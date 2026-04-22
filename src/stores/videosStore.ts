/**
 * Videos store.
 * TODO [backend]: wire CRUD actions to videosService (viz docs/ARCHITECTURE.md).
 */
import { defineStore } from 'pinia';
import type { Video } from '@/types';

interface State {
  items: Record<string, Video>;
  order: string[];
}

export const useVideosStore = defineStore('videos', {
  state: (): State => ({ items: {}, order: [] }),

  getters: {
    list: (s): Video[] => s.order.map((id) => s.items[id]).filter(Boolean),
    byId: (s) => (id: string | null | undefined): Video | undefined =>
      id ? s.items[id] : undefined,
    recommended(): Video[] {
      return this.list.filter((v) => v.recommended && v.active);
    },
  },

  actions: {
    hydrate(videos: Video[]) {
      this.items = {};
      this.order = [];
      for (const v of videos) {
        this.items[v.id] = v;
        this.order.push(v.id);
      }
    },
    create(input: Omit<Video, 'id' | 'order'>): Video {
      const v: Video = { ...input, id: crypto.randomUUID(), order: this.order.length };
      this.items[v.id] = v;
      this.order.push(v.id);
      return v;
    },
    update(id: string, patch: Partial<Video>) {
      const v = this.items[id];
      if (!v) return;
      this.items[id] = { ...v, ...patch };
    },
    remove(id: string) {
      delete this.items[id];
      this.order = this.order.filter((x) => x !== id);
    },
    move(id: string, direction: 1 | -1) {
      const idx = this.order.indexOf(id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= this.order.length) return;
      [this.order[idx], this.order[target]] = [this.order[target], this.order[idx]];
      this.order.forEach((vid, i) => {
        if (this.items[vid]) this.items[vid].order = i;
      });
    },
    toggleActive(id: string) {
      const v = this.items[id];
      if (v) this.update(id, { active: !v.active });
    },
    toggleRecommended(id: string) {
      const v = this.items[id];
      if (v) this.update(id, { recommended: !v.recommended });
    },
  },
});
