<script setup lang="ts">
const props = defineProps<{ active?: boolean; tone?: 'green' | 'red' | 'amber' | 'slate' }>();

const palette: Record<string, string> = {
  green: 'bg-[#22C55E]',
  red: 'bg-brand-red',
  amber: 'bg-brand-amber',
  slate: 'bg-slate-400',
};
const color = props.tone ? palette[props.tone] : props.active ? palette.green : palette.slate;
</script>

<template>
  <span :class="['inline-block rounded-full w-2.5 h-2.5', color]" />
</template>
