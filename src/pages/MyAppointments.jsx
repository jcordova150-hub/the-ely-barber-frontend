import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.getMyAppointments(user.token).then(setAppointments).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    await api.cancelAppointment(id, user.token);
    load();
  };

  return (
    <div className="container" style={{ padding: "3rem 1.5rem", maxWidth: 640 }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Mis citas</h1>
      {loading && <p>Cargando...</p>}
      {!loading && appointments.length === 0 && <p>Todavía no tienes citas reservadas.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {appointments.map((a) => (
          <div key={a._id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "var(--cream)", fontWeight: 500 }}>{a.service?.name}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {a.date} · {a.startTime} con {a.barber?.name}
              </div>
              <div style={{ color: "var(--gold-bright)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{a.status}</div>
            </div>
            {a.status !== "cancelada" && (
              <button className="btn btn-danger" onClick={() => handleCancel(a._id)}>
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
