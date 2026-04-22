<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePatientsStore } from '@/stores/patientsStore';
import { usePlansStore } from '@/stores/plansStore';
import { patientDays, currentPhase } from '@/composables/useDayMath';
import { useTable } from '@/composables/useTable';
import { staffLabel, STAFF } from '@/data/staff';
import DataTable from '@/components/shared/DataTable.vue';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppButton from '@/components/shared/AppButton.vue';
import SearchInput from '@/components/shared/SearchInput.vue';
import AppSelect from '@/components/shared/AppSelect.vue';
import Pill from '@/components/shared/Pill.vue';
import PhaseBadge from '@/components/shared/PhaseBadge.vue';
import DayBadge from '@/components/shared/DayBadge.vue';
import Avatar from '@/components/shared/Avatar.vue';
import StatusDot from '@/components/shared/StatusDot.vue';
import type { Patient, Column } from '@/types';

const router = useRouter();
const route = useRoute();
const patients = usePatientsStore();
const plans = usePlansStore();

const today = new Date();

const rows = computed(() =>
  patients.list.map((p) => {
    const d = patientDays(p, today);
    const phase = currentPhase(p, plans.byId(p.planTemplateId), today);
    return {
      ...p,
      _fullName: `${p.firstName} ${p.lastName}`,
      _day: d.fromSurgery,
      _phaseSlug: phase?.slug ?? '',
      _doctor: staffLabel(p.doctorId),
    };
  }),
);

const { search, setSearch, filters, setFilter, filtered, page, pageSize, totalPages } = useTable({
  rows,
  searchKeys: ['_fullName', 'email', 'phone'],
});

if (route.query.critical === '1') setFilter('_phaseSlug', 'pobyt');

const columns = computed<Column<any>[]>(() => [
  { key: '_fullName', label: 'Pacient', sortable: true },
  { key: '_day', label: 'Den', sortable: true, width: '90px' },
  { key: '_phaseSlug', label: 'Fáze', width: '160px' },
  { key: 'surgeryDate', label: 'Datum zákroku', sortable: true, width: '150px' },
  { key: 'surgeryType', label: 'Typ', width: '90px' },
  { key: 'graftCount', label: 'Štěpů', sortable: true, align: 'right', width: '100px' },
  { key: '_doctor', label: 'Lékař', width: '180px' },
  { key: 'status', label: 'Stav', width: '110px' },
]);

const phaseOptions = [
  { value: 'all', label: 'Všechny fáze' },
  { value: 'pred-odletem', label: 'Před odletem' },
  { value: 'pobyt', label: 'Pobyt' },
  { value: 'po-navratu', label: 'Po návratu' },
];

const statusOptions = [
  { value: 'all', label: 'Všechny stavy' },
  { value: 'active', label: 'Aktivní' },
  { value: 'archived', label: 'Archivovaní' },
];

const doctorOptions = computed(() => [
  { value: 'all', label: 'Všichni lékaři' },
  ...STAFF.filter((s) => s.role === 'doctor_tr').map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.lastName}`,
  })),
]);

function rowClicked(row: Patient) {
  router.push(`/patients/${row.id}`);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
</script>

<template>
  <div>
    <PageHeader title="Pacienti" :subtitle="`${patients.active.length} aktivních, ${patients.archived.length} archivovaných`">
      <template #actions>
        <AppButton variant="primary" icon="user-plus" @click="router.push('/patients/new')">
          Přidat pacienta
        </AppButton>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="bg-card border border-border-subtle rounded-2xl p-3 mb-4 flex items-center gap-2 flex-wrap">
      <SearchInput
        :model-value="search"
        placeholder="Hledat jméno, e-mail, telefon…"
        @update:model-value="setSearch"
      />
      <div class="w-48">
        <AppSelect
          :model-value="filters._phaseSlug ?? 'all'"
          :options="phaseOptions"
          @update:model-value="(v) => setFilter('_phaseSlug', v)"
        />
      </div>
      <div class="w-44">
        <AppSelect
          :model-value="filters.status ?? 'active'"
          :options="statusOptions"
          @update:model-value="(v) => setFilter('status', v)"
        />
      </div>
      <div class="w-56">
        <AppSelect
          :model-value="filters.doctorId ?? 'all'"
          :options="doctorOptions"
          @update:model-value="(v) => setFilter('doctorId', v)"
        />
      </div>
      <span class="ml-auto text-xs text-slate-500">{{ filtered.length }} výsledků</span>
    </div>

    <!-- Table -->
    <DataTable :rows="filtered" :columns="columns" :row-key="(r) => (r as any).id" @row-click="rowClicked">
      <template #cell._fullName="{ row }">
        <div class="flex items-center gap-3">
          <Avatar :name="`${row.firstName} ${row.lastName}`" tone="sky" />
          <div class="min-w-0">
            <p class="font-medium text-brand-dark truncate">{{ row.firstName }} {{ row.lastName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <template #cell._day="{ row }"><DayBadge :day="row._day" /></template>

      <template #cell._phaseSlug="{ row }">
        <PhaseBadge :slug="row._phaseSlug" />
      </template>

      <template #cell.surgeryDate="{ row }">
        <span class="tabular-nums text-slate-700">{{ formatDate(row.surgeryDate) }}</span>
      </template>

      <template #cell.surgeryType="{ row }">
        <Pill tone="default">{{ row.surgeryType }}</Pill>
      </template>

      <template #cell.graftCount="{ row }">
        <span class="tabular-nums">{{ row.graftCount.toLocaleString('cs-CZ') }}</span>
      </template>

      <template #cell.status="{ row }">
        <span class="inline-flex items-center gap-1.5">
          <StatusDot :active="row.status === 'active'" />
          <span class="text-sm">{{ row.status === 'active' ? 'Aktivní' : 'Archivovaný' }}</span>
        </span>
      </template>
    </DataTable>

    <!-- Pagination stub -->
    <div v-if="totalPages > 1" class="flex items-center justify-end gap-1.5 mt-4">
      <AppButton variant="secondary" size="sm" :disabled="page === 1" @click="page--">Předchozí</AppButton>
      <span class="text-sm text-slate-500 px-2">{{ page }} / {{ totalPages }}</span>
      <AppButton variant="secondary" size="sm" :disabled="page === totalPages" @click="page++">Další</AppButton>
    </div>
  </div>
</template>
