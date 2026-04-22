<script setup lang="ts">
import { ref } from 'vue';
import { X, Plus } from 'lucide-vue-next';

const props = defineProps<{ modelValue: string[]; label?: string; placeholder?: string }>();
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>();

const draft = ref('');

function add() {
  const v = draft.value.trim();
  if (!v) return;
  if (props.modelValue.includes(v)) {
    draft.value = '';
    return;
  }
  emit('update:modelValue', [...props.modelValue, v]);
  draft.value = '';
}

function remove(i: number) {
  const next = [...props.modelValue];
  next.splice(i, 1);
  emit('update:modelValue', next);
}
</script>

<template>
  <div>
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-1.5">{{ label }}</span>
    <div class="flex flex-wrap items-center gap-2 p-2 bg-white border border-border-subtle rounded-xl focus-within:border-brand-orange min-h-[44px]">
      <span
        v-for="(t, i) in modelValue"
        :key="t + i"
        class="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-sm rounded-full pl-3 pr-1 py-1"
      >
        {{ t }}
        <button type="button" class="p-0.5 rounded-full hover:bg-slate-200 text-slate-500" @click="remove(i)">
          <X :size="12" />
        </button>
      </span>
      <input
        v-model="draft"
        :placeholder="placeholder ?? 'Přidat tag…'"
        class="flex-1 min-w-[140px] bg-transparent outline-none text-sm py-1"
        @keydown.enter.prevent="add"
        @keydown.comma.prevent="add"
      />
      <button
        v-if="draft"
        type="button"
        class="text-brand-orange p-1 rounded hover:bg-brand-orange/10"
        @click="add"
      >
        <Plus :size="16" />
      </button>
    </div>
  </div>
</template>
