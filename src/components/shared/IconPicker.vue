<script setup lang="ts">
import { PICKER_ICONS, resolveIcon } from '@/composables/useIcon';
import { ref } from 'vue';
import { ChevronDown, Check } from 'lucide-vue-next';

defineProps<{ modelValue: string; label?: string }>();
defineEmits<{ (e: 'update:modelValue', v: string): void }>();

const open = ref(false);
</script>

<template>
  <div>
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-1.5">{{ label }}</span>
    <button
      type="button"
      class="flex items-center justify-between w-full h-11 px-3.5 rounded-xl border border-border-subtle bg-white hover:border-slate-300"
      @click="open = !open"
    >
      <span class="flex items-center gap-2">
        <component :is="resolveIcon(modelValue)" :size="18" class="text-slate-600" />
        <span class="text-sm text-slate-700 font-mono">{{ modelValue }}</span>
      </span>
      <ChevronDown :size="16" class="text-slate-400" />
    </button>
    <div v-if="open" class="mt-2 p-3 bg-white border border-border-subtle rounded-xl grid grid-cols-8 gap-1.5 max-h-64 overflow-auto">
      <button
        v-for="ic in PICKER_ICONS"
        :key="ic"
        type="button"
        :class="[
          'w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 relative',
          ic === modelValue && 'bg-brand-orange/10 text-brand-orange',
        ]"
        :title="ic"
        @click="$emit('update:modelValue', ic); open = false"
      >
        <component :is="resolveIcon(ic)" :size="18" />
        <Check v-if="ic === modelValue" :size="10" class="absolute -top-0.5 -right-0.5 bg-brand-orange text-white rounded-full p-0.5" />
      </button>
    </div>
  </div>
</template>
