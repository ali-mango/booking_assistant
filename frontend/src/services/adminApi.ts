import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin";
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string) {
  const { data } = await api.post("/admin/login", { username, password });
  localStorage.setItem("admin_token", data.token);
  return data;
}

export function logout() {
  localStorage.removeItem("admin_token");
}

export function isLoggedIn() {
  return !!localStorage.getItem("admin_token");
}

export async function getStats() {
  const { data } = await api.get("/admin/stats");
  return data;
}

export async function getBookings(status?: string, date?: string) {
  const params: any = {};
  if (status) params.status = status;
  if (date) params.date = date;
  const { data } = await api.get("/admin/bookings", { params });
  return data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { data } = await api.patch(`/admin/bookings/${bookingId}?status=${status}`);
  return data;
}

export async function getServices() {
  const { data } = await api.get("/admin/services");
  return data;
}

export async function createService(service: {
  name: string;
  duration_minutes: number;
  price: number;
  description: string;
}) {
  const { data } = await api.post("/admin/services", service);
  return data;
}

export async function updateService(serviceId: string, updates: any) {
  const { data } = await api.put(`/admin/services/${serviceId}`, updates);
  return data;
}

export async function deleteService(serviceId: string) {
  const { data } = await api.delete(`/admin/services/${serviceId}`);
  return data;
}

export async function getBusiness() {
  const { data } = await api.get("/admin/business");
  return data;
}

export async function updateBusiness(updates: any) {
  const { data } = await api.put("/admin/business", updates);
  return data;
}