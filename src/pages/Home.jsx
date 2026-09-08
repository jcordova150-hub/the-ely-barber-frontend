import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    api.getServices("servicio").then(setServices).catch(() => {});
    api.getBarbers().then(setBarbers).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={styles.hero}>
        <img src="/hero-bg.png" alt="" style={styles.heroBg} aria-hidden="true" />
        <div style={styles.heroOverlay} />
        <div className="container" style={styles.heroContent}>
          <div style={styles.badge}>★ Grooming Premium</div>
          <h1 style={styles.heroTitle}>
            ELEVA TU <br />
            <span className="gold-gradient-text" style={{ fontStyle: "italic" }}>ESTILO</span>
          </h1>
          <p style={styles.heroSub}>
            No es solo un corte, es una experiencia. En The Block Barber combinamos la tradición
            con la vanguardia para darte el mejor aspecto.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/reservar" className="btn btn-solid" style={{ fontSize: "1.05rem" }}>
              Reservar Ahora →
            </Link>
            <a
              href="https://wa.me/5215660362095"
              target="_blank"
              rel="noreferrer"
              className="btn btn-whatsapp"
              style={{ fontSize: "1.05rem" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section style={{ padding: "5rem 0", background: "var(--navy-panel)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={styles.eyebrow}>Nuestra Especialidad</div>
            <h2 style={{ fontSize: "2.2rem" }}>Servicios</h2>
          </div>
          <div style={styles.serviceGrid}>
            {services.map((s) => (
              <div key={s._id} className="service-card" style={styles.serviceCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>{s.name}</h4>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>${s.price.toFixed(2)}</span>
                </div>
                {s.description && <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{s.description}</p>}
                <div style={styles.durationRow}>⏱ {s.durationMinutes} minutos</div>
              </div>
            ))}
            {services.length === 0 && <p>Aún no hay servicios cargados.</p>}
          </div>
        </div>
      </section>

      {/* BARBEROS */}
      <section style={styles.barberSection}>
        <img src="/tools-bg.png" alt="" style={styles.toolsBg} aria-hidden="true" />
        <div style={styles.toolsOverlay} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={styles.barberHeader}>
            <div>
              <div style={styles.eyebrow}>El Equipo</div>
              <h2 style={{ fontSize: "2.2rem" }}>Nuestros Barberos</h2>
            </div>
            <Link to="/reservar" className="btn" style={{ fontSize: "0.85rem" }}>
              Elegir Barbero
            </Link>
          </div>
          <div style={styles.barberGrid}>
            {barbers.map((b) => (
              <div key={b._id}>
                <div style={styles.barberAvatar}>{b.name.charAt(0)}</div>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: "0.25rem" }}>
                  {b.name}
                </h4>
                {b.specialties?.length > 0 && (
                  <p style={{ color: "var(--gold)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                    {b.specialties.join(" • ")}
                  </p>
                )}
                {b.bio && <p style={{ fontSize: "0.85rem" }}>{b.bio}</p>}
              </div>
            ))}
            {barbers.length === 0 && <p>Aún no hay barberos registrados.</p>}
          </div>
        </div>
      </section>

      {/* UBICACIÓN */}
      <section style={{ padding: "5rem 0", background: "var(--navy-panel)", borderTop: "1px solid var(--navy-line)" }}>
        <div className="container" style={styles.locationGrid}>
          <div>
            <div style={styles.eyebrow}>Visítanos</div>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>Ubicación</h2>
            <p style={{ maxWidth: 420, marginBottom: "2rem" }}>
              Estamos ubicados en el corazón de Cancún. Ven y disfruta de una bebida de cortesía
              mientras te atendemos.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={styles.iconCircleSmall}>📍</div>
              <div>
                <div style={{ color: "var(--cream)", fontWeight: 600 }}>Dirección</div>
                <div>Cancún, Quintana Roo, México</div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=The+Block+Barber+Cancun"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 600 }}
                >
                  Abrir en Google Maps →
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={styles.iconCircleSmall}>📞</div>
              <div>
                <div style={{ color: "var(--cream)", fontWeight: 600 }}>Teléfono</div>
                <div>56 6036 2095</div>
              </div>
            </div>
          </div>
          <div style={styles.mapWrap}>
            <iframe
              title="Ubicación The Block Barber"
              src="https://www.google.com/maps?q=The+Block+Barber+Cancun&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero: {
    position: "relative",
    minHeight: "90vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.5,
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, var(--navy-deep) 10%, transparent 60%), linear-gradient(to right, var(--navy-deep) 20%, transparent 70%)",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 640 },
  badge: {
    display: "inline-block",
    padding: "0.4rem 0.9rem",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--gold)",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "1.5rem",
  },
  heroTitle: { fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1, marginBottom: "1.5rem" },
  heroSub: { fontSize: "1.1rem", maxWidth: 460, marginBottom: "2rem" },
  heroButtons: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  eyebrow: {
    color: "var(--gold)",
    fontSize: "0.8rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "0.5rem",
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "1.25rem",
  },
  serviceCard: {
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "1rem",
    padding: "1.5rem",
  },
  durationRow: { color: "var(--muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" },
  barberSection: { position: "relative", padding: "5rem 0", overflow: "hidden" },
  toolsBg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.12 },
  toolsOverlay: { position: "absolute", inset: 0, background: "rgba(13,13,13,0.9)" },
  barberHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "3rem",
  },
  barberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "2rem",
  },
  barberAvatar: {
    aspectRatio: "3/4",
    borderRadius: "1rem",
    background: "linear-gradient(135deg, var(--navy-panel), var(--navy-line))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-display)",
    fontSize: "3rem",
    color: "var(--gold)",
    marginBottom: "1rem",
  },
  locationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "var(--gold-soft)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  mapWrap: {
    height: 320,
    borderRadius: "1rem",
    overflow: "hidden",
    border: "1px solid var(--navy-line)",
  },
};
