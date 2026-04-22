<script setup lang="ts">
import { resolveIcon } from '@/composables/useIcon';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ icon?: string; title: string; text?: string }>(),
  { icon: 'info' },
);

const Icon = computed(() => resolveIcon(props.icon));
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center py-12 px-6">
    <span class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
      <component :is="Icon" :size="22" />
    </span>
    <h3 class="text-base font-semibold text-brand-dark mb-1">{{ title }}</h3>
    <p v-if="text" class="text-sm text-slate-500 max-w-sm">{{ text }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
