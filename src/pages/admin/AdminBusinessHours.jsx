import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

const DAYS = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export default function AdminBusinessHours() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getBusinessSettings()
      .then((data) => setSchedule(data.schedule || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateDay = (day, field, value) => {
    setSchedule((current) =>
      current.map((item) =>
        item.day === day ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const data = await api.updateBusinessSettings(
        { schedule },
        user.token
      );

      setSchedule(data.schedule || []);
      setMessage("Horario del negocio actualizado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Cargando horario...</p>;
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        Horario del negocio
      </h2>

      <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
        Este horario se mostrará en la página pública de The Ely Barber.
      </p>

      <form onSubmit={handleSave} className="panel">
        {DAYS.map(({ key, label }) => {
          const item = schedule.find((entry) => entry.day === key);

          if (!item) return null;

          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
                padding: "0.8rem 0",
                borderBottom: "1px solid var(--navy-line)",
              }}
            >
              <div
                style={{
                  width: 100,
                  color: "var(--cream)",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  margin: 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.open}
                  onChange={(e) =>
                    updateDay(key, "open", e.target.checked)
                  }
                  style={{ width: "auto" }}
                />
                {item.open ? "Abierto" : "Cerrado"}
              </label>

              {item.open && (
                <>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) =>
                      updateDay(key, "startTime", e.target.value)
                    }
                    style={{ width: "auto" }}
                  />

                  <span style={{ color: "var(--muted)" }}>a</span>

                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) =>
                      updateDay(key, "endTime", e.target.value)
                    }
                    style={{ width: "auto" }}
                  />
                </>
              )}
            </div>
          );
        })}

        {error && (
          <p className="error-text" style={{ marginTop: "1rem" }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{ color: "#22c55e", marginTop: "1rem" }}>
            {message}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-solid"
          disabled={saving}
          style={{ marginTop: "1.25rem" }}
        >
          {saving ? "Guardando..." : "Guardar horario"}
        </button>
      </form>
    </div>
  );
}