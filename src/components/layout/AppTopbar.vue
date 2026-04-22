<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useMessagesStore } from '@/stores/messagesStore';
import { usePatientsStore } from '@/stores/patientsStore';
import { usePhotosStore } from '@/stores/photosStore';
import { patientDays } from '@/composables/useDayMath';
import { Search, Bell, MessageCircle, Camera, CalendarCheck, Check } from 'lucide-vue-next';

const router = useRouter();
const messages = useMessagesStore();
const patients = usePatientsStore();
const photos = usePhotosStore();

const open = ref(false);
const wrapper = ref<HTMLElement | null>(null);

const today = new Date();

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'před chvílí';
  if (diffHrs < 24) return `před ${diffHrs} h`;
  const diffDays = Math.round(diffHrs / 24);
  if (diffDays === 1) return 'včera';
  if (diffDays < 7) return `před ${diffDays} dny`;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
}

interface Notif {
  id: string;
  type: 'message' | 'photo' | 'surgery';
  title: string;
  text: string;
  time: string;
  to: string;
  unread: boolean;
}

const items = computed<Notif[]>(() => {
  const out: Notif[] = [];

  // Unread patient messages
  for (const t of messages.threadList) {
    const unread = t.messages.filter((m) => !m.read && m.sender === 'patient');
    if (unread.length === 0) continue;
    const latest = unread[unread.length - 1];
    const p = patients.byId(t.patientId);
    if (!p) continue;
    out.push({
      id: `msg-${latest.id}`,
      type: 'message',
      title: `${p.firstName} ${p.lastName} napsal${p.firstName.endsWith('a') ? 'a' : ''}`,
      text: latest.text,
      time: formatTime(latest.timestamp),
      to: `/messages/${p.id}`,
      unread: true,
    });
  }

  // Recent photos (last 24h)
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const ph of photos.list) {
    if (new Date(ph.createdAt).getTime() < cutoff) continue;
    const p = patients.byId(ph.patientId);
    if (!p) continue;
    out.push({
      id: `photo-${ph.id}`,
      type: 'photo',
      title: 'Nová fotka od pacienta',
      text: `${p.firstName} ${p.lastName} — ${ph.challengeLabel}`,
      time: formatTime(ph.createdAt),
      to: `/patients/${p.id}`,
      unread: ph.marketingConsent === 'pending',
    });
  }

  // Upcoming surgeries (next 3 days)
  for (const p of patients.active) {
    const d = patientDays(p, today);
    if (d.fromSurgery < 0 && d.fromSurgery >= -3) {
      out.push({
        id: `surgery-${p.id}`,
        type: 'surgery',
        title: 'Nadcházející zákrok',
        text: `${p.firstName} ${p.lastName} — za ${Math.abs(d.fromSurgery)} ${Math.abs(d.fromSurgery) === 1 ? 'den' : 'dny'}`,
        time: '',
        to: `/patients/${p.id}`,
        unread: false,
      });
    }
  }

  return out.slice(0, 12);
});

const unreadCount = computed(() => items.value.filter((i) => i.unread).length);

function onItemClick(item: Notif) {
  open.value = false;
  router.push(item.to);
}

function onClickOutside(e: MouseEvent) {
  if (!wrapper.value) return;
  if (!wrapper.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener('mousedown', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside));

const iconFor: Record<Notif['type'], unknown> = {
  message: MessageCircle,
  photo: Camera,
  surgery: CalendarCheck,
};

const toneFor: Record<Notif['type'], string> = {
  message: 'bg-brand-orange/15 text-brand-orange',
  photo: 'bg-[#EDE9FE] text-[#6D28D9]',
  surgery: 'bg-[#FFFBEB] text-brand-amber',
};

function markAllRead() {
  for (const t of messages.threadList) messages.markRead(t.patientId);
}
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

    <div ref="wrapper" class="flex items-center gap-2 ml-4 relative">
      <button
        :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center relative transition-colors',
          open ? 'bg-slate-100 text-brand-dark' : 'hover:bg-slate-100 text-slate-600',
        ]"
        @click="open = !open"
      >
        <Bell :size="18" />
        <span
          v-if="unreadCount > 0"
          class="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 inline-flex items-center justify-center text-[10px] font-bold text-white bg-brand-red rounded-full ring-2 ring-white"
        >{{ unreadCount }}</span>
      </button>

      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="open"
          class="absolute right-0 top-12 w-[380px] bg-white border border-border-subtle rounded-2xl shadow-2xl overflow-hidden z-50"
        >
          <header class="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div>
              <h3 class="text-sm font-semibold text-brand-dark">Notifikace</h3>
              <p class="text-xs text-slate-500">{{ unreadCount }} nepřečtených · {{ items.length }} celkem</p>
            </div>
            <button
              v-if="unreadCount > 0"
              class="text-xs text-brand-orange hover:underline inline-flex items-center gap-1"
              @click="markAllRead"
            >
              <Check :size="12" /> Označit vše
            </button>
          </header>

          <ul v-if="items.length > 0" class="max-h-[420px] overflow-auto divide-y divide-border-subtle">
            <li
              v-for="n in items"
              :key="n.id"
              class="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3"
              :class="n.unread && 'bg-brand-orange/5'"
              @click="onItemClick(n)"
            >
              <span :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0', toneFor[n.type]]">
                <component :is="iconFor[n.type]" :size="16" />
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-brand-dark truncate">{{ n.title }}</p>
                <p class="text-xs text-slate-500 line-clamp-2 mt-0.5">{{ n.text }}</p>
                <p v-if="n.time" class="text-[11px] text-slate-400 mt-1">{{ n.time }}</p>
              </div>
              <span v-if="n.unread" class="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-2" />
            </li>
          </ul>
          <div v-else class="px-4 py-10 text-center">
            <Bell :size="28" class="mx-auto text-slate-300 mb-2" />
            <p class="text-sm text-slate-500">Žádné nové notifikace</p>
          </div>

          <footer class="px-4 py-2.5 border-t border-border-subtle bg-slate-50">
            <button
              class="w-full text-xs text-brand-orange hover:underline text-center"
              @click="open = false; router.push('/messages')"
            >
              Zobrazit všechny zprávy →
            </button>
          </footer>
        </div>
      </transition>
    </div>
  </header>
</template>
