/**
 * Barrel re-export for the service layer.
 *
 * ─── Where to plug in the real backend ───────────────────────────────────────
 * 1. Set `VITE_API_URL` and `VITE_USE_MOCK_API=false` in `.env.local`.
 * 2. Ensure backend endpoints match the contracts documented at the top of each
 *    service file (and summarised in `docs/API.md`).
 * 3. All other code (stores, views) calls these services only — no axios or fetch
 *    calls live outside this directory.
 */
export { default as api, API_URL, USE_MOCK_API, getAccessToken, setTokens, clearTokens } from './api';
export * as authService from './authService';
export * as patientsService from './patientsService';
export * as plansService from './plansService';
export * as videosService from './videosService';
export * as photosService from './photosService';
export * as documentsService from './documentsService';
export * as messagesService from './messagesService';
export * as settingsService from './settingsService';
