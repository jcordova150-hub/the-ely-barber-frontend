import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.register(form);
      login(user);
      navigate("/mis-citas");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "4rem 1.5rem" }}>
      <h1 style={{ marginBottom: "1.75rem" }}>Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="name">Nombre</label>
          <input id="name" required value={form.name} onChange={update("name")} />
        </div>
        <div className="field">
          <label htmlFor="phone">Teléfono (WhatsApp)</label>
          <input id="phone" required placeholder="52 998 123 4567" value={form.phone} onChange={update("phone")} />
        </div>
        <div className="field">
          <label htmlFor="email">Correo</label>
          <input id="email" type="email" required value={form.email} onChange={update("email")} />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" required minLength={6} value={form.password} onChange={update("password")} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-solid" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p style={{ marginTop: "1.25rem" }}>
        ¿Ya tienes cuenta? <Link to="/login">Entra aquí</Link>
      </p>
    </div>
  );
}
