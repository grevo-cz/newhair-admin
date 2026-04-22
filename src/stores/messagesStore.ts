import { defineStore } from 'pinia';
import type { Message, Thread } from '@/types';

interface State {
  threads: Record<string, Thread>;
  snippets: string[];
}

export const useMessagesStore = defineStore('messages', {
  state: (): State => ({ threads: {}, snippets: [] }),

  getters: {
    threadList: (s): Thread[] =>
      Object.values(s.threads).sort((a, b) => {
        const la = a.messages[a.messages.length - 1]?.timestamp ?? '';
        const lb = b.messages[b.messages.length - 1]?.timestamp ?? '';
        return lb.localeCompare(la);
      }),
    threadFor: (s) => (patientId: string): Thread | undefined => s.threads[patientId],
    unreadCount(): number {
      return Object.values(this.threads).reduce(
        (sum, t) =>
          sum + t.messages.filter((m) => !m.read && m.sender === 'patient').length,
        0,
      );
    },
    unreadByPatient: (s) => (patientId: string): number => {
      const t = s.threads[patientId];
      if (!t) return 0;
      return t.messages.filter((m) => !m.read && m.sender === 'patient').length;
    },
    lastMessage: (s) => (patientId: string): Message | undefined => {
      const t = s.threads[patientId];
      return t?.messages[t.messages.length - 1];
    },
  },

  actions: {
    hydrate(threads: Thread[], snippets: string[]) {
      this.threads = {};
      for (const t of threads) this.threads[t.patientId] = t;
      this.snippets = [...snippets];
    },
    ensureThread(patientId: string): Thread {
      if (!this.threads[patientId]) {
        this.threads[patientId] = { patientId, archived: false, messages: [] };
      }
      return this.threads[patientId];
    },
    sendFromAdmin(patientId: string, text: string) {
      const thread = this.ensureThread(patientId);
      const msg: Message = {
        id: crypto.randomUUID(),
        patientId,
        sender: 'admin',
        channel: 'whatsapp',
        text,
        timestamp: new Date().toISOString(),
        read: true,
      };
      thread.messages.push(msg);
    },
    simulatePatientReply(patientId: string, text: string) {
      const thread = this.ensureThread(patientId);
      const msg: Message = {
        id: crypto.randomUUID(),
        patientId,
        sender: 'patient',
        channel: 'whatsapp',
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      thread.messages.push(msg);
    },
    markRead(patientId: string) {
      const t = this.threads[patientId];
      if (!t) return;
      for (const m of t.messages) m.read = true;
    },
    archive(patientId: string) {
      const t = this.threads[patientId];
      if (t) t.archived = true;
    },
    unarchive(patientId: string) {
      const t = this.threads[patientId];
      if (t) t.archived = false;
    },
    addSnippet(text: string) {
      this.snippets.push(text);
    },
    removeSnippet(index: number) {
      this.snippets.splice(index, 1);
    },
  },
});
