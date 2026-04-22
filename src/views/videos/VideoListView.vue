<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVideosStore } from '@/stores/videosStore';
import { useUiStore } from '@/stores/uiStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import Pill from '@/components/shared/Pill.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import { Play, ChevronUp, ChevronDown, Pencil, Star, StarOff, Trash2 } from 'lucide-vue-next';

const router = useRouter();
const videos = useVideosStore();
const ui = useUiStore();

function fmtDuration(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

async function remove(id: string) {
  const ok = await ui.confirm({ title: 'Smazat video?', text: 'Tuto akci nelze vrátit zpět.', confirmLabel: 'Smazat', danger: true });
  if (ok) {
    videos.remove(id);
    ui.toast({ type: 'success', text: 'Video smazáno.' });
  }
}
</script>

<template>
  <div>
    <PageHeader title="Videa" subtitle="Knihovna video návodů zobrazovaná v appce pacienta.">
      <template #actions>
        <AppButton variant="primary" icon="plus" @click="router.push('/videos/new')">Přidat video</AppButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <AppCard v-for="v in videos.list" :key="v.id" padding="sm">
        <div class="relative mb-3 rounded-xl overflow-hidden bg-slate-100 aspect-video">
          <img v-if="v.thumbnailUrl" :src="v.thumbnailUrl" :alt="v.name" class="w-full h-full object-cover" />
          <span class="absolute inset-0 flex items-center justify-center bg-black/20">
            <span class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-brand-dark">
              <Play :size="22" />
            </span>
          </span>
          <Pill v-if="v.recommended" tone="orange" size="sm" class="absolute top-2 left-2">⭐ Doporučené</Pill>
          <span class="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded px-1.5 py-0.5 tabular-nums">
            {{ fmtDuration(v.durationSeconds) }}
          </span>
        </div>
        <div class="px-3 pb-3">
          <h3 class="font-semibold text-brand-dark text-sm line-clamp-2">{{ v.name }}</h3>
          <p v-if="v.description" class="text-xs text-slate-500 mt-1 line-clamp-2">{{ v.description }}</p>
          <div class="flex flex-wrap gap-1 mt-2">
            <PhaseBadge v-for="slug in v.phaseSlugs" :key="slug" :slug="slug === 'obecne' ? undefined : slug" :label="slug === 'obecne' ? 'Obecné' : undefined" />
            <Pill v-for="t in v.tags" :key="t" size="sm">{{ t }}</Pill>
          </div>
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
            <ToggleSwitch :model-value="v.active" @update:model-value="() => videos.toggleActive(v.id)" />
            <AppButton variant="ghost" size="sm" icon="chevron-up" @click="videos.move(v.id, -1)" />
            <AppButton variant="ghost" size="sm" icon="chevron-down" @click="videos.move(v.id, 1)" />
            <AppButton variant="ghost" size="sm" :icon="v.recommended ? 'star' : 'star'" @click="videos.toggleRecommended(v.id)">
              {{ v.recommended ? 'Odebrat doporučení' : 'Doporučit' }}
            </AppButton>
            <span class="flex-1" />
            <AppButton variant="ghost" size="sm" icon="pencil" @click="router.push(`/videos/${v.id}/edit`)" />
            <AppButton variant="ghost" size="sm" icon="trash-2" @click="remove(v.id)" />
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>
