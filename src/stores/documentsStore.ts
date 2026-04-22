/**
 * Documents store.
 * TODO [backend]: replace uploadStub with documentsService.uploadDocument
 * (multipart/form-data). Wire toggleVisibility / remove to services too.
 */
import { defineStore } from 'pinia';
import type { DocumentFile, DocumentType } from '@/types';

interface State {
  items: Record<string, DocumentFile>;
}

export const useDocumentsStore = defineStore('documents', {
  state: (): State => ({ items: {} }),

  getters: {
    list: (s): DocumentFile[] =>
      Object.values(s.items).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    byPatient(): (id: string) => DocumentFile[] {
      return (patientId: string) => this.list.filter((d) => d.patientId === patientId);
    },
  },

  actions: {
    hydrate(docs: DocumentFile[]) {
      this.items = {};
      for (const d of docs) this.items[d.id] = d;
    },
    add(doc: Omit<DocumentFile, 'id' | 'createdAt'>): DocumentFile {
      const d: DocumentFile = {
        ...doc,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      this.items[d.id] = d;
      return d;
    },
    update(id: string, patch: Partial<DocumentFile>) {
      const d = this.items[id];
      if (d) this.items[id] = { ...d, ...patch };
    },
    toggleVisibility(id: string) {
      const d = this.items[id];
      if (d) this.update(id, { visibleToPatient: !d.visibleToPatient });
    },
    remove(id: string) {
      delete this.items[id];
    },
    uploadStub(patientId: string, type: DocumentType, name: string): DocumentFile {
      return this.add({
        patientId,
        type,
        name,
        url: '#',
        sizeBytes: 200_000,
        visibleToPatient: type === 'instrukce' || type === 'kontakty',
        uploadedById: 'staff-admin-1',
      });
    },
  },
});
