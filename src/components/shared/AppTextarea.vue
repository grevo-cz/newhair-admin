<script setup lang="ts">
import { computed } from 'vue';

defineProps<{
  modelValue: string | null | undefined;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}>();

defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const inputId = computed(() => `t-${Math.random().toString(36).slice(2, 9)}`);
</script>

<template>
  <label :for="inputId" class="block">
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-brand-red">*</span>
    </span>
    <textarea
      :id="inputId"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :rows="rows ?? 4"
      :class="[
        'w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] text-brand-dark outline-none resize-y transition-colors',
        error ? 'border-brand-red' : 'border-border-subtle focus:border-brand-orange',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <span v-if="error" class="block text-xs text-brand-red mt-1">{{ error }}</span>
    <span v-else-if="hint" class="block text-xs text-slate-500 mt-1">{{ hint }}</span>
  </label>
</template>
