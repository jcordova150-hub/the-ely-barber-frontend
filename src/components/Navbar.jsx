import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <img src="/logo.png" alt="The Block Barber" style={styles.logo} />
          <div>
            <div style={styles.brandName}>The Block Barber</div>
            <div style={styles.tagline}>Estilo · Precisión · Tradición</div>
          </div>
        </Link>

        <nav style={styles.nav}>
          {user?.role === "admin" && (
            <Link to="/admin" style={styles.link}>
              Panel
            </Link>
          )}
          {user && user.role !== "admin" && (
            <Link to="/mis-citas" style={styles.link}>
              Mis citas
            </Link>
          )}
          {user ? (
            <button className="btn btn-ghost" onClick={handleLogout}>
              Salir
            </button>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Entrar
              </Link>
              <Link to="/reservar" className="btn btn-solid">
                Reservar cita
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--navy-line)",
    padding: "1rem 0",
    position: "sticky",
    top: 0,
    background: "rgba(13, 13, 13, 0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 10,
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logo: { width: 42, height: 42, objectFit: "contain" },
  brandName: {
    fontFamily: "var(--font-display)",
    color: "var(--cream)",
    fontSize: "1.1rem",
    lineHeight: 1.2,
  },
  tagline: {
    fontSize: "0.7rem",
    color: "var(--gold)",
    letterSpacing: "0.03em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  link: {
    color: "var(--muted)",
    fontSize: "0.95rem",
  },
};
