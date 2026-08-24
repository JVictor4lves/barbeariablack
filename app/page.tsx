import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "../components/BookingForm";
import { SERVICES } from "../lib/services";

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="m8.5 8.5 11 7.5M8.5 15.5l11-7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Barbearia Black, início">
          <span className="brand-mark">BB</span>
          <span className="brand-copy">
            <strong>BARBEARIA</strong>
            <span>BLACK</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#servicos">Serviços</a>
          <a href="#agendar">Agendar</a>
        </nav>
        <Link className="admin-link" href="/dashboard">
          Área do barbeiro
          <ArrowIcon />
        </Link>
      </header>

      <section className="hero" id="inicio">
        <Image
          className="hero-image"
          src="/hero-barbearia-black.webp"
          alt="Barbeiro finalizando o corte de um cliente"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <div className="hero-copy">
            <p className="eyebrow"><span /> ESTILO, PRECISÃO E ATITUDE</p>
            <h1>
              SEU VISUAL.<br />
              <em>SUAS REGRAS.</em>
            </h1>
            <p className="hero-description">
              Corte na medida, atendimento no horário e aquela confiança que começa
              antes do dia clarear.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#agendar">
                Agendar meu corte
                <ArrowIcon />
              </a>
              <span className="schedule-note"><ClockIcon /> Das 06h às 12h</span>
            </div>
          </div>

          <aside className="hero-card" aria-label="Informações de atendimento">
            <p>ATENDIMENTO</p>
            <strong>COMECE O DIA<br />NO ESTILO.</strong>
            <div className="hero-card-row">
              <span>Horários a cada 30 min</span>
              <b>06:00 → 12:00</b>
            </div>
          </aside>
        </div>
        <a className="scroll-cue" href="#servicos" aria-label="Ver serviços">
          <span>Role para descobrir</span>
          <i />
        </a>
      </section>

      <section className="services-section" id="servicos">
        <div className="page-shell">
          <div className="section-heading" data-reveal="up">
            <div>
              <p className="eyebrow dark"><span /> SERVIÇOS</p>
              <h2>ESCOLHA SEU<br /><em>PRÓXIMO VISUAL.</em></h2>
            </div>
            <p>
              Do clássico ao completo, cada serviço é feito com atenção aos detalhes
              e acabamento impecável.
            </p>
          </div>

          <div className="service-grid">
            {SERVICES.map((service, index) => (
              <article
                className="service-card"
                key={service.id}
                data-reveal="up"
                data-reveal-delay={index * 90}
              >
                <div className="service-number">0{index + 1}</div>
                <div className="service-icon"><ScissorsIcon /></div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span>{service.duration} min</span>
                  <strong>R$ {service.price},00</strong>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="booking-section" id="agendar">
        <div className="page-shell booking-layout">
          <div className="booking-intro" data-reveal="left">
            <p className="eyebrow"><span /> AGENDE AGORA</p>
            <h2>SEU HORÁRIO,<br /><em>SEM ESPERA.</em></h2>
            <p>
              Escolha o serviço, selecione o melhor horário e pronto. Sua cadeira fica
              reservada em poucos cliques.
            </p>
            <div className="booking-assurances">
              <div><b>01</b><span>Escolha o serviço</span></div>
              <div><b>02</b><span>Defina data e horário</span></div>
              <div><b>03</b><span>Confirme seus dados</span></div>
            </div>
          </div>
          <div className="booking-form-reveal" data-reveal="right" data-reveal-delay="100">
            <BookingForm />
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="page-shell footer-content">
          <div data-reveal="up">
            <a className="brand footer-brand" href="#inicio">
              <span className="brand-mark">BB</span>
              <span className="brand-copy"><strong>BARBEARIA</strong><span>BLACK</span></span>
            </a>
            <p>Seu estilo começa cedo.</p>
          </div>
          <div className="footer-info" data-reveal="up" data-reveal-delay="90">
            <span>ATENDIMENTO</span>
            <strong>Todos os dias • 06h às 12h</strong>
          </div>
          <div className="footer-actions" data-reveal="up" data-reveal-delay="180">
            <a href="#agendar">Agendar horário</a>
            <Link href="/dashboard">Área do barbeiro</Link>
          </div>
        </div>
        <div className="page-shell footer-bottom" data-reveal="up" data-reveal-delay="230">
          <span>© 2026 Barbearia Black</span>
          <span>Feito para quem leva estilo a sério.</span>
        </div>
      </footer>
    </main>
  );
}
