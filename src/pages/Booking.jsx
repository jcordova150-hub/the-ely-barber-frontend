import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Servicio", "Barbero", "Fecha y hora", "Confirmar"];

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [service, setService] = useState(null);
  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [error, setError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.getServices("servicio").then(setServices).catch(() => {});
    api.getBarbers().then(setBarbers).catch(() => {});
  }, []);

  useEffect(() => {
    if (!service || !barber || !date) return;
    setLoadingSlots(true);
    setTime("");
    api
      .getAvailability({ barberId: barber._id, serviceId: service._id, date })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [service, barber, date]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createAppointment(
        { barber: barber._id, service: service._id, date, startTime: time },
        user.token
      );
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split("T")[0];

  if (done) {
    return (
      <div className="container" style={{ maxWidth: 480, padding: "5rem 1.5rem", textAlign: "center" }}>
        <h1>Cita reservada</h1>
        <p style={{ marginTop: "1rem" }}>
          {service.name} con {barber.name} el {date} a las {time}. El pago se realiza en el local.
        </p>
        <button className="btn btn-solid" style={{ marginTop: "1rem" }} onClick={() => navigate("/mis-citas")}>
          Ver mis citas
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 560, padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Reservar cita</h1>
      <p>
        Paso {step + 1} de {STEPS.length}: {STEPS[step]}
      </p>
      <hr className="hairline" />

      {step === 0 && (
        <div style={styles.optionList}>
          {services.map((s) => (
            <button
              key={s._id}
              onClick={() => {
                setService(s);
                goNext();
              }}
              className="panel"
              style={{ ...styles.optionBtn, ...(service?._id === s._id ? styles.optionActive : {}) }}
            >
              <span>{s.name}</span>
              <span style={{ color: "var(--gold-bright)" }}>${s.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div style={styles.optionList}>
          {barbers.map((b) => (
            <button
              key={b._id}
              onClick={() => {
                setBarber(b);
                goNext();
              }}
              className="panel"
              style={{ ...styles.optionBtn, ...(barber?._id === b._id ? styles.optionActive : {}) }}
            >
              {b.name}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="field">
            <label htmlFor="date">Fecha</label>
            <input id="date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {date && (
            <div>
              <label>Horarios disponibles</label>
              {loadingSlots && <p>Buscando horarios...</p>}
              {!loadingSlots && slots.length === 0 && <p>No hay horarios disponibles ese día.</p>}
              <div style={styles.slotGrid}>
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className="btn"
                    style={time === s ? { background: "var(--gold)", color: "var(--navy-deep)" } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={styles.navRow}>
            <button className="btn btn-ghost" onClick={goBack}>Atrás</button>
            <button className="btn btn-solid" disabled={!time} onClick={goNext}>Continuar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="panel" style={{ marginBottom: "1.5rem" }}>
            <p><strong style={{ color: "var(--cream)" }}>Servicio:</strong> {service.name} (${service.price.toFixed(2)})</p>
            <p><strong style={{ color: "var(--cream)" }}>Barbero:</strong> {barber.name}</p>
            <p><strong style={{ color: "var(--cream)" }}>Fecha:</strong> {date} a las {time}</p>
            {!user && <p style={{ color: "var(--gold-bright)" }}>Necesitas iniciar sesión para confirmar.</p>}
          </div>
          {error && <p className="error-text">{error}</p>}
          <div style={styles.navRow}>
            <button className="btn btn-ghost" onClick={goBack}>Atrás</button>
            <button className="btn btn-solid" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Confirmando..." : user ? "Confirmar cita" : "Entrar y confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  optionList: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  optionBtn: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    color: "var(--cream)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
  },
  optionActive: { borderColor: "var(--gold)" },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "0.5rem",
    margin: "0.75rem 0 1.5rem",
  },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: "1.5rem" },
};
