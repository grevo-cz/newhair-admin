<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;
    type?: string;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    prefix?: string;
    suffix?: string;
    autofocus?: boolean;
  }>(),
  { type: 'text' },
);

defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'blur'): void }>();

const inputId = computed(() => `i-${Math.random().toString(36).slice(2, 9)}`);
</script>

<template>
  <label :for="inputId" class="block">
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-brand-red">*</span>
    </span>
    <span
      :class="[
        'flex items-center gap-2 w-full rounded-xl border bg-white px-3.5 h-11 transition-colors',
        error ? 'border-brand-red' : 'border-border-subtle focus-within:border-brand-orange',
        disabled && 'opacity-60 bg-slate-50',
      ]"
    >
      <span v-if="prefix" class="text-slate-500 text-sm">{{ prefix }}</span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :autofocus="autofocus"
        class="flex-1 bg-transparent outline-none text-[15px] text-brand-dark placeholder:text-slate-400"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <span v-if="suffix" class="text-slate-500 text-sm">{{ suffix }}</span>
    </span>
    <span v-if="error" class="block text-xs text-brand-red mt-1">{{ error }}</span>
    <span v-else-if="hint" class="block text-xs text-slate-500 mt-1">{{ hint }}</span>
  </label>
</template>
