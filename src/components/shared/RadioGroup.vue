<script setup lang="ts">
interface Opt { value: string; label: string; description?: string }

defineProps<{
  modelValue: string;
  options: Opt[];
  label?: string;
  inline?: boolean;
}>();
defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>

<template>
  <div>
    <span v-if="label" class="block text-sm font-medium text-slate-700 mb-2">{{ label }}</span>
    <div :class="[inline ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2']">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        :class="[
          'text-left rounded-xl border px-4 py-2.5 transition-colors',
          modelValue === opt.value
            ? 'border-brand-orange bg-[#FFF7EB] text-brand-dark'
            : 'border-border-subtle bg-white hover:border-slate-300',
        ]"
        @click="$emit('update:modelValue', opt.value)"
      >
        <span class="flex items-center gap-2 text-sm font-medium">
          <span
            :class="[
              'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
              modelValue === opt.value ? 'border-brand-orange' : 'border-slate-300',
            ]"
          >
            <span v-if="modelValue === opt.value" class="w-2 h-2 rounded-full bg-brand-orange" />
          </span>
          {{ opt.label }}
        </span>
        <span v-if="opt.description" class="block text-xs text-slate-500 mt-0.5 ml-6">{{ opt.description }}</span>
      </button>
    </div>
  </div>
</template>
