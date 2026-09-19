import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const STATUS_LABEL = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const load = () => api.getAllAppointments(user.token).then(setAppointments).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleWhatsapp = async (id) => {
    const { link } = await api.getWhatsappLink(id, user.token);
    window.open(link, "_blank");
  };

  const handleStatusChange = async (id, status) => {
    await api.setAppointmentStatus(id, status, user.token);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta cita PERMANENTEMENTE? Esta acción no se puede deshacer.")) return;
    await api.deleteAppointment(id, user.token);
    load();
  };

  const startEdit = (a) => {
    setEditingId(a._id);
    setEditDate(a.date);
    setEditTime(a.startTime);
  };

  const saveReschedule = async (id) => {
    await api.rescheduleAppointment(id, { date: editDate, startTime: editTime }, user.token);
    setEditingId(null);
    load();
  };

  const filtered = appointments.filter((a) => {
    if (dateFilter && a.date !== dateFilter) return false;
    if (statusFilter !== "todos" && a.status !== statusFilter) return false;
    return true;
  });

  const isToday = (dateStr) => dateStr === new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={{ fontSize: "1.3rem", fontFamily: "var(--font-display)" }}>Citas Agendadas</h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ width: "auto" }} />
          {dateFilter && (
            <button className="btn btn-ghost" onClick={() => setDateFilter("")}>Todas las fechas</button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {loading && <p>Cargando...</p>}

      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Servicio</th>
              <th style={styles.th}>Fecha y Hora</th>
              <th style={styles.th}>Barbero</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ color: "var(--cream)", fontWeight: 600 }}>{a.client?.name || a.guestName}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{a.client?.phone || a.guestPhone}</div>
                </td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{a.services?.map((s) => s.name).join(" + ")}</div>
                  {a.total > 0 && <div style={{ color: "var(--gold)", fontWeight: 700 }}>${a.total.toFixed(2)}</div>}
                </td>
                <td style={styles.td}>
                  {editingId === a._id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                      <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="btn btn-solid" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => saveReschedule(a._id)}>Guardar</button>
                        <button className="btn btn-ghost" style={{ padding: "0.3rem 0.7rem", fontSize: "0.8rem" }} onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{a.date} {isToday(a.date) && <span style={styles.todayBadge}>HOY</span>}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{a.startTime} hrs</div>
                    </div>
                  )}
                </td>
                <td style={styles.td}>{a.barber?.name}</td>
                <td style={styles.td}>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}
                    style={{ ...styles.statusSelect, ...statusColor[a.status] }}
                  >
                    {Object.entries(STATUS_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td style={styles.td}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button title="Enviar recordatorio por WhatsApp" onClick={() => handleWhatsapp(a._id)} style={styles.iconBtn}>💬</button>
                    <button title="Editar fecha/hora" onClick={() => startEdit(a)} style={styles.iconBtn}>🕐</button>
                    <button title="Eliminar permanentemente" onClick={() => handleDelete(a._id)} style={{ ...styles.iconBtn, color: "var(--danger)" }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p style={{ padding: "1.5rem" }}>No hay citas que coincidan con el filtro.</p>
        )}
      </div>
    </div>
  );
}

const statusColor = {
  pendiente: { color: "var(--muted)" },
  confirmada: { color: "var(--gold-bright)" },
  completada: { color: "#22c55e" },
  cancelada: { color: "var(--danger)" },
};

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  theadRow: { borderBottom: "1px solid var(--navy-line)" },
  th: {
    textAlign: "left",
    padding: "1rem 1.25rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--muted)",
  },
  tr: { borderBottom: "1px solid var(--navy-line)" },
  td: { padding: "1rem 1.25rem", verticalAlign: "top", fontSize: "0.9rem" },
  todayBadge: {
    marginLeft: "0.5rem",
    background: "var(--gold)",
    color: "var(--navy-deep)",
    fontSize: "0.65rem",
    fontWeight: 700,
    padding: "0.1rem 0.4rem",
    borderRadius: "0.3rem",
  },
  statusSelect: {
    width: "auto",
    padding: "0.3rem 0.5rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "999px",
  },
  iconBtn: {
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "0.5rem",
    width: 32,
    height: 32,
    cursor: "pointer",
    color: "var(--cream)",
  },
};
