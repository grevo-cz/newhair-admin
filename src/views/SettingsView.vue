<script setup lang="ts">
import { computed, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUiStore } from '@/stores/uiStore';
import { STAFF, STAFF_ROLE_LABELS } from '@/data/staff';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppCard from '@/components/shared/AppCard.vue';
import AppInput from '@/components/shared/AppInput.vue';
import AppButton from '@/components/shared/AppButton.vue';
import Pill from '@/components/shared/Pill.vue';
import Avatar from '@/components/shared/Avatar.vue';
import StatusDot from '@/components/shared/StatusDot.vue';
import Tabs from '@/components/shared/Tabs.vue';
import { Copy, Send } from 'lucide-vue-next';

const settings = useSettingsStore();
const ui = useUiStore();

const tab = ref<'whatsapp' | 'roles' | 'points'>('whatsapp');

const wa = computed(() => settings.whatsapp!);

function copy(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {});
  ui.toast({ type: 'success', text: 'Zkopírováno.' });
}

function sendTest() {
  ui.toast({ type: 'success', title: 'Test odeslán', text: 'Testovací zpráva zařazena do fronty WA API.' });
}

function toggleConnect() {
  settings.toggleConnected();
  ui.toast({ type: 'info', text: settings.isConnected ? 'Připojeno.' : 'Odpojeno.' });
}

// Roles permissions matrix (demo)
const permissions = [
  { key: 'addPatient', label: 'Přidat pacienta' },
  { key: 'deletePatient', label: 'Smazat pacienta' },
  { key: 'editPlans', label: 'Upravit šablonu plánu' },
  { key: 'uploadContract', label: 'Nahrát smlouvu' },
  { key: 'seeContracts', label: 'Vidět smlouvy' },
  { key: 'reply', label: 'Odpovídat na zprávy' },
  { key: 'seePhotos', label: 'Vidět fotky' },
  { key: 'exportPhotos', label: 'Exportovat fotky (marketing)' },
  { key: 'appSettings', label: 'Nastavení systému' },
  { key: 'waSettings', label: 'WhatsApp API nastavení' },
];

const rolesMatrix: Record<string, Record<string, boolean>> = {
  admin_cz: Object.fromEntries(permissions.map((p) => [p.key, true])),
  coordinator_cz: Object.fromEntries(permissions.map((p) => [p.key, !['deletePatient', 'appSettings', 'waSettings'].includes(p.key)])),
  staff_tr: Object.fromEntries(permissions.map((p) => [p.key, ['addPatient', 'uploadContract', 'seeContracts', 'reply', 'seePhotos'].includes(p.key)])),
  doctor_tr: Object.fromEntries(permissions.map((p) => [p.key, ['reply', 'seePhotos'].includes(p.key)])),
};
</script>

<template>
  <div v-if="settings.settings">
    <PageHeader title="Nastavení" subtitle="Integrace, role a globální konfigurace NewHair." />

    <Tabs
      v-model="tab"
      class="mb-6"
      :tabs="[
        { value: 'whatsapp', label: 'WhatsApp API' },
        { value: 'roles', label: 'Role & oprávnění' },
        { value: 'points', label: 'Body (gamifikace)' },
      ]"
    />

    <!-- WhatsApp -->
    <div v-if="tab === 'whatsapp'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <AppCard>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-brand-dark">Připojení WhatsApp Business API</h3>
          <span class="inline-flex items-center gap-1.5 text-sm">
            <StatusDot :active="settings.isConnected" />
            {{ settings.isConnected ? 'Připojeno' : 'Odpojeno' }}
          </span>
        </div>

        <div class="space-y-3">
          <AppInput
            :model-value="wa.phoneNumberId"
            label="Phone Number ID"
            required
            @update:model-value="(v) => settings.updateWhatsApp({ phoneNumberId: v })"
          />
          <AppInput
            :model-value="wa.accessToken"
            type="password"
            label="Access Token (šifrovaně uloženo)"
            required
            @update:model-value="(v) => settings.updateWhatsApp({ accessToken: v })"
          />
          <div>
            <span class="block text-sm font-medium text-slate-700 mb-1.5">Webhook URL (read-only)</span>
            <div class="flex items-center gap-2 bg-slate-50 border border-border-subtle rounded-xl px-3.5 h-11">
              <code class="text-xs text-slate-600 flex-1 truncate">{{ wa.webhookUrl }}</code>
              <button class="text-slate-400 hover:text-slate-600" @click="copy(wa.webhookUrl)"><Copy :size="14" /></button>
            </div>
          </div>
          <div>
            <span class="block text-sm font-medium text-slate-700 mb-1.5">Verify Token (auto-generovaný)</span>
            <div class="flex items-center gap-2 bg-slate-50 border border-border-subtle rounded-xl px-3.5 h-11">
              <code class="text-xs text-slate-600 flex-1 truncate">{{ wa.verifyToken }}</code>
              <button class="text-slate-400 hover:text-slate-600" @click="copy(wa.verifyToken)"><Copy :size="14" /></button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mt-5 pt-4 border-t border-border-subtle">
          <AppButton variant="primary" icon="send" @click="sendTest">Odeslat testovací zprávu</AppButton>
          <AppButton variant="secondary" @click="toggleConnect">{{ settings.isConnected ? 'Odpojit' : 'Připojit' }}</AppButton>
        </div>
      </AppCard>

      <AppCard>
        <h3 class="font-semibold text-brand-dark mb-3">Jak funguje integrace</h3>
        <ol class="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
          <li>Admin nastaví WhatsApp Business API token.</li>
          <li>Pacient má v profilu telefonní číslo (unikátní).</li>
          <li>Příchozí zpráva → spárování dle tel. čísla → zobrazení v Inboxu.</li>
          <li>Admin odpoví v panelu → odešle se přes WA API.</li>
          <li>V pacientské appce tlačítko <em>"Pomoc"</em> otevírá WhatsApp konverzaci.</li>
          <li>Pokud admin neodpoví do 2 h → eskalace na e-mail koordinátora.</li>
        </ol>

        <div class="mt-5 bg-[#F0FCF5] border border-[#D9F4E3] rounded-xl p-4 text-sm text-[#159344]">
          <strong>● Připojeno</strong> — Meta webhook je ověřen, zprávy přicházejí v reálném čase.
        </div>
      </AppCard>
    </div>

    <!-- Roles -->
    <div v-else-if="tab === 'roles'" class="space-y-4">
      <AppCard>
        <h3 class="font-semibold text-brand-dark mb-3">Uživatelé týmu</h3>
        <ul class="divide-y divide-border-subtle">
          <li v-for="s in STAFF" :key="s.id" class="flex items-center gap-3 py-3">
            <Avatar :name="`${s.firstName} ${s.lastName}`" :tone="s.role === 'admin_cz' ? 'orange' : s.role === 'coordinator_cz' ? 'sky' : s.role === 'doctor_tr' ? 'purple' : 'green'" />
            <div class="flex-1">
              <p class="text-sm font-medium text-brand-dark">{{ s.firstName }} {{ s.lastName }}</p>
              <p class="text-xs text-slate-500">{{ s.email }}{{ s.phone ? ` · ${s.phone}` : '' }}</p>
            </div>
            <Pill :tone="s.role === 'admin_cz' ? 'orange' : s.role === 'coordinator_cz' ? 'sky' : s.role === 'doctor_tr' ? 'purple' : 'green'">
              {{ STAFF_ROLE_LABELS[s.role] }}
            </Pill>
          </li>
        </ul>
      </AppCard>

      <AppCard>
        <h3 class="font-semibold text-brand-dark mb-3">Matice oprávnění</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-slate-500 text-left">
              <th class="py-2 pr-4 font-medium">Funkce</th>
              <th class="py-2 px-2 text-center font-medium">Admin CZ</th>
              <th class="py-2 px-2 text-center font-medium">Koord. CZ</th>
              <th class="py-2 px-2 text-center font-medium">Personál TR</th>
              <th class="py-2 px-2 text-center font-medium">Lékař TR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-subtle">
            <tr v-for="p in permissions" :key="p.key">
              <td class="py-2.5 pr-4 text-brand-dark">{{ p.label }}</td>
              <td v-for="role in (['admin_cz', 'coordinator_cz', 'staff_tr', 'doctor_tr'] as const)" :key="role" class="text-center">
                <span v-if="rolesMatrix[role][p.key]" class="text-[#22C55E]">✓</span>
                <span v-else class="text-slate-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </AppCard>
    </div>

    <!-- Points -->
    <div v-else class="space-y-4">
      <AppCard>
        <h3 class="font-semibold text-brand-dark mb-3">Body za spolupráci</h3>
        <p class="text-sm text-slate-500 mb-4">
          Pacient sbírá body za splnění úkolů, nahrání fotek a aktivní používání appky. Body lze (volitelně) směňovat za odměny.
        </p>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>Nahrání fotky (dle výzvy)</span><Pill tone="orange">+30 až +250</Pill>
          </li>
          <li class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>Splnění instrukce (checkbox)</span><Pill tone="orange">+10</Pill>
          </li>
          <li class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>Přihlášení do appky</span><Pill tone="orange">+5 / den</Pill>
          </li>
          <li class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>Dokončení celé fáze</span><Pill tone="orange">+100</Pill>
          </li>
          <li class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>Poskytnutí recenze</span><Pill tone="orange">+200</Pill>
          </li>
        </ul>
      </AppCard>

      <AppCard>
        <h3 class="font-semibold text-brand-dark mb-3">Směnný systém</h3>
        <p class="text-xs text-slate-500 mb-3">
          {{ settings.settings!.pointsExchange.enabled ? 'Klienti mohou body uplatnit za odměny.' : 'Body se zatím pouze sbírají (bez směny).' }}
        </p>
        <ul class="space-y-2 text-sm">
          <li v-for="r in settings.settings!.pointsExchange.rules" :key="r.points" class="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
            <span>{{ r.reward }}</span>
            <Pill tone="dark">{{ r.points }} bodů</Pill>
          </li>
        </ul>
      </AppCard>
    </div>
  </div>
</template>
