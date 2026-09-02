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
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),

  getServices: (type, token) =>
    request(`/services${type ? `?type=${type}` : ""}`, { token }),
  createService: (body, token) => request("/services", { method: "POST", body, token }),
  updateService: (id, body, token) => request(`/services/${id}`, { method: "PUT", body, token }),
  deleteService: (id, token) => request(`/services/${id}`, { method: "DELETE", token }),

  getBarbers: (token) => request("/barbers", { token }),
  createBarber: (body, token) => request("/barbers", { method: "POST", body, token }),
  updateBarber: (id, body, token) => request(`/barbers/${id}`, { method: "PUT", body, token }),
  deleteBarber: (id, token) => request(`/barbers/${id}`, { method: "DELETE", token }),

  getAvailability: (params) =>
    request(`/appointments/availability?${new URLSearchParams(params)}`),
  createAppointment: (body, token) => request("/appointments", { method: "POST", body, token }),
  getMyAppointments: (token) => request("/appointments/mine", { token }),
  getAllAppointments: (token) => request("/appointments", { token }),
  cancelAppointment: (id, token) => request(`/appointments/${id}/cancel`, { method: "PUT", token }),
  getWhatsappLink: (id, token) => request(`/appointments/${id}/whatsapp-link`, { token }),
};
