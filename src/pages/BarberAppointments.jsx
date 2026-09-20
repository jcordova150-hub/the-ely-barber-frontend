import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function BarberAppointments() {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.token || user.role !== "barber") return;
    api.getMyAppointments(user.token).then(setAppointments).catch((e) => setError(e.message));
  }, [user]);

  if (!user || user.role !== "barber") {
    return <div className="container" style={{ padding: "5rem 1.5rem" }}><p>Debes iniciar sesión como barbero.</p></div>;
  }

  return (
    <div className="container" style={{ maxWidth: 900, padding: "3rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ marginBottom: ".25rem" }}>Mis citas</h1>
          <p>Hola, {user.name || user.username}.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => { logout(); window.location.href = "/"; }}>Salir</button>
      </div>
      {error && <p className="error-text">{error}</p>}
      <div style={{ display: "grid", gap: ".8rem" }}>
        {appointments.map((a) => (
          <div key={a._id} className="panel" style={{ display: "grid", gridTemplateColumns: "130px 1fr auto", gap: "1rem", alignItems: "center" }}>
            <div><strong style={{ color: "var(--gold-bright)" }}>{a.date}</strong><br />{a.startTime} – {a.endTime}</div>
            <div><strong>{a.guestName || a.client?.name || "Cliente"}</strong><br /><span style={{ color: "var(--muted)" }}>{(a.services || []).map(s => s.name).join(" + ")}</span></div>
            <span style={{ color: "var(--muted)" }}>{a.status || "pendiente"}</span>
          </div>
        ))}
        {appointments.length === 0 && !error && <div className="panel">No tienes citas registradas.</div>}
      </div>
    </div>
  );
}
