<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-vue-next';
import { computed } from 'vue';

const ui = useUiStore();

const iconFor = (type: string) => {
  if (type === 'success') return CheckCircle2;
  if (type === 'warning') return AlertTriangle;
  if (type === 'error') return XCircle;
  return Info;
};

const toneFor = (type: string) => {
  if (type === 'success') return 'bg-[#F0FCF5] text-[#159344] border-[#D9F4E3]';
  if (type === 'warning') return 'bg-[#FFFBEB] text-brand-amber border-amber-200';
  if (type === 'error') return 'bg-[#FEF2F2] text-brand-red border-red-200';
  return 'bg-white text-brand-dark border-border-subtle';
};

const toasts = computed(() => ui.toasts);
</script>

<template>
  <div class="fixed right-6 bottom-6 z-[60] flex flex-col gap-2 items-end pointer-events-none">
    <transition-group
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        :class="['pointer-events-auto min-w-[280px] max-w-sm flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg', toneFor(t.type)]"
      >
        <component :is="iconFor(t.type)" :size="18" class="mt-0.5 shrink-0" />
        <div class="flex-1 min-w-0">
          <p v-if="t.title" class="font-semibold text-sm">{{ t.title }}</p>
          <p class="text-sm">{{ t.text }}</p>
        </div>
        <button class="text-slate-400 hover:text-slate-600" @click="ui.dismissToast(t.id)">
          <X :size="14" />
        </button>
      </div>
    </transition-group>
  </div>
</template>
