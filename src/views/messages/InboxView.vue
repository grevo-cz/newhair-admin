<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessagesStore } from '@/stores/messagesStore';
import { usePatientsStore } from '@/stores/patientsStore';
import { useUiStore } from '@/stores/uiStore';
import PageHeader from '@/components/shared/PageHeader.vue';
import AppButton from '@/components/shared/AppButton.vue';
import Avatar from '@/components/shared/Avatar.vue';
import Pill from '@/components/shared/Pill.vue';
import DayBadge from '@/components/shared/DayBadge.vue';
import { patientDayBadge, patientDays } from '@/composables/useDayMath';
import { MessageCircle, Send, Archive } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const messages = useMessagesStore();
const patients = usePatientsStore();
const ui = useUiStore();

const selectedId = computed(() => (route.params.patientId as string | undefined) ?? messages.threadList[0]?.patientId);
const filter = ref<'all' | 'unread' | 'archived'>('all');
const draft = ref('');

const listRef = ref<HTMLElement | null>(null);

const visibleThreads = computed(() => {
  return messages.threadList.filter((t) => {
    if (filter.value === 'unread') return messages.unreadByPatient(t.patientId) > 0;
    if (filter.value === 'archived') return t.archived;
    return !t.archived;
  });
});

const activeThread = computed(() => (selectedId.value ? messages.threadFor(selectedId.value) : undefined));
const activePatient = computed(() => patients.byId(selectedId.value));

function select(patientId: string) {
  router.push(`/messages/${patientId}`);
  messages.markRead(patientId);
}

function send() {
  if (!selectedId.value || !draft.value.trim()) return;
  messages.sendFromAdmin(selectedId.value, draft.value.trim());
  draft.value = '';
  nextTick(() => listRef.value?.scrollTo({ top: listRef.value.scrollHeight, behavior: 'smooth' }));
  // demo: simulate patient reply
  setTimeout(() => {
    if (!selectedId.value) return;
    messages.simulatePatientReply(selectedId.value, 'Díky za rychlou odpověď 👍');
    nextTick(() => listRef.value?.scrollTo({ top: listRef.value!.scrollHeight, behavior: 'smooth' }));
  }, 1600);
}

function pickSnippet(text: string) {
  draft.value = draft.value ? `${draft.value} ${text}` : text;
}

watch(selectedId, () => {
  if (selectedId.value) messages.markRead(selectedId.value);
});

function groupByDay(msgs: typeof messages['threadList'][number]['messages']) {
  const groups: { day: string; items: typeof msgs }[] = [];
  for (const m of msgs) {
    const day = new Date(m.timestamp).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.items.push(m);
    else groups.push({ day, items: [m] });
  }
  return groups;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <div>
    <PageHeader title="Zprávy" subtitle="WhatsApp Business API + in-app zprávy.">
      <template #actions>
        <div class="flex items-center gap-1 bg-white border border-border-subtle rounded-full p-1">
          <button
            v-for="f in (['all', 'unread', 'archived'] as const)"
            :key="f"
            :class="[
              'px-3 py-1.5 text-sm rounded-full transition-colors',
              filter === f ? 'bg-brand-dark text-white' : 'text-slate-600 hover:bg-slate-100',
            ]"
            @click="filter = f"
          >
            {{ f === 'all' ? 'Všechny' : f === 'unread' ? `Nepřečtené (${messages.unreadCount})` : 'Archivované' }}
          </button>
        </div>
      </template>
    </PageHeader>

    <div class="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
      <!-- Inbox list -->
      <aside class="col-span-12 md:col-span-4 bg-card border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
        <div class="overflow-auto flex-1">
          <ul v-if="visibleThreads.length" class="divide-y divide-border-subtle">
            <li
              v-for="t in visibleThreads"
              :key="t.patientId"
              :class="[
                'p-4 cursor-pointer flex items-start gap-3 hover:bg-slate-50',
                selectedId === t.patientId && 'bg-brand-orange/5',
              ]"
              @click="select(t.patientId)"
            >
              <Avatar :name="patients.byId(t.patientId) ? `${patients.byId(t.patientId)!.firstName} ${patients.byId(t.patientId)!.lastName}` : '?'" tone="sky" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-sm text-brand-dark truncate">
                    {{ patients.byId(t.patientId)?.firstName }} {{ patients.byId(t.patientId)?.lastName }}
                  </p>
                  <DayBadge
                    v-if="patients.byId(t.patientId)"
                    :day="patientDays(patients.byId(t.patientId)!).fromSurgery"
                    compact
                  />
                </div>
                <p class="text-xs text-slate-500 truncate mt-0.5">
                  {{ messages.lastMessage(t.patientId)?.text }}
                </p>
              </div>
              <span v-if="messages.unreadByPatient(t.patientId)" class="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-2" />
            </li>
          </ul>
          <div v-else class="p-6 text-center text-sm text-slate-500">Žádné konverzace.</div>
        </div>
      </aside>

      <!-- Thread -->
      <section class="col-span-12 md:col-span-8 bg-card border border-border-subtle rounded-2xl flex flex-col overflow-hidden">
        <template v-if="activeThread && activePatient">
          <header class="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
            <Avatar :name="`${activePatient.firstName} ${activePatient.lastName}`" tone="orange" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-brand-dark">{{ activePatient.firstName }} {{ activePatient.lastName }}</p>
              <p class="text-xs text-slate-500">{{ activePatient.phone }} · <span class="text-[#25D366]">● WhatsApp</span></p>
            </div>
            <Pill>{{ patientDayBadge(activePatient) }}</Pill>
            <AppButton variant="secondary" size="sm" icon="user" @click="router.push(`/patients/${activePatient.id}`)">Profil</AppButton>
            <AppButton variant="ghost" size="sm" icon="archive" @click="messages.archive(activePatient.id); router.push('/messages')">Archivovat</AppButton>
          </header>

          <div ref="listRef" class="flex-1 overflow-auto px-5 py-4 space-y-4 bg-[#F0F2F5]">
            <div v-for="g in groupByDay(activeThread.messages)" :key="g.day">
              <div class="text-center text-xs text-slate-500 my-2">{{ g.day }}</div>
              <div class="space-y-2">
                <div
                  v-for="m in g.items"
                  :key="m.id"
                  :class="['flex', m.sender === 'admin' ? 'justify-end' : 'justify-start']"
                >
                  <div
                    :class="[
                      'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm',
                      m.sender === 'admin'
                        ? 'bg-[#DCF8C6] text-brand-dark'
                        : 'bg-white text-brand-dark border border-border-subtle',
                    ]"
                  >
                    <p class="whitespace-pre-line">{{ m.text }}</p>
                    <p class="text-[10px] text-slate-500 text-right mt-0.5">{{ formatTime(m.timestamp) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Snippets -->
          <div v-if="messages.snippets.length" class="px-5 py-2 border-t border-border-subtle flex flex-wrap gap-1.5">
            <button
              v-for="(s, i) in messages.snippets"
              :key="i"
              class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full px-3 py-1 line-clamp-1 max-w-xs"
              @click="pickSnippet(s)"
            >{{ s }}</button>
          </div>

          <!-- Composer -->
          <div class="px-5 py-4 border-t border-border-subtle bg-white flex items-end gap-2">
            <textarea
              v-model="draft"
              :rows="1"
              placeholder="Napsat zprávu…"
              class="flex-1 min-h-[42px] max-h-32 px-4 py-2.5 rounded-xl border border-border-subtle text-sm outline-none resize-y focus:border-brand-orange"
              @keydown.enter.exact.prevent="send"
            />
            <AppButton variant="primary" icon="send" @click="send">Odeslat</AppButton>
          </div>
        </template>
        <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
          <MessageCircle :size="32" />
          <p>Vyber konverzaci vlevo.</p>
        </div>
      </section>
    </div>
  </div>
</template>
