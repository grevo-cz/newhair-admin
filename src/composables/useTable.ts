import { computed, ref, type Ref } from 'vue';

export interface TableSort {
  key: string;
  dir: 'asc' | 'desc';
}

export interface UseTableOptions<T> {
  rows: Ref<T[]> | (() => T[]);
  searchKeys?: (keyof T)[];
  pageSize?: number;
}

export function useTable<T extends Record<string, unknown>>(opts: UseTableOptions<T>) {
  const search = ref('');
  const sort = ref<TableSort | null>(null);
  const page = ref(1);
  const pageSize = ref(opts.pageSize ?? 20);
  const filters = ref<Record<string, string | null>>({});

  const rawRows = computed(() =>
    typeof opts.rows === 'function' ? opts.rows() : opts.rows.value,
  );

  const filtered = computed<T[]>(() => {
    let items = rawRows.value;
    const s = search.value.trim().toLowerCase();
    if (s && opts.searchKeys) {
      items = items.filter((row) =>
        opts.searchKeys!.some((k) => {
          const v = row[k];
          return typeof v === 'string' && v.toLowerCase().includes(s);
        }),
      );
    }
    for (const [key, value] of Object.entries(filters.value)) {
      if (value === null || value === '' || value === 'all') continue;
      items = items.filter((row) => String(row[key as keyof T] ?? '') === value);
    }
    if (sort.value) {
      const { key, dir } = sort.value;
      items = [...items].sort((a, b) => {
        const av = a[key as keyof T];
        const bv = b[key as keyof T];
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return dir === 'asc' ? -1 : 1;
        if (av > bv) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  });

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
  const paged = computed<T[]>(() => {
    const start = (page.value - 1) * pageSize.value;
    return filtered.value.slice(start, start + pageSize.value);
  });

  function toggleSort(key: string) {
    if (!sort.value || sort.value.key !== key) {
      sort.value = { key, dir: 'asc' };
    } else if (sort.value.dir === 'asc') {
      sort.value = { key, dir: 'desc' };
    } else {
      sort.value = null;
    }
  }

  function setFilter(key: string, value: string | null) {
    filters.value[key] = value;
    page.value = 1;
  }

  function setSearch(v: string) {
    search.value = v;
    page.value = 1;
  }

  return {
    search,
    setSearch,
    sort,
    toggleSort,
    filters,
    setFilter,
    page,
    pageSize,
    totalPages,
    filtered,
    paged,
  };
}
