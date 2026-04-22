<script setup lang="ts">
import { useRouter } from 'vue-router';
import { usePlansStore } from '@/stores/plansStore';
import { useUiStore } from '@/stores/uiStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppButton from '@/components/shared/AppButton.vue';
import AppCard from '@/components/shared/AppCard.vue';
import Pill from '@/components/shared/Pill.vue';
import { Copy, Pencil, Star, StarOff, Trash2 } from 'lucide-vue-next';

const plans = usePlansStore();
const ui = useUiStore();
const router = useRouter();

function clone(id: string) {
  const created = plans.clone(id);
  if (created) {
    ui.toast({ type: 'success', text: `Šablona naklonována: ${created.name}` });
    router.push(`/plans/${created.id}`);
  }
}

async function setDefault(id: string) {
  plans.setDefault(id);
  ui.toast({ type: 'success', text: 'Výchozí šablona nastavena.' });
}

async function remove(id: string) {
  const ok = await ui.confirm({
    title: 'Smazat šablonu?',
    text: 'Tuto akci nelze vrátit zpět. Pacienti, kteří ji mají přiřazenu, zůstanou beze změny.',
    confirmLabel: 'Smazat',
    danger: true,
  });
  if (ok) {
    plans.removeTemplate(id);
    ui.toast({ type: 'success', text: 'Šablona smazána.' });
  }
}

function create() {
  const t = plans.createTemplate({ name: 'Nová šablona', surgeryType: 'any' });
  router.push(`/plans/${t.id}`);
}
</script>

<template>
  <div>
    <PageHeader title="Plány péče" subtitle="Šablony obsahu pro pacienty — fáze, karty dnů a komponenty.">
      <template #actions>
        <AppButton variant="primary" icon="plus" @click="create">Nová šablona</AppButton>
      </template>
    </PageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard v-for="plan in plans.list" :key="plan.id">
        <div class="flex items-start justify-between gap-3 mb-3">
          <div class="min-w-0">
            <h3 class="font-semibold text-brand-dark flex items-center gap-2">
              {{ plan.name }}
              <Pill v-if="plan.isDefault" tone="orange" size="sm">Výchozí</Pill>
            </h3>
            <p class="text-sm text-slate-500 mt-0.5">{{ plan.description ?? '—' }}</p>
          </div>
          <Pill :tone="plan.surgeryType === 'DHI' ? 'sky' : plan.surgeryType === 'FUE' ? 'purple' : 'green'">
            {{ plan.surgeryType === 'any' ? 'Univerzální' : plan.surgeryType }}
          </Pill>
        </div>

        <dl class="grid grid-cols-3 gap-2 text-sm mb-4">
          <div class="bg-slate-50 rounded-xl p-3">
            <dt class="text-xs text-slate-500">Fází</dt>
            <dd class="font-semibold text-brand-dark text-lg">{{ plan.phases.length }}</dd>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <dt class="text-xs text-slate-500">Komponent</dt>
            <dd class="font-semibold text-brand-dark text-lg">{{ plans.componentCount(plan.id) }}</dd>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <dt class="text-xs text-slate-500">Notifikací</dt>
            <dd class="font-semibold text-brand-dark text-lg">{{ plans.notificationCount(plan.id) }}</dd>
          </div>
        </dl>

        <div class="flex items-center gap-2 flex-wrap">
          <AppButton variant="primary" icon="pencil" size="sm" @click="router.push(`/plans/${plan.id}`)">Upravit</AppButton>
          <AppButton variant="secondary" icon="copy" size="sm" @click="clone(plan.id)">Klonovat</AppButton>
          <AppButton
            v-if="!plan.isDefault"
            variant="secondary"
            icon="star"
            size="sm"
            @click="setDefault(plan.id)"
          >Nastavit výchozí</AppButton>
          <AppButton
            v-if="!plan.isDefault"
            variant="ghost"
            size="sm"
            icon="trash-2"
            @click="remove(plan.id)"
          >Smazat</AppButton>
        </div>
      </AppCard>
    </div>
  </div>
</template>
