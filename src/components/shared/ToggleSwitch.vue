<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; label?: string; disabled?: boolean }>();
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();
</script>

<template>
  <label
    class="inline-flex items-center gap-2.5 select-none"
    :class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'"
  >
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      class="relative rounded-full transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/40"
      :class="modelValue ? 'bg-brand-orange' : 'bg-slate-300'"
      :style="{ width: '36px', height: '20px' }"
      @click="!disabled && $emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute block bg-white rounded-full shadow transition-transform"
        :style="{
          width: '16px',
          height: '16px',
          top: '2px',
          left: '2px',
          transform: modelValue ? 'translateX(16px)' : 'translateX(0)',
        }"
      />
    </button>
    <span v-if="label" class="text-sm text-slate-700">{{ label }}</span>
  </label>
</template>
