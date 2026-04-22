/**
 * Axios instance for the NewHair backend (Symfony + API Platform 4.1).
 *
 * Auth pattern is identical to the patient-facing PWA (`pwa/src/services/api.ts`)
 * — JWT access token in localStorage under `user_token`, refresh token under
 * `refresh_token`, 401 → auto-refresh via `/api/token/refresh`.
 *
 * Configuration:
 *   VITE_API_URL        = https://api.newhair.cz   (required)
 *   VITE_USE_MOCK_API   = 'true' | 'false'         (default: 'true')
 *                         When 'true', services return in-memory seed data
 *                         instead of calling this axios instance.
 *
 * Swap to live backend: set VITE_USE_MOCK_API=false in .env.local and
 * implement the real endpoints listed in `docs/API.md`.
 */
import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? '';
export const USE_MOCK_API =
  (import.meta.env.VITE_USE_MOCK_API ?? 'true').toLowerCase() !== 'false';

const TOKEN_KEY = 'user_token';
const REFRESH_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function setTokens(token: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/ld+json', 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let isRefreshing = false;
let waiters: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => waiters.push({ resolve, reject })).then((t) => {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${t}`;
        return api(original);
      });
    }
    original._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      isRefreshing = false;
      return Promise.reject(error);
    }
    try {
      const { data } = await axios.post(`${API_URL}/api/token/refresh`, { refresh_token: refreshToken });
      setTokens(data.token, data.refresh_token);
      waiters.forEach((w) => w.resolve(data.token));
      waiters = [];
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    } catch (refreshError) {
      waiters.forEach((w) => w.reject(refreshError));
      waiters = [];
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/**
 * API Platform returns hydra collections: { "hydra:member": T[], "hydra:totalItems": N }.
 * Helper to unwrap to a plain array.
 */
export interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems'?: number;
  'hydra:view'?: { 'hydra:next'?: string };
}

export function unwrapHydra<T>(payload: HydraCollection<T> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  return payload['hydra:member'] ?? [];
}

/**
 * Small helper so services can short-circuit to mock mode without repeating the check.
 * Usage:
 *   export async function fetchPatients() {
 *     if (USE_MOCK_API) return mockFetchPatients();
 *     const { data } = await api.get<HydraCollection<Patient>>('/api/patients');
 *     return unwrapHydra(data);
 *   }
 */
export default api;
