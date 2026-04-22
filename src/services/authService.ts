/**
 * Auth service — JWT login + refresh, mirrors the PWA endpoints.
 *
 * Backend contract (already implemented in the API — LexikJWTAuthenticationBundle):
 *   POST /api/login            body: { username, password } → { token, refresh_token }
 *   POST /api/token/refresh    body: { refresh_token }      → { token, refresh_token }
 *   GET  /api/me               (custom) → { id, firstName, lastName, email, role }
 */
import api, { USE_MOCK_API, setTokens, clearTokens, API_URL } from './api';
import axios from 'axios';
import type { Staff } from '@/types';
import { STAFF } from '@/data/staff';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
}

export interface AuthenticatedUser extends Staff {
  // Extend as the backend adds fields (permissions, avatar URL…).
}

/**
 * Log in and persist tokens. Returns nothing — the caller should then call `fetchMe()`
 * or read the stored user via the auth store.
 */
export async function login(payload: LoginPayload): Promise<AuthenticatedUser> {
  if (USE_MOCK_API) {
    await delay(400);
    if (payload.password !== 'admin') {
      throw new Error('Neplatné přihlašovací údaje. (Mock: heslo je „admin“.)');
    }
    setTokens('mock-access-token', 'mock-refresh-token');
    return STAFF[0];
  }
  // TODO [backend]: ensure /api/login returns { token, refresh_token }.
  const { data } = await axios.post<LoginResponse>(`${API_URL}/api/login`, payload);
  setTokens(data.token, data.refresh_token);
  return fetchMe();
}

/** Fetch the currently authenticated user. */
export async function fetchMe(): Promise<AuthenticatedUser> {
  if (USE_MOCK_API) {
    await delay(100);
    return STAFF[0];
  }
  // TODO [backend]: add a GET /api/me endpoint returning the current Staff entity.
  const { data } = await api.get<AuthenticatedUser>('/api/me');
  return data;
}

export function logout(): void {
  clearTokens();
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
