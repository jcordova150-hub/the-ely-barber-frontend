import { useEffect, useState } from "react";
import { api } from "../api";

const WHATSAPP_URL = "https://wa.me/525660534952";

const SOCIALS = {
  facebook: "https://www.facebook.com/share/1DhvofmE42/",
  instagram: "https://www.instagram.com/theelybarber?stkn=a3VqaTYwY2VzMmZ1",
  tiktok: "https://www.tiktok.com/@the.ely.barber?_r=1&_t=ZS-99vuZs997i9",
};

const DEFAULT_SCHEDULE = [
  { day: "lunes", open: true, startTime: "11:00", endTime: "21:00" },
  { day: "martes", open: true, startTime: "11:00", endTime: "21:00" },
  { day: "miercoles", open: true, startTime: "14:00", endTime: "21:00" },
  { day: "jueves", open: true, startTime: "11:00", endTime: "21:00" },
  { day: "viernes", open: true, startTime: "11:00", endTime: "21:00" },
  { day: "sabado", open: true, startTime: "11:00", endTime: "20:00" },
  { day: "domingo", open: true, startTime: "11:00", endTime: "18:00" },
];

const DAY_LABELS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

function formatTime(value) {
  if (!value) return "";

  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
}

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
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  useEffect(() => {
    api.getBusinessSettings()
      .then((data) => {
        if (Array.isArray(data.schedule) && data.schedule.length) {
          setSchedule(data.schedule);
        }
      })
      .catch(() => {
        // Si el backend no responde, se conserva el horario predeterminado.
      });
  }, []);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="footer-brand-link" aria-label="Volver al inicio">
            <img src="/logo.png" alt="The Ely Barber" className="footer-logo" />
            <div className="footer-brand-name">THE ELY<br />BARBER</div>
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

          <a
            className="footer-contact-link"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-icon whatsapp-icon">◉</span>
            <span>56 6053 4952</span>
          </a>

          <a
            className="footer-line footer-contact-link"
            href="https://maps.app.goo.gl/esfKmrFpyt562YeV7"
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-icon">●</span> Ver ubicación en Google Maps
          </a>

          <a
            className="whatsapp-button"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="whatsapp-dot">◉</span>
            Escríbenos por WhatsApp <span>→</span>
          </a>
        </div>

        <div className="footer-column">
          <h4>Horarios</h4>

          {schedule.map((item) => (
            <p className="footer-line" key={item.day}>
              {DAY_LABELS[item.day] || item.day}:{" "}
              {item.open
                ? `${formatTime(item.startTime)} – ${formatTime(item.endTime)}`
                : "Cerrado"}
            </p>
          ))}

          <div
            className="footer-socials footer-hours-socials"
            aria-label="Redes sociales"
          >
            <SocialIcon href={SOCIALS.facebook} label="Facebook">f</SocialIcon>
            <SocialIcon href={SOCIALS.instagram} label="Instagram">◎</SocialIcon>
            <SocialIcon href={SOCIALS.tiktok} label="TikTok">♪</SocialIcon>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 The Ely Barber. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}