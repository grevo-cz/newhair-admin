<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

interface Opt { value: string; label: string }

const props = defineProps<{
  modelValue: string | null | undefined;
  options: Opt[];
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}>();

defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const inputId = computed(() => `s-${Math.random().toString(36).slice(2, 9)}`);
</script>

<template>
  <label :for="inputId" class="block">
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-brand-red">*</span>
    </span>
    <span
      :class="[
        'relative flex items-center w-full rounded-xl border bg-white h-11 transition-colors',
        error ? 'border-brand-red' : 'border-border-subtle focus-within:border-brand-orange',
        disabled && 'opacity-60 bg-slate-50',
      ]"
    >
      <select
        :id="inputId"
        :value="modelValue ?? ''"
        :disabled="disabled"
        class="appearance-none w-full h-full bg-transparent outline-none px-3.5 pr-10 text-[15px] text-brand-dark"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <ChevronDown :size="16" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </span>
    <span v-if="error" class="block text-xs text-brand-red mt-1">{{ error }}</span>
    <span v-else-if="hint" class="block text-xs text-slate-500 mt-1">{{ hint }}</span>
  </label>
</template>
