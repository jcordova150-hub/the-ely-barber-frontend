import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const DAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const emptyForm = { name: "", phone: "", schedule: [] };

export default function AdminBarbers() {
  const { user } = useAuth();
  const [barbers, setBarbers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.getBarbers().then(setBarbers);
  useEffect(load, []);

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
    setForm({ name: barber.name, phone: barber.phone || "", schedule: barber.schedule || [] });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.updateBarber(editingId, form, user.token);
      } else {
        await api.createBarber(form, user.token);
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
  );
}
