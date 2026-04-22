<script setup lang="ts">
import { Search, X } from 'lucide-vue-next';

defineProps<{ modelValue: string; placeholder?: string }>();
defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>

<template>
  <label class="relative inline-flex items-center w-full max-w-xs">
    <Search :size="16" class="absolute left-3 text-slate-400 pointer-events-none" />
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder ?? 'Hledat…'"
      class="w-full h-10 pl-9 pr-8 bg-white border border-border-subtle rounded-xl text-sm text-brand-dark outline-none focus:border-brand-orange"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="absolute right-2 text-slate-400 hover:text-slate-600"
      @click="$emit('update:modelValue', '')"
    >
      <X :size="14" />
    </button>
  </label>
</template>
