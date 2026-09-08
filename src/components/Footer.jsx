export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.grid}>
        <div style={styles.brandCol}>
          <img src="/logo.png" alt="The Block Barber" style={styles.logo} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--gold)" }}>
            THE BLOCK BARBER
          </div>
        </div>

        <div>
          <h4 style={styles.heading}>Contacto</h4>
          <p style={styles.line}>📞 56 6036 2095</p>
          <p style={styles.line}>📍 Cancún, Quintana Roo, México</p>
        </div>

        <div>
          <h4 style={styles.heading}>Horarios</h4>
          <p style={styles.line}>Lunes – Sábado: 11:00 AM – 8:00 PM</p>
          <p style={{ ...styles.line, color: "var(--gold)" }}>Domingo: 11:00 AM – 4:00 PM</p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
            <a href="#" aria-label="Instagram" style={styles.socialIcon}>IG</a>
            <a href="#" aria-label="Facebook" style={styles.socialIcon}>FB</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid var(--navy-line)",
    background: "var(--navy-deep)",
    padding: "3rem 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
    gap: "2rem",
  },
  brandCol: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  logo: { width: 56, height: 56, objectFit: "contain" },
  heading: { color: "var(--cream)", fontSize: "1rem", marginBottom: "0.75rem", fontFamily: "var(--font-display)" },
  line: { fontSize: "0.9rem", margin: "0 0 0.4rem 0" },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "var(--navy-panel)",
    border: "1px solid var(--navy-line)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    color: "var(--cream)",
  },
};
