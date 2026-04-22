/**
 * Messages service — WhatsApp Business API backed conversation threads.
 *
 * Backend contract:
 *   GET  /api/messages/threads                   → HydraCollection<Thread>
 *   GET  /api/messages/threads/{patientId}       → Thread
 *   POST /api/messages/threads/{patientId}       body: { text: string } → Message
 *   POST /api/messages/threads/{patientId}/mark-read
 *   POST /api/messages/threads/{patientId}/archive
 *   POST /api/messages/webhook                   (incoming WhatsApp messages; server-side)
 *
 * Real-time updates suggestion: subscribe to Mercure topic `messages/{patientId}` when
 * the inbox is open; the backend already has Mercure configured.
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { Thread, Message } from '@/types';
import { buildSeedThreads, MESSAGE_SNIPPETS } from '@/data/seedMessages';

let mockStore: Thread[] | null = null;
function mock(): Thread[] {
  if (!mockStore) mockStore = buildSeedThreads();
  return mockStore;
}

export async function fetchThreads(): Promise<Thread[]> {
  if (USE_MOCK_API) {
    await delay(120);
    return JSON.parse(JSON.stringify(mock())) as Thread[];
  }
  const { data } = await api.get<HydraCollection<Thread>>('/api/messages/threads');
  return unwrapHydra(data);
}

export async function sendMessage(patientId: string, text: string): Promise<Message> {
  if (USE_MOCK_API) {
    await delay(180);
    const msg: Message = {
      id: crypto.randomUUID(),
      patientId,
      sender: 'admin',
      channel: 'whatsapp',
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };
    const thread = mock().find((t) => t.patientId === patientId);
    if (thread) thread.messages.push(msg);
    return msg;
  }
  const { data } = await api.post<Message>(`/api/messages/threads/${patientId}`, { text });
  return data;
}

export async function markThreadRead(patientId: string): Promise<void> {
  if (USE_MOCK_API) {
    const t = mock().find((x) => x.patientId === patientId);
    if (t) for (const m of t.messages) m.read = true;
    return;
  }
  await api.post(`/api/messages/threads/${patientId}/mark-read`);
}

export async function archiveThread(patientId: string): Promise<void> {
  if (USE_MOCK_API) {
    const t = mock().find((x) => x.patientId === patientId);
    if (t) t.archived = true;
    return;
  }
  await api.post(`/api/messages/threads/${patientId}/archive`);
}

/** Canned reply snippets configured by admin. Backend endpoint TBD — for now static. */
export async function fetchSnippets(): Promise<string[]> {
  if (USE_MOCK_API) return MESSAGE_SNIPPETS;
  // TODO [backend]: decide on storage (Settings entity or its own resource)
  return MESSAGE_SNIPPETS;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
