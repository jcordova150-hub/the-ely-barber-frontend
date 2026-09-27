// El negocio está en Cancún (UTC-5, sin horario de verano). "Hoy" siempre se calcula con esa zona,
// no con la del navegador ni con UTC (toISOString adelanta el día después de las 7 PM en Cancún).
export const BUSINESS_TZ = "America/Cancun";

// "YYYY-MM-DD" de hoy en la zona del negocio
export function todayStr() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ }).format(new Date());
}

// "2026-09-23" -> "miércoles, 23 de septiembre"
export function formatLongDate(dateStr) {
  const text = new Date(`${dateStr}T12:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Suma (o resta) días a una fecha "YYYY-MM-DD"
export function addDaysStr(dateStr, days) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Lunes de la semana que contiene la fecha "YYYY-MM-DD" (la semana va de lunes a domingo)
export function weekStartStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  return addDaysStr(dateStr, -((dow + 6) % 7));
}

// "2026-09-21" -> "21 – 27 de septiembre"  |  cruzando de mes: "28 sep – 4 oct"
export function formatWeekRange(startStr) {
  const start = new Date(`${startStr}T12:00:00`);
  const end = new Date(`${addDaysStr(startStr, 6)}T12:00:00`);
  const month = (dt, style) => dt.toLocaleDateString("es-MX", { month: style });
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} de ${month(end, "long")}`;
  }
  return `${start.getDate()} ${month(start, "short").replace(".", "")} – ${end.getDate()} ${month(end, "short").replace(".", "")}`;
}
