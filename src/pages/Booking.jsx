import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const STEPS = [
  { key: "servicio", label: "Servicio", icon: "✂️" },
  { key: "barbero", label: "Barbero", icon: "👤" },
  { key: "fecha", label: "Fecha", icon: "📅" },
  { key: "datos", label: "Datos", icon: "✅" },
];
const MAX_SERVICES = 2;

export default function Booking() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedServices, setSelectedServices] = useState([]);
  const [barber, setBarber] = useState(null);
  const minDate = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState("");
  const [guest, setGuest] = useState({ name: "", phone: "", email: "", notes: "" });

  const [error, setError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.getServices("servicio").then(setServices).catch(() => {});
    api.getBarbers().then(setBarbers).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedServices.length === 0 || !barber || !date) return;
    setLoadingSlots(true);
    setTime("");
    api
      .getAvailability(barber._id, selectedServices.map((s) => s._id), date)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedServices, barber, date]);

  const toggleService = (s) => {
    const exists = selectedServices.find((x) => x._id === s._id);
    if (exists) {
      setSelectedServices(selectedServices.filter((x) => x._id !== s._id));
    } else if (selectedServices.length < MAX_SERVICES) {
      setSelectedServices([...selectedServices, s]);
    }
  };

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      await api.createAppointment({
        barber: barber._id,
        services: selectedServices.map((s) => s._id),
        date,
        startTime: time,
        guestName: guest.name,
        guestPhone: guest.phone,
        guestEmail: guest.email,
        notes: guest.notes,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const waMessage = `Hola, quiero confirmar mi cita: ${selectedServices.map((s) => s.name).join(" + ")} con ${barber.name} el ${date} a las ${time}. Mi nombre es ${guest.name}.`;
    const waLink = `https://wa.me/525660362095?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="container" style={{ maxWidth: 480, padding: "6rem 1.5rem", textAlign: "center" }}>
        <h1>¡Cita reservada!</h1>
        <p style={{ marginTop: "1rem" }}>
          {selectedServices.map((s) => s.name).join(" + ")} con {barber.name} el {date} a las {time}.
          El pago se realiza en el local.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          Para confirmar tu lugar, mándanos un WhatsApp:
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-whatsapp"
          style={{ display: "inline-block", marginTop: "1rem", marginRight: "0.75rem" }}
        >
          Confirmar por WhatsApp
        </a>
        <button className="btn btn-ghost" style={{ marginTop: "1rem" }} onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 640, padding: "3.5rem 1.5rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Reserva tu Cita</h1>

      <div style={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s.key} style={styles.stepperItem}>
            <div style={{ ...styles.stepCircle, ...(i === step ? styles.stepCircleActive : {}) }}>{s.icon}</div>
            <div style={{ ...styles.stepLabel, ...(i === step ? { color: "var(--gold)" } : {}) }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        {step === 0 && (
          <div>
            <h3 style={{ marginBottom: "0.25rem" }}>Selecciona tu Servicio</h3>
            <p style={{ marginBottom: "1.25rem" }}>
              Puedes elegir hasta <span style={{ color: "var(--gold)", fontWeight: 700 }}>{MAX_SERVICES} servicios</span>. Toca para seleccionar o deseleccionar.
            </p>
            <div style={styles.optionList}>
              {services.map((s) => {
                const selected = selectedServices.find((x) => x._id === s._id);
                return (
                  <button
                    key={s._id}
                    onClick={() => toggleService(s)}
                    style={{ ...styles.optionBtn, ...(selected ? styles.optionSelected : {}) }}
                  >
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }}>{s.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{s.durationMinutes} min</div>
                    </div>
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>${s.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
            <div style={styles.navRow}>
              <span />
              <button className="btn btn-solid" disabled={selectedServices.length === 0} onClick={goNext}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: "1.25rem" }}>Elige tu Barbero</h3>
            <div style={styles.optionList}>
              {barbers.map((b) => (
                <button
                  key={b._id}
                  onClick={() => {
                    setBarber(b);
                    goNext();
                  }}
                  style={{ ...styles.optionBtn, ...(barber?._id === b._id ? styles.optionSelected : {}) }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem" }}>{b.name}</span>
                </button>
              ))}
            </div>
            <div style={styles.navRow}>
              <button className="btn btn-ghost" onClick={goBack}>Atrás</button>
              <span />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: "1.25rem" }}>Elige Fecha y Hora</h3>
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
            <h3 style={{ marginBottom: "1.25rem" }}>Tus Datos</h3>
            <div className="panel" style={{ marginBottom: "1.25rem", background: "var(--navy-deep)" }}>
              <p><strong style={{ color: "var(--cream)" }}>Servicios:</strong> {selectedServices.map((s) => s.name).join(" + ")}</p>
              <p><strong style={{ color: "var(--cream)" }}>Barbero:</strong> {barber.name}</p>
              <p><strong style={{ color: "var(--cream)" }}>Fecha:</strong> {date} a las {time} ({totalDuration} min)</p>
              <p style={{ marginBottom: 0 }}><strong style={{ color: "var(--cream)" }}>Total:</strong> <span style={{ color: "var(--gold)" }}>${total.toFixed(2)}</span> (se paga en el local)</p>
            </div>
            <div className="field">
              <label htmlFor="gname">Nombre</label>
              <input id="gname" required value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="gphone">Teléfono (WhatsApp)</label>
              <input id="gphone" required placeholder="52 998 123 4567" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="gemail">Correo (opcional)</label>
              <input id="gemail" type="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="gnotes">Notas (opcional)</label>
              <input id="gnotes" value={guest.notes} onChange={(e) => setGuest({ ...guest, notes: e.target.value })} />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div style={styles.navRow}>
              <button className="btn btn-ghost" onClick={goBack}>Atrás</button>
              <button className="btn btn-solid" disabled={!guest.name || !guest.phone || submitting} onClick={handleConfirm}>
                {submitting ? "Confirmando..." : "Confirmar cita"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  stepper: { display: "flex", justifyContent: "space-between", marginBottom: "2rem" },
  stepperItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", flex: 1 },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "var(--navy-panel)",
    border: "1px solid var(--navy-line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
  },
  stepCircleActive: { background: "var(--gold)", borderColor: "var(--gold)" },
  stepLabel: { fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" },
  optionList: { display: "flex", flexDirection: "column", gap: "0.6rem" },
  optionBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    color: "var(--cream)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "0.75rem",
    padding: "1rem 1.25rem",
  },
  optionSelected: { borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" },
  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "0.5rem",
    margin: "0.75rem 0 1.5rem",
  },
  navRow: { display: "flex", justifyContent: "space-between", marginTop: "1.5rem" },
};
