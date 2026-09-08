import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <Link to="/" style={styles.brand}>
          <img src="/logo.png" alt="The Block Barber" style={styles.logo} />
          <div style={styles.brandName}>
            THE BLOCK<br />BARBER
          </div>
        </Link>

        <nav style={styles.nav}>
          <Link to="/" style={{ ...styles.link, ...(isActive("/") ? styles.linkActive : {}) }}>Inicio</Link>
          <Link to="/reservar" style={{ ...styles.link, ...(isActive("/reservar") ? styles.linkActive : {}) }}>Reservar</Link>
          {user?.role === "admin" ? (
            <Link to="/admin" style={{ ...styles.link, ...(isActive("/admin") ? styles.linkActive : {}) }}>Admin</Link>
          ) : (
            <Link to="/login" style={{ ...styles.link, ...(isActive("/login") ? styles.linkActive : {}) }}>Admin</Link>
          )}
          {user?.role === "admin" && (
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: "0.4rem 0.9rem" }}>
              Salir
            </button>
          )}
          <Link to="/reservar" className="btn btn-solid">
            Agendar Cita
          </Link>
        </nav>
      </div>
    </header>
  );
}

const styles = {
  header: {
    borderBottom: "1px solid var(--navy-line)",
    padding: "1.4rem 0",
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
  logo: {
    width: 76,
    height: 76,
    objectFit: "contain",
    borderRadius: "50%",
    filter: "drop-shadow(0 0 8px rgba(217,165,32,0.5))",
  },
  brandName: {
    fontFamily: "var(--font-display)",
    color: "var(--gold)",
    fontSize: "1.6rem",
    lineHeight: 1.1,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.75rem",
  },
  link: {
    color: "var(--muted)",
    fontSize: "1.02rem",
    fontWeight: 500,
  },
  linkActive: {
    color: "var(--gold)",
  },
};
