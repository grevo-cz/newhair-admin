/**
 * Photos store. Uploady provádí PWA pacienta přímo; admin pouze čte + mění consent.
 * TODO [backend]: setConsent → await photosService.setPhotoConsent(id, consent).
 */
import { defineStore } from 'pinia';
import type { Photo, PhotoConsent } from '@/types';

interface State {
  items: Record<string, Photo>;
}

export const usePhotosStore = defineStore('photos', {
  state: (): State => ({ items: {} }),

  getters: {
    list: (s): Photo[] => Object.values(s.items),
    byPatient: (s) => (patientId: string): Photo[] =>
      Object.values(s.items).filter((p) => p.patientId === patientId),
    withConsent: (s) => (): Photo[] =>
      Object.values(s.items).filter((p) => p.marketingConsent === 'yes'),
    recentCount: (s) => (hours: number): number => {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - hours);
      return Object.values(s.items).filter(
        (p) => new Date(p.createdAt).getTime() >= cutoff.getTime(),
      ).length;
    },
  },

  actions: {
    hydrate(photos: Photo[]) {
      this.items = {};
      for (const p of photos) this.items[p.id] = p;
    },
    add(photo: Omit<Photo, 'id' | 'createdAt'>): Photo {
      const p: Photo = {
        ...photo,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      this.items[p.id] = p;
      return p;
    },
    setConsent(id: string, consent: PhotoConsent) {
      const p = this.items[id];
      if (p) this.items[id] = { ...p, marketingConsent: consent };
    },
    remove(id: string) {
      delete this.items[id];
    },
  },
});
