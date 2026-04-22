<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVideosStore } from '@/stores/videosStore';
import { useUiStore } from '@/stores/uiStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppInput from '@/components/shared/AppInput.vue';
import AppSelect from '@/components/shared/AppSelect.vue';
import AppTextarea from '@/components/shared/AppTextarea.vue';
import AppButton from '@/components/shared/AppButton.vue';
import TagInput from '@/components/shared/TagInput.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import { ArrowLeft, Play } from 'lucide-vue-next';
import type { Video } from '@/types';

const route = useRoute();
const router = useRouter();
const videos = useVideosStore();
const ui = useUiStore();

const editingId = computed(() => (route.params.id as string | undefined) ?? null);

function blank(): Video {
  return {
    id: '',
    name: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    durationSeconds: 180,
    category: 'obecne',
    phaseSlugs: ['obecne'],
    tags: [],
    order: 0,
    recommended: false,
    active: true,
  };
}

const form = reactive<Video>(editingId.value ? { ...(videos.byId(editingId.value) ?? blank()) } : blank());

// auto thumbnail from YouTube
watch(() => form.url, (url) => {
  if (!url) return;
  const m = url.match(/(?:youtu\.be\/|v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  if (m) {
    form.thumbnailUrl = `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg`;
  }
});

function submit() {
  if (!form.name.trim() || !form.url.trim()) {
    ui.toast({ type: 'error', text: 'Vyplň název a URL.' });
    return;
  }
  if (editingId.value) {
    videos.update(editingId.value, { ...form });
    ui.toast({ type: 'success', text: 'Video uloženo.' });
  } else {
    const { id: _drop, order: _o, ...rest } = form;
    const created = videos.create(rest);
    ui.toast({ type: 'success', text: 'Video přidáno.' });
    router.push(`/videos/${created.id}/edit`);
    return;
  }
  router.push('/videos');
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-3 mb-4">
      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="router.push('/videos')">
        <ArrowLeft :size="18" />
      </button>
      <span class="text-sm text-slate-500">Videa / {{ editingId ? 'upravit' : 'nové' }}</span>
    </div>

    <PageHeader :title="editingId ? 'Upravit video' : 'Nové video'" />

    <AppCard>
      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="form.name" label="Název" required />
        <AppInput v-model="form.url" label="URL (YouTube / Vimeo / CDN)" required placeholder="https://..." />
      </div>
      <AppTextarea v-model="form.description" label="Popis" :rows="2" class="mt-3" />

      <div class="grid grid-cols-3 gap-4 mt-3">
        <AppInput v-model.number="form.durationSeconds" type="number" label="Délka (s)" />
        <AppSelect
          v-model="form.category as string"
          label="Kategorie"
          :options="[
            { value: 'pred-odletem', label: 'Před odletem' },
            { value: 'pobyt', label: 'Pobyt' },
            { value: 'po-navratu', label: 'Po návratu' },
            { value: 'obecne', label: 'Obecné' },
          ]"
        />
        <AppInput v-model="form.thumbnailUrl" label="Thumbnail URL" hint="Auto-extrakce z YouTube" />
      </div>

      <div v-if="form.thumbnailUrl" class="mt-4 rounded-xl overflow-hidden bg-slate-100 aspect-video max-w-md relative">
        <img :src="form.thumbnailUrl" alt="" class="w-full h-full object-cover" />
        <span class="absolute inset-0 flex items-center justify-center bg-black/20">
          <Play :size="32" class="text-white" />
        </span>
      </div>

      <div class="mt-4">
        <TagInput v-model="form.tags" label="Tagy" placeholder="mytí, péče, spánek…" />
      </div>

      <div class="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
        <ToggleSwitch v-model="form.recommended" label="Doporučené" />
        <ToggleSwitch v-model="form.active" label="Aktivní v appce" />
      </div>
    </AppCard>

    <div class="flex items-center justify-end gap-2 mt-6">
      <AppButton variant="secondary" @click="router.push('/videos')">Zrušit</AppButton>
      <AppButton variant="primary" icon="save" @click="submit">Uložit</AppButton>
    </div>
  </div>
</template>
