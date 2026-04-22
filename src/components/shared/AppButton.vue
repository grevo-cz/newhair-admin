<script setup lang="ts">
import { computed } from 'vue';
import { resolveIcon } from '@/composables/useIcon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    icon?: string;
    iconRight?: string;
    block?: boolean;
    pill?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
    loading?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    pill: true,
    type: 'button',
  },
);

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-orange text-white hover:bg-[#E97D18] active:bg-[#D66F12] shadow-sm',
  secondary:
    'bg-white text-brand-dark border border-border-subtle hover:bg-slate-50',
  ghost: 'text-brand-dark hover:bg-slate-100',
  danger: 'bg-brand-red text-white hover:bg-red-600',
  dark: 'bg-brand-dark text-white hover:bg-[#1F2937]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
};

const IconLeft = computed(() => (props.icon ? resolveIcon(props.icon) : null));
const IconRight = computed(() => (props.iconRight ? resolveIcon(props.iconRight) : null));
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors select-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1',
      pill ? 'rounded-full' : 'rounded-xl',
      block ? 'w-full' : '',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <component :is="IconLeft" v-if="IconLeft" :size="size === 'sm' ? 14 : 16" :stroke-width="2" />
    <slot />
    <component :is="IconRight" v-if="IconRight" :size="size === 'sm' ? 14 : 16" :stroke-width="2" />
  </button>
</template>
