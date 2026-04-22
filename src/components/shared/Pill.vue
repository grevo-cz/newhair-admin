<script setup lang="ts">
type Tone = 'default' | 'orange' | 'sky' | 'green' | 'red' | 'amber' | 'dark' | 'purple';

withDefaults(
  defineProps<{
    tone?: Tone;
    size?: 'sm' | 'md';
  }>(),
  { tone: 'default', size: 'md' },
);

const toneClasses: Record<Tone, string> = {
  default: 'bg-slate-100 text-slate-700',
  orange: 'bg-brand-orange/15 text-[#B5660C]',
  sky: 'bg-[#EFF8FE] text-[#0E6EA0]',
  green: 'bg-[#F0FCF5] text-[#159344]',
  red: 'bg-[#FEF2F2] text-brand-red',
  amber: 'bg-[#FFFBEB] text-brand-amber',
  dark: 'bg-brand-dark text-white',
  purple: 'bg-[#EDE9FE] text-[#6D28D9]',
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-medium rounded-full',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[13px] px-2.5 py-1',
      toneClasses[tone],
    ]"
  >
    <slot />
  </span>
</template>
