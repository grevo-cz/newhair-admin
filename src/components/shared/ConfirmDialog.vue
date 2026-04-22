<script setup lang="ts">
import { useUiStore } from '@/stores/uiStore';
import Modal from './Modal.vue';
import AppButton from './AppButton.vue';

const ui = useUiStore();
</script>

<template>
  <Modal
    :model-value="ui.confirmState.open"
    @update:model-value="(v) => !v && ui.closeConfirm(false)"
    size="sm"
    :title="ui.confirmState.title"
  >
    <p class="text-sm text-slate-600 whitespace-pre-line">{{ ui.confirmState.text }}</p>
    <template #footer>
      <AppButton variant="secondary" @click="ui.closeConfirm(false)">
        {{ ui.confirmState.cancelLabel ?? 'Zrušit' }}
      </AppButton>
      <AppButton
        :variant="ui.confirmState.danger ? 'danger' : 'primary'"
        @click="ui.closeConfirm(true)"
      >
        {{ ui.confirmState.confirmLabel ?? 'Potvrdit' }}
      </AppButton>
    </template>
  </Modal>
</template>
