/**
 * Plans service — plan templates, phases, day cards, components, library.
 *
 * The admin works with the whole PlanTemplate tree at once (read & mutate in memory,
 * then persist). Two suggested backend shapes:
 *
 *   (a) TREE ENDPOINTS (simple, chatty-safe)
 *     GET   /api/plan-templates                        → HydraCollection<PlanTemplate>
 *     GET   /api/plan-templates/{id}                   → PlanTemplate (with nested tree)
 *     POST  /api/plan-templates                        body: PlanTemplate
 *     PUT   /api/plan-templates/{id}                   body: PlanTemplate (full tree)
 *     DELETE/api/plan-templates/{id}                   → 204
 *
 *   (b) GRANULAR CRUD (RESTful, preferred long-term)
 *     CRUD per phase:     /api/plan-phases
 *     CRUD per day card:  /api/day-cards
 *     CRUD per component: /api/components
 *     CRUD per library:   /api/library-components
 *
 * The mock implementation below behaves as if (a) was chosen so the frontend can be
 * wired with minimum backend work. You can later split into (b) without changing
 * this file's exported signature.
 */
import api, { USE_MOCK_API, unwrapHydra, type HydraCollection } from './api';
import type { PlanTemplate } from '@/types';
import { buildSeedPlans } from '@/data/seedPlans';

let mockStore: PlanTemplate[] | null = null;
function mock(): PlanTemplate[] {
  if (!mockStore) mockStore = buildSeedPlans();
  return mockStore;
}

export async function fetchPlans(): Promise<PlanTemplate[]> {
  if (USE_MOCK_API) {
    await delay(140);
    return JSON.parse(JSON.stringify(mock())) as PlanTemplate[];
  }
  const { data } = await api.get<HydraCollection<PlanTemplate>>('/api/plan-templates');
  return unwrapHydra(data);
}

export async function fetchPlan(id: string): Promise<PlanTemplate> {
  if (USE_MOCK_API) {
    await delay(80);
    const t = mock().find((x) => x.id === id);
    if (!t) throw new Error(`Plan template ${id} not found`);
    return JSON.parse(JSON.stringify(t)) as PlanTemplate;
  }
  const { data } = await api.get<PlanTemplate>(`/api/plan-templates/${id}`);
  return data;
}

/** Persist the whole plan tree. Server may respond with the canonical version. */
export async function savePlan(plan: PlanTemplate): Promise<PlanTemplate> {
  if (USE_MOCK_API) {
    await delay(180);
    const idx = mock().findIndex((x) => x.id === plan.id);
    if (idx >= 0) mock().splice(idx, 1, plan);
    else mock().unshift(plan);
    return plan;
  }
  const { data } = await api.put<PlanTemplate>(`/api/plan-templates/${plan.id}`, plan);
  return data;
}

export async function createPlan(plan: PlanTemplate): Promise<PlanTemplate> {
  if (USE_MOCK_API) {
    await delay(160);
    mock().unshift(plan);
    return plan;
  }
  const { data } = await api.post<PlanTemplate>('/api/plan-templates', plan);
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  if (USE_MOCK_API) {
    await delay(100);
    mockStore = mock().filter((x) => x.id !== id);
    return;
  }
  await api.delete(`/api/plan-templates/${id}`);
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
