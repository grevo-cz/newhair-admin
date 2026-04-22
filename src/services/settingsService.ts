/**
 * Settings service — clinic-wide configuration (WhatsApp API, points rules…).
 *
 * Backend contract:
 *   GET   /api/settings                  → AppSettings (single singleton resource)
 *   PATCH /api/settings                  body: Partial<AppSettings>
 *   POST  /api/settings/whatsapp/test    → { ok, messageId? }
 */
import api, { USE_MOCK_API } from './api';
import type { AppSettings, WhatsAppSettings } from '@/types';
import { buildSeedSettings } from '@/data/seedSettings';

let mockStore: AppSettings | null = null;
function mock(): AppSettings {
  if (!mockStore) mockStore = buildSeedSettings();
  return mockStore;
}

export async function fetchSettings(): Promise<AppSettings> {
  if (USE_MOCK_API) {
    await delay(80);
    return JSON.parse(JSON.stringify(mock())) as AppSettings;
  }
  const { data } = await api.get<AppSettings>('/api/settings');
  return data;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  if (USE_MOCK_API) {
    await delay(80);
    mockStore = { ...mock(), ...patch };
    return mockStore;
  }
  const { data } = await api.patch<AppSettings>('/api/settings', patch, {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
  return data;
}

export async function updateWhatsAppSettings(patch: Partial<WhatsAppSettings>): Promise<AppSettings> {
  const current = await fetchSettings();
  return updateSettings({ whatsapp: { ...current.whatsapp, ...patch } });
}

export async function testWhatsApp(): Promise<{ ok: boolean; messageId?: string }> {
  if (USE_MOCK_API) {
    await delay(500);
    return { ok: true, messageId: 'wamid.mock' };
  }
  const { data } = await api.post<{ ok: boolean; messageId?: string }>('/api/settings/whatsapp/test');
  return data;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
