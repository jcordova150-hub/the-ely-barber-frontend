import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.adminLogin(password);
      login(user);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 380, padding: "6rem 1.5rem" }}>
      <form onSubmit={handleSubmit} className="panel" style={{ textAlign: "center", borderTop: "2px solid var(--gold)" }}>
        <div style={styles.iconCircle}>🔒</div>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>Panel Admin</h1>
        <p style={{ marginBottom: "1.5rem" }}>The Ely Barber</p>
        <div className="field" style={{ textAlign: "left", position: "relative" }}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="Ingresa la contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-solid" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "var(--gold-soft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    margin: "0 auto 1rem",
  },
  eyeBtn: {
    position: "absolute",
    right: "0.75rem",
    top: "2.1rem",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
};
