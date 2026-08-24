"use client";

/* eslint-disable react-hooks/set-state-in-effect -- the dashboard reloads when its active period changes */

import { useCallback, useEffect, useMemo, useState } from "react";

type Status = "pending" | "confirmed" | "completed" | "cancelled";
type ViewMode = "upcoming" | "day";

type Booking = {
  id: number;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABEL: Record<Status, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

function todayValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatLongDate(value: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatCardDate(value: string) {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
  return formatted.replace(".", "");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M7 3v4M17 3v4M3 10h18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M18.2 10A7 7 0 0 0 6 7.6L4 12M6 14a7 7 0 0 0 12 2.4l2-4.4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function DashboardClient() {
  const [date, setDate] = useState(todayValue);
  const [viewMode, setViewMode] = useState<ViewMode>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = viewMode === "upcoming" ? "/api/bookings" : `/api/bookings?date=${date}`;
      const response = await fetch(endpoint, { cache: "no-store" });
      const data = (await response.json()) as { bookings?: Booking[]; error?: string };
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar a agenda.");
      setBookings(data.bookings ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [date, viewMode]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const stats = useMemo(() => {
    const active = bookings.filter((booking) => booking.status !== "cancelled");
    return {
      total: active.length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
      revenue: bookings
        .filter((booking) => booking.status === "completed")
        .reduce((sum, booking) => sum + booking.price, 0),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesSearch =
        !term ||
        booking.customerName.toLowerCase().includes(term) ||
        booking.phone.includes(term) ||
        booking.serviceName.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [bookings, search, statusFilter]);

  async function updateStatus(id: number, status: Status) {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await response.json()) as { booking?: Booking; error?: string };
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      if (!response.ok || !data.booking) {
        throw new Error(data.error || "Não foi possível atualizar o agendamento.");
      }
      setBookings((current) =>
        current.map((booking) => (booking.id === id ? data.booking! : booking)),
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tente novamente.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="dashboard-content">
      <div className="dashboard-toolbar">
        <div className="schedule-view-controls">
          <div className="view-switcher" role="group" aria-label="Período da agenda">
            <button
              type="button"
              className={viewMode === "upcoming" ? "active" : ""}
              aria-pressed={viewMode === "upcoming"}
              onClick={() => setViewMode("upcoming")}
            >
              Próximos
            </button>
            <button
              type="button"
              className={viewMode === "day" ? "active" : ""}
              aria-pressed={viewMode === "day"}
              onClick={() => setViewMode("day")}
            >
              Por data
            </button>
          </div>
          {viewMode === "day" && (
            <div className="date-control">
              <CalendarIcon />
              <input
                aria-label="Data da agenda"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
              <span>{formatLongDate(date)}</span>
            </div>
          )}
        </div>
        <button className="refresh-button" type="button" onClick={loadBookings} disabled={loading}>
          <RefreshIcon /> {loading ? "Atualizando" : "Atualizar agenda"}
        </button>
      </div>

      <div className="stats-grid">
        <article>
          <span>AGENDAMENTOS</span>
          <strong>{String(stats.total).padStart(2, "0")}</strong>
          <small>{viewMode === "upcoming" ? "De hoje em diante" : "No dia selecionado"}</small>
          <i className="orange" />
        </article>
        <article>
          <span>PENDENTES</span>
          <strong>{String(stats.pending).padStart(2, "0")}</strong>
          <small>Aguardando confirmação</small>
          <i className="yellow" />
        </article>
        <article>
          <span>CONFIRMADOS</span>
          <strong>{String(stats.confirmed).padStart(2, "0")}</strong>
          <small>Clientes confirmados</small>
          <i className="green" />
        </article>
        <article>
          <span>FATURAMENTO</span>
          <strong>{formatMoney(stats.revenue)}</strong>
          <small>Serviços concluídos</small>
          <i className="blue" />
        </article>
      </div>

      <section className="agenda-panel">
        <div className="agenda-heading">
          <div>
            <p>{viewMode === "upcoming" ? "PRÓXIMOS AGENDAMENTOS" : "AGENDA DO DIA"}</p>
            <h2>Atendimentos</h2>
          </div>
          <label className="dashboard-search">
            <SearchIcon />
            <input
              type="search"
              placeholder="Buscar cliente ou serviço"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="status-tabs" role="tablist" aria-label="Filtrar por status">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map((status) => (
            <button
              type="button"
              key={status}
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Todos" : STATUS_LABEL[status]}
              <span>
                {status === "all"
                  ? bookings.length
                  : bookings.filter((booking) => booking.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="dashboard-error" role="alert">{error}</p>}

        <div className={`appointment-list ${loading ? "is-loading" : ""}`}>
          {!loading && filteredBookings.length === 0 ? (
            <div className="empty-agenda">
              <span>06—12</span>
              <h3>Agenda livre por aqui.</h3>
              <p>
                {viewMode === "upcoming"
                  ? "Nenhum próximo atendimento encontrado para os filtros selecionados."
                  : "Nenhum atendimento encontrado nesta data para os filtros selecionados."}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <article className={`appointment-card status-${booking.status}`} key={booking.id}>
                <div className="appointment-datetime">
                  <time>{booking.appointmentTime}</time>
                  {viewMode === "upcoming" && <span>{formatCardDate(booking.appointmentDate)}</span>}
                </div>
                <div className="client-avatar">{initials(booking.customerName)}</div>
                <div className="client-info">
                  <strong>{booking.customerName}</strong>
                  <span>{booking.phone}</span>
                </div>
                <div className="service-info">
                  <span>SERVIÇO</span>
                  <strong>{booking.serviceName}</strong>
                  {booking.notes && <small title={booking.notes}>Obs.: {booking.notes}</small>}
                </div>
                <div className="appointment-price">
                  <span>VALOR</span>
                  <strong>{formatMoney(booking.price)}</strong>
                </div>
                <span className={`status-badge ${booking.status}`}>
                  <i /> {STATUS_LABEL[booking.status]}
                </span>
                <div className="appointment-actions">
                  {booking.status === "pending" && (
                    <button
                      className="confirm-action"
                      type="button"
                      onClick={() => updateStatus(booking.id, "confirmed")}
                      disabled={updatingId === booking.id}
                      title="Confirmar agendamento"
                    ><CheckIcon /> <span>Confirmar</span></button>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      className="complete-action"
                      type="button"
                      onClick={() => updateStatus(booking.id, "completed")}
                      disabled={updatingId === booking.id}
                      title="Concluir atendimento"
                    ><CheckIcon /> <span>Concluir</span></button>
                  )}
                  {(booking.status === "pending" || booking.status === "confirmed") && (
                    <button
                      className="cancel-action"
                      type="button"
                      onClick={() => updateStatus(booking.id, "cancelled")}
                      disabled={updatingId === booking.id}
                      title="Cancelar agendamento"
                    ><CloseIcon /> <span>Cancelar</span></button>
                  )}
                  {booking.status === "cancelled" && (
                    <button
                      className="reopen-action"
                      type="button"
                      onClick={() => updateStatus(booking.id, "pending")}
                      disabled={updatingId === booking.id}
                    >Reabrir</button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
