<script setup lang="ts">
import { computed, ref } from 'vue';
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
import { ArrowLeft, ChevronDown, ChevronRight, Link2, Plus, Repeat } from 'lucide-vue-next';
import type {
  ComponentItem, ComponentType, PhaseReference, HeroColor, DayCard, LibraryComponent,
} from '@/types';
import { COMPONENT_TYPE_LABELS } from '@/types';

const route = useRoute();
const router = useRouter();
const plans = usePlansStore();
const ui = useUiStore();

const templateId = computed(() => route.params.id as string);
const template = computed(() => plans.byId(templateId.value));

const tab = ref<'phases' | 'library'>('phases');

// Collapsed by default
const openPhases = ref<Record<string, boolean>>({});
const openCards = ref<Record<string, boolean>>({});
const openPhaseSettings = ref<Record<string, boolean>>({});
const templateMetaOpen = ref(false);

function togglePhase(id: string) { openPhases.value = { ...openPhases.value, [id]: !openPhases.value[id] }; }
function toggleCard(id: string) { openCards.value = { ...openCards.value, [id]: !openCards.value[id] }; }
function togglePhaseSettings(id: string) { openPhaseSettings.value = { ...openPhaseSettings.value, [id]: !openPhaseSettings.value[id] }; }
const isPhaseOpen = (id: string) => !!openPhases.value[id];
const isCardOpen = (id: string) => !!openCards.value[id];
const isPhaseSettingsOpen = (id: string) => !!openPhaseSettings.value[id];

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
  ui.toast({ type: 'success', text: `Vloženo: ${lib.name}` });
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
  ui.toast({ type: 'info', text: 'Odpojeno od opakující se akce.' });
}
function onSaveCurrentToLibrary() {
  if (!template.value || !compModal.value.componentId) return;
  const lib = plans.saveComponentToLibrary(template.value.id, compModal.value.phaseId, compModal.value.cardId, compModal.value.componentId);
  if (lib) {
    compModal.value.draft.libraryId = lib.id;
    ui.toast({ type: 'success', text: `Uloženo jako opakující se akce: ${lib.name}` });
  }
}

// ── Library (Opakující se akce) manager ──
const libModal = ref<{ open: boolean; libraryId: string | null; draft: ComponentItem }>({
  open: false, libraryId: null, draft: blankComponent('instrukce', ''),
});
function newLibraryMaster() {
  libModal.value = { open: true, libraryId: null, draft: blankComponent('instrukce', '') };
}
function editLibraryMaster(lib: LibraryComponent) {
  libModal.value = {
    open: true, libraryId: lib.id,
    draft: { ...blankComponent(lib.type, ''), ...lib, dayCardId: '', order: 0, libraryId: null },
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
    ui.toast({ type: 'success', text: 'Akce uložena — změny se propsaly do všech instancí.' });
  } else {
    plans.createLibraryComponent(template.value.id, payload);
    ui.toast({ type: 'success', text: 'Opakující se akce uložena.' });
  }
  libModal.value.open = false;
}
async function removeLibraryMaster(lib: LibraryComponent) {
  if (!template.value) return;
  const usages = plans.libraryUsageCount(template.value.id, lib.id);
  const ok = await ui.confirm({
    title: 'Smazat opakující se akci?',
    text: usages > 0
      ? `${usages} instancí se odpojí a ponechá si aktuální hodnoty jako lokální komponenty.`
      : 'Žádná instance na tuto akci neodkazuje.',
    confirmLabel: 'Smazat',
    danger: true,
  });
  if (ok) {
    plans.removeLibraryComponent(template.value.id, lib.id);
    ui.toast({ type: 'success', text: 'Akce smazána.' });
  }
}

// ── Destruction ──
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
  const ok = await ui.confirm({ title: 'Smazat komponentu?', text: 'Tuto akci nelze vrátit zpět. Opakující se akce v knihovně zůstává.', confirmLabel: 'Smazat', danger: true });
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
function cardDayTag(card: DayCard): string {
  return card.dayFrom === card.dayTo ? `D ${card.dayFrom}` : `${card.dayFrom}–${card.dayTo}`;
}
function componentRowClass(type: ComponentType): string {
  if (type === 'info') return 'border-l-[#65BCEA]';
  if (type === 'varovani') return 'border-l-brand-amber';
  if (type === 'nebezpeci') return 'border-l-brand-red';
  if (type === 'uspech') return 'border-l-[#22C55E]';
  return 'border-l-slate-300';
}
function componentIconBg(type: ComponentType): string {
  if (type === 'info') return 'bg-[#EFF8FE] text-[#0E6EA0]';
  if (type === 'varovani') return 'bg-[#FFFBEB] text-brand-amber';
  if (type === 'nebezpeci') return 'bg-[#FEF2F2] text-brand-red';
  if (type === 'uspech') return 'bg-[#F0FCF5] text-[#159344]';
  return 'bg-slate-100 text-brand-dark';
}
</script>

<template>
  <div v-if="template">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-3 mb-3">
      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="router.push('/plans')">
        <ArrowLeft :size="18" />
      </button>
      <span class="text-sm text-slate-500">Plány / {{ template.name }}</span>
    </div>

    <PageHeader
      :title="template.name"
      :subtitle="`${template.phases.length} fází · ${plans.componentCount(template.id)} komponent · ${template.library.length} opakujících se akcí`"
    >
      <template #actions>
        <AppButton variant="secondary" icon="copy" @click="plans.clone(template.id)">Klonovat</AppButton>
        <AppButton v-if="tab === 'phases'" variant="primary" icon="plus" @click="addPhase">Přidat fázi</AppButton>
        <AppButton v-else variant="primary" icon="plus" @click="newLibraryMaster">Nová akce</AppButton>
      </template>
    </PageHeader>

    <!-- Template meta (collapsed by default) -->
    <AppCard padding="none" class="mb-4">
      <button
        class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-2xl"
        @click="templateMetaOpen = !templateMetaOpen"
      >
        <ChevronDown v-if="templateMetaOpen" :size="16" class="text-slate-400" />
        <ChevronRight v-else :size="16" class="text-slate-400" />
        <span class="text-sm font-medium text-slate-700">Základní nastavení šablony</span>
        <span class="text-xs text-slate-400 ml-auto">{{ template.surgeryType === 'any' ? 'Univerzální' : template.surgeryType }}</span>
      </button>
      <div v-if="templateMetaOpen" class="px-4 pb-4 space-y-3 border-t border-border-subtle pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          @update:model-value="(v) => saveTemplate({ description: v })"
        />
      </div>
    </AppCard>

    <Tabs
      v-model="tab"
      :tabs="[
        { value: 'phases', label: 'Fáze a karty dní', badge: template.phases.length || undefined },
        { value: 'library', label: 'Opakující se akce', badge: template.library.length || undefined },
      ]"
      class="mb-4"
    />

    <!-- ── Phases tab ── -->
    <div v-if="tab === 'phases'" class="space-y-2">
      <AppCard v-for="phase in template.phases" :key="phase.id" padding="none">
        <!-- Phase header (compact, clickable) -->
        <button
          class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 rounded-t-2xl"
          :class="!isPhaseOpen(phase.id) && 'rounded-b-2xl'"
          @click="togglePhase(phase.id)"
        >
          <ChevronDown v-if="isPhaseOpen(phase.id)" :size="16" class="text-slate-400 shrink-0" />
          <ChevronRight v-else :size="16" class="text-slate-400 shrink-0" />
          <component :is="resolveIcon(phase.icon)" :size="18" class="text-brand-dark shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-brand-dark truncate">{{ phase.name }}</p>
            <p class="text-xs text-slate-500">{{ phase.dayCards.length }} karet · {{ phase.dayCards.reduce((s, c) => s + c.components.length, 0) }} komponent</p>
          </div>
          <PhaseBadge :reference="phase.relativeTo" />
          <span class="p-1.5 rounded hover:bg-white text-slate-400 hover:text-brand-red transition-colors" role="button" @click.stop="removePhase(phase.id)">
            <component :is="resolveIcon('trash-2')" :size="14" />
          </span>
        </button>

        <div v-if="isPhaseOpen(phase.id)" class="border-t border-border-subtle">
          <!-- Phase settings: collapsed sub-row -->
          <button
            class="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-slate-50 border-b border-border-subtle"
            @click="togglePhaseSettings(phase.id)"
          >
            <ChevronDown v-if="isPhaseSettingsOpen(phase.id)" :size="14" class="text-slate-400" />
            <ChevronRight v-else :size="14" class="text-slate-400" />
            <component :is="resolveIcon('settings')" :size="14" class="text-slate-500" />
            <span class="text-sm text-slate-600">Nastavení fáze</span>
          </button>
          <div v-if="isPhaseSettingsOpen(phase.id)" class="px-4 py-4 space-y-3 bg-slate-50 border-b border-border-subtle">
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
          </div>

          <!-- Day cards: each is its own collapsible row -->
          <ul>
            <li v-for="card in phase.dayCards" :key="card.id" class="border-b border-border-subtle last:border-b-0">
              <button
                class="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                @click="toggleCard(card.id)"
              >
                <ChevronDown v-if="isCardOpen(card.id)" :size="14" class="text-slate-400 shrink-0" />
                <ChevronRight v-else :size="14" class="text-slate-400 shrink-0" />
                <span class="bg-slate-100 text-slate-600 text-[11px] font-semibold rounded px-1.5 py-0.5 tabular-nums shrink-0">{{ cardDayTag(card) }}</span>
                <span class="text-sm font-medium text-brand-dark truncate flex-1">{{ cardLabel(card) }}</span>
                <span class="text-xs text-slate-500 tabular-nums">{{ card.components.length }}</span>
                <span class="p-1 rounded hover:bg-white text-slate-400 hover:text-brand-red" role="button" @click.stop="removeCard(phase.id, card.id)">
                  <component :is="resolveIcon('trash-2')" :size="13" />
                </span>
              </button>

              <div v-if="isCardOpen(card.id)" class="bg-slate-50/60 border-t border-border-subtle">
                <ul v-if="card.components.length">
                  <li
                    v-for="comp in card.components"
                    :key="comp.id"
                    :class="['group flex items-center gap-3 px-4 py-2 border-l-2 hover:bg-white transition-colors', componentRowClass(comp.type)]"
                  >
                    <span :class="['w-7 h-7 rounded-md flex items-center justify-center shrink-0', componentIconBg(comp.type)]">
                      <component :is="resolveIcon(comp.icon || COMPONENT_TYPE_ICONS[comp.type])" :size="14" />
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <p class="text-sm font-medium text-brand-dark truncate">{{ comp.name }}</p>
                        <Pill v-if="comp.libraryId" tone="purple" size="sm">
                          <Repeat :size="9" class="inline -mt-px" /> opakuje se
                        </Pill>
                        <Pill v-if="comp.requiresPhoto" tone="purple" size="sm">📸</Pill>
                        <Pill v-if="comp.notification?.enabled" tone="orange" size="sm">🔔 {{ comp.notification.time }}</Pill>
                      </div>
                    </div>
                    <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button class="p-1 rounded hover:bg-slate-100 text-slate-500" title="Nahoru" @click="plans.moveComponent(template!.id, phase.id, card.id, comp.id, -1)">
                        <component :is="resolveIcon('chevron-up')" :size="14" />
                      </button>
                      <button class="p-1 rounded hover:bg-slate-100 text-slate-500" title="Dolů" @click="plans.moveComponent(template!.id, phase.id, card.id, comp.id, 1)">
                        <component :is="resolveIcon('chevron-down')" :size="14" />
                      </button>
                      <button class="p-1 rounded hover:bg-slate-100 text-slate-500" title="Upravit" @click="editComponent(phase.id, card.id, comp)">
                        <component :is="resolveIcon('pencil')" :size="14" />
                      </button>
                      <button class="p-1 rounded hover:bg-slate-100 text-brand-red" title="Smazat" @click="removeComp(phase.id, card.id, comp.id)">
                        <component :is="resolveIcon('trash-2')" :size="14" />
                      </button>
                    </div>
                  </li>
                </ul>
                <div class="px-4 py-2 border-t border-border-subtle">
                  <button
                    class="inline-flex items-center gap-1.5 text-sm text-brand-orange hover:underline"
                    @click="openAddMenu(phase.id, card.id)"
                  >
                    <Plus :size="14" /> Přidat komponentu
                  </button>
                </div>
              </div>
            </li>
          </ul>

          <!-- Add day card -->
          <div class="px-4 py-3 bg-slate-50">
            <button
              class="inline-flex items-center gap-1.5 text-sm text-brand-orange hover:underline"
              @click="addCard(phase.id)"
            >
              <Plus :size="14" /> Přidat kartu dne
            </button>
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

    <!-- ── Opakující se akce ── -->
    <div v-else class="space-y-4">
      <AppCard>
        <div class="flex items-start gap-3">
          <span class="w-10 h-10 rounded-lg bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center shrink-0">
            <Repeat :size="18" />
          </span>
          <div class="flex-1 text-sm text-slate-700">
            <p class="font-semibold text-brand-dark">Opakující se akce</p>
            <p class="text-xs text-slate-500 mt-1">
              Akce, které se vyskytují v plánu opakovaně (ranní léky, mytí hlavy, foto pokroku…).
              Nadefinuj je jednou — pak je při přidávání komponenty jen <em>vložíš</em>. Úprava akce se automaticky propíše do všech instancí v kartách.
            </p>
          </div>
        </div>
      </AppCard>

      <EmptyState
        v-if="template.library.length === 0"
        icon="repeat"
        title="Zatím žádné opakující se akce"
        text="Přidej první akci ručně, nebo z konkrétní komponenty v kartě vyber „Uložit do knihovny opakujících se akcí“."
      >
        <AppButton variant="primary" icon="plus" @click="newLibraryMaster">Nová akce</AppButton>
      </EmptyState>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <AppCard
          v-for="lib in template.library"
          :key="lib.id"
          padding="none"
          class="cursor-pointer hover:shadow-md transition-shadow"
          @click="editLibraryMaster(lib)"
        >
          <div class="flex items-start gap-3 p-4">
            <span :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0', componentIconBg(lib.type)]">
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
                  <Repeat :size="10" class="inline -mt-px" /> {{ plans.libraryUsageCount(template.id, lib.id) }}× použito
                </Pill>
                <Pill v-if="lib.requiresPhoto" tone="purple" size="sm">📸 foto</Pill>
                <Pill v-if="lib.notification?.enabled" tone="orange" size="sm">🔔 {{ lib.notification.time }}</Pill>
              </div>
            </div>
          </div>
          <div class="px-4 pb-3 flex items-center justify-end gap-1">
            <button class="p-1.5 rounded hover:bg-slate-100 text-slate-500" title="Upravit" @click.stop="editLibraryMaster(lib)">
              <component :is="resolveIcon('pencil')" :size="14" />
            </button>
            <button class="p-1.5 rounded hover:bg-slate-100 text-brand-red" title="Smazat" @click.stop="removeLibraryMaster(lib)">
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

    <Modal v-model="addMenu.open" title="Přidat komponentu" size="lg">
      <div class="space-y-5">
        <section v-if="template.library.length > 0">
          <div class="flex items-center gap-2 mb-2">
            <Repeat :size="16" class="text-[#6D28D9]" />
            <h4 class="text-sm font-semibold text-brand-dark">Z opakujících se akcí ({{ template.library.length }})</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              v-for="l in template.library"
              :key="l.id"
              class="text-left border border-border-subtle rounded-xl p-3 hover:border-brand-orange hover:bg-[#FFF7EB] transition-colors flex items-center gap-3"
              @click="pickFromLibrary(l)"
            >
              <span :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', componentIconBg(l.type)]">
                <component :is="resolveIcon(l.icon)" :size="16" />
              </span>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ l.name }}</p>
                <p class="text-xs text-slate-500 truncate">
                  {{ COMPONENT_TYPE_LABELS[l.type] }} · {{ plans.libraryUsageCount(template.id, l.id) }}× použito
                </p>
              </div>
              <Plus :size="14" class="text-slate-400 shrink-0" />
            </button>
          </div>
        </section>

        <section class="pt-4 border-t border-border-subtle">
          <h4 class="text-sm font-semibold text-brand-dark mb-2">Nebo vytvoř novou lokální</h4>
          <AppButton variant="secondary" icon="plus" block @click="newLocalComponent">Nová vlastní komponenta</AppButton>
          <p class="text-xs text-slate-500 mt-2">Lokální komponenta žije jen v této kartě. Později ji můžeš v editoru uložit do knihovny opakujících se akcí.</p>
        </section>
      </div>
      <template #footer>
        <AppButton variant="secondary" @click="addMenu.open = false">Zrušit</AppButton>
      </template>
    </Modal>

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

    <Modal
      v-model="libModal.open"
      :title="libModal.libraryId ? 'Upravit opakující se akci' : 'Nová opakující se akce'"
      size="xl"
    >
      <div class="mb-4 bg-[#EDE9FE] border border-[#DDD6FE] text-[#5B21B6] rounded-xl px-4 py-2.5 text-xs flex items-start gap-2">
        <Repeat :size="14" class="mt-0.5 shrink-0" />
        <span>
          Tato definice je sdílená — změny se po uložení <strong>automaticky propíšou do všech karet</strong>, kde je akce použitá.
        </span>
      </div>
      <ComponentEditor v-model="libModal.draft" />
      <template #footer>
        <AppButton variant="secondary" @click="libModal.open = false">Zrušit</AppButton>
        <AppButton variant="primary" @click="saveLibraryMaster">Uložit</AppButton>
      </template>
    </Modal>
  </div>
  <div v-else class="text-center py-12 text-sm text-slate-500">Plán nenalezen.</div>
</template>
