import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import { todayStr } from "../../utils/time";

const money = (value) =>
  Number(value || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

export default function AdminFinance() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayStr());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [productId, setProductId] = useState("");
  const [productBarberId, setProductBarberId] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");
  const [productPaymentMethod, setProductPaymentMethod] = useState("efectivo");
  const [savingProductSale, setSavingProductSale] = useState(false);

  const [cardCommissionRate, setCardCommissionRate] = useState("");
  const [savingCardCommission, setSavingCardCommission] = useState(false);
  const [editingCardCommission, setEditingCardCommission] = useState(false);

  const [transferDirection, setTransferDirection] = useState("efectivo-digital");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [savingTransfer, setSavingTransfer] = useState(false);

  const [withdrawAccount, setWithdrawAccount] = useState("efectivo");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api.getFinances(date, user.token);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  useEffect(() => {
    const loadProductSaleOptions = async () => {
      try {
        const [productList, barberList] = await Promise.all([
          api.getServices("producto", user.token),
          api.getBarbers(user.token),
        ]);

        setProducts(Array.isArray(productList) ? productList : []);
        setBarbers(Array.isArray(barberList) ? barberList : []);
      } catch (e) {
        setError(e.message);
      }
    };

    loadProductSaleOptions();
  }, [user.token]);

  useEffect(() => {
    const loadFinanceSettings = async () => {
      try {
        const settings = await api.getFinanceSettings(user.token);
        setCardCommissionRate(
          String(settings.cardCommissionRate ?? 4.06)
        );
      } catch (e) {
        setError(e.message);
      }
    };

    loadFinanceSettings();
  }, [user.token]);

  const handleSaveCardCommission = async () => {
    const rate = Number(cardCommissionRate);

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      alert("Ingresa un porcentaje válido entre 0 y 100.");
      return;
    }

    setSavingCardCommission(true);
    setError("");

    try {
      const settings = await api.updateFinanceSettings(
        { cardCommissionRate: rate },
        user.token
      );

      setCardCommissionRate(
        String(settings.cardCommissionRate ?? rate)
      );

      alert("Porcentaje de comisión de tarjeta guardado.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingCardCommission(false);
    }
  };

  const summary = data?.summary || {};

  const handleProductSale = async () => {
    const quantity = Number(productQuantity);

    if (!productId) {
      alert("Selecciona un producto.");
      return;
    }

    if (!productBarberId) {
      alert("Selecciona el barbero que realizó la venta.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Ingresa una cantidad válida.");
      return;
    }

    setSavingProductSale(true);
    setError("");

    try {
      await api.createProductSale(
        {
          date,
          product: productId,
          barber: productBarberId,
          quantity,
          paymentMethod: productPaymentMethod,
        },
        user.token
      );

      setProductId("");
      setProductBarberId("");
      setProductQuantity("1");
      setProductPaymentMethod("efectivo");

      await load();
      alert("Venta de producto registrada correctamente.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingProductSale(false);
    }
  };

  const handleWithdrawAll = async () => {
    const cashBalance = Math.max(0, Number(summary.cashBalance || 0));
    const digitalBalance = Math.max(0, Number(summary.digitalBalance || 0));
    const total = cashBalance + digitalBalance;

    const confirmed = window.confirm(
      `¿Retirar todo y cerrar caja?

Efectivo: ${money(cashBalance)}
Digital: ${money(digitalBalance)}
Total: ${money(total)}

Después del cierre, Finanzas comenzará un nuevo periodo desde $0.00.`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.createFinanceCutoff(
        {
          date,
          cashBalance,
          digitalBalance,
        },
        user.token
      );

      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  const handlePartialWithdrawal = async () => {
    const amount = Number(withdrawAmount);
    const available =
      withdrawAccount === "efectivo"
        ? Number(summary.cashBalance || 0)
        : Number(summary.digitalBalance || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Ingresa un importe válido para el retiro.");
      return;
    }

    if (amount > Math.max(0, available)) {
      alert(
        `No puedes retirar ${money(amount)}. Disponible en ${
          withdrawAccount === "efectivo" ? "efectivo" : "digital"
        }: ${money(Math.max(0, available))}.`
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Confirmar retiro parcial?

Cuenta: ${withdrawAccount === "efectivo" ? "Efectivo" : "Digital"}
Importe: ${money(amount)}`
    );

    if (!confirmed) return;

    setSavingWithdrawal(true);
    setError("");

    try {
      await api.createFinanceMovement(
        {
          date,
          type: "retiro",
          account: withdrawAccount,
          amount,
          note: withdrawNote.trim() || "Retiro parcial",
        },
        user.token
      );

      setWithdrawAmount("");
      setWithdrawNote("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingWithdrawal(false);
    }
  };
  const handleTransfer = async () => {
    const amount = Number(transferAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Ingresa un importe válido.");
      return;
    }

    const fromAccount =
      transferDirection === "efectivo-digital" ? "efectivo" : "digital";

    const destinationAccount =
      transferDirection === "efectivo-digital" ? "digital" : "efectivo";

    setSavingTransfer(true);
    setError("");

    try {
      await api.createFinanceMovement(
        {
          date,
          type: "transferencia_cuentas",
          account: fromAccount,
          destinationAccount,
          amount,
          note: transferNote.trim(),
        },
        user.token
      );

      setTransferAmount("");
      setTransferNote("");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingTransfer(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Finanzas</h2>
          <p style={styles.muted}>
            Control diario de ventas, comisiones y saldos.
          </p>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.dateInput}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p>Cargando finanzas...</p>
      ) : (
        <>
          <div style={styles.grid}>
            <Card
              title="Efectivo disponible"
              value={money(summary.cashBalance)}
              subtitle={`Anterior: ${money(summary.previousCash)}`}
            />

            <Card
              title="Tarjeta + Transferencia"
              value={money(summary.digitalBalance)}
              subtitle={`Anterior: ${money(summary.previousDigital)}`}
            />

            <Card
              title="Ventas del día"
              value={money(summary.totalSales)}
              subtitle="Total cobrado"
            />

            <Card
              title="Comisiones"
              value={money(summary.commissions)}
              subtitle="Descontadas primero de efectivo"
            />
          </div>

          <h3 style={styles.sectionTitle}>Desglose de ventas</h3>

          <div style={styles.grid}>
            <Card
              title="Ventas de servicios"
              value={money(summary.serviceSales)}
            />
            <Card
              title="Ventas de productos"
              value={money(summary.productSales)}
            />
            <Card
              title="Comisiones de servicios"
              value={money(summary.serviceCommissions)}
            />
            <Card
              title="Comisiones de productos"
              value={money(summary.productCommissions)}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              margin: "18px 0",
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 10,
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <strong>Comisión Mercado Pago</strong>

            {!editingCardCommission ? (
              <>
                <span>{cardCommissionRate || "0"}%</span>

                <button
                  type="button"
                  onClick={() => setEditingCardCommission(true)}
                  title="Editar porcentaje"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 18,
                    padding: "2px 5px",
                  }}
                >
                  ✏️
                </button>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={cardCommissionRate}
                    onChange={(e) => setCardCommissionRate(e.target.value)}
                    style={{
                      width: 80,
                      padding: "7px 8px",
                      border: "1px solid #ccc",
                      borderRadius: 6,
                    }}
                  />
                  <span>%</span>
                </div>

                <button
                  type="button"
                  className="btn btn-solid"
                  disabled={savingCardCommission}
                  onClick={async () => {
                    await handleSaveCardCommission();
                    setEditingCardCommission(false);
                  }}
                  style={{ padding: "7px 12px" }}
                >
                  {savingCardCommission ? "Guardando..." : "Guardar"}
                </button>
              </>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              margin: "10px 0 18px",
            }}
          >
            <div style={styles.transferBox}>
              <div style={styles.transferFields}>
                <select
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  style={styles.transferInput}
                >
                  <option value="efectivo">Retirar de Efectivo</option>
                  <option value="digital">Retirar de Digital</option>
                </select>

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Cantidad a retirar"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={styles.transferInput}
                />

                <input
                  type="text"
                  placeholder="Motivo / nota opcional"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  style={styles.transferInput}
                />

                <button
                  type="button"
                  className="btn btn-solid"
                  onClick={handlePartialWithdrawal}
                  disabled={savingWithdrawal}
                >
                  {savingWithdrawal ? "Retirando..." : "Retiro parcial"}
                </button>
              </div>

              <div style={styles.transferHelp}>
                Retira solamente la cantidad indicada. No cierra la caja ni modifica
                las ventas o comisiones.
              </div>
            </div>

            <button
              type="button"
              onClick={handleWithdrawAll}
              style={{
                padding: "8px 14px",
                border: "1px solid #ccc",
                borderRadius: 7,
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Retirar todo / Cerrar caja
            </button>
          </div>
          <h3 style={styles.sectionTitle}>Mover dinero entre cuentas</h3>

          <div style={styles.transferBox}>
            <div style={styles.transferFields}>
              <select
                value={transferDirection}
                onChange={(e) => setTransferDirection(e.target.value)}
                style={styles.transferInput}
              >
                <option value="efectivo-digital">
                  Efectivo → Digital
                </option>
                <option value="digital-efectivo">
                  Digital → Efectivo
                </option>
              </select>

              <input
                type="number"
                min="0"
                step="1"
                placeholder="Importe"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                style={styles.transferInput}
              />

              <input
                type="text"
                placeholder="Nota opcional"
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                style={styles.transferInput}
              />

              <button
                className="btn btn-solid"
                onClick={handleTransfer}
                disabled={savingTransfer}
              >
                {savingTransfer ? "Moviendo..." : "Mover dinero"}
              </button>
            </div>

            <div style={styles.transferHelp}>
              El importe se resta de la cuenta de origen y se suma a la cuenta
              de destino. No modifica las ventas del día.
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Registrar venta de producto</h3>

          <div style={styles.transferBox}>
            <div style={styles.transferFields}>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                style={styles.transferInput}
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {money(product.price)}
                  </option>
                ))}
              </select>

              <select
                value={productBarberId}
                onChange={(e) => setProductBarberId(e.target.value)}
                style={styles.transferInput}
              >
                <option value="">Barbero que realizó la venta</option>
                {barbers.map((barber) => (
                  <option key={barber._id} value={barber._id}>
                    {barber.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                step="1"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                placeholder="Cantidad"
                style={styles.transferInput}
              />

              <select
                value={productPaymentMethod}
                onChange={(e) => setProductPaymentMethod(e.target.value)}
                style={styles.transferInput}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>

              <button
                type="button"
                className="btn btn-solid"
                onClick={handleProductSale}
                disabled={savingProductSale}
              >
                {savingProductSale ? "Registrando..." : "Registrar venta"}
              </button>
            </div>

            {productId && (() => {
              const selectedProduct = products.find(
                (product) => product._id === productId
              );
              const quantity = Math.max(1, Number(productQuantity) || 1);
              const unitCommission =
                selectedProduct?.commissionType === "total"
                  ? Number(selectedProduct?.price || 0)
                  : Number(selectedProduct?.commission || 0);

              return (
                <div style={styles.transferHelp}>
                  Precio unitario: {money(selectedProduct?.price)} ·
                  Comisión por unidad: {money(unitCommission)} ·
                  Total: {money(Number(selectedProduct?.price || 0) * quantity)}
                </div>
              );
            })()}

            <div style={styles.transferHelp}>
              La venta se registrará a nombre del barbero seleccionado y se
              integrará automáticamente a Finanzas.
            </div>
          </div>

          <h3 style={styles.sectionTitle}>Cobros del día</h3>

          <div style={styles.grid}>
            <Card title="Efectivo" value={money(summary.cashSales)} />
            <Card title="Tarjeta" value={money(summary.cardSales)} />
            <Card title="Transferencia" value={money(summary.transferSales)} />
            <Card
              title="Tarjeta + Transferencia"
              value={money(summary.digitalSales)}
            />
          </div>

          <h3 style={styles.sectionTitle}>Otros movimientos</h3>

          <div style={styles.grid}>
            <Card title="Propinas" value={money(summary.tips)} />
            <Card title="Salidas" value={money(summary.cashOut)} />
            <Card title="Retiros" value={money(summary.withdrawals)} />
            <Card
              title="Comisión pasada a digital"
              value={money(summary.digitalCommission)}
            />
            <Card
              title="Comisión Mercado Pago"
              value={money(summary.mercadoPagoCommission || 0)}
            />
          </div>

          <h3 style={styles.sectionTitle}>Ventas de productos del día</h3>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Barbero</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio unitario</th>
                  <th style={styles.th}>Venta</th>
                  <th style={styles.th}>Comisión</th>
                  <th style={styles.th}>Método de pago</th>
                </tr>
              </thead>

              <tbody>
                {(data?.productSales || []).map((sale) => (
                  <tr key={sale._id}>
                    <td style={styles.td}>
                      {sale.productName || sale.product?.name || "Producto"}
                    </td>
                    <td style={styles.td}>
                      {sale.barber?.name || "Sin barbero"}
                    </td>
                    <td style={styles.td}>{sale.quantity}</td>
                    <td style={styles.td}>{money(sale.unitPrice)}</td>
                    <td style={styles.td}>{money(sale.total)}</td>
                    <td style={styles.td}>{money(sale.commissionTotal)}</td>
                    <td style={styles.td}>
                      {sale.paymentMethod === "efectivo"
                        ? "Efectivo"
                        : sale.paymentMethod === "tarjeta"
                        ? "Tarjeta"
                        : "Transferencia"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(data?.productSales || []).length === 0 && (
              <p style={{ padding: "1rem" }}>
                No hay ventas de productos registradas en esta fecha.
              </p>
            )}
          </div>

          <h3 style={styles.sectionTitle}>Ventas por barbero</h3>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Barbero</th>
                  <th style={styles.th}>Citas</th>
                  <th style={styles.th}>Servicios</th>
                  <th style={styles.th}>Productos</th>
                  <th style={styles.th}>Venta total</th>
                  <th style={styles.th}>Comisión servicios</th>
                  <th style={styles.th}>Comisión productos</th>
                  <th style={styles.th}>Comisión total</th>
                  <th style={styles.th}>Propina</th>
                  <th style={styles.th}>Comisión + Propina</th>
                  <th style={styles.th}>Después de comisión</th>
                </tr>
              </thead>

              <tbody>
                {(data?.barbers || []).map((row) => (
                  <tr key={row.barber?._id || "sin-barbero"}>
                    <td style={styles.td}>
                      {row.barber?.name || "Sin barbero"}
                    </td>
                    <td style={styles.td}>{row.appointments}</td>
                    <td style={styles.td}>
                      {money(Number(row.sales || 0) - Number(row.productSales || 0))}
                    </td>
                    <td style={styles.td}>{money(row.productSales)}</td>
                    <td style={styles.td}>{money(row.sales)}</td>
                    <td style={styles.td}>
                      {money(
                        Number(row.commission || 0) -
                          Number(row.productCommission || 0)
                      )}
                    </td>
                    <td style={styles.td}>{money(row.productCommission)}</td>
                    <td style={styles.td}>{money(row.commission)}</td>
                    <td style={styles.td}>{money(row.tip)}</td>
                    <td style={styles.td}>
                      {money(row.commission + row.tip)}
                    </td>
                    <td style={styles.td}>
                      {money(row.sales - row.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(data?.barbers || []).length === 0 && (
              <p style={{ padding: "1rem" }}>
                No hay ventas ni citas completadas en esta fecha.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value}</div>
      {subtitle && <div style={styles.cardSubtitle}>{subtitle}</div>}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },

  muted: {
    color: "var(--muted)",
    margin: "0.35rem 0 0",
  },

  dateInput: {
    padding: "0.65rem",
    borderRadius: "8px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "1rem",
  },

  card: {
    padding: "1.1rem",
    border: "1px solid var(--navy-line)",
    borderRadius: "12px",
  },

  cardTitle: {
    color: "var(--muted)",
    fontSize: "0.9rem",
  },

  cardValue: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginTop: "0.35rem",
  },

  cardSubtitle: {
    color: "var(--muted)",
    fontSize: "0.8rem",
    marginTop: "0.35rem",
  },

  sectionTitle: {
    marginTop: "2rem",
    marginBottom: "1rem",
  },

  transferBox: {
    padding: "1rem",
    border: "1px solid var(--navy-line)",
    borderRadius: "12px",
  },

  transferFields: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    flexWrap: "wrap",
  },

  transferInput: {
    minWidth: "170px",
    flex: "1 1 170px",
    padding: "0.65rem",
    borderRadius: "8px",
    border: "1px solid var(--navy-line)",
  },

  transferHelp: {
    color: "var(--muted)",
    fontSize: "0.8rem",
    marginTop: "0.75rem",
  },

  tableWrap: {
    overflowX: "auto",
    border: "1px solid var(--navy-line)",
    borderRadius: "12px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "0.85rem",
    borderBottom: "1px solid var(--navy-line)",
  },

  td: {
    padding: "0.85rem",
    borderBottom: "1px solid var(--navy-line)",
  },

  error: {
    padding: "0.8rem",
    marginBottom: "1rem",
    border: "1px solid var(--danger)",
    color: "var(--danger)",
    borderRadius: "8px",
  },
};
