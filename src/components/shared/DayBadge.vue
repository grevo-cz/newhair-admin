<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  day: number;                // relativní den (může být záporný)
  compact?: boolean;
}>();

const label = computed(() => {
  if (props.day === 0) return 'D 0';
  if (props.day > 0) return `D +${props.day}`;
  return `D ${props.day}`;
});

const tone = computed(() => {
  if (props.day < 0) return 'bg-slate-100 text-slate-600';
  if (props.day === 0) return 'bg-brand-orange text-white';
  if (props.day <= 7) return 'bg-[#FEF2F2] text-brand-red';
  if (props.day <= 30) return 'bg-[#FFFBEB] text-brand-amber';
  return 'bg-[#F0FCF5] text-[#159344]';
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-full tabular-nums',
      tone,
      compact ? 'text-xs px-2 py-0.5' : 'text-[13px] px-2.5 py-1 min-w-[58px]',
    ]"
  >
    {{ label }}
  </span>
</template>
