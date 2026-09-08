import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.getAllAppointments(user.token).then(setAppointments).finally(() => setLoading(false));
  useEffect(load, []);

  const handleWhatsapp = async (id) => {
    const { link } = await api.getWhatsappLink(id, user.token);
    window.open(link, "_blank");
  };

  const handleCancel = async (id) => {
    await api.cancelAppointment(id, user.token);
    load();
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Todas las citas</h2>
      {loading && <p>Cargando...</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {appointments.map((a) => (
          <div key={a._id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <div style={{ color: "var(--cream)" }}>
                {a.client?.name || a.guestName} · {a.services?.map((s) => s.name).join(" + ")}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {a.date} · {a.startTime} con {a.barber?.name} · {a.client?.phone || a.guestPhone} · {a.status}
              </div>
              {a.notes && <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>Nota: {a.notes}</div>}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn" onClick={() => handleWhatsapp(a._id)}>Enviar recordatorio</button>
              {a.status !== "cancelada" && (
                <button className="btn btn-danger" onClick={() => handleCancel(a._id)}>Cancelar</button>
              )}
            </div>
          </div>
        ))}
        {!loading && appointments.length === 0 && <p>No hay citas registradas todavía.</p>}
      </div>
    </div>
  );
}
