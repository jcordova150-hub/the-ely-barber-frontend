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
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="The Ely Barber" className="navbar-logo" />
          <div className="navbar-brand-name">
            THE ELY BARBER
          </div>
        </Link>

        <nav style={styles.nav}>
          <Link
            to="/"
            style={{ ...styles.link, ...(isActive("/") ? styles.linkActive : {}) }}
          >
            Inicio
          </Link>

          <Link
            to="/reservar"
            style={{ ...styles.link, ...(isActive("/reservar") ? styles.linkActive : {}) }}
          >
            Reservar
          </Link>

          <Link
            to="/barbero"
            style={{ ...styles.link, ...(isActive("/barbero") ? styles.linkActive : {}) }}
          >
            Barberos
          </Link>

          {user?.role === "barber" ? (
            <Link
              to="/mis-citas"
              style={{
                ...styles.link,
                ...(isActive("/mis-citas") ? styles.linkActive : {}),
              }}
            >
              Mis citas
            </Link>
          ) : user?.role === "admin" ? (
            <Link
              to="/admin"
              style={{
                ...styles.link,
                ...(isActive("/admin") ? styles.linkActive : {}),
              }}
            >
              Admin
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                ...styles.link,
                ...(isActive("/login") ? styles.linkActive : {}),
              }}
            >
              Admin
            </Link>
          )}

          {user?.role === "barber" && (
            <button
              className="btn btn-ghost"
              onClick={handleLogout}
              style={{ padding: "0.4rem 0.9rem" }}
            >
              Salir
            </button>
          )}

          {user?.role === "admin" && (
            <button
              className="btn btn-ghost"
              onClick={handleLogout}
              style={{ padding: "0.4rem 0.9rem" }}
            >
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
    padding: "0.35rem 0",
    position: "sticky",
    top: 0,
    background: "rgba(13, 13, 13, 0.94)",
    backdropFilter: "blur(10px)",
    zIndex: 10,
  },
  inner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
  },
  link: {
    color: "var(--muted)",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  linkActive: {
    color: "var(--gold)",
  },
};
