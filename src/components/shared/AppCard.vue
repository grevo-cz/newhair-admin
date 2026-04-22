<script setup lang="ts">
withDefaults(
  defineProps<{
    padding?: 'none' | 'sm' | 'md' | 'lg';
    rounded?: 'md' | 'lg' | 'xl' | '2xl';
    hoverable?: boolean;
  }>(),
  { padding: 'md', rounded: '2xl' },
);
</script>

<template>
  <div
    :class="[
      'bg-card border border-border-subtle',
      rounded === 'md' && 'rounded-md',
      rounded === 'lg' && 'rounded-lg',
      rounded === 'xl' && 'rounded-xl',
      rounded === '2xl' && 'rounded-2xl',
      padding === 'sm' && 'p-3',
      padding === 'md' && 'p-5',
      padding === 'lg' && 'p-7',
      hoverable && 'transition-shadow hover:shadow-md',
    ]"
  >
    <slot />
  </div>
</template>
