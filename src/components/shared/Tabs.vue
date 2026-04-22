<script setup lang="ts">
interface Tab { value: string; label: string; badge?: string | number }

defineProps<{ modelValue: string; tabs: Tab[] }>();
defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>

<template>
  <div class="flex items-center gap-1 border-b border-border-subtle">
    <button
      v-for="t in tabs"
      :key="t.value"
      type="button"
      :class="[
        'relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium -mb-px transition-colors',
        modelValue === t.value
          ? 'text-brand-dark border-b-2 border-brand-orange'
          : 'text-slate-500 hover:text-brand-dark border-b-2 border-transparent',
      ]"
      @click="$emit('update:modelValue', t.value)"
    >
      {{ t.label }}
      <span
        v-if="t.badge != null"
        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-brand-orange text-white"
      >{{ t.badge }}</span>
    </button>
  </div>
</template>
