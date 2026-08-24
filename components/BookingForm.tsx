"use client";

/* eslint-disable react-hooks/set-state-in-effect -- loading state is reset when the selected date changes */

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AVAILABLE_TIMES, SERVICES, getService } from "../lib/services";

type BookingResult = {
  id: number;
  customerName: string;
  serviceId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
};

function todayValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function BookingForm() {
  const [serviceId, setServiceId] = useState(SERVICES[0].id as string);
  const [date, setDate] = useState(todayValue);
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);

  const selectedService = useMemo(() => getService(serviceId), [serviceId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTimes(true);
    setTime("");
    setError("");
    fetch(`/api/bookings?scope=availability&date=${date}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível consultar os horários.");
        return response.json() as Promise<{ bookedTimes: string[] }>;
      })
      .then((data) => setBookedTimes(data.bookedTimes ?? []))
      .catch((requestError: Error) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => setLoadingTimes(false));
    return () => controller.abort();
  }, [date]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!time) {
      setError("Selecione um horário disponível para continuar.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          phone,
          serviceId,
          appointmentDate: date,
          appointmentTime: time,
          notes,
        }),
      });
      const data = (await response.json()) as { booking?: BookingResult; error?: string };
      if (!response.ok || !data.booking) {
        throw new Error(data.error || "Não foi possível concluir o agendamento.");
      }
      setResult(data.booking);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setResult(null);
    setTime("");
    setName("");
    setPhone("");
    setNotes("");
    setBookedTimes((current) => [...current, result?.appointmentTime ?? ""]);
  }

  if (result) {
    const service = getService(result.serviceId);
    return (
      <div className="booking-card success-card" role="status">
        <div className="success-icon"><CheckIcon /></div>
        <p className="form-kicker">AGENDAMENTO CONFIRMADO</p>
        <h3>Pronto, {result.customerName.split(" ")[0]}!</h3>
        <p>Seu horário foi reservado. Agora é só chegar e deixar o estilo com a gente.</p>
        <div className="success-summary">
          <div><span>Serviço</span><strong>{service?.name}</strong></div>
          <div><span>Data</span><strong>{formatDate(result.appointmentDate)}</strong></div>
          <div><span>Horário</span><strong>{result.appointmentTime}</strong></div>
          <div><span>Valor</span><strong>R$ {service?.price},00</strong></div>
        </div>
        <button className="secondary-button" type="button" onClick={resetForm}>
          Fazer outro agendamento
        </button>
      </div>
    );
  }

  return (
    <form className="booking-card" onSubmit={handleSubmit}>
      <div className="form-topline">
        <div>
          <p className="form-kicker">RESERVA ONLINE</p>
          <h3>Agende seu corte</h3>
        </div>
        <span className="form-step">Leva menos de 1 min</span>
      </div>

      <fieldset className="form-group">
        <legend>1. Qual serviço você deseja?</legend>
        <div className="service-options">
          {SERVICES.map((service) => (
            <label key={service.id} className={serviceId === service.id ? "selected" : ""}>
              <input
                type="radio"
                name="service"
                value={service.id}
                checked={serviceId === service.id}
                onChange={(event) => setServiceId(event.target.value)}
              />
              <span>
                <strong>{service.name}</strong>
                <small>{service.duration} min</small>
              </span>
              <b>R$ {service.price}</b>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-group">
        <label className="field-label" htmlFor="appointment-date">2. Escolha a data</label>
        <input
          className="text-field date-field"
          id="appointment-date"
          name="date"
          type="date"
          min={todayValue()}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
        <p className="selected-date">{formatDate(date)}</p>
      </div>

      <fieldset className="form-group">
        <legend>3. Selecione um horário</legend>
        <div className={`time-grid ${loadingTimes ? "is-loading" : ""}`}>
          {AVAILABLE_TIMES.map((slot) => {
            const unavailable = bookedTimes.includes(slot);
            return (
              <label
                className={`${time === slot ? "selected" : ""} ${unavailable ? "unavailable" : ""}`}
                key={slot}
              >
                <input
                  type="radio"
                  name="time"
                  value={slot}
                  checked={time === slot}
                  disabled={unavailable || loadingTimes}
                  onChange={(event) => setTime(event.target.value)}
                />
                {slot}
              </label>
            );
          })}
        </div>
        <div className="time-legend"><span><i /> Disponível</span><span><i /> Ocupado</span></div>
      </fieldset>

      <div className="details-grid form-group">
        <label>
          <span className="field-label">4. Seu nome</span>
          <input
            className="text-field"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome completo"
            minLength={3}
            required
          />
        </label>
        <label>
          <span className="field-label">WhatsApp</span>
          <input
            className="text-field"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            placeholder="(00) 00000-0000"
            minLength={14}
            required
          />
        </label>
      </div>

      <label className="form-group notes-field">
        <span className="field-label">Observação <small>(opcional)</small></span>
        <input
          className="text-field"
          type="text"
          value={notes}
          onChange={(event) => setNotes(event.target.value.slice(0, 160))}
          placeholder="Alguma preferência para o corte?"
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-total">
        <div>
          <span>Total</span>
          <strong>R$ {selectedService?.price},00</strong>
        </div>
        <button className="submit-button" type="submit" disabled={submitting}>
          {submitting ? "Confirmando..." : "Confirmar agendamento"}
          {!submitting && <ArrowIcon />}
        </button>
      </div>
      <p className="privacy-note">Seus dados são usados apenas para confirmar o atendimento.</p>
    </form>
  );
}
