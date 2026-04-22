import { usePatientsStore } from '@/stores/patientsStore';
import { usePlansStore } from '@/stores/plansStore';
import { useVideosStore } from '@/stores/videosStore';
import { usePhotosStore } from '@/stores/photosStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useSettingsStore } from '@/stores/settingsStore';

import { buildSeedPatients } from './seedPatients';
import { buildSeedPlans } from './seedPlans';
import { buildSeedVideos } from './seedVideos';
import { buildSeedPhotos } from './seedPhotos';
import { buildSeedDocuments } from './seedDocuments';
import { buildSeedThreads, MESSAGE_SNIPPETS } from './seedMessages';
import { buildSeedSettings } from './seedSettings';

export function loadSeeds(): void {
  usePatientsStore().hydrate(buildSeedPatients());
  usePlansStore().hydrate(buildSeedPlans());
  useVideosStore().hydrate(buildSeedVideos());
  usePhotosStore().hydrate(buildSeedPhotos());
  useDocumentsStore().hydrate(buildSeedDocuments());
  useMessagesStore().hydrate(buildSeedThreads(), MESSAGE_SNIPPETS);
  useSettingsStore().hydrate(buildSeedSettings());
}
