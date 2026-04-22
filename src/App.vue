<script setup lang="ts">
import { RouterView } from 'vue-router';
import ToastHost from '@/components/shared/ToastHost.vue';
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue';
</script>

<template>
  <RouterView />
  <ToastHost />
  <ConfirmDialog />
</template>
