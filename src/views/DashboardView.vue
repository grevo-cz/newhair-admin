<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patientsStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { usePhotosStore } from '@/stores/photosStore';
import { usePlansStore } from '@/stores/plansStore';
import { patientDays } from '@/composables/useDayMath';
import StatCard from '@/components/dashboard/StatCard.vue';
import AppCard from '@/components/shared/AppCard.vue';
import Pill from '@/components/shared/Pill.vue';
import DayBadge from '@/components/shared/DayBadge.vue';
import Avatar from '@/components/shared/Avatar.vue';
import AppButton from '@/components/shared/AppButton.vue';

const router = useRouter();

const patients = usePatientsStore();
const messages = useMessagesStore();
const photos = usePhotosStore();
const plans = usePlansStore();

const today = new Date();

const criticalPatients = computed(() =>
  patients.active.filter((p) => {
    const d = patientDays(p, today);
    return d.fromSurgery >= 0 && d.fromSurgery <= 7;
  }),
);

const upcomingSurgeries = computed(() =>
  patients.active.filter((p) => {
    const d = patientDays(p, today);
    return d.fromSurgery < 0 && d.fromSurgery >= -14;
  }),
);

const todaysNotifications = computed(() => {
  let n = 0;
  for (const p of patients.active) {
    const template = plans.byId(p.planTemplateId);
    if (!template) continue;
    const d = patientDays(p, today);
    for (const phase of template.phases) {
      const rel = phase.relativeTo === 'odlet' ? d.fromDeparture : phase.relativeTo === 'zakrok' ? d.fromSurgery : d.fromReturn;
      for (const card of phase.dayCards) {
        if (rel < card.dayFrom || rel > card.dayTo) continue;
        for (const c of card.components) {
          if (c.notification?.enabled) n++;
        }
      }
    }
  }
  return n;
});

const recentPatients = computed(() => [...patients.active].slice(0, 4));
const photosToday = computed(() => photos.recentCount(24));
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-brand-dark tracking-tight">Přehled</h1>
        <p class="text-sm text-slate-500 mt-1">Denní stav kliniky NewHair.</p>
      </div>
      <AppButton variant="primary" icon="user-plus" @click="router.push('/patients/new')">
        Přidat pacienta
      </AppButton>
    </header>

    <!-- Widgety -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <StatCard
        title="Kritická fáze (D0–D7)"
        :value="criticalPatients.length"
        :subtitle="`${criticalPatients.length} pacientů potřebuje pozornost`"
        icon="alert-triangle"
        tone="red"
        to="/patients?critical=1"
      />
      <StatCard
        title="Nepřečtené zprávy"
        :value="messages.unreadCount"
        subtitle="WhatsApp + in-app"
        icon="message-circle"
        tone="orange"
        to="/messages"
      />
      <StatCard
        title="Notifikace dnes"
        :value="todaysNotifications"
        subtitle="Naplánovaných odeslání"
        icon="bell"
        tone="sky"
      />
      <StatCard
        title="Nové fotky (24h)"
        :value="photosToday"
        :subtitle="`${photos.withConsent().length} se souhlasem`"
        icon="camera"
        tone="purple"
      />
      <StatCard
        title="Noví pacienti (týden)"
        :value="patients.active.length"
        subtitle="Za posledních 7 dní"
        icon="user-plus"
        tone="green"
        to="/patients"
      />
      <StatCard
        title="Nadcházející operace"
        :value="upcomingSurgeries.length"
        subtitle="Do 14 dní"
        icon="calendar-check"
        tone="amber"
      />
    </div>

    <!-- Recent patients + Critical list -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-brand-dark">Kritická fáze</h2>
          <Pill tone="red">{{ criticalPatients.length }}</Pill>
        </div>
        <ul v-if="criticalPatients.length" class="space-y-2">
          <li v-for="p in criticalPatients" :key="p.id">
            <RouterLink
              :to="`/patients/${p.id}`"
              class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50"
            >
              <Avatar :name="`${p.firstName} ${p.lastName}`" tone="orange" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-brand-dark truncate">{{ p.firstName }} {{ p.lastName }}</p>
                <p class="text-xs text-slate-500 truncate">{{ p.surgeryType }} · {{ p.graftCount }} štěpů</p>
              </div>
              <DayBadge :day="patientDays(p, today).fromSurgery" />
            </RouterLink>
          </li>
        </ul>
        <p v-else class="text-sm text-slate-500">Žádný pacient aktuálně není v kritické fázi.</p>
      </AppCard>

      <AppCard>
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-brand-dark">Posledně přidaní pacienti</h2>
          <RouterLink to="/patients" class="text-sm text-brand-orange hover:underline">Zobrazit vše</RouterLink>
        </div>
        <ul class="space-y-2">
          <li v-for="p in recentPatients" :key="p.id">
            <RouterLink
              :to="`/patients/${p.id}`"
              class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50"
            >
              <Avatar :name="`${p.firstName} ${p.lastName}`" tone="sky" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-brand-dark truncate">{{ p.firstName }} {{ p.lastName }}</p>
                <p class="text-xs text-slate-500 truncate">{{ p.email }}</p>
              </div>
              <DayBadge :day="patientDays(p, today).fromSurgery" />
            </RouterLink>
          </li>
        </ul>
      </AppCard>
    </div>
  </div>
</template>
