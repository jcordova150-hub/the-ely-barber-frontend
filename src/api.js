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
  getAllAppointments: (token) => request("/appointments", { token }),
  cancelAppointment: (id, token) => request(`/appointments/${id}/cancel`, { method: "PUT", token }),
  setAppointmentStatus: (id, status, token) => request(`/appointments/${id}/status`, { method: "PUT", body: { status }, token }),
  rescheduleAppointment: (id, body, token) => request(`/appointments/${id}/reschedule`, { method: "PUT", body, token }),
  deleteAppointment: (id, token) => request(`/appointments/${id}`, { method: "DELETE", token }),
  getWhatsappLink: (id, token) => request(`/appointments/${id}/whatsapp-link`, { token }),
  setBarberPassword: (id, password, token) => request(`/barbers/${id}/account`, { method: "POST", body: { password }, token }),
  getMyAppointments: (token) => request("/appointments/my", { token }),
};
