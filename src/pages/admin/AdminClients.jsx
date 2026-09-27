import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { formatLongDate } from "../../utils/time";

const REMIND_AFTER_DAYS = 15; // a partir de cuántos días sin venir se considera "para recordar"

// Construye el enlace de WhatsApp para invitar a un cliente inactivo a volver
const reminderLink = (client) => {
  const phone = String(client.phone || "").replace(/\D/g, "");
  const message = `Hola ${client.name || ""}, en The Ely Barber te extrañamos. Ya tienes ${client.daysSinceVisit} días sin visitarnos, ¿agendamos tu próximo corte?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const badgeStyle = (days) => {
  if (days >= 20) return { color: "var(--danger)" };
  if (days >= REMIND_AFTER_DAYS) return { color: "var(--gold-bright)" };
  return { color: "#22c55e" };
};

export default function AdminClients() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("recordar"); // "recordar" | "todos"
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .getClients(user.token)
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toRemind = useMemo(
    () => clients.filter((c) => c.daysSinceVisit >= REMIND_AFTER_DAYS && !c.hasUpcoming),
    [clients]
  );

  const base = tab === "recordar" ? toRemind : clients;
  const q = search.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, "");
  // Ojo: si qDigits fuera "" (buscando solo texto, sin números), "".includes("") siempre da true,
  // así que solo se compara por teléfono cuando la búsqueda trae al menos un dígito.
  const filtered = q
    ? base.filter((c) => c.name?.toLowerCase().includes(q) || (qDigits && c.phone.replace(/\D/g, "").includes(qDigits)))
    : base;

  return (
    <div>
      <div className="admin-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.1rem" }}>Clientes</h2>
          <p style={{ color: "var(--muted)", marginTop: "0.2rem" }}>
            {tab === "recordar"
              ? `${toRemind.length} ${toRemind.length === 1 ? "cliente lleva" : "clientes llevan"} ${REMIND_AFTER_DAYS} días o más sin venir`
              : `${clients.length} ${clients.length === 1 ? "cliente" : "clientes"} en total`}
          </p>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "auto", minWidth: 220 }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.5rem" }}>
        <button
          className="btn btn-ghost"
          style={{ ...styles.chip, ...(tab === "recordar" ? styles.chipOn : {}) }}
          onClick={() => setTab("recordar")}
        >
          Para recordar
        </button>
        <button
          className="btn btn-ghost"
          style={{ ...styles.chip, ...(tab === "todos" ? styles.chipOn : {}) }}
          onClick={() => setTab("todos")}
        >
          Todos
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
      {loading && <p>Cargando...</p>}

      {!loading && filtered.length === 0 && !error && (
        <p style={{ color: "var(--muted)" }}>
          {tab === "recordar" ? "Nadie lleva 15 días o más sin venir. 🎉" : "Todavía no hay clientes registrados."}
        </p>
      )}

      <div style={{ display: "grid", gap: "0.8rem" }}>
        {filtered.map((c) => (
          <div key={c.phone} className="panel admin-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.25rem" }}>
            <div>
              <div style={{ color: "var(--cream)", fontWeight: 600 }}>{c.name || "Sin nombre"}</div>
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{c.phone}</div>
              <div style={{ marginTop: "0.3rem", fontSize: "0.85rem" }}>
                Última visita: {formatLongDate(c.lastVisitDate)} ·{" "}
                <strong style={badgeStyle(c.daysSinceVisit)}>hace {c.daysSinceVisit} días</strong>
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                {c.totalVisits} {c.totalVisits === 1 ? "visita" : "visitas"}
                {c.hasUpcoming && <span style={{ color: "var(--gold-bright)" }}> · Ya tiene una cita agendada</span>}
              </div>
            </div>
            <div className="admin-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
              <a className="btn btn-whatsapp" href={reminderLink(c)} target="_blank" rel="noreferrer">
                Recordarle por WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  chip: { padding: "0.35rem 0.9rem", fontSize: "0.85rem", borderRadius: "999px" },
  chipOn: { background: "var(--navy-panel)", color: "var(--cream)", borderColor: "var(--gold)" },
};
