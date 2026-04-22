<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePatientsStore } from '@/stores/patientsStore';
import { usePlansStore } from '@/stores/plansStore';
import { useUiStore } from '@/stores/uiStore';
import { STAFF } from '@/data/staff';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppButton from '@/components/shared/AppButton.vue';
import AppInput from '@/components/shared/AppInput.vue';
import AppSelect from '@/components/shared/AppSelect.vue';
import AppTextarea from '@/components/shared/AppTextarea.vue';
import RadioGroup from '@/components/shared/RadioGroup.vue';
import ToggleSwitch from '@/components/shared/ToggleSwitch.vue';
import Pill from '@/components/shared/Pill.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import { Check } from 'lucide-vue-next';

const router = useRouter();
const patients = usePatientsStore();
const plans = usePlansStore();
const ui = useUiStore();

const step = ref(1);
const maxStep = 3;

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  nationality: 'Česká republika',
  language: 'cs' as 'cs' | 'en' | 'de' | 'sk',

  departureDate: '',
  surgeryDate: '',
  returnDate: '',
  surgeryType: 'DHI' as 'DHI' | 'FUE' | 'Combo',
  graftCount: 3000,
  doctorId: '',
  coordinatorId: STAFF.find((s) => s.role === 'coordinator_cz')?.id ?? '',

  planTemplateId: '',
  internalNote: '',
  welcomeEmailSent: true,
  pushEnabled: true,
  whatsappBroadcast: true,
});

const errors = reactive<Record<string, string>>({});

const doctors = computed(() => STAFF.filter((s) => s.role === 'doctor_tr'));
const coordinators = computed(() => STAFF.filter((s) => s.role === 'coordinator_cz'));

const stayLength = computed(() => {
  if (!form.departureDate || !form.returnDate) return null;
  const ms = new Date(form.returnDate).getTime() - new Date(form.departureDate).getTime();
  const days = Math.round(ms / 86_400_000);
  return days >= 0 ? days : null;
});

const daysBeforeSurgery = computed(() => {
  if (!form.departureDate || !form.surgeryDate) return null;
  const ms = new Date(form.surgeryDate).getTime() - new Date(form.departureDate).getTime();
  const days = Math.round(ms / 86_400_000);
  return days >= 0 ? days : null;
});

const selectedPlan = computed(() => plans.byId(form.planTemplateId));
const planComponentCount = computed(() =>
  form.planTemplateId ? plans.componentCount(form.planTemplateId) : 0,
);
const planNotifCount = computed(() =>
  form.planTemplateId ? plans.notificationCount(form.planTemplateId) : 0,
);

function validateStep1(): boolean {
  for (const k of Object.keys(errors)) delete errors[k];
  if (!form.firstName.trim()) errors.firstName = 'Povinné';
  if (!form.lastName.trim()) errors.lastName = 'Povinné';
  if (!form.email.trim()) errors.email = 'Povinné';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Neplatný e-mail';
  if (!form.phone.trim()) errors.phone = 'Povinné';
  else if (!/^\+?[0-9\s]{9,}$/.test(form.phone)) errors.phone = 'Neplatný formát (např. +420 777 123 456)';
  return Object.keys(errors).length === 0;
}

function validateStep2(): boolean {
  for (const k of Object.keys(errors)) delete errors[k];
  if (!form.departureDate) errors.departureDate = 'Povinné';
  if (!form.surgeryDate) errors.surgeryDate = 'Povinné';
  if (!form.returnDate) errors.returnDate = 'Povinné';
  if (form.departureDate && form.surgeryDate && new Date(form.surgeryDate) < new Date(form.departureDate)) {
    errors.surgeryDate = 'Musí být ≥ datum odletu';
  }
  if (form.surgeryDate && form.returnDate && new Date(form.returnDate) < new Date(form.surgeryDate)) {
    errors.returnDate = 'Musí být ≥ datum zákroku';
  }
  if (!form.graftCount || form.graftCount < 100 || form.graftCount > 6000) {
    errors.graftCount = 'Počet štěpů 100–6000';
  }
  if (!form.doctorId) errors.doctorId = 'Vyberte lékaře';
  if (!form.coordinatorId) errors.coordinatorId = 'Vyberte koordinátora';
  return Object.keys(errors).length === 0;
}

function validateStep3(): boolean {
  for (const k of Object.keys(errors)) delete errors[k];
  if (!form.planTemplateId) errors.planTemplateId = 'Vyberte šablonu plánu';
  return Object.keys(errors).length === 0;
}

function next() {
  const ok = step.value === 1 ? validateStep1() : step.value === 2 ? validateStep2() : validateStep3();
  if (!ok) return;
  if (step.value < maxStep) step.value++;
  else submit();
}

function submit() {
  if (!validateStep3()) return;
  const created = patients.create({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    birthDate: form.birthDate || undefined,
    nationality: form.nationality,
    language: form.language,
    departureDate: form.departureDate,
    surgeryDate: form.surgeryDate,
    returnDate: form.returnDate,
    surgeryType: form.surgeryType,
    graftCount: form.graftCount,
    doctorId: form.doctorId,
    coordinatorId: form.coordinatorId,
    planTemplateId: form.planTemplateId,
    welcomeEmailSent: form.welcomeEmailSent,
    pushEnabled: form.pushEnabled,
    whatsappBroadcast: form.whatsappBroadcast,
    internalNote: form.internalNote || undefined,
  });
  ui.toast({ type: 'success', title: 'Pacient přidán', text: `${created.firstName} ${created.lastName} byl úspěšně přidán.` });
  router.push(`/patients/${created.id}`);
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <PageHeader title="Přidat pacienta" subtitle="3 kroky, ~2 minuty." />

    <!-- Stepper -->
    <div class="flex items-center gap-3 mb-6">
      <template v-for="n in maxStep" :key="n">
        <div class="flex items-center gap-2">
          <span
            :class="[
              'w-8 h-8 rounded-full inline-flex items-center justify-center text-sm font-semibold',
              n < step && 'bg-[#22C55E] text-white',
              n === step && 'bg-brand-orange text-white',
              n > step && 'bg-slate-200 text-slate-500',
            ]"
          >
            <Check v-if="n < step" :size="14" />
            <span v-else>{{ n }}</span>
          </span>
          <span :class="['text-sm', n === step ? 'text-brand-dark font-medium' : 'text-slate-500']">
            {{ n === 1 ? 'Identifikace' : n === 2 ? 'Zákrok & termíny' : 'Plán & dokončení' }}
          </span>
        </div>
        <span v-if="n < maxStep" class="flex-1 h-px bg-slate-200" />
      </template>
    </div>

    <!-- Step 1 -->
    <AppCard v-if="step === 1">
      <h2 class="text-lg font-semibold text-brand-dark mb-4">1. Identifikace klienta</h2>
      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="form.firstName" label="Jméno" required :error="errors.firstName" autofocus />
        <AppInput v-model="form.lastName" label="Příjmení" required :error="errors.lastName" />
        <AppInput v-model="form.email" type="email" label="E-mail" required :error="errors.email" />
        <AppInput v-model="form.phone" label="Telefon" required :error="errors.phone" placeholder="+420 777 123 456" hint="Unikátní — používá se pro WhatsApp párování" />
        <AppInput v-model="form.birthDate" type="date" label="Datum narození" />
        <AppInput v-model="form.nationality" label="Státní příslušnost" />
        <AppSelect
          v-model="form.language"
          label="Jazyk komunikace"
          required
          :options="[
            { value: 'cs', label: 'Čeština' },
            { value: 'en', label: 'Angličtina' },
            { value: 'de', label: 'Němčina' },
            { value: 'sk', label: 'Slovenština' },
          ]"
        />
      </div>
    </AppCard>

    <!-- Step 2 -->
    <AppCard v-else-if="step === 2">
      <h2 class="text-lg font-semibold text-brand-dark mb-1">2. Zákrok a termíny</h2>
      <p class="text-xs text-slate-500 mb-4">Všechna tři data jsou povinná — odlet ≤ zákrok ≤ návrat.</p>

      <div class="grid grid-cols-3 gap-4 mb-5">
        <AppInput v-model="form.departureDate" type="date" label="Datum odletu z ČR" required :error="errors.departureDate" />
        <AppInput v-model="form.surgeryDate" type="date" label="Datum zákroku" required :error="errors.surgeryDate" />
        <AppInput v-model="form.returnDate" type="date" label="Datum návratu do ČR" required :error="errors.returnDate" />
      </div>

      <div v-if="stayLength != null" class="bg-[#EFF8FE] text-[#0E6EA0] text-sm rounded-xl px-4 py-3 mb-5">
        Pobyt v Istanbulu: <strong>{{ stayLength }} dní</strong>
        <span v-if="daysBeforeSurgery && daysBeforeSurgery > 0">
          , z toho <strong>{{ daysBeforeSurgery }} {{ daysBeforeSurgery === 1 ? 'den' : 'dní' }}</strong> před zákrokem.
        </span>
      </div>

      <RadioGroup
        v-model="form.surgeryType"
        label="Typ zákroku"
        inline
        :options="[
          { value: 'DHI', label: 'DHI' },
          { value: 'FUE', label: 'FUE' },
          { value: 'Combo', label: 'Combo' },
        ]"
      />

      <div class="grid grid-cols-3 gap-4 mt-4">
        <AppInput
          v-model.number="form.graftCount"
          type="number"
          label="Počet štěpů"
          required
          :error="errors.graftCount"
          hint="100–6000"
        />
        <AppSelect
          v-model="form.doctorId"
          label="Přiřazený lékař"
          required
          :error="errors.doctorId"
          placeholder="Vyberte…"
          :options="doctors.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}` }))"
        />
        <AppSelect
          v-model="form.coordinatorId"
          label="Koordinátor (ČR)"
          required
          :error="errors.coordinatorId"
          placeholder="Vyberte…"
          :options="coordinators.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}` }))"
        />
      </div>
    </AppCard>

    <!-- Step 3 -->
    <AppCard v-else>
      <h2 class="text-lg font-semibold text-brand-dark mb-4">3. Plán a dokončení</h2>

      <div class="mb-4">
        <span class="block text-sm font-medium text-slate-700 mb-2">Šablona plánu <span class="text-brand-red">*</span></span>
        <div class="grid gap-2">
          <button
            v-for="plan in plans.list"
            :key="plan.id"
            type="button"
            :class="[
              'text-left rounded-xl border px-4 py-3 transition-colors flex items-center justify-between',
              form.planTemplateId === plan.id
                ? 'border-brand-orange bg-[#FFF7EB]'
                : 'border-border-subtle bg-white hover:border-slate-300',
            ]"
            @click="form.planTemplateId = plan.id"
          >
            <div>
              <p class="font-medium text-brand-dark flex items-center gap-2">
                {{ plan.name }}
                <Pill v-if="plan.isDefault" tone="orange" size="sm">Výchozí</Pill>
              </p>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ plans.componentCount(plan.id) }} komponent · {{ plans.notificationCount(plan.id) }} notifikací · {{ plan.phases.length }} fází
              </p>
            </div>
            <PhaseBadge :label="plan.surgeryType === 'any' ? 'Univerzální' : plan.surgeryType" />
          </button>
        </div>
        <p v-if="errors.planTemplateId" class="text-xs text-brand-red mt-1">{{ errors.planTemplateId }}</p>
      </div>

      <div
        v-if="selectedPlan"
        class="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-sm text-slate-700"
      >
        Plán obsahuje <strong>{{ planComponentCount }}</strong> komponent a
        <strong>{{ planNotifCount }}</strong> naplánovaných notifikací přes
        <strong>{{ selectedPlan.phases.length }}</strong> fáze.
      </div>

      <AppTextarea v-model="form.internalNote" label="Interní poznámka (vidí jen admin)" :rows="3" />

      <div class="space-y-2.5 mt-5">
        <ToggleSwitch v-model="form.welcomeEmailSent" label="Odeslat uvítací e-mail klientovi" />
        <ToggleSwitch v-model="form.pushEnabled" label="Aktivovat push notifikace" />
        <ToggleSwitch v-model="form.whatsappBroadcast" label="Přidat do WhatsApp broadcast skupiny" />
      </div>
    </AppCard>

    <!-- Nav -->
    <div class="flex items-center justify-between mt-6">
      <AppButton variant="secondary" :disabled="step === 1" @click="step--">Zpět</AppButton>
      <AppButton variant="primary" icon-right="chevron-right" @click="next">
        {{ step === maxStep ? 'Vytvořit pacienta' : 'Pokračovat' }}
      </AppButton>
    </div>
  </div>
</template>
