import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="container" style={{ padding: "3rem 1.5rem" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>Panel de administración</h1>
      <div className="admin-tabs" style={styles.tabs}>
        <NavLink to="/admin/citas" style={({ isActive }) => tabStyle(isActive)}>Citas</NavLink>
        <NavLink to="/admin/barberos" style={({ isActive }) => tabStyle(isActive)}>Barberos</NavLink>
        <NavLink to="/admin/articulos" style={({ isActive }) => tabStyle(isActive)}>Artículos y precios</NavLink>
        <NavLink to="/admin/clientes" style={({ isActive }) => tabStyle(isActive)}>Clientes</NavLink>
        <NavLink to="/admin/fidelidad" style={({ isActive }) => tabStyle(isActive)}>Fidelidad</NavLink>
      </div>
      <Outlet />
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: "0.6rem 0",
  marginRight: "1.75rem",
  color: isActive ? "var(--gold-bright)" : "var(--muted)",
  borderBottom: isActive ? "2px solid var(--gold)" : "2px solid transparent",
  fontWeight: 500,
});

const styles = {
  tabs: { display: "flex", borderBottom: "1px solid var(--navy-line)", marginBottom: "2rem" },
};
