<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useVideosStore } from '@/stores/videosStore';
import { useUiStore } from '@/stores/uiStore';
import { resolveIcon } from '@/composables/useIcon';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import Pill from '@/components/shared/Pill.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import { Play, Star } from 'lucide-vue-next';

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
          <div class="mt-3 pt-3 border-t border-border-subtle space-y-2">
            <!-- Row 1: Aktivní + Doporučené -->
            <div class="flex items-center gap-3">
              <ToggleSwitch
                :model-value="v.active"
                :title="v.active ? 'Aktivní v appce — vypnout' : 'Neaktivní — zapnout'"
                @update:model-value="() => videos.toggleActive(v.id)"
              />
              <span class="text-xs text-slate-500">{{ v.active ? 'Aktivní' : 'Vypnuté' }}</span>
              <span class="flex-1" />
              <button
                :class="[
                  'inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 transition-colors',
                  v.recommended
                    ? 'bg-brand-orange/15 text-[#B5660C]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                ]"
                :title="v.recommended ? 'Odebrat doporučení' : 'Doporučit'"
                @click="videos.toggleRecommended(v.id)"
              >
                <Star :size="12" :fill="v.recommended ? 'currentColor' : 'none'" />
                {{ v.recommended ? 'Doporučeno' : 'Doporučit' }}
              </button>
            </div>

            <!-- Row 2: Reorder + Edit + Delete -->
            <div class="flex items-center gap-0.5">
              <button
                class="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                title="Posunout nahoru"
                @click="videos.move(v.id, -1)"
              >
                <component :is="resolveIcon('chevron-up')" :size="15" />
              </button>
              <button
                class="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                title="Posunout dolů"
                @click="videos.move(v.id, 1)"
              >
                <component :is="resolveIcon('chevron-down')" :size="15" />
              </button>
              <span class="flex-1" />
              <button
                class="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded px-2 py-1"
                title="Upravit"
                @click="router.push(`/videos/${v.id}/edit`)"
              >
                <component :is="resolveIcon('pencil')" :size="13" />
                Upravit
              </button>
              <button
                class="p-1.5 rounded hover:bg-[#FEF2F2] text-brand-red"
                title="Smazat"
                @click="remove(v.id)"
              >
                <component :is="resolveIcon('trash-2')" :size="15" />
              </button>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>
