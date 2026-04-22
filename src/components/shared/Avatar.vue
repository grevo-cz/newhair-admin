<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{ name: string; src?: string; size?: number; tone?: 'orange' | 'sky' | 'dark' | 'green' | 'purple' | 'slate' }>(),
  { size: 36, tone: 'slate' },
);

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
});

const toneClass: Record<string, string> = {
  orange: 'bg-brand-orange text-white',
  sky: 'bg-[#2EB0E4] text-white',
  dark: 'bg-brand-dark text-white',
  green: 'bg-[#22C55E] text-white',
  purple: 'bg-[#6D28D9] text-white',
  slate: 'bg-slate-200 text-slate-700',
};
</script>

<template>
  <span
    :class="['inline-flex items-center justify-center rounded-full font-semibold select-none shrink-0', toneClass[tone]]"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.4)}px` }"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full rounded-full object-cover" />
    <template v-else>{{ initials }}</template>
  </span>
</template>
