<script setup lang="ts">
import { X } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  { size: 'md' },
);

defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();
</script>

<template>
  <transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        :class="[
          'bg-white rounded-2xl shadow-2xl w-full overflow-hidden',
          size === 'sm' && 'max-w-sm',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
          size === 'xl' && 'max-w-4xl',
        ]"
      >
        <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <slot name="header">
            <h3 class="text-lg font-semibold text-brand-dark">{{ title }}</h3>
          </slot>
          <button
            class="p-1 rounded hover:bg-slate-100 text-slate-500"
            @click="$emit('update:modelValue', false)"
          >
            <X :size="18" />
          </button>
        </div>
        <div class="px-6 py-5">
          <slot />
        </div>
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-border-subtle bg-slate-50 flex items-center justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>
