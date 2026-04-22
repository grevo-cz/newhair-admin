<script setup lang="ts">
defineProps<{ modelValue: boolean; label?: string; disabled?: boolean }>();
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();
</script>

<template>
  <label class="inline-flex items-center gap-2.5 cursor-pointer select-none" :class="disabled && 'opacity-50 cursor-not-allowed'">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative w-10 h-6 rounded-full transition-colors shrink-0',
        modelValue ? 'bg-brand-orange' : 'bg-slate-300',
      ]"
      @click="!disabled && $emit('update:modelValue', !modelValue)"
    >
      <span
        :class="[
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          modelValue ? 'translate-x-[18px]' : 'translate-x-0.5',
        ]"
      />
    </button>
    <span v-if="label" class="text-sm text-slate-700">{{ label }}</span>
  </label>
</template>
