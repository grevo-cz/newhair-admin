/**
 * Videos service.
 *
 * Backend contract:
 *   GET    /api/videos               → HydraCollection<Video>
 *   POST   /api/videos               body: Omit<Video,'id'|'order'> → Video
 *   PATCH  /api/videos/{id}          body: Partial<Video>           → Video
 *   DELETE /api/videos/{id}          → 204
 *   POST   /api/videos/reorder       body: { order: string[] }      → 204
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { Video } from '@/types';
import { buildSeedVideos } from '@/data/seedVideos';

let mockStore: Video[] | null = null;
function mock(): Video[] {
  if (!mockStore) mockStore = buildSeedVideos();
  return mockStore;
}

export async function fetchVideos(): Promise<Video[]> {
  if (USE_MOCK_API) {
    await delay(100);
    return [...mock()];
  }
  const { data } = await api.get<HydraCollection<Video>>('/api/videos');
  return unwrapHydra(data);
}

export async function createVideo(input: Omit<Video, 'id' | 'order'>): Promise<Video> {
  if (USE_MOCK_API) {
    await delay(140);
    const v: Video = { ...input, id: crypto.randomUUID(), order: mock().length };
    mock().push(v);
    return v;
  }
  const { data } = await api.post<Video>('/api/videos', input);
  return data;
}

export async function updateVideo(id: string, patch: Partial<Video>): Promise<Video> {
  if (USE_MOCK_API) {
    await delay(100);
    const v = mock().find((x) => x.id === id);
    if (!v) throw new Error(`Video ${id} not found`);
    Object.assign(v, patch);
    return v;
  }
  const { data } = await api.patch<Video>(`/api/videos/${id}`, patch, {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
  return data;
}

export async function deleteVideo(id: string): Promise<void> {
  if (USE_MOCK_API) {
    await delay(100);
    mockStore = mock().filter((x) => x.id !== id);
    return;
  }
  await api.delete(`/api/videos/${id}`);
}

export async function reorderVideos(orderedIds: string[]): Promise<void> {
  if (USE_MOCK_API) {
    await delay(60);
    return;
  }
  await api.post('/api/videos/reorder', { order: orderedIds });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
