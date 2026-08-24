import { isDashboardRequestAuthenticated } from "../../../lib/dashboard-auth";
import { ensureDatabase, getSql } from "../../../lib/database";
import { AVAILABLE_TIMES, getService } from "../../../lib/services";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

type BookingRow = {
  id: number;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function isDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

function todayInBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function normalizeBooking(row: Record<string, unknown>): BookingRow {
  return {
    id: Number(row.id),
    customerName: String(row.customer_name),
    phone: String(row.phone),
    serviceId: String(row.service_id),
    serviceName: String(row.service_name),
    price: Number(row.price),
    appointmentDate: String(row.appointment_date),
    appointmentTime: String(row.appointment_time),
    notes: String(row.notes ?? ""),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erro inesperado.";
  console.error("Booking API error:", error);
  return Response.json(
    {
      error: message.includes("ainda não foi configurado")
        ? message
        : "O serviço de agendamentos está temporariamente indisponível.",
    },
    { status: 500 },
  );
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope");
    const date = url.searchParams.get("date") ?? "";
    await ensureDatabase();
    const sql = getSql();

    if (scope === "availability") {
      if (!isDate(date)) {
        return Response.json({ error: "Informe uma data válida." }, { status: 400 });
      }
      const result = await sql`
        SELECT appointment_time
        FROM bookings
        WHERE appointment_date = ${date} AND status != 'cancelled'
        ORDER BY appointment_time ASC
      `;
      return Response.json({ bookedTimes: result.map((row) => String(row.appointment_time)) });
    }

    if (!(await isDashboardRequestAuthenticated(request))) {
      return Response.json(
        { error: "Sua sessão expirou. Entre novamente no painel." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (date && !isDate(date)) {
      return Response.json({ error: "Informe uma data válida." }, { status: 400 });
    }

    const result = date
      ? await sql`
          SELECT * FROM bookings
          WHERE appointment_date = ${date}
          ORDER BY appointment_time ASC, created_at DESC
        `
      : await sql`
          SELECT * FROM bookings
          WHERE appointment_date >= ${todayInBrazil()}
          ORDER BY appointment_date ASC, appointment_time ASC
          LIMIT 250
        `;
    return Response.json({ bookings: result.map((row) => normalizeBooking(row)) });
  } catch (error) {
    return responseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const customerName = String(body.customerName ?? "").trim().replace(/\s+/g, " ");
    const phone = String(body.phone ?? "").trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const serviceId = String(body.serviceId ?? "");
    const appointmentDate = String(body.appointmentDate ?? "");
    const appointmentTime = String(body.appointmentTime ?? "");
    const notes = String(body.notes ?? "").trim().slice(0, 160);
    const service = getService(serviceId);
    await ensureDatabase();
    const sql = getSql();

    if (customerName.length < 3 || customerName.length > 80) {
      return Response.json({ error: "Informe seu nome completo." }, { status: 400 });
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return Response.json({ error: "Informe um WhatsApp válido." }, { status: 400 });
    }
    if (!service) {
      return Response.json({ error: "Selecione um serviço válido." }, { status: 400 });
    }
    if (!isDate(appointmentDate) || appointmentDate < todayInBrazil()) {
      return Response.json({ error: "Selecione uma data de hoje em diante." }, { status: 400 });
    }
    if (!AVAILABLE_TIMES.includes(appointmentTime as (typeof AVAILABLE_TIMES)[number])) {
      return Response.json({ error: "Selecione um horário entre 06h e 12h." }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO bookings (
          customer_name, phone, service_id, service_name, price,
          appointment_date, appointment_time, notes, status, updated_at
        ) VALUES (
          ${customerName}, ${phone}, ${service.id}, ${service.name}, ${service.price},
          ${appointmentDate}, ${appointmentTime}, ${notes}, 'pending', CURRENT_TIMESTAMP
        )
        ON CONFLICT(appointment_date, appointment_time) DO UPDATE SET
          customer_name = excluded.customer_name,
          phone = excluded.phone,
          service_id = excluded.service_id,
          service_name = excluded.service_name,
          price = excluded.price,
          notes = excluded.notes,
          status = 'pending',
          updated_at = CURRENT_TIMESTAMP
        WHERE bookings.status = 'cancelled'
        RETURNING *
    `;
    const booking = result[0] as Record<string, unknown> | undefined;

    if (!booking) {
      return Response.json(
        { error: "Esse horário acabou de ser reservado. Escolha outro horário disponível." },
        { status: 409 },
      );
    }

    return Response.json({ booking: normalizeBooking(booking) }, { status: 201 });
  } catch (error) {
    return responseError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isDashboardRequestAuthenticated(request))) {
      return Response.json(
        { error: "Sua sessão expirou. Entre novamente no painel." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = Number(body.id);
    const status = String(body.status ?? "");
    if (!Number.isInteger(id) || id < 1) {
      return Response.json({ error: "Agendamento inválido." }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return Response.json({ error: "Status inválido." }, { status: 400 });
    }
    await ensureDatabase();
    const sql = getSql();

    const result = await sql`
      UPDATE bookings
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    const booking = result[0] as Record<string, unknown> | undefined;

    if (!booking) {
      return Response.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }
    return Response.json({ booking: normalizeBooking(booking) });
  } catch (error) {
    return responseError(error);
  }
}
