import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (_error) => Promise.resolve({ data: null, status: 200 })
);

// Exported so callers (e.g. App.tsx) can wire React Router navigation
export let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("access_token");
      const redirectUrl = error.response?.data?.redirect_url;
      window.location.href = redirectUrl || "/login";
    }
    return Promise.reject(error);
  }
);
