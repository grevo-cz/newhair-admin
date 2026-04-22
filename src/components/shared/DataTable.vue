<script setup lang="ts" generic="T extends Record<string, unknown>">
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-vue-next';
import type { Column } from '@/types';
import EmptyState from './EmptyState.vue';

defineProps<{
  rows: T[];
  columns: Column<T>[];
  sortKey?: string | null;
  sortDir?: 'asc' | 'desc' | null;
  rowKey?: (row: T) => string;
  selectable?: boolean;
  selected?: Set<string>;
  emptyTitle?: string;
  emptyText?: string;
}>();

const emit = defineEmits<{
  (e: 'row-click', row: T): void;
  (e: 'sort', key: string): void;
  (e: 'toggle-row', id: string): void;
  (e: 'toggle-all', ids: string[]): void;
}>();

function getId(row: T, rowKey?: (row: T) => string, fallback = ''): string {
  if (rowKey) return rowKey(row);
  return String((row as { id?: unknown }).id ?? fallback);
}

function getValue(row: T, key: string): unknown {
  return key.split('.').reduce<any>((acc, p) => (acc == null ? undefined : acc[p]), row);
}

function onHeaderSort(col: Column<T>) {
  if (col.sortable) emit('sort', col.key);
}
</script>

<template>
  <div class="bg-card border border-border-subtle rounded-2xl overflow-hidden">
    <table class="w-full text-sm">
      <thead>
        <tr class="bg-slate-50 text-left text-slate-500">
          <th v-if="selectable" class="w-10 px-4 py-3">
            <input
              type="checkbox"
              class="accent-brand-orange"
              :checked="selected && rows.length > 0 && rows.every((r) => selected!.has(getId(r, rowKey)))"
              @change="emit('toggle-all', rows.map((r) => getId(r, rowKey)))"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3 font-medium whitespace-nowrap',
              col.align === 'right' && 'text-right',
              col.align === 'center' && 'text-center',
              col.sortable && 'cursor-pointer select-none hover:text-brand-dark',
            ]"
            :style="col.width ? { width: col.width } : undefined"
            @click="onHeaderSort(col)"
          >
            <span class="inline-flex items-center gap-1">
              {{ col.label }}
              <template v-if="col.sortable">
                <ArrowUp v-if="sortKey === col.key && sortDir === 'asc'" :size="12" />
                <ArrowDown v-else-if="sortKey === col.key && sortDir === 'desc'" :size="12" />
                <ArrowUpDown v-else :size="12" class="opacity-40" />
              </template>
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border-subtle">
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + (selectable ? 1 : 0)">
            <EmptyState
              icon="list-checks"
              :title="emptyTitle ?? 'Žádné záznamy'"
              :text="emptyText ?? 'Zkus změnit filtry nebo přidej nový záznam.'"
            />
          </td>
        </tr>
        <tr
          v-for="row in rows"
          :key="getId(row, rowKey)"
          class="hover:bg-slate-50/70 cursor-pointer"
          @click="emit('row-click', row)"
        >
          <td v-if="selectable" class="px-4 py-3 align-middle" @click.stop>
            <input
              type="checkbox"
              class="accent-brand-orange"
              :checked="selected?.has(getId(row, rowKey))"
              @change="emit('toggle-row', getId(row, rowKey))"
            />
          </td>
          <td
            v-for="col in columns"
            :key="col.key"
            :class="[
              'px-4 py-3 align-middle text-slate-700',
              col.align === 'right' && 'text-right',
              col.align === 'center' && 'text-center',
            ]"
          >
            <slot :name="`cell.${col.key}`" :row="row" :value="getValue(row, col.key)">
              <span v-if="col.render">{{ col.render(row) }}</span>
              <span v-else>{{ getValue(row, col.key) ?? '—' }}</span>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
