<script setup lang="ts">
import AppButton from '@/components/shared/AppButton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <span class="text-6xl font-bold text-slate-300 mb-4">404</span>
    <h1 class="text-2xl font-bold text-brand-dark mb-2">Stránka nenalezena</h1>
    <p class="text-slate-500 mb-6">Adresa neodpovídá žádné sekci adminu.</p>
    <AppButton variant="primary" icon="home" @click="router.push('/')">Zpět na Dashboard</AppButton>
  </div>
</template>
