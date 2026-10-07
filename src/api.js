const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Algo salió mal, intenta de nuevo");
  return data;
}

export const api = {
  adminLogin: (password) => request("/auth/admin-login", { method: "POST", body: { password } }),
  barberLogin: (username, password) => request("/auth/barber-login", { method: "POST", body: { username, password } }),

  getServices: (type, token) =>
    request(`/services${type ? `?type=${type}` : ""}`, { token }),
  createService: (body, token) => request("/services", { method: "POST", body, token }),
  updateService: (id, body, token) => request(`/services/${id}`, { method: "PUT", body, token }),
  deleteService: (id, token) => request(`/services/${id}`, { method: "DELETE", token }),

  getBarbers: (token) => request("/barbers", { token }),
  getAllBarbers: (token) => request("/barbers/all", { token }),
  createBarber: (body, token) => request("/barbers", { method: "POST", body, token }),
  updateBarber: (id, body, token) => request(`/barbers/${id}`, { method: "PUT", body, token }),
  deleteBarber: (id, token) => request(`/barbers/${id}`, { method: "DELETE", token }),

  getAvailability: (barberId, serviceIds, date) =>
    request(`/appointments/availability?${new URLSearchParams({ barberId, date, serviceIds: serviceIds.join(",") })}`),
  createAppointment: (body) => request("/appointments", { method: "POST", body }),
  getAllAppointments: (token, date) => request(`/appointments${date ? `?date=${date}` : ""}`, { token }),
  cancelAppointment: (id, token) => request(`/appointments/${id}/cancel`, { method: "PUT", token }),
  setAppointmentStatus: (id, status, token, paymentData = {}) =>
    request(`/appointments/${id}/status`, {
      method: "PUT",
      body: {
        status,
        ...paymentData,
      },
      token,
    }),
  updateAppointmentServices: (id, services, token) => request(`/appointments/${id}/services`, { method: "PUT", body: { services }, token }),
  rescheduleAppointment: (id, body, token) => request(`/appointments/${id}/reschedule`, { method: "PUT", body, token }),
  deleteAppointment: (id, token) => request(`/appointments/${id}`, { method: "DELETE", token }),
  getWhatsappLink: (id, token) => request(`/appointments/${id}/whatsapp-link`, { token }),
  setBarberPassword: (id, password, token) => request(`/barbers/${id}/account`, { method: "POST", body: { password }, token }),
  getMyAppointments: (token) => request("/appointments/my", { token }),

  getClients: (token) => request("/clients", { token }),

  // Finanzas
  getFinances: (date, token) =>
    request(`/finances?date=${encodeURIComponent(date)}`, { token }),

  getProductSales: (date, token) =>
    request(`/product-sales${date ? `?date=${encodeURIComponent(date)}` : ""}`, { token }),

  createProductSale: (body, token) =>
    request("/product-sales", { method: "POST", body, token }),

  getFinanceSettings: (token) =>
    request("/finances/settings", { token }),

  updateFinanceSettings: (body, token) =>
    request("/finances/settings", { method: "PUT", body, token }),

  createFinanceMovement: (body, token) =>
    request("/finances/movements", { method: "POST", body, token }),

  createFinanceCutoff: (body, token) =>
    request("/finances/cutoff", { method: "POST", body, token }),

  // Horario publico del negocio
  getBusinessSettings: () =>
    request("/business-settings"),

  updateBusinessSettings: (body, token) =>
    request("/business-settings", { method: "PUT", body, token }),


  // Fidelidad
  getLoyaltyClients: (token) =>
    request("/loyalty", { token }),

  createLoyaltyClient: (body, token) =>
    request("/loyalty", { method: "POST", body, token }),

  addLoyaltyStamp: (id, token) =>
    request(`/loyalty/${id}/stamp`, { method: "POST", token }),

  removeLoyaltyStamp: (id, token) =>
    request(`/loyalty/${id}/stamp`, { method: "DELETE", token }),

  redeemLoyaltyReward: (id, token) =>
    request(`/loyalty/${id}/redeem`, { method: "POST", token }),

  getLoyaltyCard: (publicCode) =>
    request(`/loyalty/card/${publicCode}`),

  deleteLoyaltyClient: (id, token) =>
    request(`/loyalty/${id}`, { method: "DELETE", token }),
};
