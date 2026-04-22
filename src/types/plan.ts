import type { SurgeryType } from './patient';

export type PhaseReference = 'odlet' | 'zakrok' | 'navrat';
export type PhaseSlug = 'pred-odletem' | 'pobyt' | 'po-navratu' | string;
export type HeroColor = 'dark' | 'teal' | 'green' | 'purple';

export const PHASE_REFERENCE_LABELS: Record<PhaseReference, string> = {
  odlet: 'Odlet',
  zakrok: 'Zákrok',
  navrat: 'Návrat',
};

export interface PlanTemplate {
  id: string;
  name: string;
  surgeryType: SurgeryType | 'any';
  description?: string;
  isDefault: boolean;
  phases: PlanPhase[];
  library: LibraryComponent[];
}

/**
 * Master definition of a component — like a Figma component.
 * Instances referenced from a DayCard via ComponentItem.libraryId share values.
 */
export interface LibraryComponent {
  id: string;
  templateId: string;
  type: ComponentType;
  name: string;
  shortDescription?: string;
  hasDetail: boolean;
  detailRichtext?: string;
  icon: string;
  requiresCompletion: boolean;
  requiresPhoto: boolean;
  timeOfDay?: TimeOfDay;
  pointsForCompletion: number;
  notification?: ComponentNotification;
  dangerItems?: DangerItem[];
  videoId?: string;
  externalLink?: string;
}

export interface PlanPhase {
  id: string;
  templateId: string;
  name: string;
  slug: PhaseSlug;
  order: number;
  relativeTo: PhaseReference;
  heroColor: HeroColor;
  icon: string;
  quote?: string;
  description?: string;
  dayCards: DayCard[];
}

export interface DayCard {
  id: string;
  phaseId: string;
  dayFrom: number;            // relative number; can be negative
  dayTo: number;              // relative; same as dayFrom = single day
  name?: string;              // optional override; auto "Den 5" or "Dny 5–15"
  order: number;
  components: ComponentItem[];
}

export type ComponentType = 'info' | 'instrukce' | 'varovani' | 'nebezpeci' | 'uspech';
export type TimeOfDay = 'rano' | 'dopoledne' | 'obed' | 'odpoledne' | 'vecer' | 'noc' | 'cely_den';

export const COMPONENT_TYPE_LABELS: Record<ComponentType, string> = {
  info: 'Info',
  instrukce: 'Instrukce',
  varovani: 'Varování',
  nebezpeci: 'Nebezpečí',
  uspech: 'Úspěch',
};

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  rano: 'Ráno',
  dopoledne: 'Dopoledne',
  obed: 'Oběd',
  odpoledne: 'Odpoledne',
  vecer: 'Večer',
  noc: 'Noc',
  cely_den: 'Celý den',
};

export interface ComponentItem {
  id: string;
  dayCardId: string;
  /**
   * If set, this is an instance of a LibraryComponent — its values
   * are resolved from the library (like a Figma component instance).
   * If null, component holds its own values locally.
   */
  libraryId?: string | null;
  type: ComponentType;
  name: string;
  shortDescription?: string;
  hasDetail: boolean;
  detailRichtext?: string;    // markdown-ish; rendered as preview
  icon: string;
  requiresCompletion: boolean;
  requiresPhoto: boolean;
  timeOfDay?: TimeOfDay;
  pointsForCompletion: number;
  order: number;
  notification?: ComponentNotification;
  dangerItems?: DangerItem[];
  videoId?: string;
  externalLink?: string;
}

export interface ComponentNotification {
  enabled: boolean;
  time: string;               // "HH:MM"
  text?: string;              // fallback -> component name
  actionType: 'detail' | 'dashboard';
}

export interface DangerItem {
  id: string;
  text: string;
  order: number;
}
