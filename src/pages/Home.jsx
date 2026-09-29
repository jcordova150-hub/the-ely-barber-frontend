import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { barberPhoto } from "../utils/barbers";

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
      <section className="home-hero" style={styles.hero}>
        <img src="/hero-bg.png" alt="" style={styles.heroBg} aria-hidden="true" />
        <div style={styles.heroOverlay} />
        <div className="container home-hero-content" style={styles.heroContent}>
          <div style={styles.badge}>Grooming Premium</div>
          <h1 className="home-hero-title" style={styles.heroTitle}>
            ELEVA TU <br />
            <span className="gold-gradient-text" style={{ fontStyle: "italic" }}>ESTILO</span>
          </h1>
          <p className="home-hero-sub" style={styles.heroSub}>
            No es solo un corte, es una experiencia. En The Ely Barber combinamos la tradición
            con la vanguardia para darte el mejor aspecto.
          </p>
          <div className="home-hero-buttons" style={styles.heroButtons}>
            <Link to="/reservar" className="btn btn-solid" style={{ fontSize: "1.05rem" }}>
              Reservar Ahora →
            </Link>
            <a
              href="https://wa.me/525660534952"
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
          <div className="home-service-grid" style={styles.serviceGrid}>
            {services.map((s) => (
              <div key={s._id} className="service-card" style={styles.serviceCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>{s.name}</h4>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>${s.price.toFixed(2)}</span>
                </div>
                {s.description && <p style={{ fontSize: "0.85rem", marginBottom: "0.5rem" }}>{s.description}</p>}
                <div
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    color: "var(--gold)",
    fontSize: "0.8rem",
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginTop: "0.35rem",
  }}
>
  <span
    style={{
      width: 24,
      height: 24,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(214, 165, 32, 0.45)",
      background: "rgba(214, 165, 32, 0.08)",
      boxShadow: "0 0 12px rgba(214, 165, 32, 0.08)",
      flexShrink: 0,
    }}
  >
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 3.5H15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  </span>

  <span>
    {s.durationMinutes} minutos
  </span>
</div>
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
          <div className="home-barber-header" style={styles.barberHeader}>
            <div>
              <div style={styles.eyebrow}>El Equipo</div>
              <h2 style={{ fontSize: "2.2rem" }}>Nuestros Barberos</h2>
            </div>
            <Link to="/reservar" className="btn" style={{ fontSize: "0.85rem" }}>
              Elegir Barbero
            </Link>
          </div>
          <div className="home-barber-grid" style={styles.barberGrid}>
            {barbers.map((b) => (
              <div key={b._id}>
                <div className="barber-photo-wrap" style={styles.barberAvatar}>
                  <img
                    className="barber-photo"
                    src={barberPhoto(b)}
                    alt={b.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
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
        <div className="container home-location-grid" style={styles.locationGrid}>
          <div>
            <div style={styles.eyebrow}>Visítanos</div>
            <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>Ubicación</h2>
            <p style={{ maxWidth: 420, marginBottom: "2rem" }}>
              Estamos ubicados en el corazón de Cancún. Ven y disfruta de una bebida de cortesía
              mientras te atendemos.
            </p>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
              <div
  style={{
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(214,165,32,.16), rgba(214,165,32,.035))",
    border: "1px solid rgba(214,165,32,.5)",
    boxShadow: "0 8px 24px rgba(0,0,0,.28)",
    color: "var(--gold)",
  }}
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 10.2C20 15.4 12 21 12 21C12 21 4 15.4 4 10.2C4 5.8 7.5 3 12 3C16.5 3 20 5.8 20 10.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="10"
      r="2.8"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
</div>
              <div>
                <div style={{ color: "var(--cream)", fontWeight: 600 }}>Dirección</div>
                <div>Cancún, Quintana Roo, México</div>
                <a
                  href="https://maps.app.goo.gl/esfKmrFpyt562YeV7"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 600 }}
                >
                  Abrir en Google Maps →
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <div
  className="location-whatsapp-icon"
  style={{
    width: 48,
    height: 48,
    minWidth: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, rgba(214,165,32,.16), rgba(214,165,32,.035))",
    border: "1px solid rgba(214,165,32,.5)",
    boxShadow: "0 8px 24px rgba(0,0,0,.28)",
    color: "var(--gold)",
  }}
>
  <svg
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 11.5C20 16.2 16.4 20 12 20C10.6 20 9.3 19.6 8.2 19L4 20L5.1 16.2C4.4 15 4 13.8 4 12.5C4 7.8 7.6 4 12 4C16.4 4 20 7.8 20 11.5Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M8.3 9.1C8.5 8.6 8.8 8.4 9.2 8.4H9.8C10 8.4 10.2 8.5 10.3 8.7L11 10.1C11.1 10.3 11.1 10.5 10.9 10.7L10.3 11.3C10.9 12.4 11.8 13.3 12.9 13.9L13.5 13.3C13.7 13.1 13.9 13.1 14.1 13.2L15.5 13.9C15.7 14 15.8 14.2 15.8 14.4V15.1C15.8 15.5 15.6 15.8 15.1 16C14.5 16.2 13.8 16.1 13.2 15.9C10.8 15.1 8.8 13.1 8 10.7C7.8 10.1 7.7 9.4 8.3 9.1Z"
      fill="currentColor"
    />
  </svg>
</div>
              <div>
                <div style={{ color: "var(--cream)", fontWeight: 600 }}>WhatsApp</div>
                <a
                  href="https://wa.me/525660534952"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--cream)" }}
                >56 6053 4952</a>
                <div>
                  <a
                    href="https://wa.me/525660534952"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--gold)", fontSize: "0.9rem", fontWeight: 600 }}
                  >
                    Escríbenos por WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="home-map-wrap" style={styles.mapWrap}>
            <iframe
              title="Ubicación The Ely Barber"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14881.750677202033!2d-86.8662667!3d21.1747657!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f4c2d0042f4a2b3%3A0xc05d04142b8e2b5f!2sTHE%20ELY%20BARBER!5e0!3m2!1ses-419!2smx!4v1790222034085!5m2!1ses-419!2smx"
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
    minHeight: "92vh",
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
  heroContent: { position: "relative", zIndex: 1, maxWidth: 700 },
  badge: {
    display: "inline-block",
    padding: "0.5rem 1.1rem",
    borderRadius: 999,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "var(--gold)",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "1.75rem",
  },
  heroTitle: { fontSize: "clamp(3.25rem, 8vw, 6.5rem)", lineHeight: 1.05, marginBottom: "1.75rem" },
  heroSub: { fontSize: "1.2rem", maxWidth: 520, marginBottom: "2.25rem" },
  heroButtons: { display: "flex", gap: "1.1rem", flexWrap: "wrap" },
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







