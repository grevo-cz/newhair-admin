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
import Tabs from '@/components/shared/Tabs.vue';
import EmptyState from '@/components/shared/EmptyState.vue';
import ComponentEditor from '@/components/plans/ComponentEditor.vue';
import { resolveIcon, COMPONENT_TYPE_ICONS } from '@/composables/useIcon';
import { ArrowLeft, ChevronDown, ChevronRight, Link2, Plus } from 'lucide-vue-next';
import type {
  ComponentItem, ComponentType, PhaseReference, HeroColor, DayCard, LibraryComponent,
} from '@/types';
import { COMPONENT_TYPE_LABELS, PHASE_REFERENCE_LABELS } from '@/types';

const route = useRoute();
const router = useRouter();
const plans = usePlansStore();
const ui = useUiStore();

const templateId = computed(() => route.params.id as string);
const template = computed(() => plans.byId(templateId.value));

const tab = ref<'phases' | 'library'>('phases');

const openPhases = ref<Record<string, boolean>>({});
function togglePhase(id: string) {
  openPhases.value = { ...openPhases.value, [id]: !openPhases.value[id] };
}
function isOpen(id: string): boolean {
  return !!openPhases.value[id];
}
watch(
  () => template.value?.phases?.[0]?.id,
  (firstId) => {
    if (firstId && openPhases.value[firstId] == null) {
      openPhases.value = { ...openPhases.value, [firstId]: true };
    }
  },
  { immediate: true },
);

// ── Phase modal ──
const phaseModal = ref<{ open: boolean; name: string; relativeTo: PhaseReference; heroColor: HeroColor; icon: string; quote: string; description: string }>({
  open: false, name: '', relativeTo: 'zakrok', heroColor: 'dark', icon: 'flag', quote: '', description: '',
});
function addPhase() {
  phaseModal.value = { open: true, name: '', relativeTo: 'zakrok', heroColor: 'dark', icon: 'flag', quote: '', description: '' };
}
function savePhase() {
  if (!template.value || !phaseModal.value.name.trim()) return;
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

// ── Card modal ──
const cardModal = ref<{ open: boolean; phaseId: string; mode: 'single' | 'range'; dayFrom: number; dayTo: number; name: string }>({
  open: false, phaseId: '', mode: 'single', dayFrom: 0, dayTo: 0, name: '',
});
function addCard(phaseId: string) {
  cardModal.value = { open: true, phaseId, mode: 'single', dayFrom: 0, dayTo: 0, name: '' };
}
function saveCard() {
  if (!template.value) return;
  const df = Number(cardModal.value.dayFrom);
  const dt = cardModal.value.mode === 'single' ? df : Number(cardModal.value.dayTo);
  plans.addDayCard(template.value.id, cardModal.value.phaseId, {
    dayFrom: df, dayTo: dt, name: cardModal.value.name || undefined,
  });
  cardModal.value.open = false;
  ui.toast({ type: 'success', text: 'Karta dne přidána.' });
}

// ── Add-component picker ──
const addMenu = ref<{ open: boolean; phaseId: string; cardId: string }>({
  open: false, phaseId: '', cardId: '',
});
function openAddMenu(phaseId: string, cardId: string) {
  addMenu.value = { open: true, phaseId, cardId };
}
function pickFromLibrary(lib: LibraryComponent) {
  if (!template.value) return;
  plans.instantiateFromLibrary(template.value.id, addMenu.value.phaseId, addMenu.value.cardId, lib.id);
  addMenu.value.open = false;
  ui.toast({ type: 'success', text: `Přidáno z knihovny: ${lib.name}` });
}
function newLocalComponent() {
  const { phaseId, cardId } = addMenu.value;
  addMenu.value.open = false;
  compModal.value = {
    open: true, phaseId, cardId, componentId: null,
    draft: blankComponent('instrukce', cardId),
  };
}

// ── Component editor modal ──
const compModal = ref<{ open: boolean; phaseId: string; cardId: string; componentId: string | null; draft: ComponentItem }>({
  open: false, phaseId: '', cardId: '', componentId: null,
  draft: blankComponent('instrukce', ''),
});
function blankComponent(type: ComponentType, cardId: string): ComponentItem {
  return {
    id: crypto.randomUUID(), dayCardId: cardId, libraryId: null, type,
    name: '', hasDetail: false, icon: COMPONENT_TYPE_ICONS[type] ?? 'check',
    requiresCompletion: type === 'instrukce', requiresPhoto: false, pointsForCompletion: 0, order: 0,
  };
}
function editComponent(phaseId: string, cardId: string, comp: ComponentItem) {
  compModal.value = {
    open: true, phaseId, cardId, componentId: comp.id,
    draft: JSON.parse(JSON.stringify(comp)),
  };
}
const compLinkedLibrary = computed<LibraryComponent | null>(() => {
  if (!template.value || !compModal.value.draft.libraryId) return null;
  return plans.libraryById(template.value.id, compModal.value.draft.libraryId) ?? null;
});
function saveComponent() {
  if (!template.value || !compModal.value.draft.name.trim()) return;
  const { phaseId, cardId, componentId, draft } = compModal.value;
  if (componentId) {
    plans.updateComponent(template.value.id, phaseId, cardId, componentId, draft);
  } else {
    plans.addComponent(template.value.id, phaseId, cardId, { ...draft });
  }
  compModal.value.open = false;
  ui.toast({ type: 'success', text: 'Komponenta uložena.' });
}
function onDetach() {
  if (!template.value || !compModal.value.componentId) return;
  plans.detachFromLibrary(template.value.id, compModal.value.phaseId, compModal.value.cardId, compModal.value.componentId);
  compModal.value.draft.libraryId = null;
  ui.toast({ type: 'info', text: 'Instance odpojena od knihovny.' });
}
function onSaveCurrentToLibrary() {
  if (!template.value || !compModal.value.componentId) return;
  const lib = plans.saveComponentToLibrary(template.value.id, compModal.value.phaseId, compModal.value.cardId, compModal.value.componentId);
  if (lib) {
    compModal.value.draft.libraryId = lib.id;
    ui.toast({ type: 'success', text: `Uloženo do knihovny: ${lib.name}` });
  }
}

// ── Library manager ──
const libModal = ref<{ open: boolean; libraryId: string | null; draft: ComponentItem }>({
  open: false, libraryId: null, draft: blankComponent('instrukce', ''),
});
function newLibraryMaster() {
  libModal.value = {
    open: true, libraryId: null,
    draft: blankComponent('instrukce', ''),
  };
}
function editLibraryMaster(lib: LibraryComponent) {
  libModal.value = {
    open: true, libraryId: lib.id,
    draft: {
      ...blankComponent(lib.type, ''),
      ...lib,
      dayCardId: '',
      order: 0,
      libraryId: null,
    },
  };
}
function saveLibraryMaster() {
  if (!template.value || !libModal.value.draft.name.trim()) return;
  const payload: Partial<LibraryComponent> & { name: string; type: ComponentType } = {
    type: libModal.value.draft.type,
    name: libModal.value.draft.name,
    shortDescription: libModal.value.draft.shortDescription,
    hasDetail: libModal.value.draft.hasDetail,
    detailRichtext: libModal.value.draft.detailRichtext,
    icon: libModal.value.draft.icon,
    requiresCompletion: libModal.value.draft.requiresCompletion,
    requiresPhoto: libModal.value.draft.requiresPhoto,
    timeOfDay: libModal.value.draft.timeOfDay,
    pointsForCompletion: libModal.value.draft.pointsForCompletion,
    notification: libModal.value.draft.notification,
    dangerItems: libModal.value.draft.dangerItems,
    videoId: libModal.value.draft.videoId,
    externalLink: libModal.value.draft.externalLink,
  };
  if (libModal.value.libraryId) {
    plans.updateLibraryComponent(template.value.id, libModal.value.libraryId, payload);
    plans.propagateLibraryUpdate(template.value.id, libModal.value.libraryId);
    ui.toast({ type: 'success', text: 'Master uložen — změny se propsaly do všech instancí.' });
  } else {
    plans.createLibraryComponent(template.value.id, payload);
    ui.toast({ type: 'success', text: 'Master uložen do knihovny.' });
  }
  libModal.value.open = false;
}
async function removeLibraryMaster(lib: LibraryComponent) {
  if (!template.value) return;
  const usages = plans.libraryUsageCount(template.value.id, lib.id);
  const ok = await ui.confirm({
    title: 'Smazat master z knihovny?',
    text: usages > 0
      ? `${usages} instancí se odpojí a ponechá si aktuální hodnoty jako lokální komponenty.`
      : 'Master se smaže (žádná instance na něj neodkazuje).',
    confirmLabel: 'Smazat',
    danger: true,
  });
  if (ok) {
    plans.removeLibraryComponent(template.value.id, lib.id);
    ui.toast({ type: 'success', text: 'Master smazán.' });
  }
}

// ── Destruction confirmations for phases / cards / comps ──
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
  const ok = await ui.confirm({ title: 'Smazat komponentu?', text: 'Tuto akci nelze vrátit zpět. Master v knihovně zůstává.', confirmLabel: 'Smazat', danger: true });
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
  if (type === 'info') return 'bg-[#EFF8FE] border-l-[#65BCEA]';
  if (type === 'varovani') return 'bg-[#FFFBEB] border-l-brand-amber';
  if (type === 'nebezpeci') return 'bg-[#FEF2F2] border-l-brand-red';
  if (type === 'uspech') return 'bg-[#F0FCF5] border-l-[#22C55E]';
  return 'bg-white border-l-slate-300';
}
</script>

<template>
  <div v-if="template">
    <div class="flex items-center gap-3 mb-3">
      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="router.push('/plans')">
        <ArrowLeft :size="18" />
      </button>
      <span class="text-sm text-slate-500">Plány / {{ template.name }}</span>
    </div>

    <PageHeader
      :title="template.name"
      :subtitle="`${plans.componentCount(template.id)} komponent · ${plans.notificationCount(template.id)} notifikací · ${template.library.length} v knihovně`"
    >
      <template #actions>
        <AppButton variant="secondary" icon="copy" @click="plans.clone(template.id)">Klonovat</AppButton>
        <AppButton v-if="tab === 'phases'" variant="primary" icon="plus" @click="addPhase">Přidat fázi</AppButton>
        <AppButton v-else variant="primary" icon="plus" @click="newLibraryMaster">Nový master</AppButton>
      </template>
    </PageHeader>

    <AppCard class="mb-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <AppTextarea
        :model-value="template.description"
        label="Popis"
        :rows="2"
        class="mt-3"
        @update:model-value="(v) => saveTemplate({ description: v })"
      />
    </AppCard>

    <Tabs
      v-model="tab"
      :tabs="[
        { value: 'phases', label: 'Fáze & karty', badge: template.phases.length || undefined },
        { value: 'library', label: 'Knihovna komponent', badge: template.library.length || undefined },
      ]"
      class="mb-4"
    />

    <!-- ── Phases tab ── -->
    <div v-if="tab === 'phases'" class="space-y-3">
      <AppCard v-for="phase in template.phases" :key="phase.id" padding="none">
        <header class="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-t-2xl">
          <button class="p-1 rounded hover:bg-white text-slate-500" @click="togglePhase(phase.id)">
            <ChevronDown v-if="isOpen(phase.id)" :size="18" />
            <ChevronRight v-else :size="18" />
          </button>
          <component :is="resolveIcon(phase.icon)" :size="20" class="text-brand-dark shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-brand-dark truncate">{{ phase.name }}</p>
            <p class="text-xs text-slate-500">
              {{ phase.dayCards.length }} karet · {{ phase.dayCards.reduce((s, c) => s + c.components.length, 0) }} komponent
            </p>
          </div>
          <PhaseBadge :reference="phase.relativeTo" />
          <button class="text-slate-400 hover:text-brand-red p-1.5 rounded hover:bg-white" @click="removePhase(phase.id)">
            <component :is="resolveIcon('trash-2')" :size="16" />
          </button>
        </header>

        <div v-if="isOpen(phase.id)" class="px-4 pb-4 space-y-4 pt-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <AppInput :model-value="phase.name" label="Název" @update:model-value="(v) => plans.updatePhase(template!.id, phase.id, { name: v })" />
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <span v-if="card.dayFrom !== card.dayTo" class="text-xs text-slate-500">opakuje se každý den v rozsahu</span>
                <span class="flex-1" />
                <button class="text-slate-400 hover:text-brand-red p-1.5 rounded hover:bg-white" @click="removeCard(phase.id, card.id)">
                  <component :is="resolveIcon('trash-2')" :size="16" />
                </button>
              </div>
              <ul v-if="card.components.length" class="divide-y divide-border-subtle">
                <li
                  v-for="comp in card.components"
                  :key="comp.id"
                  :class="['flex items-start gap-3 px-4 py-2.5 border-l-4', componentCardClass(comp.type)]"
                >
                  <span class="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
                    <component :is="resolveIcon(comp.icon || COMPONENT_TYPE_ICONS[comp.type])" :size="16" />
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <p class="text-sm font-medium text-brand-dark truncate">{{ comp.name }}</p>
                      <Pill
                        size="sm"
                        :tone="comp.type === 'info' ? 'sky' : comp.type === 'varovani' ? 'amber' : comp.type === 'nebezpeci' ? 'red' : comp.type === 'uspech' ? 'green' : 'default'"
                      >
                        {{ COMPONENT_TYPE_LABELS[comp.type] }}
                      </Pill>
                      <Pill v-if="comp.libraryId" tone="purple" size="sm">
                        <Link2 :size="10" class="inline -mt-px" /> z knihovny
                      </Pill>
                      <Pill v-if="comp.requiresCompletion" tone="green" size="sm">✓ splnění</Pill>
                      <Pill v-if="comp.requiresPhoto" tone="purple" size="sm">📸 foto</Pill>
                      <Pill v-if="comp.notification?.enabled" tone="orange" size="sm">🔔 {{ comp.notification.time }}</Pill>
                    </div>
                    <p v-if="comp.shortDescription" class="text-xs text-slate-600 truncate mt-0.5">{{ comp.shortDescription }}</p>
                  </div>
                  <div class="flex items-center gap-0.5 shrink-0">
                    <button class="p-1.5 rounded hover:bg-white/70 text-slate-500" @click="plans.moveComponent(template!.id, phase.id, card.id, comp.id, -1)" title="Nahoru">
                      <component :is="resolveIcon('chevron-up')" :size="14" />
                    </button>
                    <button class="p-1.5 rounded hover:bg-white/70 text-slate-500" @click="plans.moveComponent(template!.id, phase.id, card.id, comp.id, 1)" title="Dolů">
                      <component :is="resolveIcon('chevron-down')" :size="14" />
                    </button>
                    <button class="p-1.5 rounded hover:bg-white/70 text-slate-500" @click="editComponent(phase.id, card.id, comp)" title="Upravit">
                      <component :is="resolveIcon('pencil')" :size="14" />
                    </button>
                    <button class="p-1.5 rounded hover:bg-white/70 text-brand-red" @click="removeComp(phase.id, card.id, comp.id)" title="Smazat">
                      <component :is="resolveIcon('trash-2')" :size="14" />
                    </button>
                  </div>
                </li>
              </ul>
              <div v-else class="px-4 py-3 text-xs text-slate-400 italic">Zatím žádné komponenty v této kartě.</div>
              <div class="p-2 border-t border-border-subtle bg-white">
                <AppButton variant="ghost" size="sm" icon="plus" block @click="openAddMenu(phase.id, card.id)">Přidat komponentu</AppButton>
              </div>
            </div>
            <AppButton variant="secondary" icon="plus" block @click="addCard(phase.id)">Přidat kartu dne</AppButton>
          </div>
        </div>
      </AppCard>

      <EmptyState
        v-if="template.phases.length === 0"
        icon="flag"
        title="Zatím žádné fáze"
        text="Fáze tvoří strukturu plánu. Začni přidáním první fáze — např. Před odletem."
      >
        <AppButton variant="primary" icon="plus" @click="addPhase">Přidat fázi</AppButton>
      </EmptyState>
    </div>

    <!-- ── Library tab ── -->
    <div v-else class="space-y-4">
      <AppCard>
        <div class="flex items-start gap-3">
          <span class="w-10 h-10 rounded-lg bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center shrink-0">
            <Link2 :size="18" />
          </span>
          <div class="flex-1 text-sm text-slate-700">
            <p class="font-semibold text-brand-dark">Knihovna komponent (jako Figma komponenty)</p>
            <p class="text-xs text-slate-500 mt-1">
              Mastery tady definuješ jednou — pak je v libovolné kartě "vložíš z knihovny". Změna masteru se automaticky propíše do všech instancí.
              Jednotlivou instanci můžeš odpojit, pokud potřebuješ lokální variantu.
            </p>
          </div>
        </div>
      </AppCard>

      <EmptyState
        v-if="template.library.length === 0"
        icon="link"
        title="Knihovna je prázdná"
        text="Ulož první master — nebo z konkrétní komponenty v kartě vyber 'Uložit do knihovny'."
      >
        <AppButton variant="primary" icon="plus" @click="newLibraryMaster">Nový master</AppButton>
      </EmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AppCard
          v-for="lib in template.library"
          :key="lib.id"
          padding="sm"
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="editLibraryMaster(lib)"
        >
          <div class="flex items-start gap-3 p-3">
            <span
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                lib.type === 'info' && 'bg-[#EFF8FE] text-[#0E6EA0]',
                lib.type === 'instrukce' && 'bg-slate-100 text-brand-dark',
                lib.type === 'varovani' && 'bg-[#FFFBEB] text-brand-amber',
                lib.type === 'nebezpeci' && 'bg-[#FEF2F2] text-brand-red',
                lib.type === 'uspech' && 'bg-[#F0FCF5] text-[#159344]',
              ]"
            >
              <component :is="resolveIcon(lib.icon)" :size="18" />
            </span>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <p class="font-semibold text-brand-dark truncate">{{ lib.name }}</p>
                <Pill
                  size="sm"
                  :tone="lib.type === 'info' ? 'sky' : lib.type === 'varovani' ? 'amber' : lib.type === 'nebezpeci' ? 'red' : lib.type === 'uspech' ? 'green' : 'default'"
                >
                  {{ COMPONENT_TYPE_LABELS[lib.type] }}
                </Pill>
              </div>
              <p v-if="lib.shortDescription" class="text-xs text-slate-500 mt-1 line-clamp-2">{{ lib.shortDescription }}</p>
              <div class="flex items-center gap-1.5 mt-2 flex-wrap">
                <Pill tone="purple" size="sm">
                  <Link2 :size="10" class="inline -mt-px" /> {{ plans.libraryUsageCount(template.id, lib.id) }} použití
                </Pill>
                <Pill v-if="lib.requiresCompletion" tone="green" size="sm">✓ splnění</Pill>
                <Pill v-if="lib.requiresPhoto" tone="purple" size="sm">📸 foto</Pill>
                <Pill v-if="lib.notification?.enabled" tone="orange" size="sm">🔔 {{ lib.notification.time }}</Pill>
              </div>
            </div>
          </div>
          <div class="px-3 pb-3 flex items-center justify-end gap-1">
            <button class="p-1.5 rounded hover:bg-slate-100 text-slate-500" @click.stop="editLibraryMaster(lib)">
              <component :is="resolveIcon('pencil')" :size="14" />
            </button>
            <button class="p-1.5 rounded hover:bg-slate-100 text-brand-red" @click.stop="removeLibraryMaster(lib)">
              <component :is="resolveIcon('trash-2')" :size="14" />
            </button>
          </div>
        </AppCard>
      </div>
    </div>

    <!-- ── Modals ── -->
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

    <!-- Add component: picker between library and new -->
    <Modal v-model="addMenu.open" title="Přidat komponentu" size="lg">
      <div class="space-y-5">
        <section v-if="template.library.length > 0">
          <div class="flex items-center gap-2 mb-2">
            <Link2 :size="16" class="text-[#6D28D9]" />
            <h4 class="text-sm font-semibold text-brand-dark">Z knihovny ({{ template.library.length }})</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              v-for="l in template.library"
              :key="l.id"
              class="text-left border border-border-subtle rounded-xl p-3 hover:border-brand-orange hover:bg-[#FFF7EB] transition-colors flex items-center gap-3"
              @click="pickFromLibrary(l)"
            >
              <span class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <component :is="resolveIcon(l.icon)" :size="16" />
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ l.name }}</p>
                <p class="text-xs text-slate-500 truncate">
                  {{ COMPONENT_TYPE_LABELS[l.type] }} · {{ plans.libraryUsageCount(template.id, l.id) }} použití
                </p>
              </div>
              <Plus :size="14" class="text-slate-400 shrink-0" />
            </button>
          </div>
        </section>

        <section class="pt-4 border-t border-border-subtle">
          <h4 class="text-sm font-semibold text-brand-dark mb-2">Nebo vytvoř novou lokální</h4>
          <AppButton variant="secondary" icon="plus" block @click="newLocalComponent">Nová vlastní komponenta</AppButton>
          <p class="text-xs text-slate-500 mt-2">Lokální komponenta žije jen v této kartě. Později ji můžeš v editoru uložit do knihovny.</p>
        </section>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="addMenu.open = false">Zrušit</AppButton>
      </template>
    </Modal>

    <!-- Component instance editor -->
    <Modal v-model="compModal.open" :title="compModal.componentId ? 'Upravit komponentu' : 'Nová komponenta'" size="xl">
      <ComponentEditor
        v-model="compModal.draft"
        :linked-library="compLinkedLibrary"
        :can-save-to-library="!!compModal.componentId && !compModal.draft.libraryId"
        @detach-from-library="onDetach"
        @save-to-library="onSaveCurrentToLibrary"
      />
      <template #footer>
        <AppButton variant="secondary" @click="compModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="saveComponent">Uložit</AppButton>
      </template>
    </Modal>

    <!-- Library master editor -->
    <Modal
      v-model="libModal.open"
      :title="libModal.libraryId ? 'Upravit master v knihovně' : 'Nový master v knihovně'"
      size="xl"
    >
      <div class="mb-4 bg-[#EDE9FE] border border-[#DDD6FE] text-[#5B21B6] rounded-xl px-4 py-2.5 text-xs flex items-start gap-2">
        <Link2 :size="14" class="mt-0.5 shrink-0" />
        <span>
          Tento master je definice komponenty v knihovně. Každá úprava se po uložení propíše do <strong>všech instancí</strong>, které na něj odkazují.
        </span>
      </div>
      <ComponentEditor v-model="libModal.draft" />
      <template #footer>
        <AppButton variant="secondary" @click="libModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="saveLibraryMaster">Uložit master</AppButton>
      </template>
    </Modal>
  </div>
  <div v-else class="text-center py-12 text-sm text-slate-500">Plán nenalezen.</div>
</template>
