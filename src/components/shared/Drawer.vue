<script setup lang="ts">
import { X } from 'lucide-vue-next';

withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    width?: 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  { width: 'md' },
);

defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const widthClass: Record<string, string> = {
  sm: 'w-[380px]',
  md: 'w-[480px]',
  lg: 'w-[640px]',
  xl: 'w-[800px]',
};
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex">
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div class="absolute inset-0 bg-black/40" @click="$emit('update:modelValue', false)" />
    </transition>
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        :class="[
          'ml-auto relative bg-white h-full shadow-2xl flex flex-col max-w-full',
          widthClass[width],
        ]"
      >
        <header class="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <slot name="header">
            <h3 class="text-lg font-semibold text-brand-dark">{{ title }}</h3>
          </slot>
          <button
            class="p-1 rounded hover:bg-slate-100 text-slate-500"
            @click="$emit('update:modelValue', false)"
          >
            <X :size="18" />
          </button>
        </header>
        <div class="flex-1 overflow-auto">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="px-6 py-4 border-t border-border-subtle bg-slate-50">
          <slot name="footer" />
        </footer>
      </aside>
    </transition>
  </div>
</template>
