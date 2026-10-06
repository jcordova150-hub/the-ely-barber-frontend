import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { todayStr, addDaysStr, weekStartStr, formatLongDate, formatWeekRange } from "../utils/time";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function BarberAppointments() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => weekStartStr(todayStr()));
  const [selected, setSelected] = useState(() => todayStr()); // un día "YYYY-MM-DD" o "semana"

  useEffect(() => {
    if (!user?.token || user.role !== "barber") return;
    api
      .getMyAppointments(user.token)
      .then(setAppointments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== "barber") {
    return <div className="container" style={{ padding: "5rem 1.5rem" }}><p>Debes iniciar sesión como barbero.</p></div>;
  }

  const today = todayStr();
  const yesterday = addDaysStr(today, -1);
  const tomorrow = addDaysStr(today, 1);
  const currentWeekStart = weekStartStr(today);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i));

  const byDate = {};
  appointments.forEach((a) => { (byDate[a.date] = byDate[a.date] || []).push(a); });
  const activeCount = (d) => (byDate[d] || []).filter((a) => a.status !== "cancelada").length;

  const isPast = (d) => d < today; // solo para atenuar el estilo; ya no oculta ni bloquea el día
  const dayTitle = (d) =>
    d === today
      ? `Hoy · ${formatLongDate(d)}`
      : d === tomorrow
      ? `Mañana · ${formatLongDate(d)}`
      : d === yesterday
      ? `Ayer · ${formatLongDate(d)}`
      : formatLongDate(d);

  const goWeek = (delta) => {
    const next = addDaysStr(weekStart, delta * 7);
    setWeekStart(next);
    setSelected((prev) => (prev === "semana" ? "semana" : next === currentWeekStart ? today : next));
  };
  const goToday = () => {
    setWeekStart(currentWeekStart);
    setSelected(today);
  };

  const shownDays = selected === "semana" ? weekDays : [selected]; // "Ver toda la semana" incluye también los días ya pasados

  const shownAppointments = shownDays.flatMap((d) => byDate[d] || []);

  const completedAppointments = shownAppointments.filter(
    (a) => a.status === "completada"
  );

  const completedCuts = completedAppointments.length;

  const totalSales = completedAppointments.reduce(
    (sum, a) => sum + Number(a.total || 0),
    0
  );

  const totalCommission = completedAppointments.reduce(
    (sum, a) => sum + Number(a.commissionTotal || 0),
    0
  );

  const totalTips = completedAppointments.reduce(
    (sum, a) =>
      sum + Number(a.tipNetAmount ?? a.tipAmount ?? 0),
    0
  );

  const renderDay = (d) => (
    <section key={d} style={{ marginBottom: "1.75rem" }}>
      <h3 style={{ fontFamily: "var(--font-display)", color: d === today ? "var(--gold-bright)" : "var(--cream)", marginBottom: ".75rem" }}>
        {dayTitle(d)}
      </h3>
      <div style={{ display: "grid", gap: ".8rem" }}>
        {(byDate[d] || []).map((a) => (
          <div key={a._id} className="panel" style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: "1.1rem", padding: "1rem 1.1rem", alignItems: "center", opacity: a.status === "cancelada" ? 0.55 : 1 }}>
            <div><strong style={{ color: "var(--gold-bright)" }}>{a.startTime}</strong><br />hasta {a.endTime}</div>
            <div style={{ minWidth: 0 }}>
              <strong>{a.guestName || a.client?.name || "Cliente"}</strong>
              <div style={{ color: "var(--muted)" }}>{(a.services || []).map((s) => s.name).join(" + ")}</div>
              <div style={{ color: "var(--muted)", fontSize: ".8rem", textTransform: "capitalize", marginTop: ".15rem" }}>{a.status || "pendiente"}</div>

              {a.status === "completada" && (
                <div
                  style={{
                    color: "var(--gold-bright)",
                    fontSize: ".85rem",
                    marginTop: ".35rem",
                    fontWeight: 600,
                  }}
                >
                  Venta: ${Number(a.total || 0).toFixed(2)}
                  {" · "}
                  Mi comisión: ${Number(a.commissionTotal || 0).toFixed(2)}
                  {" · "}
                  Mi propina: ${Number(a.tipNetAmount ?? a.tipAmount ?? 0).toFixed(2)}
                </div>
              )}
            </div>
          </div>
        ))}
        {!loading && !byDate[d] && !error && (
          <div className="panel" style={{ color: "var(--muted)" }}>
            {d === today ? "No tienes citas para hoy." : "Sin citas este día."}
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="container" style={{ maxWidth: 900, padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ marginBottom: ".25rem" }}>Mis citas</h1>
          <p>Hola, {user.name || user.username}.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => { logout(); window.location.href = "/"; }}>Salir</button>
      </div>

      {/* Semana: navegación y días */}
      <div style={styles.weekBar}>
        <button className="btn btn-ghost" style={styles.navBtn} onClick={() => goWeek(-1)} aria-label="Semana anterior">‹</button>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            {weekStart === currentWeekStart ? "Esta semana" : "Semana"}
          </div>
          <div style={{ color: "var(--muted)", fontSize: ".85rem" }}>{formatWeekRange(weekStart)}</div>
        </div>
        <button className="btn btn-ghost" style={styles.navBtn} onClick={() => goWeek(1)} aria-label="Semana siguiente">›</button>
      </div>

      <div style={styles.weekGrid}>
        {weekDays.map((d, i) => {
          const past = isPast(d);
          const isSel = selected === d;
          const count = activeCount(d);
          return (
            <button
              key={d}
              onClick={() => setSelected(d)}
              aria-label={`${dayTitle(d)}${count ? `, ${count} citas` : ""}`}
              aria-pressed={isSel}
              style={{
                ...styles.dayBtn,
                ...(d === today ? styles.dayToday : {}),
                ...(isSel ? styles.daySelected : {}),
                ...(past ? styles.dayPast : {}),
              }}
            >
              <span style={{ fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".04em" }}>{DAY_LABELS[i]}</span>
              <span style={{ fontSize: "1.2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>{Number(d.slice(8))}</span>
              <span style={{ ...styles.badge, ...(count ? {} : { visibility: "hidden" }), ...(isSel ? styles.badgeSel : {}) }}>{count || 0}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", margin: "1rem 0 1.75rem" }}>
        <button
          className="btn btn-ghost"
          style={{ ...styles.chip, ...(selected === "semana" ? styles.chipOn : {}) }}
          onClick={() => setSelected("semana")}
        >
          Ver toda la semana
        </button>
        {(selected !== today || weekStart !== currentWeekStart) && (
          <button className="btn btn-ghost" style={styles.chip} onClick={goToday}>Volver a hoy</button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Cargando...</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: ".8rem",
            marginBottom: "1.75rem",
          }}
        >
          <div className="panel" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
              Citas completadas
            </div>
            <strong
              style={{
                display: "block",
                color: "var(--gold-bright)",
                fontSize: "1.5rem",
                marginTop: ".25rem",
              }}
            >
              {completedCuts}
            </strong>
          </div>

          <div className="panel" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
              Ventas
            </div>
            <strong
              style={{
                display: "block",
                color: "var(--gold-bright)",
                fontSize: "1.5rem",
                marginTop: ".25rem",
              }}
            >
              ${totalSales.toFixed(2)}
            </strong>
          </div>

          <div className="panel" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
              Mi comisión
            </div>
            <strong
              style={{
                display: "block",
                color: "var(--gold-bright)",
                fontSize: "1.5rem",
                marginTop: ".25rem",
              }}
            >
              ${totalCommission.toFixed(2)}
            </strong>
          </div>

          <div className="panel" style={{ padding: "1rem", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: ".8rem" }}>
              Mis propinas
            </div>
            <strong
              style={{
                display: "block",
                color: "var(--gold-bright)",
                fontSize: "1.5rem",
                marginTop: ".25rem",
              }}
            >
              ${totalTips.toFixed(2)}
            </strong>
          </div>
        </div>
      )}

      {shownDays.map(renderDay)}
    </div>
  );
}

const styles = {
  weekBar: { display: "flex", alignItems: "center", gap: ".75rem", marginBottom: ".9rem" },
  navBtn: { padding: ".35rem .9rem", fontSize: "1.3rem", lineHeight: 1, borderRadius: ".6rem" },
  weekGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: ".4rem" },
  dayBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: ".15rem",
    padding: ".55rem .2rem",
    cursor: "pointer",
    color: "var(--cream)",
    fontFamily: "var(--font-body)",
    background: "var(--navy-panel)",
    border: "1px solid var(--navy-line)",
    borderRadius: ".75rem",
  },
  dayToday: { borderColor: "var(--gold)" },
  daySelected: { background: "var(--gold)", color: "var(--navy-deep)", borderColor: "var(--gold)" },
  dayPast: { opacity: 0.6 }, // días ya pasados: se ven un poco atenuados pero siguen siendo tocables
  badge: {
    minWidth: 20,
    padding: "0 .35rem",
    fontSize: ".7rem",
    fontWeight: 700,
    borderRadius: "999px",
    background: "rgba(217,165,32,0.2)",
    color: "var(--gold-bright)",
  },
  badgeSel: { background: "var(--navy-deep)", color: "var(--gold-bright)" },
  chip: { padding: ".35rem .9rem", fontSize: ".8rem", borderRadius: "999px" },
  chipOn: { background: "var(--navy-panel)", color: "var(--cream)", borderColor: "var(--gold)" },
};
