import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const emptyForm = { name: "", phone: "", bio: "", specialties: "", schedule: [] };

export default function AdminBarbers() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.getAllBarbers(user.token).then(setBarbers);
  useEffect(() => { load(); }, []);

  const setStatus = async (barber, status) => {
    await api.updateBarber(barber._id, { status }, user.token);
    load();
  };

  const toggleDay = (day) => {
    const exists = form.schedule.find((s) => s.day === day);
    if (exists) {
      setForm({ ...form, schedule: form.schedule.filter((s) => s.day !== day) });
    } else {
      setForm({ ...form, schedule: [...form.schedule, { day, startTime: "09:00", endTime: "18:00" }] });
    }
  };

  const updateDayTime = (day, field, value) => {
    setForm({
      ...form,
      schedule: form.schedule.map((s) => (s.day === day ? { ...s, [field]: value } : s)),
    });
  };

  const startEdit = (barber) => {
    setEditingId(barber._id);
    setForm({
      name: barber.name,
      phone: barber.phone || "",
      bio: barber.bio || "",
      specialties: (barber.specialties || []).join(", "),
      schedule: barber.schedule || [],
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editingId) {
        await api.updateBarber(editingId, payload, user.token);
      } else {
        await api.createBarber(payload, user.token);
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este barbero?")) return;
    await api.deleteBarber(id, user.token);
    load();
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Disponibilidad de Barberos</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
        {barbers.map((b) => (
          <div key={b._id} className="panel" style={{ display: "flex", alignItems: "center", gap: "0.9rem", flex: "1 1 320px" }}>
            <div className="barber-photo-wrap" style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
              <img
                className="barber-photo"
                src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop"
                alt={b.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--cream)", fontWeight: 600 }}>{b.name}</div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                onClick={() => setStatus(b, "disponible")}
                style={{ ...statusBtnStyle, ...(b.status === "disponible" ? statusActive.disponible : {}) }}
              >
                Disponible
              </button>
              <button
                onClick={() => setStatus(b, "ausente")}
                style={{ ...statusBtnStyle, ...(b.status === "ausente" ? statusActive.ausente : {}) }}
              >
                Ausente
              </button>
              <button
                onClick={() => setStatus(b, "retirado")}
                style={{ ...statusBtnStyle, ...(b.status === "retirado" ? statusActive.retirado : {}) }}
              >
                Retirado
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          {editingId ? "Editar barbero" : "Agregar barbero"}
        </h2>
        <form onSubmit={handleSubmit} className="panel">
          <div className="field">
            <label htmlFor="bname">Nombre</label>
            <input id="bname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bphone">Teléfono</label>
            <input id="bphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bbio">Biografía corta</label>
            <input id="bbio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="bspec">Especialidades (separadas por coma)</label>
            <input id="bspec" placeholder="Fade, Cortes modernos, Diseño de líneas" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          </div>
          <div className="field">
            <label>Días y horario de trabajo</label>
            {DAYS.map((day) => {
              const active = form.schedule.find((s) => s.day === day);
              return (
                <div key={day} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <input
                    type="checkbox"
                    id={day}
                    checked={!!active}
                    onChange={() => toggleDay(day)}
                    style={{ width: "auto" }}
                  />
                  <label htmlFor={day} style={{ margin: 0, width: 90, textTransform: "capitalize" }}>{day}</label>
                  {active && (
                    <>
                      <input type="time" value={active.startTime} onChange={(e) => updateDayTime(day, "startTime", e.target.value)} />
                      <input type="time" value={active.endTime} onChange={(e) => updateDayTime(day, "endTime", e.target.value)} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {error && <p className="error-text">{error}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-solid">{editingId ? "Guardar cambios" : "Agregar"}</button>
            {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Barberos activos</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {barbers.map((b) => (
            <div key={b._id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "var(--cream)" }}>{b.name}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  {b.schedule?.length ? `${b.schedule.length} días activos` : "Sin horario configurado"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-ghost" onClick={() => startEdit(b)}>Editar</button>
                <button className="btn btn-danger" onClick={() => handleDelete(b._id)}>Eliminar</button>
              </div>
            </div>
          ))}
          {barbers.length === 0 && <p>Aún no hay barberos registrados.</p>}
        </div>
      </div>
      </div>
    </div>
  );
}

const statusBtnStyle = {
  padding: "0.4rem 0.7rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  borderRadius: "999px",
  border: "1px solid var(--navy-line)",
  background: "var(--navy-deep)",
  color: "var(--muted)",
  cursor: "pointer",
};

const statusActive = {
  disponible: { background: "rgba(34,197,94,0.15)", borderColor: "#22c55e", color: "#22c55e" },
  ausente: { background: "rgba(217,165,32,0.15)", borderColor: "var(--gold)", color: "var(--gold-bright)" },
  retirado: { background: "rgba(229,83,61,0.15)", borderColor: "var(--danger)", color: "var(--danger)" },
};
