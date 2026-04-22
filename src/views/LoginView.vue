<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import AppInput from '@/components/shared/AppInput.vue';
import AppButton from '@/components/shared/AppButton.vue';
import AppCard from '@/components/shared/AppCard.vue';
import { USE_MOCK_API } from '@/services/api';
import logoUrl from '@/assets/logo.svg';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();

const username = ref('');
const password = ref('');
const error = ref<string | null>(null);

async function submit() {
  error.value = null;
  try {
    await auth.login(username.value.trim(), password.value);
    const redirect = (route.query.redirect as string | undefined) || '/';
    router.replace(redirect);
    ui.toast({ type: 'success', text: `Vítejte, ${auth.user?.firstName}!` });
  } catch (e: any) {
    error.value = e?.message ?? 'Přihlášení selhalo.';
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-surface">
    <AppCard class="w-full max-w-md">
      <div class="flex flex-col items-center mb-6">
        <img :src="logoUrl" alt="NewHair" class="w-14 h-14 rounded-xl mb-3" />
        <h1 class="text-xl font-bold text-brand-dark">NewHair Admin</h1>
        <p class="text-sm text-slate-500 mt-1">Přihlášení do administrace</p>
      </div>

      <form class="space-y-3" @submit.prevent="submit">
        <AppInput
          v-model="username"
          label="Uživatelské jméno"
          required
          autofocus
          :placeholder="USE_MOCK_API ? 'admin' : ''"
        />
        <AppInput
          v-model="password"
          type="password"
          label="Heslo"
          required
          :placeholder="USE_MOCK_API ? 'admin' : ''"
        />
        <p v-if="error" class="text-sm text-brand-red bg-[#FEF2F2] border border-red-200 rounded-xl px-3 py-2">{{ error }}</p>

        <AppButton variant="primary" type="submit" block :loading="auth.loading">
          {{ auth.loading ? 'Přihlašuji…' : 'Přihlásit se' }}
        </AppButton>
      </form>

      <p v-if="USE_MOCK_API" class="mt-5 text-[11px] text-slate-500 bg-slate-50 border border-border-subtle rounded-xl px-3 py-2 text-center">
        <strong>Mock režim:</strong> jakékoli username s heslem <code class="font-mono">admin</code>.
      </p>
    </AppCard>
  </div>
</template>
