/**
 * Documents service — contracts, GDPR, medical reports, patient-facing instructions.
 *
 * Backend contract:
 *   GET    /api/patients/{id}/documents              → HydraCollection<DocumentFile>
 *   POST   /api/patients/{id}/documents              multipart/form-data: { file, type, visibleToPatient }
 *   PATCH  /api/documents/{id}                       body: Partial<DocumentFile>
 *   DELETE /api/documents/{id}                       → 204
 *   GET    /api/documents/{id}/download              → binary (redirects to signed URL)
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { DocumentFile, DocumentType } from '@/types';
import { buildSeedDocuments } from '@/data/seedDocuments';

let mockStore: DocumentFile[] | null = null;
function mock(): DocumentFile[] {
  if (!mockStore) mockStore = buildSeedDocuments();
  return mockStore;
}

export async function fetchDocuments(patientId: string): Promise<DocumentFile[]> {
  if (USE_MOCK_API) {
    await delay(90);
    return mock().filter((d) => d.patientId === patientId);
  }
  const { data } = await api.get<HydraCollection<DocumentFile>>(`/api/patients/${patientId}/documents`);
  return unwrapHydra(data);
}

export async function uploadDocument(
  patientId: string,
  file: File,
  type: DocumentType,
  visibleToPatient = false,
): Promise<DocumentFile> {
  if (USE_MOCK_API) {
    await delay(200);
    const doc: DocumentFile = {
      id: crypto.randomUUID(),
      patientId,
      type,
      name: file.name,
      url: '#',
      sizeBytes: file.size || 200_000,
      visibleToPatient,
      uploadedById: 'staff-admin-1',
      createdAt: new Date().toISOString(),
    };
    mock().unshift(doc);
    return doc;
  }
  const form = new FormData();
  form.append('file', file);
  form.append('type', type);
  form.append('visibleToPatient', String(visibleToPatient));
  const { data } = await api.post<DocumentFile>(`/api/patients/${patientId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function toggleDocumentVisibility(id: string): Promise<DocumentFile> {
  if (USE_MOCK_API) {
    const d = mock().find((x) => x.id === id);
    if (!d) throw new Error(`Document ${id} not found`);
    d.visibleToPatient = !d.visibleToPatient;
    return d;
  }
  const doc = mock().find((x) => x.id === id);
  const { data } = await api.patch<DocumentFile>(`/api/documents/${id}`, {
    visibleToPatient: !(doc?.visibleToPatient ?? false),
  }, { headers: { 'Content-Type': 'application/merge-patch+json' } });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  if (USE_MOCK_API) {
    mockStore = mock().filter((x) => x.id !== id);
    return;
  }
  await api.delete(`/api/documents/${id}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
