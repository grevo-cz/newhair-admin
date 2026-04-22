<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Patient } from '@/types';
import { usePlansStore } from '@/stores/plansStore';
import Drawer from '@/components/shared/Drawer.vue';
import MockPwaDashboard from './MockPwaDashboard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import DayBadge from '@/components/shared/DayBadge.vue';
import { patientDays } from '@/composables/useDayMath';

const props = defineProps<{ modelValue: boolean; patient: Patient | undefined }>();
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const plans = usePlansStore();
const template = computed(() => plans.byId(props.patient?.planTemplateId));

const offsetDays = ref(0);

watch(() => props.modelValue, (v) => { if (v) offsetDays.value = 0; });

const simulatedDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays.value);
  return d;
});

const days = computed(() => props.patient ? patientDays(props.patient, simulatedDate.value) : null);
</script>

<template>
  <Drawer :model-value="modelValue" width="lg" @update:model-value="(v) => $emit('update:modelValue', v)">
    <template #header>
      <div>
        <h3 class="text-lg font-semibold text-brand-dark">Pohled pacienta</h3>
        <p v-if="patient" class="text-xs text-slate-500">{{ patient.firstName }} {{ patient.lastName }}</p>
      </div>
    </template>

    <div v-if="patient" class="p-6 flex flex-col items-center gap-5 bg-surface min-h-full">
      <!-- Day stepper -->
      <div class="flex items-center gap-2 bg-white border border-border-subtle rounded-full p-1">
        <AppButton variant="ghost" size="sm" icon="chevron-left" @click="offsetDays--">Předchozí</AppButton>
        <div class="px-3 flex items-center gap-2">
          <span class="text-sm text-slate-600">Dnes {{ offsetDays === 0 ? '' : offsetDays > 0 ? `+ ${offsetDays} dní` : `- ${Math.abs(offsetDays)} dní` }}</span>
          <DayBadge v-if="days" :day="days.fromSurgery" compact />
        </div>
        <AppButton variant="ghost" size="sm" icon-right="chevron-right" @click="offsetDays++">Další</AppButton>
      </div>

      <MockPwaDashboard :patient="patient" :template="template" :simulated-date="simulatedDate" />

      <p class="text-xs text-slate-500 max-w-sm text-center">
        Renderujeme přesně to, co vidí pacient v aplikaci pro vybraný den. Zákrok: {{ days?.fromSurgery }} · Odlet: {{ days?.fromDeparture }} · Návrat: {{ days?.fromReturn }}.
      </p>
    </div>
  </Drawer>
</template>
