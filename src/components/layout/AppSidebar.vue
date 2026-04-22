<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useMessagesStore } from '@/stores/messagesStore';
import {
  LayoutDashboard, Users, ListChecks, MessageCircle, Film, Settings,
} from 'lucide-vue-next';
import Avatar from '@/components/shared/Avatar.vue';
import logoUrl from '@/assets/logo.svg';

const messages = useMessagesStore();
const unread = computed(() => messages.unreadCount);

interface NavItem { name: string; label: string; icon: any; to: string; badge?: () => number | undefined }

const nav: NavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { name: 'patients', label: 'Pacienti', icon: Users, to: '/patients' },
  { name: 'plans', label: 'Plány péče', icon: ListChecks, to: '/plans' },
  { name: 'videos', label: 'Videa', icon: Film, to: '/videos' },
  { name: 'messages', label: 'Zprávy', icon: MessageCircle, to: '/messages', badge: () => unread.value },
  { name: 'settings', label: 'Nastavení', icon: Settings, to: '/settings' },
];
</script>

<template>
  <aside class="w-[248px] shrink-0 bg-brand-dark text-white h-screen sticky top-0 flex flex-col">
    <!-- Logo -->
    <RouterLink to="/" class="flex items-center gap-2.5 px-5 h-16 border-b border-white/5">
      <img :src="logoUrl" alt="NewHair" class="w-9 h-9 rounded-lg" />
      <span class="font-semibold tracking-tight text-[17px]">NewHair</span>
      <span class="text-[10px] uppercase tracking-wider text-white/40 ml-auto">Admin</span>
    </RouterLink>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <RouterLink
        v-for="item in nav"
        :key="item.name"
        :to="item.to"
        custom
        v-slot="{ navigate, isActive, isExactActive }"
      >
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition-colors',
            (item.to === '/' ? isExactActive : isActive)
              ? 'bg-brand-orange text-white shadow-sm'
              : 'text-white/70 hover:bg-white/5 hover:text-white',
          ]"
          @click="navigate"
        >
          <component :is="item.icon" :size="18" :stroke-width="2" />
          <span class="flex-1 text-left">{{ item.label }}</span>
          <span
            v-if="item.badge && item.badge()"
            class="inline-flex items-center justify-center text-[10px] font-bold min-w-[20px] h-[20px] px-1 rounded-full bg-brand-red text-white"
          >{{ item.badge() }}</span>
        </button>
      </RouterLink>
    </nav>

    <!-- Admin user -->
    <div class="px-3 pb-4">
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
        <Avatar name="Anna Nováková" tone="orange" :size="36" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">Anna Nováková</p>
          <p class="text-xs text-white/50 truncate">Admin CZ</p>
        </div>
      </div>
    </div>
  </aside>
</template>
