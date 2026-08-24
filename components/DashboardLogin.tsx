"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

export function DashboardLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível entrar.");
      }
      window.location.reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <main className="dashboard-login-page">
      <div className="login-brand-panel">
        <Link className="brand" href="/" aria-label="Voltar para Barbearia Black">
          <span className="brand-mark">BB</span>
          <span className="brand-copy"><strong>BARBEARIA</strong><span>BLACK</span></span>
        </Link>
        <div className="login-brand-copy">
          <p>ÁREA ADMINISTRATIVA</p>
          <h1>CONTROLE TOTAL.<br /><em>ACESSO SEGURO.</em></h1>
          <span>Gerencie sua agenda com praticidade, privacidade e confiança.</span>
        </div>
        <small>BARBEARIA BLACK • PAINEL DO BARBEIRO</small>
      </div>

      <section className="login-form-panel">
        <form className="dashboard-login-card" onSubmit={handleSubmit}>
          <div className="login-lock"><LockIcon /></div>
          <p>ACESSO RESTRITO</p>
          <h2>Entre no dashboard</h2>
          <span className="login-description">
            Digite a senha administrativa para visualizar e controlar os agendamentos.
          </span>

          <label className="login-password-field">
            <span>Senha</span>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <EyeIcon hidden={showPassword} />
              </button>
            </div>
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="login-submit" type="submit" disabled={submitting}>
            {submitting ? "Verificando..." : "Entrar no painel"}
          </button>
          <small className="login-session-note">Sessão protegida com duração de 8 horas.</small>
          <Link className="login-back-link" href="/">← Voltar para o site</Link>
        </form>
      </section>
    </main>
  );
}
