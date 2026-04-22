/**
 * Photos service. The admin only reads photos + sets marketing consent; patients
 * upload directly from the PWA via a signed upload URL.
 *
 * Backend contract:
 *   GET   /api/patients/{id}/photos              → HydraCollection<Photo>
 *   PATCH /api/photos/{id}                       body: { marketingConsent } → Photo
 *   DELETE/api/photos/{id}                       → 204
 *   POST  /api/photos/export                     body: { patientIds[], consentOnly: bool }
 *                                                   → { url }  (ZIP download link)
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { Photo, PhotoConsent } from '@/types';
import { buildSeedPhotos } from '@/data/seedPhotos';

let mockStore: Photo[] | null = null;
function mock(): Photo[] {
  if (!mockStore) mockStore = buildSeedPhotos();
  return mockStore;
}

export async function fetchPhotos(patientId?: string): Promise<Photo[]> {
  if (USE_MOCK_API) {
    await delay(100);
    return patientId ? mock().filter((p) => p.patientId === patientId) : [...mock()];
  }
  const path = patientId ? `/api/patients/${patientId}/photos` : '/api/photos';
  const { data } = await api.get<HydraCollection<Photo>>(path);
  return unwrapHydra(data);
}

export async function setPhotoConsent(id: string, consent: PhotoConsent): Promise<Photo> {
  if (USE_MOCK_API) {
    await delay(60);
    const p = mock().find((x) => x.id === id);
    if (!p) throw new Error(`Photo ${id} not found`);
    p.marketingConsent = consent;
    return p;
  }
  const { data } = await api.patch<Photo>(`/api/photos/${id}`, { marketingConsent: consent }, {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
  return data;
}

export async function deletePhoto(id: string): Promise<void> {
  if (USE_MOCK_API) {
    mockStore = mock().filter((x) => x.id !== id);
    return;
  }
  await api.delete(`/api/photos/${id}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
