<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <header class="flex items-start md:items-center justify-between gap-4 flex-col md:flex-row mb-6">
    <div>
      <h1 class="text-2xl font-bold text-brand-dark tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="text-sm text-slate-500 mt-1">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
