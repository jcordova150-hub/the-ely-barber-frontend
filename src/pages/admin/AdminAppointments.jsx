import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { todayStr, formatLongDate } from "../../utils/time";

const MAX_SERVICES = 2; // igual que al reservar: hasta 2 servicios por cita

const STATUS_LABEL = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayStr()); // por defecto, solo las citas de hoy
  const [statusFilter, setStatusFilter] = useState("todos");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [allServices, setAllServices] = useState([]);
  const [editingServicesId, setEditingServicesId] = useState(null);
  const [editServiceIds, setEditServiceIds] = useState([]);

  // Datos de cobro por cita
  const [paymentMethods, setPaymentMethods] = useState({});
  const [tipAmounts, setTipAmounts] = useState({});
  const [tipMethods, setTipMethods] = useState({});
  const [priceAdjustmentTypes, setPriceAdjustmentTypes] = useState({});
  const [discountPercents, setDiscountPercents] = useState({});
  const [refundFinalPrices, setRefundFinalPrices] = useState({});
  const [refundFinalCommissions, setRefundFinalCommissions] = useState({});

  const isToday = date === todayStr();

  // Carga las citas del día elegido (el servidor solo devuelve ese día)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getAllAppointments(user.token, date)
      .then((list) => { if (!cancelled) setAppointments(list); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date]);

  useEffect(() => {
    api.getServices("servicio").then(setAllServices).catch(() => {});
  }, []);

  const reload = () => api.getAllAppointments(user.token, date).then(setAppointments);

  // Ejecuta una acción, muestra el error si falla y recarga la lista si sale bien
  const run = async (action) => {
    setError("");
    try {
      await action();
      await reload();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleWhatsapp = async (id) => {
    try {
      const { link } = await api.getWhatsappLink(id, user.token);
      window.open(link, "_blank");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleStatusChange = (id, status) => {
    const appointment = appointments.find((a) => a._id === id);

    if (status !== "completada") {
      return run(() =>
        api.setAppointmentStatus(id, status, user.token)
      );
    }

    const adjustmentType =
      priceAdjustmentTypes[id] ||
      appointment?.priceAdjustmentType ||
      "normal";

    const paymentMethod =
      paymentMethods[id] ||
      appointment?.paymentMethod ||
      "";

    const tipAmount = Number(
      tipAmounts[id] ?? appointment?.tipAmount ?? 0
    );

    const tipMethod =
      tipMethods[id] ||
      appointment?.tipMethod ||
      "";

    if (!Number.isFinite(tipAmount) || tipAmount < 0) {
      alert("Ingresa una propina válida.");
      return;
    }

    if (
      tipAmount > 0 &&
      !["efectivo", "digital"].includes(tipMethod)
    ) {
      alert("Selecciona cómo se recibió la propina.");
      return;
    }

    let discountPercent = 0;
    let refundFinalPrice;
    let refundFinalCommission;

    if (adjustmentType === "porcentaje") {
      if (
        discountPercents[id] === undefined ||
        String(discountPercents[id]).trim() === ""
      ) {
        alert("Ingresa el porcentaje de descuento.");
        return;
      }

      discountPercent = Number(discountPercents[id]);

      if (
        !Number.isFinite(discountPercent) ||
        discountPercent < 0 ||
        discountPercent > 100
      ) {
        alert("El descuento debe estar entre 0% y 100%.");
        return;
      }
    }

    if (adjustmentType === "devolucion") {
      if (
        refundFinalPrices[id] === undefined ||
        String(refundFinalPrices[id]).trim() === ""
      ) {
        alert("Ingresa el nuevo precio final.");
        return;
      }

      if (
        refundFinalCommissions[id] === undefined ||
        String(refundFinalCommissions[id]).trim() === ""
      ) {
        alert("Ingresa la nueva comisión.");
        return;
      }

      refundFinalPrice = Number(refundFinalPrices[id]);
      refundFinalCommission = Number(refundFinalCommissions[id]);

      if (
        !Number.isFinite(refundFinalPrice) ||
        refundFinalPrice < 0
      ) {
        alert("Ingresa un precio final válido.");
        return;
      }

      if (
        !Number.isFinite(refundFinalCommission) ||
        refundFinalCommission < 0
      ) {
        alert("Ingresa una comisión final válida.");
        return;
      }
    }

    const isFree =
      adjustmentType === "gratis" ||
      adjustmentType === "cumpleanos";

    if (!isFree && !["efectivo", "tarjeta", "transferencia"].includes(paymentMethod)) {
      alert("Selecciona el método de pago.");
      return;
    }

    if (
      isFree &&
      tipAmount > 0 &&
      tipMethod === "digital" &&
      !["tarjeta", "transferencia"].includes(paymentMethod)
    ) {
      alert("Para una propina digital selecciona tarjeta o transferencia.");
      return;
    }

    let chargedAmount;

    const hasTotalCommission = (appointment?.services || []).some(
      (service) => service.commissionType === "total"
    );

    if (hasTotalCommission) {
      const value = prompt(
        "¿Cuál es el importe base del servicio con comisión del 100%? El descuento no reducirá la comisión del barbero."
      );

      if (value === null) return;

      chargedAmount = Number(value);

      if (!Number.isFinite(chargedAmount) || chargedAmount < 0) {
        alert("Ingresa un importe válido.");
        return;
      }
    }

    return run(() =>
      api.setAppointmentStatus(id, status, user.token, {
        chargedAmount,
        paymentMethod: paymentMethod || undefined,
        tipAmount,
        tipMethod: tipAmount > 0 ? tipMethod : undefined,
        priceAdjustmentType: adjustmentType,
        discountPercent,
        refundFinalPrice,
        refundFinalCommission,
      })
    );
  };
  const handleDelete = (id) => {
    if (!confirm("¿Eliminar esta cita PERMANENTEMENTE? Esta acción no se puede deshacer.")) return;
    run(() => api.deleteAppointment(id, user.token));
  };

  const startEdit = (a) => {
    setEditingServicesId(null);
    setEditingId(a._id);
    setEditDate(a.date);
    setEditTime(a.startTime);
  };

  const saveReschedule = (id) =>
    run(async () => {
      await api.rescheduleAppointment(id, { date: editDate, startTime: editTime }, user.token);
      setEditingId(null);
    });

  // --- Cambiar los servicios de una cita ya agendada ---
  const startEditServices = (a) => {
    setEditingId(null);
    setEditingServicesId(a._id);
    setEditServiceIds((a.services || []).map((s) => s._id));
  };

  const toggleEditService = (id) =>
    setEditServiceIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return prev.length < MAX_SERVICES ? [...prev, id] : prev;
    });

  // Servicios activos + los que la cita ya tenía (por si alguno se desactivó después)
  const serviceOptions = (a) => {
    const extra = (a.services || []).filter((s) => !allServices.some((x) => x._id === s._id));
    return [...allServices, ...extra];
  };

  const saveServices = (id) =>
    run(async () => {
      await api.updateAppointmentServices(id, editServiceIds, user.token);
      setEditingServicesId(null);
    });

  const filtered = appointments.filter((a) => statusFilter === "todos" || a.status === statusFilter);

  return (
    <div>
      <div style={styles.headerRow}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontFamily: "var(--font-display)" }}>
            {isToday ? "Citas de hoy" : "Citas del día"}
          </h2>
          <p style={{ color: "var(--muted)", marginTop: "0.2rem" }}>
            {formatLongDate(date)} · {filtered.length} {filtered.length === 1 ? "cita" : "citas"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayStr())}
            style={{ width: "auto" }}
          />
          {!isToday && (
            <button className="btn btn-ghost" style={styles.smallBtn} onClick={() => setDate(todayStr())}>
              Volver a hoy
            </button>
          )}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "auto" }}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {error && <p className="error-text" style={{ marginTop: 0 }}>{error}</p>}
      {loading && <p>Cargando...</p>}

      <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table className="admin-table" style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Cliente</th>
              <th style={styles.th}>Servicio</th>
              <th style={styles.th}>Fecha y Hora</th>
              <th style={styles.th}>Barbero</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} style={styles.tr}>
                <td data-label="Cliente" style={styles.td}>
                  <div style={{ color: "var(--cream)", fontWeight: 600 }}>{a.client?.name || a.guestName}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{a.client?.phone || a.guestPhone}</div>
                </td>
                <td data-label="Servicio" style={styles.td}>
                  {editingServicesId === a._id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 220 }}>
                      {serviceOptions(a).map((s) => {
                        const checked = editServiceIds.includes(s._id);
                        return (
                          <label
                            key={s._id}
                            style={{ ...styles.svcOption, ...(checked ? styles.svcOptionOn : {}) }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleEditService(s._id)}
                              style={{ width: "auto" }}
                            />
                            <span>{s.name}</span>
                            <span style={{ marginLeft: "auto", color: "var(--gold)", fontWeight: 700 }}>
                              ${s.price.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                      <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                        Máximo {MAX_SERVICES} servicios · Total:{" "}
                        <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                          ${serviceOptions(a)
                            .filter((s) => editServiceIds.includes(s._id))
                            .reduce((sum, s) => sum + s.price, 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          className="btn btn-solid"
                          style={styles.smallBtn}
                          disabled={editServiceIds.length === 0}
                          onClick={() => saveServices(a._id)}
                        >
                          Guardar
                        </button>
                        <button className="btn btn-ghost" style={styles.smallBtn} onClick={() => setEditingServicesId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.services?.map((s) => s.name).join(" + ")}</div>
                      {a.total > 0 && <div style={{ color: "var(--gold)", fontWeight: 700 }}>${a.total.toFixed(2)}</div>}
                      <button
                        className="btn btn-ghost"
                        style={{ ...styles.smallBtn, marginTop: "0.4rem" }}
                        onClick={() => startEditServices(a)}
                      >
                        ✂️ Cambiar servicios
                      </button>
                    </div>
                  )}
                </td>
                <td data-label="Fecha y hora" style={styles.td}>
                  {editingId === a._id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                      <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="btn btn-solid" style={styles.smallBtn} onClick={() => saveReschedule(a._id)}>Guardar</button>
                        <button className="btn btn-ghost" style={styles.smallBtn} onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.startTime} hrs</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>hasta {a.endTime}</div>
                    </div>
                  )}
                </td>
                <td data-label="Barbero" style={styles.td}>{a.barber?.name}</td>
                <td data-label="Estado" style={styles.td}>
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}
                    style={{ ...styles.statusSelect, ...statusColor[a.status] }}
                  >
                    {Object.entries(STATUS_LABEL).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>

                  {a.status !== "completada" && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        minWidth: "210px",
                      }}
                    >
                      <select
                        value={
                          priceAdjustmentTypes[a._id] ||
                          a.priceAdjustmentType ||
                          "normal"
                        }
                        onChange={(e) =>
                          setPriceAdjustmentTypes((prev) => ({
                            ...prev,
                            [a._id]: e.target.value,
                          }))
                        }
                      >
                        <option value="normal">Normal</option>
                        <option value="porcentaje">Descuento %</option>
                        <option value="gratis">Corte gratis 100%</option>
                        <option value="cumpleanos">Cumpleaños 100%</option>
                        <option value="devolucion">Devolución</option>
                      </select>

                      {(priceAdjustmentTypes[a._id] ||
                        a.priceAdjustmentType ||
                        "normal") === "porcentaje" && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="Descuento %"
                          value={discountPercents[a._id] ?? ""}
                          onChange={(e) =>
                            setDiscountPercents((prev) => ({
                              ...prev,
                              [a._id]: e.target.value,
                            }))
                          }
                        />
                      )}

                      {(priceAdjustmentTypes[a._id] ||
                        a.priceAdjustmentType ||
                        "normal") === "devolucion" && (
                        <>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Nuevo precio final"
                            value={refundFinalPrices[a._id] ?? ""}
                            onChange={(e) =>
                              setRefundFinalPrices((prev) => ({
                                ...prev,
                                [a._id]: e.target.value,
                              }))
                            }
                          />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Nueva comisión"
                            value={refundFinalCommissions[a._id] ?? ""}
                            onChange={(e) =>
                              setRefundFinalCommissions((prev) => ({
                                ...prev,
                                [a._id]: e.target.value,
                              }))
                            }
                          />
                        </>
                      )}

                      <select
                        value={
                          paymentMethods[a._id] ||
                          a.paymentMethod ||
                          ""
                        }
                        onChange={(e) =>
                          setPaymentMethods((prev) => ({
                            ...prev,
                            [a._id]: e.target.value,
                          }))
                        }
                      >
                        <option value="">Método de pago</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Propina"
                        value={tipAmounts[a._id] ?? ""}
                        onChange={(e) =>
                          setTipAmounts((prev) => ({
                            ...prev,
                            [a._id]: e.target.value,
                          }))
                        }
                      />

                      {Number(tipAmounts[a._id] || 0) > 0 && (
                        <select
                          value={tipMethods[a._id] || ""}
                          onChange={(e) =>
                            setTipMethods((prev) => ({
                              ...prev,
                              [a._id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Forma de propina</option>
                          <option value="efectivo">Efectivo</option>
                          <option value="digital">Digital</option>
                        </select>
                      )}

                      {["gratis", "cumpleanos"].includes(
                        priceAdjustmentTypes[a._id] ||
                          a.priceAdjustmentType ||
                          "normal"
                      ) && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted)",
                          }}
                        >
                          Cliente paga $0. La comisión del barbero se conserva completa.
                        </div>
                      )}

                      {(priceAdjustmentTypes[a._id] ||
                        a.priceAdjustmentType ||
                        "normal") === "porcentaje" && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted)",
                          }}
                        >
                          El descuento reduce el cobro al cliente, no la comisión del barbero.
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td data-label="Acciones" style={styles.td}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="icon-btn" title="Enviar recordatorio por WhatsApp" onClick={() => handleWhatsapp(a._id)} style={styles.iconBtn}>💬</button>
                    <button className="icon-btn" title="Editar fecha/hora" onClick={() => startEdit(a)} style={styles.iconBtn}>🕐</button>
                    <button className="icon-btn" title="Eliminar permanentemente" onClick={() => handleDelete(a._id)} style={{ ...styles.iconBtn, color: "var(--danger)" }}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p style={{ padding: "1.5rem" }}>
            {isToday ? "No hay citas para hoy." : "No hay citas ese día."}
          </p>
        )}
      </div>
    </div>
  );
}

const statusColor = {
  pendiente: { color: "var(--muted)" },
  confirmada: { color: "var(--gold-bright)" },
  completada: { color: "#22c55e" },
  cancelada: { color: "var(--danger)" },
};

const styles = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  theadRow: { borderBottom: "1px solid var(--navy-line)" },
  th: {
    textAlign: "left",
    padding: "1rem 1.25rem",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--muted)",
  },
  tr: { borderBottom: "1px solid var(--navy-line)" },
  td: { padding: "1rem 1.25rem", verticalAlign: "top", fontSize: "0.9rem" },
  smallBtn: { padding: "0.3rem 0.7rem", fontSize: "0.8rem" },
  svcOption: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: 0,
    padding: "0.4rem 0.6rem",
    fontSize: "0.85rem",
    color: "var(--cream)",
    cursor: "pointer",
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "0.5rem",
  },
  svcOptionOn: { borderColor: "var(--gold)" },
  statusSelect: {
    width: "auto",
    padding: "0.3rem 0.5rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "999px",
  },
  iconBtn: {
    background: "var(--navy-deep)",
    border: "1px solid var(--navy-line)",
    borderRadius: "0.5rem",
    width: 32,
    height: 32,
    cursor: "pointer",
    color: "var(--cream)",
  },
};
