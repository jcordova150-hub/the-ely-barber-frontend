import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

const gold = "#d6a94f";
const lightGold = "#f5d77a";
const darkGold = "#8f6717";

export default function LoyaltyCard() {
  const { publicCode } = useParams();

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCard() {
      try {
        setLoading(true);
        setError("");

        const data = await api.getLoyaltyCard(publicCode);
        setCard(data);
      } catch (err) {
        setError(err?.message || "No se pudo cargar la tarjeta.");
      } finally {
        setLoading(false);
      }
    }

    loadCard();
  }, [publicCode]);

  if (loading) {
    return (
      <div style={styles.screen}>
        <div style={styles.message}>Cargando tarjeta...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div style={styles.screen}>
        <div style={styles.message}>
          {error || "Tarjeta no encontrada."}
        </div>
      </div>
    );
  }

  const goal = card.stampsGoal || 10;
  const stamps = card.stamps || 0;
  const completed = stamps >= goal || card.rewardsAvailable > 0;

  return (
    <div style={styles.screen}>
      <main style={styles.card}>
        <div style={styles.header}>
          <div>
            <div style={styles.brand}>THE ELY BARBER</div>

            <h1 style={styles.title}>TARJETA DE FIDELIDAD</h1>

            <div style={styles.subtitle}>
              ACUMULA VISITAS Y OBT{"\u00C9"}N CORTES GRATIS
            </div>
          </div>

          <img
            src="/logo.png"
            alt="The Ely Barber"
            style={styles.logo}
          />
        </div>

        <div style={styles.divider} />

        {completed && (
          <div style={styles.completedBanner}>
            <div style={styles.completedTitle}>
              TARJETA COMPLETA
            </div>

            <div style={styles.completedSubtitle}>
              LISTA PARA REINICIARSE
            </div>
          </div>
        )}

        <div style={styles.stampGrid}>
          {Array.from({ length: goal }).map((_, index) => {
            const number = index + 1;
            const active = index < stamps;
            const prize = number === 5 || number === goal;

            return (
              <div
                key={number}
                style={{
                  ...styles.stamp,
                  ...(active ? styles.activeStamp : {}),
                  ...(prize ? styles.prizeStamp : {}),
                  ...(prize && active ? styles.prizeWon : {}),
                }}
              >
                {prize ? (
                  <>
                    <div className="loyalty-public-prize-gift" style={styles.giftIcon}>
                      {"\uD83C\uDF81"}
                    </div>

                    <div className="loyalty-public-prize-congrats" style={active ? styles.prizeSmallWon : styles.prizeSmall}>
                      {"\u00A1"}FELICIDADES!
                    </div>

                    <div className="loyalty-public-prize-cut" style={active ? styles.prizeBigWon : styles.prizeBig}>
                      CORTE
                      <br />
                      GRATIS
                    </div>
                  </>
                ) : active ? (
                  <img
                    src="/logo.png"
                    alt=""
                    style={styles.stampLogo}
                  />
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.bottomDivider} />

        <div style={styles.client}>
          <div style={styles.clientName}>{card.name}</div>

          <div style={styles.progress}>
            {stamps} de {goal} visitas
          </div>

          {completed && (
            <div style={styles.reward}>
              {"\u2605"} CORTE GRATIS DISPONIBLE {"\u2605"}
            </div>
          )}
        </div>

        <div style={styles.contactButtons}>
          <a
            href="/reservar"
            style={styles.contactButton}
          >
            AGENDAR CITA
          </a>

          <a
            href="https://www.facebook.com/share/1DhvofmE42/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            <FaFacebookF size={24} aria-hidden="true" />
          </a>

          <a
            href="https://www.instagram.com/theelybarber?stkn=a3VqaTYwY2VzMmZ1"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            <FaInstagram size={24} aria-hidden="true" />
          </a>

          <a
            href="https://www.tiktok.com/@the.ely.barber?_r=1&_t=ZS-99vuZs997i9"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            <FaTiktok size={24} aria-hidden="true" />
          </a>

          <a
            href="https://maps.app.goo.gl/esfKmrFpyt562YeV7"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.contactButton}
          >
            CÓMO LLEGAR
          </a>
        </div>
      </main>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100vh",
    background: "#080808",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "clamp(10px, 3vw, 30px)",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: 760,
    background:
      "linear-gradient(145deg, #050505 0%, #0d0d0d 55%, #050505 100%)",
    border: `1px solid ${gold}`,
    borderRadius: 18,
    padding: "clamp(18px, 4vw, 30px)",
    boxSizing: "border-box",
    boxShadow:
      "0 20px 55px rgba(0,0,0,.75), 0 0 25px rgba(214,169,79,.08)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
  },

  brand: {
    color: lightGold,
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 900,
    letterSpacing: "0.14em",
    fontSize: "clamp(1.05rem, 4vw, 1.55rem)",
    textShadow:
      "0 1px 0 #8b6418, 0 2px 8px rgba(214,169,79,.45), 0 0 18px rgba(245,215,122,.18)",
    display: "inline-block",
    paddingBottom: "0.3rem",
    borderBottom: "1px solid rgba(214,169,79,.65)",
  },

  title: {
    color: gold,
    fontFamily: "Georgia, 'Times New Roman', serif",
    margin: "0.65rem 0 0.3rem",
    fontSize: "clamp(1.55rem, 5vw, 2.6rem)",
    lineHeight: 1,
  },

  subtitle: {
    color: gold,
    fontSize: "clamp(.62rem, 2vw, .78rem)",
    letterSpacing: "0.04em",
  },

  logo: {
    width: "clamp(62px, 15vw, 100px)",
    height: "clamp(62px, 15vw, 100px)",
    objectFit: "contain",
    flexShrink: 0,
  },

  divider: {
    height: 1,
    background: darkGold,
    margin: "1rem 0",
  },

  completedBanner: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.8rem 1rem",
    marginBottom: "1.2rem",
    border: `1px solid ${lightGold}`,
    borderRadius: 8,
    background:
      "linear-gradient(135deg, #a97916 0%, #e0b83e 25%, #f5d77a 50%, #d6a94f 75%, #9a6d12 100%)",
    boxShadow:
      "0 0 18px rgba(214,169,79,.55), inset 0 1px 0 rgba(255,255,255,.55)",
    textAlign: "center",
  },

  completedTitle: {
    color: "#080808",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(1.05rem, 4vw, 1.4rem)",
    fontWeight: 900,
    letterSpacing: "0.08em",
  },

  completedSubtitle: {
    color: "#080808",
    fontSize: "0.65rem",
    fontWeight: 900,
    letterSpacing: "0.2em",
    marginTop: "0.25rem",
  },

  stampGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: "clamp(6px, 2vw, 12px)",
  },

  stamp: {
    aspectRatio: "1 / 1",
    minWidth: 0,
    border: `2px solid ${gold}`,
    borderRadius: 11,
    background: "#111",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  activeStamp: {
    background:
      "radial-gradient(circle at center, rgba(214,169,79,.18), #080808 72%)",
  },

  prizeStamp: {
    background:
      "linear-gradient(135deg, #c18e20 0%, #f5d77a 50%, #b47d15 100%)",
    color: "#050505",
    boxShadow: "0 0 14px rgba(214,169,79,.45)",
  },

  prizeWon: {
    background: "linear-gradient(135deg, #8b6419 0%, #f5d77a 45%, #d6a94f 70%, #8b6419 100%)",
    border: "3px solid #f5d77a",
    boxShadow: "0 0 18px rgba(214,169,79,.85), inset 0 0 12px rgba(255,255,255,.25)",
    transform: "scale(1.04)",
  },

  stampLogo: {
    width: "82%",
    height: "82%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
    borderRadius: "50%",
    border: `2px solid ${gold}`,
    background: "#000",
    boxSizing: "border-box",
  },

  number: {
    color: gold,
    fontSize: "clamp(1rem, 4vw, 1.7rem)",
    fontWeight: 900,
  },

  giftIcon: {
    fontSize: "2.5rem",
    lineHeight: 1,
    marginBottom: "0.25rem",
    filter: "sepia(1) saturate(4) hue-rotate(355deg) drop-shadow(0 2px 3px rgba(0,0,0,.45))",
  },

  prizeSmallWon: {
    fontSize: "0.9rem",
    display: "block",
    marginBottom: "0.35rem",
    letterSpacing: "0.08em",
    color: "#050505",
    fontWeight: 900,
    textAlign: "center",
  },

  prizeBigWon: {
    fontSize: "1rem",
    textAlign: "center",
    lineHeight: 1.05,
    marginTop: "0.25rem",
    color: "#050505",
    fontWeight: 900,
    textShadow: "0 1px 0 rgba(255,255,255,.3)",
  },

  prizeSmall: {
    fontSize: "0.55rem",
    letterSpacing: "0.08em",
  },

  prizeBig: {
    fontSize: "0.9rem",
    textAlign: "center",
    lineHeight: 1.05,
    marginTop: "0.3rem",
  },

  bottomDivider: {
    height: 1,
    background: darkGold,
    margin: "1.3rem 0 1rem",
  },

  client: {
    textAlign: "left",
  },

  clientName: {
    color: gold,
    fontSize: "clamp(1.05rem, 4vw, 1.35rem)",
    fontWeight: 900,
  },

  progress: {
    color: "#fff",
    fontSize: "0.85rem",
    marginTop: 5,
  },

  reward: {
    color: lightGold,
    fontWeight: 900,
    marginTop: 10,
    letterSpacing: "0.05em",
  },

  contactButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "0.75rem",
    marginTop: "1.4rem",
    paddingTop: "1.1rem",
    borderTop: `1px solid ${darkGold}`,
  },

  contactButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    padding: "0.7rem 0.8rem",
    boxSizing: "border-box",
    border: `1px solid ${lightGold}`,
    borderRadius: 9,
    background:
      "linear-gradient(135deg, #9a6d12 0%, #d6a94f 35%, #f5d77a 55%, #b78318 100%)",
    color: "#080808",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "clamp(.72rem, 2.5vw, .9rem)",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textAlign: "center",
    textDecoration: "none",
    boxShadow:
      "0 4px 14px rgba(214,169,79,.22), inset 0 1px 0 rgba(255,255,255,.45)",
  },

  message: {
    color: gold,
    fontFamily: "Georgia, serif",
    fontSize: "1.2rem",
    padding: "3rem",
    textAlign: "center",
  },
};