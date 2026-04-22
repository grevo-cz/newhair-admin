/**
 * Patients store — in-memory cache for the mock UI. When wiring the backend:
 *   - hydrate() je volán buď ze seedIndex.loadSeeds() (mock) nebo z
 *     await patientsService.fetchPatients() (live, viz main.ts / router guard).
 *   - CRUD akce dnes mutují jen paměť; pro live režim uvnitř akcí zavolej
 *     odpovídající patientsService.* a vložím výsledek.
 *     Viz docs/ARCHITECTURE.md — tabulka „Swap points".
 */
import { defineStore } from 'pinia';
import type { Patient } from '@/types';

interface State {
  items: Record<string, Patient>;
  order: string[];
}

export const usePatientsStore = defineStore('patients', {
  state: (): State => ({ items: {}, order: [] }),

  getters: {
    list: (s): Patient[] => s.order.map((id) => s.items[id]).filter(Boolean),
    active(): Patient[] {
      return this.list.filter((p) => p.status === 'active');
    },
    archived(): Patient[] {
      return this.list.filter((p) => p.status === 'archived');
    },
    byId: (s) => (id: string | undefined | null): Patient | undefined =>
      id ? s.items[id] : undefined,
  },

  actions: {
    hydrate(items: Patient[]) {
      this.items = {};
      this.order = [];
      for (const p of items) {
        this.items[p.id] = p;
        this.order.push(p.id);
      }
    },
    // TODO [backend]: make async and `return patientsService.createPatient(input)`
    create(input: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'points' | 'status'>): Patient {
      const now = new Date().toISOString();
      const p: Patient = {
        ...input,
        id: crypto.randomUUID(),
        points: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };
      this.items[p.id] = p;
      this.order.unshift(p.id);
      return p;
    },
    // TODO [backend]: await patientsService.updatePatient(id, patch) then assign result
    update(id: string, patch: Partial<Patient>) {
      const p = this.items[id];
      if (!p) return;
      this.items[id] = { ...p, ...patch, updatedAt: new Date().toISOString() };
    },
    // TODO [backend]: await patientsService.archivePatient(id)
    archive(id: string) {
      this.update(id, { status: 'archived' });
    },
    unarchive(id: string) {
      this.update(id, { status: 'active' });
    },
    // TODO [backend]: await patientsService.deletePatient(id)
    remove(id: string) {
      delete this.items[id];
      this.order = this.order.filter((x) => x !== id);
    },
    addPoints(id: string, delta: number) {
      const p = this.items[id];
      if (!p) return;
      this.update(id, { points: Math.max(0, p.points + delta) });
    },
  },
});
