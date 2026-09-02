import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices("servicio").then(setServices).catch(() => {});
  }, []);

  return (
    <div>
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <img src="/logo.png" alt="" style={styles.heroLogo} aria-hidden="true" />
          <h1 style={styles.heroTitle}>The Block Barber</h1>
          <p style={styles.heroTagline}>Estilo · Precisión · Tradición</p>
          <p style={styles.heroSub}>
            Reserva tu lugar en la silla. Elige servicio, barbero y horario en menos de un minuto.
          </p>
          <Link to="/reservar" className="btn btn-solid" style={{ fontSize: "1rem" }}>
            Reservar cita
          </Link>
        </div>
      </section>

      <section className="container" style={{ padding: "3rem 1.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>Servicios</h2>
        <p>El precio se paga directamente en el local.</p>
        <div style={styles.grid}>
          {services.map((s) => (
            <div key={s._id} className="panel" style={styles.serviceCard}>
              <div style={styles.serviceName}>{s.name}</div>
              <div style={styles.servicePrice}>${s.price.toFixed(2)}</div>
            </div>
          ))}
          {services.length === 0 && (
            <p>Aún no hay servicios cargados. El administrador puede agregarlos desde el panel.</p>
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    borderBottom: "1px solid var(--navy-line)",
    padding: "4.5rem 0 4rem",
    textAlign: "center",
  },
  heroInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heroLogo: { width: 120, height: 120, objectFit: "contain", marginBottom: "1.5rem" },
  heroTitle: { fontSize: "2.6rem", letterSpacing: "0.02em" },
  heroTagline: {
    color: "var(--gold)",
    fontSize: "0.95rem",
    margin: "0.6rem 0 1.5rem",
    letterSpacing: "0.04em",
  },
  heroSub: { maxWidth: 440, margin: "0 auto 2rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  serviceCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceName: { color: "var(--cream)", fontWeight: 500 },
  servicePrice: { color: "var(--gold-bright)", fontFamily: "var(--font-display)" },
};
