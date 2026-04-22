import type { PhaseSlug } from './plan';

export type VideoCategory = PhaseSlug | 'obecne';

export interface Video {
  id: string;
  name: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  category: VideoCategory;
  phaseSlugs: VideoCategory[];
  tags: string[];
  order: number;
  recommended: boolean;
  active: boolean;
}
