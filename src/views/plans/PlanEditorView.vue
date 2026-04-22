<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlansStore } from '@/stores/plansStore';
import { useUiStore } from '@/stores/uiStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import AppInput from '@/components/shared/AppInput.vue';
import AppTextarea from '@/components/shared/AppTextarea.vue';
import AppSelect from '@/components/shared/AppSelect.vue';
import Pill from '@/components/shared/Pill.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import IconPicker from '@/components/shared/IconPicker.vue';
import Modal from '@/components/shared/Modal.vue';
import RadioGroup from '@/components/shared/RadioGroup.vue';
import ComponentEditor from '@/components/plans/ComponentEditor.vue';
import { resolveIcon, COMPONENT_TYPE_ICONS } from '@/composables/useIcon';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, Trash2, Pencil, Plus, Copy } from 'lucide-vue-next';
import type { ComponentItem, ComponentType, PhaseReference, HeroColor, DayCard } from '@/types';
import { COMPONENT_TYPE_LABELS, PHASE_REFERENCE_LABELS } from '@/types';

const route = useRoute();
const router = useRouter();
const plans = usePlansStore();
const ui = useUiStore();

const templateId = computed(() => route.params.id as string);
const template = computed(() => plans.byId(templateId.value));

const openPhases = ref<Record<string, boolean>>({});

function togglePhase(id: string) {
  openPhases.value = { ...openPhases.value, [id]: !openPhases.value[id] };
}
function isOpen(id: string): boolean {
  return !!openPhases.value[id];
}

// Auto-expand first phase when the template loads
watch(
  () => template.value?.phases?.[0]?.id,
  (firstId) => {
    if (firstId && openPhases.value[firstId] == null) {
      openPhases.value = { ...openPhases.value, [firstId]: true };
    }
  },
  { immediate: true },
);

// Modals
const phaseModal = ref<{ open: boolean; name: string; relativeTo: PhaseReference; heroColor: HeroColor; icon: string; quote: string; description: string }>({
  open: false,
  name: '',
  relativeTo: 'zakrok',
  heroColor: 'dark',
  icon: 'flag',
  quote: '',
  description: '',
});
function addPhase() {
  phaseModal.value = { open: true, name: '', relativeTo: 'zakrok', heroColor: 'dark', icon: 'flag', quote: '', description: '' };
}
function savePhase() {
  if (!template.value) return;
  if (!phaseModal.value.name.trim()) return;
  plans.addPhase(template.value.id, {
    name: phaseModal.value.name,
    relativeTo: phaseModal.value.relativeTo,
    heroColor: phaseModal.value.heroColor,
    icon: phaseModal.value.icon,
    quote: phaseModal.value.quote || undefined,
    description: phaseModal.value.description || undefined,
  });
  phaseModal.value.open = false;
  ui.toast({ type: 'success', text: 'Fáze přidána.' });
}

const cardModal = ref<{ open: boolean; phaseId: string; mode: 'single' | 'range'; dayFrom: number; dayTo: number; name: string }>({
  open: false,
  phaseId: '',
  mode: 'single',
  dayFrom: 0,
  dayTo: 0,
  name: '',
});
function addCard(phaseId: string) {
  cardModal.value = { open: true, phaseId, mode: 'single', dayFrom: 0, dayTo: 0, name: '' };
}
function saveCard() {
  if (!template.value) return;
  const df = Number(cardModal.value.dayFrom);
  const dt = cardModal.value.mode === 'single' ? df : Number(cardModal.value.dayTo);
  plans.addDayCard(template.value.id, cardModal.value.phaseId, {
    dayFrom: df,
    dayTo: dt,
    name: cardModal.value.name || undefined,
  });
  cardModal.value.open = false;
  ui.toast({ type: 'success', text: 'Karta dne přidána.' });
}

// Component editor modal
const compModal = ref<{ open: boolean; phaseId: string; cardId: string; componentId: string | null; draft: ComponentItem }>({
  open: false,
  phaseId: '',
  cardId: '',
  componentId: null,
  draft: blankComponent('instrukce', ''),
});
function blankComponent(type: ComponentType, cardId: string): ComponentItem {
  return {
    id: crypto.randomUUID(),
    dayCardId: cardId,
    type,
    name: '',
    hasDetail: false,
    icon: COMPONENT_TYPE_ICONS[type] ?? 'check',
    requiresCompletion: type === 'instrukce',
    requiresPhoto: false,
    pointsForCompletion: 0,
    order: 0,
  };
}
function addComponent(phaseId: string, cardId: string) {
  compModal.value = {
    open: true,
    phaseId,
    cardId,
    componentId: null,
    draft: blankComponent('instrukce', cardId),
  };
}
function editComponent(phaseId: string, cardId: string, comp: ComponentItem) {
  compModal.value = {
    open: true,
    phaseId,
    cardId,
    componentId: comp.id,
    draft: JSON.parse(JSON.stringify(comp)),
  };
}
function saveComponent() {
  if (!template.value) return;
  if (!compModal.value.draft.name.trim()) return;
  if (compModal.value.componentId) {
    plans.updateComponent(
      template.value.id,
      compModal.value.phaseId,
      compModal.value.cardId,
      compModal.value.componentId,
      compModal.value.draft,
    );
  } else {
    plans.addComponent(template.value.id, compModal.value.phaseId, compModal.value.cardId, {
      ...compModal.value.draft,
    });
  }
  compModal.value.open = false;
  ui.toast({ type: 'success', text: 'Komponenta uložena.' });
}

async function removePhase(id: string) {
  const ok = await ui.confirm({ title: 'Smazat fázi?', text: 'Smažou se všechny karty a komponenty této fáze.', confirmLabel: 'Smazat', danger: true });
  if (ok && template.value) {
    plans.removePhase(template.value.id, id);
    ui.toast({ type: 'success', text: 'Fáze smazána.' });
  }
}

async function removeCard(phaseId: string, cardId: string) {
  const ok = await ui.confirm({ title: 'Smazat kartu?', text: 'Smažou se všechny komponenty v této kartě.', confirmLabel: 'Smazat', danger: true });
  if (ok && template.value) {
    plans.removeDayCard(template.value.id, phaseId, cardId);
    ui.toast({ type: 'success', text: 'Karta smazána.' });
  }
}

async function removeComp(phaseId: string, cardId: string, compId: string) {
  const ok = await ui.confirm({ title: 'Smazat komponentu?', text: 'Tuto akci nelze vrátit zpět.', confirmLabel: 'Smazat', danger: true });
  if (ok && template.value) {
    plans.removeComponent(template.value.id, phaseId, cardId, compId);
    ui.toast({ type: 'success', text: 'Komponenta smazána.' });
  }
}

function saveTemplate(patch: Partial<{ name: string; description: string }>) {
  if (!template.value) return;
  plans.updateTemplate(template.value.id, patch);
}

function cardLabel(card: DayCard): string {
  if (card.name) return card.name;
  return card.dayFrom === card.dayTo ? `Den ${card.dayFrom}` : `Dny ${card.dayFrom}–${card.dayTo}`;
}

function componentCardClass(type: ComponentType): string {
  if (type === 'info') return 'bg-[#EFF8FE] border-[#B3E0F5]';
  if (type === 'varovani') return 'bg-[#FFFBEB] border-amber-200';
  if (type === 'nebezpeci') return 'bg-[#FEF2F2] border-red-200';
  if (type === 'uspech') return 'bg-[#F0FCF5] border-[#D9F4E3]';
  return 'bg-white border-border-subtle';
}
</script>

<template>
  <div v-if="template">
    <div class="flex items-center gap-3 mb-4">
      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="router.push('/plans')">
        <ArrowLeft :size="18" />
      </button>
      <span class="text-sm text-slate-500">Plány / {{ template.name }}</span>
    </div>

    <PageHeader :title="template.name" :subtitle="`${plans.componentCount(template.id)} komponent · ${plans.notificationCount(template.id)} notifikací`">
      <template #actions>
        <AppButton variant="secondary" icon="copy" @click="plans.clone(template.id)">Klonovat</AppButton>
        <AppButton variant="primary" icon="plus" @click="addPhase">Přidat fázi</AppButton>
      </template>
    </PageHeader>

    <AppCard class="mb-4">
      <div class="grid grid-cols-2 gap-4">
        <AppInput :model-value="template.name" label="Název šablony" @update:model-value="(v) => saveTemplate({ name: v })" />
        <AppSelect
          :model-value="template.surgeryType"
          label="Typ zákroku"
          :options="[
            { value: 'any', label: 'Univerzální' },
            { value: 'DHI', label: 'DHI' },
            { value: 'FUE', label: 'FUE' },
            { value: 'Combo', label: 'Combo' },
          ]"
          @update:model-value="(v) => plans.updateTemplate(template!.id, { surgeryType: v as any })"
        />
      </div>
      <AppTextarea :model-value="template!.description" label="Popis" :rows="2" class="mt-3" @update:model-value="(v) => saveTemplate({ description: v })" />
    </AppCard>

    <!-- Phases -->
    <div class="space-y-3">
      <AppCard v-for="phase in template!.phases" :key="phase.id" padding="sm">
        <div class="flex items-center gap-3 p-3">
          <button class="p-1 rounded hover:bg-slate-100 text-slate-500" @click="togglePhase(phase.id)">
            <ChevronDown v-if="isOpen(phase.id)" :size="18" />
            <ChevronRight v-else :size="18" />
          </button>
          <component :is="resolveIcon(phase.icon)" :size="20" class="text-brand-dark" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-brand-dark">{{ phase.name }}</p>
            <p class="text-xs text-slate-500">
              Relativní k: <strong>{{ PHASE_REFERENCE_LABELS[phase.relativeTo] }}</strong> ·
              {{ phase.dayCards.length }} karet · {{ phase.dayCards.reduce((s, c) => s + c.components.length, 0) }} komponent
            </p>
          </div>
          <PhaseBadge :reference="phase.relativeTo" />
          <AppButton variant="ghost" size="sm" icon="chevron-up" @click="plans.movePhase(template!.id, phase.id, -1)" />
          <AppButton variant="ghost" size="sm" icon="chevron-down" @click="plans.movePhase(template!.id, phase.id, 1)" />
          <AppButton variant="ghost" size="sm" icon="trash-2" @click="removePhase(phase.id)" />
        </div>

        <!-- Body -->
        <div v-if="isOpen(phase.id)" class="px-3 pb-3 space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <AppInput :model-value="phase.name" label="Název fáze" @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { name: v })" />
            <RadioGroup
              :model-value="phase.relativeTo"
              label="Relativní k"
              inline
              :options="[
                { value: 'odlet', label: 'Odlet' },
                { value: 'zakrok', label: 'Zákrok' },
                { value: 'navrat', label: 'Návrat' },
              ]"
              @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { relativeTo: v as any })"
            />
            <IconPicker :model-value="phase.icon" label="Ikona" @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { icon: v })" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <AppInput :model-value="phase.quote" label="Citát dne (v hero)" @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { quote: v || undefined })" />
            <AppSelect
              :model-value="phase.heroColor"
              label="Barva hero"
              :options="[
                { value: 'dark', label: 'Dark' },
                { value: 'teal', label: 'Teal' },
                { value: 'green', label: 'Green' },
                { value: 'purple', label: 'Purple' },
              ]"
              @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { heroColor: v as any })"
            />
          </div>

          <!-- DayCards -->
          <div class="space-y-2 pt-2">
            <div v-for="card in phase.dayCards" :key="card.id" class="border border-border-subtle rounded-2xl overflow-hidden">
              <div class="flex items-center gap-3 px-4 py-2.5 bg-slate-50">
                <p class="font-semibold text-brand-dark">{{ cardLabel(card) }}</p>
                <Pill size="sm">{{ card.components.length }} komponent</Pill>
                <span class="flex-1" />
                <AppButton variant="ghost" size="sm" icon="chevron-up" @click="plans.moveDayCard(template!.id, phase.id, card.id, -1)" />
                <AppButton variant="ghost" size="sm" icon="chevron-down" @click="plans.moveDayCard(template!.id, phase.id, card.id, 1)" />
                <AppButton variant="ghost" size="sm" icon="trash-2" @click="removeCard(phase.id, card.id)" />
              </div>
              <ul class="divide-y divide-border-subtle">
                <li
                  v-for="comp in card.components"
                  :key="comp.id"
                  :class="['flex items-start gap-3 px-4 py-2.5 border-l-4', componentCardClass(comp.type)]"
                >
                  <span class="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                    <component :is="resolveIcon(comp.icon || COMPONENT_TYPE_ICONS[comp.type])" :size="16" />
                  </span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-brand-dark flex items-center gap-1.5">
                      {{ comp.name }}
                      <Pill size="sm" :tone="comp.type === 'info' ? 'sky' : comp.type === 'varovani' ? 'amber' : comp.type === 'nebezpeci' ? 'red' : comp.type === 'uspech' ? 'green' : 'default'">
                        {{ COMPONENT_TYPE_LABELS[comp.type] }}
                      </Pill>
                      <Pill v-if="comp.requiresCompletion" tone="green" size="sm">✓ splnění</Pill>
                      <Pill v-if="comp.requiresPhoto" tone="purple" size="sm">📸 foto</Pill>
                      <Pill v-if="comp.notification?.enabled" tone="orange" size="sm">🔔 {{ comp.notification.time }}</Pill>
                    </p>
                    <p v-if="comp.shortDescription" class="text-xs text-slate-600 truncate">{{ comp.shortDescription }}</p>
                  </div>
                  <AppButton variant="ghost" size="sm" icon="chevron-up" @click="plans.moveComponent(template.id, phase.id, card.id, comp.id, -1)" />
                  <AppButton variant="ghost" size="sm" icon="chevron-down" @click="plans.moveComponent(template.id, phase.id, card.id, comp.id, 1)" />
                  <AppButton variant="ghost" size="sm" icon="pencil" @click="editComponent(phase.id, card.id, comp)" />
                  <AppButton variant="ghost" size="sm" icon="trash-2" @click="removeComp(phase.id, card.id, comp.id)" />
                </li>
              </ul>
              <div class="p-2 border-t border-border-subtle">
                <AppButton variant="ghost" size="sm" icon="plus" block @click="addComponent(phase.id, card.id)">Přidat komponentu</AppButton>
              </div>
            </div>
            <AppButton variant="secondary" icon="plus" block @click="addCard(phase.id)">Přidat kartu dne</AppButton>
          </div>
        </div>
      </AppCard>
    </div>

    <!-- Add Phase Modal -->
    <Modal v-model="phaseModal.open" title="Nová fáze" size="lg">
      <div class="space-y-3">
        <AppInput v-model="phaseModal.name" label="Název fáze" required placeholder="Např. Před odletem" />
        <RadioGroup
          v-model="phaseModal.relativeTo"
          label="Relativní k (referenční bod)"
          inline
          :options="[
            { value: 'odlet', label: 'Odlet' },
            { value: 'zakrok', label: 'Zákrok' },
            { value: 'navrat', label: 'Návrat' },
          ]"
        />
        <div class="grid grid-cols-2 gap-3">
          <AppSelect
            v-model="phaseModal.heroColor"
            label="Barva hero"
            :options="[
              { value: 'dark', label: 'Dark' },
              { value: 'teal', label: 'Teal' },
              { value: 'green', label: 'Green' },
              { value: 'purple', label: 'Purple' },
            ]"
          />
          <IconPicker v-model="phaseModal.icon" label="Ikona" />
        </div>
        <AppInput v-model="phaseModal.quote" label="Citát dne (v hero)" />
        <AppTextarea v-model="phaseModal.description" label="Popis fáze" :rows="2" />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="phaseModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="savePhase">Vytvořit fázi</AppButton>
      </template>
    </Modal>

    <!-- Add Card Modal -->
    <Modal v-model="cardModal.open" title="Nová karta dne">
      <div class="space-y-3">
        <RadioGroup
          v-model="cardModal.mode"
          label="Typ dne"
          inline
          :options="[
            { value: 'single', label: 'Jeden den' },
            { value: 'range', label: 'Rozsah dní' },
          ]"
        />
        <div class="grid gap-3" :class="cardModal.mode === 'range' ? 'grid-cols-2' : 'grid-cols-1'">
          <AppInput v-model.number="cardModal.dayFrom" type="number" label="Den od" hint="Může být záporný (před referencí)" />
          <AppInput v-if="cardModal.mode === 'range'" v-model.number="cardModal.dayTo" type="number" label="Den do" />
        </div>
        <AppInput v-model="cardModal.name" label="Název karty (volitelný)" hint='Nechat prázdné → "Den 5" nebo "Dny 5–15"' />
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="cardModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="saveCard">Vytvořit kartu</AppButton>
      </template>
    </Modal>

    <!-- Component Modal -->
    <Modal v-model="compModal.open" :title="compModal.componentId ? 'Upravit komponentu' : 'Nová komponenta'" size="xl">
      <ComponentEditor v-model="compModal.draft" />
      <template #footer>
        <AppButton variant="secondary" @click="compModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="saveComponent">Uložit</AppButton>
      </template>
    </Modal>
  </div>
  <div v-else class="text-center py-12 text-sm text-slate-500">Plán nenalezen.</div>
</template>
