import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const emptyForm = { name: "", description: "", price: "", type: "servicio", durationMinutes: 30 };

export default function AdminServices() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const load = () => api.getServices(null, user.token).then(setItems);
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createService(
        { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) },
        user.token
      );
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    await api.deleteService(id, user.token);
    load();
  };

  const exportCsv = () => {
    const header = "Nombre,Tipo,Precio,Duracion(min)\n";
    const rows = items.map((i) => `${i.name},${i.type},${i.price},${i.durationMinutes || ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "articulos-the-block-barber.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "2rem" }}>
      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Agregar artículo</h2>
        <form onSubmit={handleSubmit} className="panel">
          <div className="field">
            <label htmlFor="iname">Nombre</label>
            <input id="iname" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="idesc">Descripción (opcional)</label>
            <input id="idesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="field">
            <label htmlFor="itype">Tipo</label>
            <select id="itype" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="servicio">Servicio (se agenda)</option>
              <option value="producto">Producto (solo se vende)</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="iprice">Precio</label>
            <input id="iprice" type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          {form.type === "servicio" && (
            <div className="field">
              <label htmlFor="idur">Duración (minutos)</label>
              <input id="idur" type="number" required value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
          )}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-solid">Agregar artículo</button>
        </form>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem" }}>Artículos ({items.length})</h2>
          <button className="btn btn-ghost" onClick={exportCsv}>Exportar precios (CSV)</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {items.map((i) => (
            <div key={i._id} className="panel" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem" }}>
              <div>
                <div style={{ color: "var(--cream)" }}>{i.name}</div>
                {i.description && <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{i.description}</div>}
                <div style={{ color: "var(--muted)", fontSize: "0.8rem", textTransform: "capitalize" }}>
                  {i.type}{i.type === "servicio" ? ` · ${i.durationMinutes} min` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "var(--gold-bright)", fontFamily: "var(--font-display)" }}>${i.price.toFixed(2)}</span>
                <button className="btn btn-danger" onClick={() => handleDelete(i._id)}>Eliminar</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p>Aún no hay artículos cargados.</p>}
        </div>
      </div>
    </div>
  );
}
