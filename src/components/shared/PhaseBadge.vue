<script setup lang="ts">
import { computed } from 'vue';
import Pill from './Pill.vue';
import type { PhaseReference, PhaseSlug } from '@/types';

const props = defineProps<{
  slug?: PhaseSlug;
  reference?: PhaseReference;
  label?: string;
}>();

const tone = computed(() => {
  if (props.slug === 'pred-odletem') return 'dark';
  if (props.slug === 'pobyt') return 'sky';
  if (props.slug === 'po-navratu') return 'purple';
  if (props.reference === 'odlet') return 'dark';
  if (props.reference === 'zakrok') return 'sky';
  if (props.reference === 'navrat') return 'purple';
  return 'default';
});

const text = computed(() => {
  if (props.label) return props.label;
  if (props.slug === 'pred-odletem') return 'Před odletem';
  if (props.slug === 'pobyt') return 'Pobyt';
  if (props.slug === 'po-navratu') return 'Po návratu';
  if (props.reference === 'odlet') return 'Odlet';
  if (props.reference === 'zakrok') return 'Zákrok';
  if (props.reference === 'navrat') return 'Návrat';
  return '—';
});
</script>

<template>
  <Pill :tone="tone as any">{{ text }}</Pill>
</template>
