import type { Patient, PhaseReference, PlanTemplate, PlanPhase, DayCard } from '@/types';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffDays(a: string, b: Date): number {
  const aDate = startOfDay(new Date(a));
  const bDate = startOfDay(b);
  const ms = bDate.getTime() - aDate.getTime();
  return Math.round(ms / 86_400_000);
}

export interface PatientDays {
  fromDeparture: number;
  fromSurgery: number;
  fromReturn: number;
}

/**
 * Počet dní od referenčních datumů pacienta pro libovolné "dnes".
 */
export function patientDays(p: Patient, today: Date = new Date()): PatientDays {
  return {
    fromDeparture: diffDays(p.departureDate, today),
    fromSurgery: diffDays(p.surgeryDate, today),
    fromReturn: diffDays(p.returnDate, today),
  };
}

/**
 * Vrátí aktuální relativní den pro daný referenční bod.
 */
export function dayForReference(
  p: Patient,
  ref: PhaseReference,
  today: Date = new Date(),
): number {
  const d = patientDays(p, today);
  if (ref === 'odlet') return d.fromDeparture;
  if (ref === 'zakrok') return d.fromSurgery;
  return d.fromReturn;
}

/**
 * Vrátí aktuální fázi podle data pacienta a plánu.
 */
export function currentPhase(
  p: Patient,
  template: PlanTemplate | undefined,
  today: Date = new Date(),
): PlanPhase | undefined {
  if (!template) return;
  const d = patientDays(p, today);
  // Najdi fázi, která "pokrývá" dnešek přes aspoň jednu kartu.
  for (const phase of template.phases) {
    const rel = d[refToKey(phase.relativeTo)];
    for (const card of phase.dayCards) {
      if (rel >= card.dayFrom && rel <= card.dayTo) return phase;
    }
  }
  // fallback — rozhoduje dle data operace
  if (d.fromSurgery < 0) return template.phases.find((p) => p.relativeTo === 'odlet');
  if (d.fromReturn >= 0) return template.phases.find((p) => p.relativeTo === 'navrat');
  return template.phases.find((p) => p.relativeTo === 'zakrok');
}

function refToKey(ref: PhaseReference): keyof PatientDays {
  if (ref === 'odlet') return 'fromDeparture';
  if (ref === 'zakrok') return 'fromSurgery';
  return 'fromReturn';
}

/**
 * Seznam karet dne aktivních pro daný den (dle všech referenčních bodů).
 */
export function activeCards(
  p: Patient,
  template: PlanTemplate | undefined,
  today: Date = new Date(),
): { phase: PlanPhase; card: DayCard; relativeDay: number }[] {
  if (!template) return [];
  const d = patientDays(p, today);
  const out: { phase: PlanPhase; card: DayCard; relativeDay: number }[] = [];
  for (const phase of template.phases) {
    const rel = d[refToKey(phase.relativeTo)];
    for (const card of phase.dayCards) {
      if (rel >= card.dayFrom && rel <= card.dayTo) {
        out.push({ phase, card, relativeDay: rel });
      }
    }
  }
  return out;
}

/**
 * Popisek jako "D+5 od zákroku", "D-3 do zákroku".
 */
export function formatRelativeDay(day: number, ref: PhaseReference): string {
  const label = { odlet: 'odletu', zakrok: 'zákroku', navrat: 'návratu' }[ref];
  if (day === 0) return `Den ${label}`;
  if (day > 0) return `D+${day} od ${label}`;
  return `D${day} do ${label}`;
}

/**
 * Zvláštní popisek pro tabulky — primárně počítáme od zákroku.
 */
export function patientDayBadge(p: Patient, today: Date = new Date()): string {
  const d = patientDays(p, today);
  if (d.fromSurgery === 0) return 'D 0';
  if (d.fromSurgery > 0) return `D +${d.fromSurgery}`;
  return `D ${d.fromSurgery}`;
}

export function stayDurationDays(p: Patient): number {
  return diffDays(p.departureDate, new Date(p.returnDate));
}
