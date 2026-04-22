<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patientsStore';
import { usePlansStore } from '@/stores/plansStore';
import { useDocumentsStore } from '@/stores/documentsStore';
import { usePhotosStore } from '@/stores/photosStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useUiStore } from '@/stores/uiStore';
import { staffLabel } from '@/data/staff';
import { patientDays, currentPhase, stayDurationDays } from '@/composables/useDayMath';
import { PHOTO_CHALLENGES } from '@/data/seedPhotos';
import { DOCUMENT_TYPE_LABELS } from '@/types';
import AppCard from '@/components/shared/AppCard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import Avatar from '@/components/shared/Avatar.vue';
import Pill from '@/components/shared/Pill.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import DayBadge from '@/components/shared/DayBadge.vue';
import Tabs from '@/components/shared/Tabs.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import PatientPreviewDrawer from '@/components/preview/PatientPreviewDrawer.vue';
import { resolveIcon } from '@/composables/useIcon';
import { Eye, Download, Trash2, ArrowLeft, Star, Check } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const patientsStore = usePatientsStore();
const plans = usePlansStore();
const documents = useDocumentsStore();
const photos = usePhotosStore();
const messages = useMessagesStore();
const ui = useUiStore();

const patientId = computed(() => route.params.id as string);
const patient = computed(() => patientsStore.byId(patientId.value));
const template = computed(() => plans.byId(patient.value?.planTemplateId));

const tab = ref<'info' | 'plan' | 'photos' | 'notifications' | 'documents' | 'messages' | 'notes'>('info');

const previewOpen = ref(false);

const today = new Date();
const days = computed(() => (patient.value ? patientDays(patient.value, today) : null));
const phase = computed(() => patient.value && currentPhase(patient.value, template.value, today));

const docs = computed(() => patient.value ? documents.byPatient(patient.value.id) : []);
const patientPhotos = computed(() => patient.value ? photos.byPatient(patient.value.id) : []);
const thread = computed(() => patient.value ? messages.threadFor(patient.value.id) : undefined);

const photoChallengeStatus = computed(() => {
  return PHOTO_CHALLENGES.map((ch) => {
    const matching = patientPhotos.value.filter((p) => p.challengeLabel === ch.label);
    return {
      ...ch,
      count: matching.length,
      done: matching.length > 0,
    };
  });
});

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function archivePatient() {
  if (!patient.value) return;
  const ok = await ui.confirm({
    title: 'Archivovat pacienta?',
    text: 'Pacient bude skryt z aktivního seznamu. Můžeš ho později obnovit.',
    confirmLabel: 'Archivovat',
  });
  if (ok) {
    patientsStore.archive(patient.value.id);
    ui.toast({ type: 'success', text: 'Pacient archivován.' });
  }
}

async function deleteDoc(id: string) {
  const ok = await ui.confirm({
    title: 'Smazat dokument?',
    text: 'Tuto akci nelze vrátit zpět.',
    confirmLabel: 'Smazat',
    danger: true,
  });
  if (ok) {
    documents.remove(id);
    ui.toast({ type: 'success', text: 'Dokument smazán.' });
  }
}

function uploadDocStub(type: 'smlouva' | 'gdpr' | 'lekarska' | 'instrukce' | 'kontakty' | 'jine') {
  if (!patient.value) return;
  documents.uploadStub(
    patient.value.id,
    type,
    `${DOCUMENT_TYPE_LABELS[type]}_${patient.value.lastName}.pdf`,
  );
  ui.toast({ type: 'success', text: 'Dokument nahrán (demo).' });
}
</script>

<template>
  <div v-if="patient">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4">
      <button class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" @click="router.push('/patients')">
        <ArrowLeft :size="18" />
      </button>
      <span class="text-sm text-slate-500">Pacienti / {{ patient.firstName }} {{ patient.lastName }}</span>
    </div>

    <PageHeader :title="`${patient.firstName} ${patient.lastName}`">
      <template #actions>
        <AppButton variant="secondary" icon="eye" @click="previewOpen = true">Pohled pacienta</AppButton>
        <AppButton variant="secondary" icon="trash-2" @click="archivePatient">Archivovat</AppButton>
      </template>
    </PageHeader>

    <!-- Summary card -->
    <AppCard class="mb-6">
      <div class="flex items-start gap-5">
        <Avatar :name="`${patient.firstName} ${patient.lastName}`" tone="orange" :size="64" />
        <div class="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-6 text-sm">
          <div>
            <p class="text-slate-500 text-xs">Fáze</p>
            <div class="mt-0.5"><PhaseBadge v-if="phase" :slug="phase.slug" /><span v-else>—</span></div>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Den (od zákroku)</p>
            <div class="mt-0.5"><DayBadge v-if="days" :day="days.fromSurgery" /></div>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Typ zákroku</p>
            <p class="font-medium text-brand-dark">{{ patient.surgeryType }} · {{ patient.graftCount.toLocaleString('cs-CZ') }} štěpů</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Body</p>
            <p class="font-medium text-brand-dark flex items-center gap-1"><Star :size="14" class="text-brand-orange" /> {{ patient.points }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Odlet</p>
            <p class="font-medium text-brand-dark">{{ formatDate(patient.departureDate) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Zákrok</p>
            <p class="font-medium text-brand-dark">{{ formatDate(patient.surgeryDate) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Návrat</p>
            <p class="font-medium text-brand-dark">{{ formatDate(patient.returnDate) }}</p>
          </div>
          <div>
            <p class="text-slate-500 text-xs">Pobyt v Istanbulu</p>
            <p class="font-medium text-brand-dark">{{ stayDurationDays(patient) }} dní</p>
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Tabs -->
    <div class="mb-4">
      <Tabs
        v-model="tab"
        :tabs="[
          { value: 'info', label: 'Základní info' },
          { value: 'plan', label: 'Přiřazený plán' },
          { value: 'photos', label: 'Fotodokumentace', badge: patientPhotos.length || undefined },
          { value: 'notifications', label: 'Notifikace' },
          { value: 'documents', label: 'Dokumenty', badge: docs.length || undefined },
          { value: 'messages', label: 'Zprávy', badge: thread?.messages.filter((m) => !m.read && m.sender === 'patient').length || undefined },
          { value: 'notes', label: 'Poznámky' },
        ]"
      />
    </div>

    <!-- Info -->
    <AppCard v-if="tab === 'info'">
      <div class="grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 class="font-semibold text-brand-dark mb-3">Kontakt</h3>
          <dl class="space-y-2">
            <div><dt class="text-slate-500 text-xs">E-mail</dt><dd class="text-brand-dark">{{ patient.email }}</dd></div>
            <div><dt class="text-slate-500 text-xs">Telefon</dt><dd class="text-brand-dark">{{ patient.phone }}</dd></div>
            <div><dt class="text-slate-500 text-xs">Datum narození</dt><dd class="text-brand-dark">{{ formatDate(patient.birthDate) }}</dd></div>
            <div><dt class="text-slate-500 text-xs">Jazyk</dt><dd class="text-brand-dark">{{ patient.language.toUpperCase() }}</dd></div>
            <div><dt class="text-slate-500 text-xs">Státní příslušnost</dt><dd class="text-brand-dark">{{ patient.nationality ?? '—' }}</dd></div>
          </dl>
        </div>
        <div>
          <h3 class="font-semibold text-brand-dark mb-3">Tým</h3>
          <dl class="space-y-2">
            <div><dt class="text-slate-500 text-xs">Lékař</dt><dd class="text-brand-dark">{{ staffLabel(patient.doctorId) }}</dd></div>
            <div><dt class="text-slate-500 text-xs">Koordinátor (ČR)</dt><dd class="text-brand-dark">{{ staffLabel(patient.coordinatorId) }}</dd></div>
          </dl>

          <h3 class="font-semibold text-brand-dark mt-5 mb-3">Kanály</h3>
          <div class="space-y-2">
            <ToggleSwitch :model-value="patient.pushEnabled" label="Push notifikace" @update:model-value="(v) => patientsStore.update(patient!.id, { pushEnabled: v })" />
            <ToggleSwitch :model-value="patient.whatsappBroadcast" label="WhatsApp broadcast" @update:model-value="(v) => patientsStore.update(patient!.id, { whatsappBroadcast: v })" />
          </div>
        </div>
      </div>
    </AppCard>

    <!-- Plan -->
    <AppCard v-else-if="tab === 'plan'">
      <div v-if="template">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-semibold text-brand-dark">{{ template.name }}</h3>
            <p class="text-sm text-slate-500 mt-0.5">
              {{ plans.componentCount(template.id) }} komponent · {{ plans.notificationCount(template.id) }} notifikací · {{ template.phases.length }} fází
            </p>
          </div>
          <AppButton variant="secondary" icon="pencil" @click="router.push(`/plans/${template.id}`)">Upravit plán</AppButton>
        </div>

        <!-- Timeline of phases -->
        <div class="space-y-5">
          <div v-for="ph in template.phases" :key="ph.id" class="border border-border-subtle rounded-2xl overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50">
              <div class="flex items-center gap-2">
                <component :is="resolveIcon(ph.icon)" :size="18" class="text-brand-dark" />
                <p class="font-semibold text-brand-dark">{{ ph.name }}</p>
                <PhaseBadge :reference="ph.relativeTo" />
              </div>
              <Pill tone="default">{{ ph.dayCards.length }} karet · {{ ph.dayCards.reduce((s, c) => s + c.components.length, 0) }} komponent</Pill>
            </div>
            <ul class="divide-y divide-border-subtle">
              <li v-for="card in ph.dayCards" :key="card.id" class="px-4 py-3 text-sm flex items-center gap-3">
                <span class="font-semibold text-brand-dark w-24 shrink-0 tabular-nums">
                  {{ card.name ?? (card.dayFrom === card.dayTo ? `Den ${card.dayFrom}` : `Dny ${card.dayFrom}–${card.dayTo}`) }}
                </span>
                <span class="text-slate-500 flex-1 truncate">{{ card.components.map((c) => c.name).join(' · ') }}</span>
                <Pill size="sm">{{ card.components.length }}</Pill>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-slate-500">K pacientovi není přiřazen žádný plán.</p>
    </AppCard>

    <!-- Photos -->
    <AppCard v-else-if="tab === 'photos'">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="font-semibold text-brand-dark">Fotodokumentace</h3>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ photoChallengeStatus.filter((x) => x.done).length }} z {{ photoChallengeStatus.length }} výzev splněno
          </p>
        </div>
        <AppButton variant="secondary" icon="download">Stáhnout ZIP</AppButton>
      </div>

      <ul class="space-y-1.5 mb-6">
        <li v-for="ch in photoChallengeStatus" :key="ch.key" class="flex items-center gap-3 py-1">
          <span :class="[
            'w-7 h-7 rounded-full flex items-center justify-center',
            ch.done ? 'bg-[#22C55E] text-white' : 'bg-slate-100 text-slate-400',
          ]">
            <Check v-if="ch.done" :size="14" />
            <span v-else class="text-xs">○</span>
          </span>
          <span class="flex-1 text-sm font-medium text-brand-dark">{{ ch.label }}</span>
          <span class="text-xs text-slate-500">{{ ch.count }} fotek · {{ ch.points }} bodů</span>
        </li>
      </ul>

      <div v-if="patientPhotos.length" class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <figure v-for="p in patientPhotos" :key="p.id" class="relative group rounded-xl overflow-hidden bg-slate-100">
          <img :src="p.thumbnailUrl" :alt="p.challengeLabel" class="w-full aspect-square object-cover" />
          <figcaption class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-white text-[11px]">
            <p class="font-semibold truncate">{{ p.challengeLabel }}</p>
            <p class="opacity-80">{{ formatDate(p.createdAt) }}</p>
          </figcaption>
          <span class="absolute top-1.5 right-1.5">
            <Pill :tone="p.marketingConsent === 'yes' ? 'green' : p.marketingConsent === 'no' ? 'red' : 'amber'" size="sm">
              {{ p.marketingConsent === 'yes' ? '✓ souhlas' : p.marketingConsent === 'no' ? '✗ nesouhlas' : '? čeká' }}
            </Pill>
          </span>
        </figure>
      </div>
      <p v-else class="text-sm text-slate-500">Zatím žádné fotky.</p>
    </AppCard>

    <!-- Notifications -->
    <AppCard v-else-if="tab === 'notifications'">
      <h3 class="font-semibold text-brand-dark mb-4">Naplánované notifikace</h3>
      <p class="text-sm text-slate-500">
        Zde se zobrazí všechny notifikace, které aplikace pošle pacientovi podle jeho plánu.
        Celkem <strong class="text-brand-dark">{{ template ? plans.notificationCount(template.id) : 0 }}</strong> naplánovaných v aktivním plánu.
        Detailní editor per-notifikace je v rámci úprav komponenty v plánu.
      </p>
    </AppCard>

    <!-- Documents -->
    <AppCard v-else-if="tab === 'documents'">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-brand-dark">Dokumenty</h3>
        <div class="flex gap-2">
          <AppButton variant="secondary" icon="file-up" @click="uploadDocStub('smlouva')">Smlouva</AppButton>
          <AppButton variant="secondary" icon="file-up" @click="uploadDocStub('gdpr')">GDPR</AppButton>
          <AppButton variant="secondary" icon="file-up" @click="uploadDocStub('lekarska')">Lékařská zpráva</AppButton>
          <AppButton variant="secondary" icon="file-up" @click="uploadDocStub('instrukce')">Pro klienta</AppButton>
        </div>
      </div>

      <ul class="divide-y divide-border-subtle">
        <li v-for="d in docs" :key="d.id" class="flex items-center gap-3 py-3">
          <span class="w-9 h-9 rounded-lg bg-[#EFF8FE] text-[#0E6EA0] flex items-center justify-center">
            <component :is="resolveIcon('file-text')" :size="18" />
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-brand-dark truncate">{{ d.name }}</p>
            <p class="text-xs text-slate-500">
              {{ DOCUMENT_TYPE_LABELS[d.type] }} · {{ formatSize(d.sizeBytes) }} · {{ formatDate(d.createdAt) }}
            </p>
          </div>
          <ToggleSwitch
            :model-value="d.visibleToPatient"
            label="Vidí klient"
            @update:model-value="documents.toggleVisibility(d.id)"
          />
          <button class="text-slate-400 hover:text-slate-600 p-1"><Eye :size="16" /></button>
          <button class="text-slate-400 hover:text-slate-600 p-1"><Download :size="16" /></button>
          <button class="text-brand-red hover:text-red-600 p-1" @click="deleteDoc(d.id)"><Trash2 :size="16" /></button>
        </li>
        <li v-if="docs.length === 0" class="py-6 text-center text-sm text-slate-500">Žádné dokumenty.</li>
      </ul>
    </AppCard>

    <!-- Messages -->
    <AppCard v-else-if="tab === 'messages'">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-brand-dark">Zprávy</h3>
        <AppButton variant="secondary" icon="message-circle" @click="router.push(`/messages/${patient.id}`)">Otevřít inbox</AppButton>
      </div>
      <p v-if="!thread || thread.messages.length === 0" class="text-sm text-slate-500">Zatím žádná konverzace.</p>
      <ul v-else class="space-y-2">
        <li
          v-for="m in thread.messages.slice(-4).reverse()"
          :key="m.id"
          class="text-sm"
        >
          <p class="text-xs text-slate-500 mb-0.5">
            {{ m.sender === 'patient' ? `${patient.firstName} ${patient.lastName}` : 'Admin' }}
            · {{ new Date(m.timestamp).toLocaleString('cs-CZ') }}
          </p>
          <p class="text-brand-dark">{{ m.text }}</p>
        </li>
      </ul>
    </AppCard>

    <!-- Notes -->
    <AppCard v-else-if="tab === 'notes'">
      <h3 class="font-semibold text-brand-dark mb-4">Interní poznámky</h3>
      <p v-if="!patient.internalNote" class="text-sm text-slate-500">Zatím žádné poznámky.</p>
      <p v-else class="text-sm text-brand-dark whitespace-pre-line bg-[#FFFBEB] border border-amber-200 rounded-xl p-4">
        {{ patient.internalNote }}
      </p>
    </AppCard>

    <PatientPreviewDrawer v-model="previewOpen" :patient="patient" />
  </div>
  <div v-else class="text-center py-12">
    <p class="text-slate-500">Pacient nenalezen.</p>
  </div>
</template>
