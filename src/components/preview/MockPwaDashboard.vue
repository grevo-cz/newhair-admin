<script setup lang="ts">
import { computed } from 'vue';
import type { Patient, PlanTemplate, DayCard, PlanPhase } from '@/types';
import { patientDays, activeCards, currentPhase as computeCurrentPhase } from '@/composables/useDayMath';
import { resolveIcon, COMPONENT_TYPE_ICONS } from '@/composables/useIcon';
import { Bell, MessageCircle, ChevronLeft, Check, Camera } from 'lucide-vue-next';

const props = defineProps<{ patient: Patient; template: PlanTemplate | undefined; simulatedDate: Date }>();

const d = computed(() => patientDays(props.patient, props.simulatedDate));
const phase = computed(() => computeCurrentPhase(props.patient, props.template, props.simulatedDate));

const heroClass = computed(() => {
  switch (phase.value?.heroColor) {
    case 'dark': return 'bg-gradient-to-b from-[#0F172A] to-[#1E293B]';
    case 'teal': return 'bg-gradient-to-b from-[#134E5E] to-[#0F3A47]';
    case 'green': return 'bg-gradient-to-b from-[#14532D] to-[#0F3F22]';
    case 'purple': return 'bg-gradient-to-b from-[#4C1D95] to-[#2E1065]';
    default: return 'bg-gradient-to-b from-[#0F172A] to-[#1E293B]';
  }
});

const cards = computed(() => activeCards(props.patient, props.template, props.simulatedDate));

function relativeDay(card: { card: DayCard; phase: PlanPhase; relativeDay: number }) {
  return card.relativeDay;
}

function todayComponents() {
  const out: { card: DayCard; phase: PlanPhase; comp: any }[] = [];
  for (const { card, phase } of cards.value) {
    for (const comp of card.components) {
      out.push({ card, phase, comp });
    }
  }
  return out;
}

const heroTitle = computed(() => {
  if (!phase.value) return 'NewHair';
  return phase.value.name;
});

const heroSubtitle = computed(() => {
  if (!phase.value) return '';
  if (phase.value.relativeTo === 'odlet' && d.value.fromDeparture < 0) {
    return `Odlet za ${Math.abs(d.value.fromDeparture)} dní`;
  }
  if (phase.value.relativeTo === 'zakrok') {
    if (d.value.fromSurgery === 0) return 'Den zákroku';
    if (d.value.fromSurgery > 0) return `Den +${d.value.fromSurgery} po zákroku`;
    return `Zákrok za ${Math.abs(d.value.fromSurgery)} dní`;
  }
  if (phase.value.relativeTo === 'navrat') {
    return `Den +${d.value.fromReturn} doma`;
  }
  return '';
});
</script>

<template>
  <div class="w-[390px] rounded-[32px] overflow-hidden border-[8px] border-brand-dark bg-[#F8FAFC] shadow-2xl">
    <!-- Hero -->
    <div :class="['px-5 pt-4 pb-8 text-white', heroClass]">
      <div class="flex items-center justify-between mb-8 text-white/80">
        <ChevronLeft :size="20" />
        <div class="flex items-center gap-1 font-semibold text-white">
          <span class="text-brand-orange">•</span>
          <span>NewHair</span>
        </div>
        <div class="flex items-center gap-2">
          <MessageCircle :size="18" />
          <Bell :size="18" />
        </div>
      </div>
      <p class="text-[11px] uppercase tracking-wider opacity-60 mb-1">{{ heroSubtitle }}</p>
      <h2 class="text-[26px] leading-tight font-semibold">{{ heroTitle }}</h2>
      <p v-if="phase?.quote" class="text-sm text-white/70 mt-2 italic">"{{ phase.quote }}"</p>
    </div>

    <!-- Content -->
    <div class="-mt-4 mx-3 bg-white rounded-2xl p-4 space-y-4 pb-6">
      <!-- Day pills -->
      <div v-if="cards.length > 0" class="flex gap-1.5 flex-wrap">
        <span
          v-for="(c, i) in cards"
          :key="c.card.id"
          :class="[
            'text-xs font-semibold rounded-full px-3 py-1',
            i === 0 ? 'bg-brand-dark text-white' : 'bg-[#EFF8FE] text-[#0E6EA0]',
          ]"
        >
          {{ c.card.name ?? `Den ${relativeDay(c)}` }}
        </span>
      </div>

      <!-- Empty -->
      <div v-if="todayComponents().length === 0" class="text-center py-6 text-sm text-slate-400">
        Dnes nic naplánováno.
      </div>

      <!-- Components -->
      <div
        v-for="{ comp } in todayComponents()"
        :key="comp.id"
        :class="[
          'rounded-xl p-3 text-sm',
          comp.type === 'info' && 'bg-[#EFF8FE] text-[#0E6EA0]',
          comp.type === 'instrukce' && 'bg-white border border-border-subtle text-brand-dark',
          comp.type === 'varovani' && 'bg-[#FFFBEB] text-brand-amber',
          comp.type === 'nebezpeci' && 'bg-[#FEF2F2] text-brand-red',
          comp.type === 'uspech' && 'bg-[#F0FCF5] text-[#159344]',
        ]"
      >
        <div class="flex items-start gap-2.5">
          <span
            :class="[
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
              comp.requiresCompletion ? 'bg-[#22C55E] text-white' : 'bg-white/60',
            ]"
          >
            <Check v-if="comp.requiresCompletion" :size="14" />
            <component v-else :is="resolveIcon(comp.icon || COMPONENT_TYPE_ICONS[comp.type])" :size="14" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="font-medium leading-tight">{{ comp.name }}</p>
            <p v-if="comp.shortDescription" class="text-xs opacity-70 mt-0.5 line-clamp-2">{{ comp.shortDescription }}</p>
            <ul v-if="comp.dangerItems?.length" class="mt-2 flex flex-wrap gap-1">
              <li
                v-for="di in comp.dangerItems"
                :key="di.id"
                class="text-xs bg-white/60 text-brand-red rounded-full px-2 py-0.5 font-medium"
              >❌ {{ di.text }}</li>
            </ul>
            <button
              v-if="comp.requiresPhoto"
              class="mt-2 inline-flex items-center gap-2 bg-brand-orange text-white rounded-full text-xs font-medium px-3 py-1.5"
            >
              <Camera :size="12" /> Nahrát fotku
            </button>
          </div>
          <span v-if="comp.timeOfDay" class="text-[10px] uppercase opacity-70 shrink-0">{{ comp.timeOfDay }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom nav -->
    <div class="bg-brand-dark flex items-center justify-around py-3 text-white/70">
      <span class="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center">
        <component :is="resolveIcon('home')" :size="16" />
      </span>
      <component :is="resolveIcon('list-checks')" :size="18" />
      <component :is="resolveIcon('play-circle')" :size="18" />
      <component :is="resolveIcon('message-circle')" :size="18" />
      <component :is="resolveIcon('user')" :size="18" />
    </div>
  </div>
</template>
