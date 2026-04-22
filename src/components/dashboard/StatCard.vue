<script setup lang="ts">
import { computed } from 'vue';
import { resolveIcon } from '@/composables/useIcon';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  tone?: 'orange' | 'sky' | 'green' | 'red' | 'purple' | 'amber' | 'dark';
  to?: string;
}>();

const Icon = computed(() => resolveIcon(props.icon));

const tonePalette: Record<string, { bg: string; fg: string }> = {
  orange: { bg: 'bg-brand-orange/15', fg: 'text-brand-orange' },
  sky: { bg: 'bg-[#EFF8FE]', fg: 'text-[#0E6EA0]' },
  green: { bg: 'bg-[#F0FCF5]', fg: 'text-[#159344]' },
  red: { bg: 'bg-[#FEF2F2]', fg: 'text-brand-red' },
  purple: { bg: 'bg-[#EDE9FE]', fg: 'text-[#6D28D9]' },
  amber: { bg: 'bg-[#FFFBEB]', fg: 'text-brand-amber' },
  dark: { bg: 'bg-brand-dark/10', fg: 'text-brand-dark' },
};

const t = computed(() => tonePalette[props.tone ?? 'orange']);
</script>

<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to"
    class="block bg-card border border-border-subtle rounded-2xl p-5 hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm text-slate-500">{{ title }}</p>
        <p class="text-3xl font-bold text-brand-dark mt-1 tabular-nums">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>
      </div>
      <span
        :class="['w-11 h-11 rounded-xl flex items-center justify-center shrink-0', t.bg, t.fg]"
      >
        <component :is="Icon" :size="20" />
      </span>
    </div>
  </component>
</template>
