import axios from 'axios';

// In development (separate frontend/backend servers) VITE_API_URL should
// point to the backend, e.g. http://localhost:4000/api.
// In production (single-service deployment, backend also serves the built
// frontend) it defaults to a relative '/api' path so it works on whatever
// domain the app is deployed to, without hardcoding a URL at build time.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Attach the stored JWT token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('indokerja_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global handling for expired/invalid sessions.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('indokerja_token');
      localStorage.removeItem('indokerja_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Extracts a human-readable message from an Axios/API error. */
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; errors?: { message: string }[] };
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(', ');
    }
    if (data?.message) return data.message;
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
