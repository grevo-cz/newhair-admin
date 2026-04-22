<script setup lang="ts">
import { Search, Bell } from 'lucide-vue-next';
</script>

<template>
  <header class="h-16 bg-card border-b border-border-subtle flex items-center px-6 sticky top-0 z-10">
    <div class="flex-1 max-w-md relative">
      <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="search"
        placeholder="Hledat pacienta, plán, video…"
        class="w-full h-10 pl-9 pr-3 bg-slate-100 border border-border-subtle rounded-xl text-sm text-brand-dark placeholder:text-slate-500 outline-none focus:border-brand-orange focus:bg-white focus:ring-2 focus:ring-brand-orange/15"
      />
    </div>
    <div class="flex items-center gap-2 ml-4">
      <button class="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center relative text-slate-600">
        <Bell :size="18" />
        <span class="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full" />
      </button>
    </div>
  </header>
</template>
