import {
  clearDashboardSessionCookie,
  dashboardSessionCookie,
  issueDashboardSessionToken,
  verifyDashboardPassword,
} from "../../../lib/dashboard-auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown };
    const password = typeof body.password === "string" ? body.password : "";

    if (!(await verifyDashboardPassword(password))) {
      return Response.json(
        { error: "Senha incorreta. Verifique e tente novamente." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const token = await issueDashboardSessionToken();
    return Response.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store",
          "Set-Cookie": dashboardSessionCookie(token),
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Não foi possível entrar agora. Tente novamente em instantes." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function DELETE() {
  return Response.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": clearDashboardSessionCookie(),
      },
    },
  );
}
