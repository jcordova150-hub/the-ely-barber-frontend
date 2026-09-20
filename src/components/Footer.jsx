const WHATSAPP_URL = "https://wa.me/5215660362095";
const SOCIALS = {
  facebook: "https://www.facebook.com/share/1BxWHjaHEU/",
  instagram: "https://www.instagram.com/barbertheblock?stkn=eTZ1d3FjZGI4eXRy",
  tiktok: "https://www.tiktok.com/@theblockbarber1?is_from_webapp=1&sender_device=pc",
};

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="social-icon"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="footer-brand-link" aria-label="Volver al inicio">
            <img src="/logo.png" alt="The Block Barber" className="footer-logo" />
            <div className="footer-brand-name">THE BLOCK<br />BARBER</div>
          </a>
          <p className="footer-description">
            Tu estilo, nuestra pasión. La mejor experiencia de barbería en Cancún,
            combinando técnicas clásicas con tendencias modernas.
          </p>
          <div className="footer-socials" aria-label="Redes sociales">
            <SocialIcon href={SOCIALS.facebook} label="Facebook">f</SocialIcon>
            <SocialIcon href={SOCIALS.instagram} label="Instagram">◎</SocialIcon>
            <SocialIcon href={SOCIALS.tiktok} label="TikTok">♪</SocialIcon>
          </div>
        </div>

        <div className="footer-column">
          <h4>Contacto</h4>
          <a className="footer-contact-link" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <span className="contact-icon whatsapp-icon">◉</span>
            <span>56 6036 2095</span>
          </a>
          <p className="footer-line"><span className="contact-icon">●</span> Cancún, Quintana Roo, México</p>
          <a className="whatsapp-button" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            <span className="whatsapp-dot">◉</span>
            Escríbenos por WhatsApp <span>→</span>
          </a>
        </div>

        <div className="footer-column">
          <h4>Horarios</h4>
          <p className="footer-line">Lunes – Sábado: 11:00 AM – 8:00 PM</p>
          <p className="footer-line footer-gold">Domingo: 11:00 AM – 4:00 PM</p>
          <div className="footer-socials footer-hours-socials" aria-label="Redes sociales">
            <SocialIcon href={SOCIALS.facebook} label="Facebook">f</SocialIcon>
            <SocialIcon href={SOCIALS.instagram} label="Instagram">◎</SocialIcon>
            <SocialIcon href={SOCIALS.tiktok} label="TikTok">♪</SocialIcon>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 The Block Barber. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
