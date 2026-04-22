/**
 * Patients service.
 *
 * Backend contract (API Platform resource):
 *   GET    /api/patients               → HydraCollection<Patient>
 *   GET    /api/patients/{id}          → Patient
 *   POST   /api/patients               body: CreatePatientInput → Patient
 *   PATCH  /api/patients/{id}          body: Partial<Patient>   → Patient
 *   DELETE /api/patients/{id}          → 204
 *   POST   /api/patients/{id}/archive  (custom) → Patient
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { Patient } from '@/types';
import { buildSeedPatients } from '@/data/seedPatients';

export type CreatePatientInput = Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'points' | 'status'>;

let mockStore: Patient[] | null = null;
function mock(): Patient[] {
  if (!mockStore) mockStore = buildSeedPatients();
  return mockStore;
}

export async function fetchPatients(): Promise<Patient[]> {
  if (USE_MOCK_API) {
    await delay(120);
    return [...mock()];
  }
  const { data } = await api.get<HydraCollection<Patient>>('/api/patients');
  return unwrapHydra(data);
}

export async function fetchPatient(id: string): Promise<Patient> {
  if (USE_MOCK_API) {
    await delay(80);
    const p = mock().find((x) => x.id === id);
    if (!p) throw new Error(`Patient ${id} not found`);
    return p;
  }
  const { data } = await api.get<Patient>(`/api/patients/${id}`);
  return data;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  if (USE_MOCK_API) {
    await delay(200);
    const now = new Date().toISOString();
    const p: Patient = {
      ...input,
      id: crypto.randomUUID(),
      points: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    mock().unshift(p);
    return p;
  }
  const { data } = await api.post<Patient>('/api/patients', input);
  return data;
}

export async function updatePatient(id: string, patch: Partial<Patient>): Promise<Patient> {
  if (USE_MOCK_API) {
    await delay(120);
    const p = mock().find((x) => x.id === id);
    if (!p) throw new Error(`Patient ${id} not found`);
    Object.assign(p, patch, { updatedAt: new Date().toISOString() });
    return p;
  }
  // PATCH requires Content-Type: application/merge-patch+json in API Platform.
  const { data } = await api.patch<Patient>(`/api/patients/${id}`, patch, {
    headers: { 'Content-Type': 'application/merge-patch+json' },
  });
  return data;
}

export async function archivePatient(id: string): Promise<Patient> {
  if (USE_MOCK_API) return updatePatient(id, { status: 'archived' });
  const { data } = await api.post<Patient>(`/api/patients/${id}/archive`);
  return data;
}

export async function deletePatient(id: string): Promise<void> {
  if (USE_MOCK_API) {
    await delay(120);
    mockStore = mock().filter((x) => x.id !== id);
    return;
  }
  await api.delete(`/api/patients/${id}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
