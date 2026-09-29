import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const PHONE = "56 6053 4952";

const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export default function AdminLoyalty() {
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    stampsGoal: 10,
  });

  const loadClients = async () => {
    try {
      setError("");
      const data = await api.getLoyaltyClients(user.token);
      setClients(data);

      if (data.length && !selectedId) {
        setSelectedId(data[0]._id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");

    if (!q) return clients;

    return clients.filter((client) => {
      const name = String(client.name || "").toLowerCase();
      const phone = String(client.phone || "").replace(/\D/g, "");

      return name.includes(q) || (digits && phone.includes(digits));
    });
  }, [clients, search]);

  const selected =
    clients.find((client) => client._id === selectedId) || filtered[0] || null;

  const replaceClient = (updated) => {
    setClients((current) =>
      current.map((client) =>
        client._id === updated._id ? updated : client
      )
    );
  };

  const publicUrl = (client) =>
    `${window.location.origin}/fidelidad/${client.publicCode}`;

  const createClient = async (e) => {
    e.preventDefault();

    try {
      setWorking(true);
      setError("");
      setMessage("");

      const created = await api.createLoyaltyClient(
        {
          name: form.name,
          phone: form.phone,
          stampsGoal: Number(form.stampsGoal),
        },
        user.token
      );

      setClients((current) => [created, ...current]);
      setSelectedId(created._id);
      setForm({ name: "", phone: "", stampsGoal: 10 });
      setMessage(`Tarjeta creada para ${created.name}.`);

      const digits = String(created.phone || form.phone || "").replace(/\D/g, "");
      const whatsappPhone = digits.startsWith("52") ? digits : `52${digits}`;
      const cardUrl = publicUrl(created);

      const whatsappMessage =
        `Hola ${created.name} 👋\n\n` +
        `Gracias por ser cliente de The Ely Barber. 💈\n\n` +
        `Aquí tienes tu tarjeta de fidelidad personal:\n${cardUrl}\n\n` +
        `Presenta tu tarjeta en cada visita para acumular tus sellos y obtener tus premios. 🎁`;

      window.open(
        `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const addStamp = async () => {
    if (!selected) return;

    try {
      setWorking(true);
      setError("");
      setMessage("");

      const updated = await api.addLoyaltyStamp(
        selected._id,
        user.token
      );

      replaceClient(updated);

      if (updated.rewardsAvailable > selected.rewardsAvailable) {
        setMessage(`\u00A1${selected.name} complet\u00F3 una tarjeta y gan\u00F3 un corte gratis!`);
      } else {
        setMessage(`Visita sellada para ${selected.name}.`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const removeStamp = async () => {
    if (!selected || selected.stamps <= 0) return;

    try {
      setWorking(true);
      setError("");
      setMessage("");

      const updated = await api.removeLoyaltyStamp(
        selected._id,
        user.token
      );

      replaceClient(updated);
      setMessage(`Se quit\u00F3 el \u00FAltimo sello de ${selected.name}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const redeemReward = async () => {
    if (!selected || selected.rewardsAvailable <= 0) return;

    const ok = window.confirm(`\u00BFConfirmas que ${selected.name} desea canjear un corte gratis?`);

    if (!ok) return;

    try {
      setWorking(true);
      setError("");
      setMessage("");

      const updated = await api.redeemLoyaltyReward(
        selected._id,
        user.token
      );

      replaceClient(updated);
      setMessage(`Premio canjeado para ${selected.name}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const deleteClient = async () => {
    if (!selected) return;

    const ok = window.confirm(`\u00BFSeguro que deseas eliminar la tarjeta de fidelidad de ${selected.name}?`);

    if (!ok) return;

    try {
      setWorking(true);
      setError("");
      setMessage("");

      await api.deleteLoyaltyClient(selected._id, user.token);

      const remaining = clients.filter(
        (client) => client._id !== selected._id
      );

      setClients(remaining);
      setSelectedId(remaining[0]?._id || "");
      setMessage("Cliente eliminado de fidelidad.");
    } catch (e) {
      setError(e.message);
    } finally {
      setWorking(false);
    }
  };

  const copyLink = async () => {
    if (!selected) return;

    try {
      await navigator.clipboard.writeText(publicUrl(selected));
      setMessage("Enlace de la tarjeta copiado.");
      setError("");
    } catch {
      setError("No se pudo copiar el enlace.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.heading}>
        <div>
          <h2 style={styles.title}>Tarjeta de Fidelidad</h2>
          <p style={styles.subtitle}>
            The Ely Barber {"\u00B7"} Administraci{"\u00F3"}n de tarjetas y visitas
          </p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3 style={styles.sideTitle}>Clientes</h3>

          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />

          <div style={styles.clientList}>
            {loading ? (
              <p style={styles.muted}>Cargando...</p>
            ) : filtered.length === 0 ? (
              <p style={styles.muted}>No hay clientes.</p>
            ) : (
              filtered.map((client) => (
                <button
                  key={client._id}
                  type="button"
                  onClick={() => setSelectedId(client._id)}
                  style={{
                    ...styles.clientButton,
                    ...(selected?._id === client._id
                      ? styles.clientButtonActive
                      : {}),
                  }}
                >
                  <span>
                    <strong style={styles.clientName}>
                      {client.name}
                    </strong>
                    <span style={styles.clientPhone}>
                      {client.phone}
                    </span>
                  </span>

                  <strong style={styles.counter}>
                    {client.stamps}/{client.stampsGoal}
                  </strong>
                </button>
              ))
            )}
          </div>
        </aside>

        <main style={styles.main}>
          {selected ? (
            <>
              <section style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.brand}>THE ELY BARBER</div>
                    <h3 style={styles.cardTitle}>
                      TARJETA DE FIDELIDAD
                    </h3>
                    <p style={styles.cardSubtitle}>
                      ACUMULA VISITAS Y OBT{"\u00C9"}N CORTES GRATIS
                    </p>
                  </div>

                  <img
                    src="/logo.png"
                    alt="The Ely Barber"
                    style={styles.cardLogo}
                  />
                </div>

                {selected.rewardsAvailable > 0 && (
                  <div style={styles.completedBanner}>
                    <div style={styles.completedBannerTitle}>
                      TARJETA COMPLETA
                    </div>
                    <div style={styles.completedBannerSubtitle}>
                      LISTA PARA REINICIARSE
                    </div>
                  </div>
                )}

                <div style={styles.stampGrid}>
                  {Array.from({
                    length: selected.stampsGoal || 10,
                  }).map((_, index) => {
                    const number = index + 1;
                    const active = index < selected.stamps;
                    const prize =
                      number === 5 ||
                      number === selected.stampsGoal;

                    return (
                      <div
                        key={number}
                        style={{
                          ...styles.stamp,
                          ...(active ? styles.stampActive : {}),
                          ...(prize ? styles.prizeStamp : {}),
                          ...(prize && active ? styles.prizeWon : {}),
                        }}
                      >
                        {prize ? (
                          <>
                            {active && (
                              <span style={styles.giftIcon}>{"\uD83C\uDF81"}</span>
                            )}
                            <span style={active ? styles.prizeSmallWon : styles.prizeSmall}>
                              {active ? "\u00A1FELICIDADES!" : "FELICIDADES"}
                            </span>
                            <strong style={active ? styles.prizeBigWon : styles.prizeBig}>
                              CORTE
                              <br />
                              GRATIS
                            </strong>
                          </>
                        ) : active ? (
                          <img
                            src="/logo.png"
                            alt="Sello The Ely Barber"
                            style={styles.stampLogo}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div style={styles.cardInfo}>
                  <div style={styles.customer}>
                    <strong style={styles.customerName}>
                      {selected.name}
                    </strong>

                    <span style={styles.customerPhone}>
                      {selected.phone}
                    </span>

                    <span style={styles.since}>
                      Cliente desde {formatDate(selected.createdAt)}
                    </span>

                    <span style={styles.bookingPhone}>
                      Citas: {PHONE}
                    </span>

                    {selected.rewardsAvailable > 0 && (
                      <button
                        type="button"
                        onClick={redeemReward}
                        disabled={working}
                        style={styles.rewardButton}
                      >
                        REINICIAR TARJETA
                      </button>
                    )}
                  </div>

                  <div style={styles.qrBox}>
                    <QRCodeSVG
                      value={publicUrl(selected)}
                      size={130}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="M"
                    />
                    <span style={styles.qrText}>
                      ESCANEA PARA VER TU TARJETA
                    </span>
                  </div>
                </div>
              </section>

              <div style={styles.actions}>
                <button
                  type="button"
                  onClick={addStamp}
                  disabled={working}
                  style={styles.primaryButton}
                >
                  {working ? "PROCESANDO..." : "SELLAR VISITA DE HOY"}
                </button>

                <button
                  type="button"
                  onClick={removeStamp}
                  disabled={working || selected.stamps <= 0}
                  style={styles.secondaryButton}
                >
                  QUITAR {"\u00DA"}LTIMO SELLO
                </button>

                <button
                  type="button"
                  onClick={deleteClient}
                  disabled={working}
                  style={styles.deleteButton}
                >
                  ELIMINAR CLIENTE
                </button>
              </div>

              <div style={styles.linkBox}>
                <div style={{ flex: 1 }}>
                  <strong style={styles.linkTitle}>
                    Enlace personal de la tarjeta
                  </strong>
                  <div style={styles.linkText}>
                    {publicUrl(selected)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyLink}
                  style={styles.copyButton}
                >
                  COPIAR ENLACE
                </button>
              </div>
            </>
          ) : (
            <div style={styles.noSelection}>
              Selecciona un cliente o crea una nueva tarjeta.
            </div>
          )}
        </main>
      </div>

      <section style={styles.newClient}>
        <h3 style={styles.newTitle}>Registrar nuevo cliente</h3>

        <form onSubmit={createClient} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            required
          />

          <input
            type="tel"
            placeholder={"Tel\u00E9fono"}
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
            required
          />

          <input
            type="number"
            min="1"
            value={form.stampsGoal}
            title="Visitas necesarias para completar la tarjeta"
            onChange={(e) =>
              setForm({ ...form, stampsGoal: e.target.value })
            }
            required
          />

          <button
            type="submit"
            disabled={working}
            style={styles.createButton}
          >
            REGISTRAR CLIENTE
          </button>
        </form>
      </section>
    </div>
  );
}

const gold = "#d6a94f";
const darkGold = "#9b6b16";
const black = "#050505";
const panel = "#101010";
const line = "#3b2b12";

const styles = {
  page: {
    maxWidth: 1280,
    margin: "0 auto",
  },

  heading: {
    marginBottom: "1.5rem",
  },

  title: {
    color: gold,
    fontSize: "1.6rem",
    margin: 0,
  },

  subtitle: {
    color: "#9b9b9b",
    marginTop: "0.35rem",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(230px, 0.7fr) minmax(0, 2.3fr)",
    gap: "1.5rem",
    alignItems: "start",
  },

  sidebar: {
    background: panel,
    border: `1px solid ${line}`,
    borderRadius: 14,
    overflow: "hidden",
  },

  sideTitle: {
    color: gold,
    padding: "1rem 1.1rem 0.7rem",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  search: {
    width: "calc(100% - 2rem)",
    margin: "0 1rem 1rem",
  },

  clientList: {
    maxHeight: 680,
    overflowY: "auto",
  },

  clientButton: {
    width: "100%",
    border: 0,
    borderTop: `1px solid ${line}`,
    background: "transparent",
    color: "#eee",
    padding: "0.9rem 1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    cursor: "pointer",
  },

  clientButtonActive: {
    background: "rgba(214,169,79,0.14)",
  },

  clientName: {
    display: "block",
    color: "#f1d08b",
    marginBottom: "0.15rem",
  },

  clientPhone: {
    display: "block",
    color: "#8d8d8d",
    fontSize: "0.82rem",
  },

  counter: {
    color: gold,
  },

  main: {
    minWidth: 0,
  },

  card: {
    background: black,
    border: `2px solid ${gold}`,
    borderRadius: 22,
    padding: "1.7rem",
    boxShadow: "0 18px 50px rgba(0,0,0,.35)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    alignItems: "flex-start",
    borderBottom: `1px solid ${darkGold}`,
    paddingBottom: "1rem",
  },

  brand: {
    color: "#f5d77a",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontWeight: 900,
    letterSpacing: "0.14em",
    fontSize: "clamp(1.05rem, 2vw, 1.45rem)",
    textTransform: "uppercase",
    lineHeight: 1.1,
    textShadow:
      "0 1px 0 #8b6418, 0 2px 8px rgba(214,169,79,.45), 0 0 18px rgba(245,215,122,.18)",
    display: "inline-block",
    paddingBottom: "0.35rem",
    borderBottom: "1px solid rgba(214,169,79,.65)",
  },

  cardTitle: {
    color: gold,
    margin: "0.4rem 0 0.2rem",
    fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
    letterSpacing: "0.04em",
  },

  cardSubtitle: {
    color: gold,
    margin: 0,
    fontSize: "0.8rem",
    letterSpacing: "0.08em",
  },

  cardLogo: {
    width: 78,
    height: 78,
    objectFit: "contain",
    flexShrink: 0,
  },

  stampLogo: {
    width: "82%",
    height: "82%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
    borderRadius: "50%",
    border: "2px solid #d6a94f",
    background: "#000",
    boxSizing: "border-box",
  },

  completedBanner: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "1rem",
    marginBottom: "0.4rem",
    padding: "0.8rem 1rem",
    border: "1px solid #f5d77a",
    borderRadius: 8,
    background:
      "linear-gradient(135deg, #a97916 0%, #e0b83e 25%, #f5d77a 50%, #d6a94f 75%, #9a6d12 100%)",
    boxShadow:
      "0 0 18px rgba(214,169,79,.55), inset 0 1px 0 rgba(255,255,255,.55)",
    textAlign: "center",
  },

  completedBannerTitle: {
    color: "#080808",
    fontFamily: "Georgia, serif",
    fontSize: "1.35rem",
    fontWeight: 900,
    letterSpacing: "0.08em",
    lineHeight: 1.1,
  },

  completedBannerSubtitle: {
    color: "#080808",
    fontSize: "0.7rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    marginTop: "0.35rem",
  },

  stampGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(85px, 1fr))",
    gap: "0.8rem",
    margin: "1.5rem 0",
  },

  stamp: {
    aspectRatio: "1 / 1",
    border: `2px solid ${darkGold}`,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: gold,
    background: "#080808",
  },

  stampActive: {
    borderColor: gold,
    background: "rgba(214,169,79,0.18)",
    boxShadow: `inset 0 0 0 1px ${gold}`,
  },

  prizeStamp: {
    borderColor: gold,
  },

  visitNumber: {
    fontSize: "2rem",
    fontWeight: 800,
    lineHeight: 1,
  },

  visitText: {
    fontSize: "0.65rem",
    letterSpacing: "0.12em",
    marginTop: "0.35rem",
  },

  giftIcon: {
    fontSize: "2.5rem",
    lineHeight: 1,
    marginBottom: "0.25rem",
    filter: "sepia(1) saturate(4) hue-rotate(355deg) drop-shadow(0 2px 3px rgba(0,0,0,.45))",
  },

  prizeWon: {
    background: "linear-gradient(135deg, #8b6419 0%, #f5d77a 45%, #d6a94f 70%, #8b6419 100%)",
    border: "3px solid #f5d77a",
    boxShadow: "0 0 18px rgba(214,169,79,.85), inset 0 0 12px rgba(255,255,255,.25)",
    transform: "scale(1.04)",
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

  cardInfo: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1.5rem",
    alignItems: "flex-end",
    borderTop: `1px solid ${darkGold}`,
    paddingTop: "1.3rem",
  },

  customer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.35rem",
  },

  customerName: {
    color: gold,
    fontSize: "1.35rem",
  },

  customerPhone: {
    color: "#fff",
  },

  since: {
    color: "#9d9d9d",
    fontSize: "0.85rem",
  },

  bookingPhone: {
    color: gold,
    fontWeight: 700,
    marginTop: "0.25rem",
  },

  completedCardBox: {
    marginTop: "0.9rem",
    padding: "0.9rem 1rem",
    border: `2px solid ${gold}`,
    borderRadius: 10,
    background:
      "linear-gradient(135deg, rgba(214,169,79,.22) 0%, rgba(0,0,0,.95) 45%, rgba(214,169,79,.14) 100%)",
    boxShadow:
      "0 0 18px rgba(214,169,79,.38), inset 0 0 16px rgba(214,169,79,.08)",
    textAlign: "center",
  },

  completedCardTitle: {
    color: "#f5d77a",
    fontSize: "1.25rem",
    fontWeight: 900,
    letterSpacing: "0.08em",
    lineHeight: 1.1,
    textShadow: "0 0 10px rgba(214,169,79,.55)",
  },

  completedCardSubtitle: {
    color: gold,
    fontSize: "0.72rem",
    fontWeight: 800,
    letterSpacing: "0.13em",
    marginTop: "0.35rem",
  },

  rewardButton: {
    marginTop: "0.7rem",
    border: `1px solid ${gold}`,
    background: gold,
    color: "#080808",
    fontWeight: 800,
    padding: "0.65rem 0.9rem",
    borderRadius: 8,
    cursor: "pointer",
  },

  qrBox: {
    background: "#fff",
    padding: "0.65rem",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.4rem",
  },

  qrText: {
    color: "#111",
    fontSize: "0.55rem",
    fontWeight: 800,
    textAlign: "center",
  },

  footerBrand: {
    textAlign: "center",
    color: gold,
    borderTop: `1px solid ${darkGold}`,
    marginTop: "1.3rem",
    paddingTop: "0.8rem",
    letterSpacing: "0.18em",
    fontWeight: 800,
  },

  actions: {
    display: "flex",
    gap: "0.8rem",
    flexWrap: "wrap",
    marginTop: "1rem",
  },

  primaryButton: {
    flex: 1,
    minWidth: 220,
    padding: "0.9rem 1rem",
    borderRadius: 8,
    border: `1px solid ${gold}`,
    background: gold,
    color: "#080808",
    fontWeight: 900,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "0.9rem 1rem",
    borderRadius: 8,
    border: `1px solid ${gold}`,
    background: "transparent",
    color: gold,
    fontWeight: 800,
    cursor: "pointer",
  },

  deleteButton: {
    padding: "0.9rem 1rem",
    borderRadius: 8,
    border: "1px solid #7f1d1d",
    background: "transparent",
    color: "#ef4444",
    fontWeight: 800,
    cursor: "pointer",
  },

  linkBox: {
    marginTop: "1rem",
    background: panel,
    border: `1px solid ${line}`,
    borderRadius: 10,
    padding: "0.9rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },

  linkTitle: {
    display: "block",
    color: gold,
    fontSize: "0.82rem",
    marginBottom: "0.3rem",
  },

  linkText: {
    color: "#999",
    fontSize: "0.78rem",
    overflowWrap: "anywhere",
  },

  copyButton: {
    border: `1px solid ${gold}`,
    background: "transparent",
    color: gold,
    borderRadius: 7,
    padding: "0.65rem 0.8rem",
    fontWeight: 800,
    cursor: "pointer",
  },

  newClient: {
    marginTop: "1.5rem",
    background: panel,
    border: `1px solid ${line}`,
    borderRadius: 14,
    padding: "1.25rem",
  },

  newTitle: {
    color: gold,
    margin: "0 0 1rem",
  },

  form: {
    display: "grid",
    gridTemplateColumns: "2fr 1.4fr 0.6fr auto",
    gap: "0.8rem",
  },

  createButton: {
    border: `1px solid ${gold}`,
    background: gold,
    color: "#080808",
    borderRadius: 8,
    padding: "0.7rem 1.2rem",
    fontWeight: 900,
    cursor: "pointer",
  },

  error: {
    border: "1px solid #7f1d1d",
    color: "#f87171",
    padding: "0.8rem 1rem",
    borderRadius: 8,
    marginBottom: "1rem",
  },

  message: {
    border: `1px solid ${gold}`,
    color: gold,
    padding: "0.8rem 1rem",
    borderRadius: 8,
    marginBottom: "1rem",
  },

  muted: {
    color: "#888",
    padding: "0 1rem 1rem",
  },

  noSelection: {
    background: panel,
    border: `1px solid ${line}`,
    borderRadius: 14,
    color: "#999",
    padding: "3rem 1rem",
    textAlign: "center",
  },
};