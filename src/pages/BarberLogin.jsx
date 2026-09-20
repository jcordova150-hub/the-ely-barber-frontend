import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function BarberLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.barberLogin(username, password);
      login(user);
      navigate("/mis-citas");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, padding: "6rem 1.5rem" }}>
      <form onSubmit={submit} className="panel" style={{ textAlign: "center", borderTop: "2px solid var(--gold)" }}>
        <div style={styles.icon}>✂️</div>
        <h1 style={{ fontSize: "1.5rem", marginBottom: ".3rem" }}>Acceso Barberos</h1>
        <p style={{ marginBottom: "1.5rem" }}>Consulta tus citas</p>
        <div className="field" style={{ textAlign: "left" }}>
          <label htmlFor="username">Usuario</label>
          <input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu nombre" />
        </div>
        <div className="field" style={{ textAlign: "left" }}>
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-solid" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  icon: { width: 56, height: 56, borderRadius: "50%", background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "1.5rem" },
};
