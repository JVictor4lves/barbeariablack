import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { DashboardClient } from "../../components/DashboardClient";
import { DashboardLogin } from "../../components/DashboardLogin";
import { DashboardLogout } from "../../components/DashboardLogout";
import {
  DASHBOARD_COOKIE_NAME,
  isDashboardSessionValid,
} from "../../lib/dashboard-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel do barbeiro",
  description: "Controle os agendamentos da Barbearia Black.",
  robots: { index: false, follow: false },
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DASHBOARD_COOKIE_NAME)?.value;
  const isAuthenticated = await isDashboardSessionValid(token);

  if (!isAuthenticated) {
    return <DashboardLogin />;
  }

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <Link className="brand" href="/" aria-label="Voltar para Barbearia Black">
          <span className="brand-mark">BB</span>
          <span className="brand-copy"><strong>BARBEARIA</strong><span>BLACK</span></span>
        </Link>
        <div className="sidebar-menu">
          <p>MENU</p>
          <span className="active"><i /> Agenda</span>
          <span><i /> Visão geral</span>
          <span><i /> Clientes</span>
        </div>
        <div className="sidebar-hours">
          <span>HORÁRIO DE ATENDIMENTO</span>
          <strong>06:00 — 12:00</strong>
          <small>Agenda em intervalos de 30 min</small>
        </div>
        <Link className="view-site-link" href="/">
          Ver site do cliente <ArrowIcon />
        </Link>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p>PAINEL ADMINISTRATIVO</p>
            <h1>Bom dia, <em>Barbeiro.</em></h1>
          </div>
          <div className="dashboard-profile">
            <span>BB</span>
            <div><strong>Barbearia Black</strong><small>Administrador</small></div>
            <DashboardLogout />
          </div>
        </header>
        <DashboardClient />
      </section>
    </main>
  );
}
