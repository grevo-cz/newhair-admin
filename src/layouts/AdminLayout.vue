<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppTopbar from '@/components/layout/AppTopbar.vue';
</script>

<template>
  <div class="min-h-screen flex bg-surface">
    <AppSidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <AppTopbar />
      <main class="flex-1 p-8 overflow-x-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>
