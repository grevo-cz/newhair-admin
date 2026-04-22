/**
 * Settings store — singleton AppSettings.
 * TODO [backend]: hydrate via settingsService.fetchSettings(); mutations via
 * settingsService.updateSettings / updateWhatsAppSettings / testWhatsApp.
 */
import { defineStore } from 'pinia';
import type { AppSettings, WhatsAppSettings } from '@/types';

interface State {
  settings: AppSettings | null;
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => ({ settings: null }),

  getters: {
    whatsapp: (s): WhatsAppSettings | undefined => s.settings?.whatsapp,
    isConnected: (s): boolean => !!s.settings?.whatsapp.connected,
  },

  actions: {
    hydrate(settings: AppSettings) {
      this.settings = settings;
    },
    updateWhatsApp(patch: Partial<WhatsAppSettings>) {
      if (!this.settings) return;
      this.settings.whatsapp = { ...this.settings.whatsapp, ...patch };
    },
    toggleConnected() {
      if (!this.settings) return;
      this.settings.whatsapp.connected = !this.settings.whatsapp.connected;
    },
    update(patch: Partial<AppSettings>) {
      if (!this.settings) return;
      this.settings = { ...this.settings, ...patch };
    },
  },
});
