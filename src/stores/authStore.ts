import { defineStore } from 'pinia';
import type { AuthenticatedUser } from '@/services/authService';
import * as authService from '@/services/authService';
import { getAccessToken } from '@/services/api';

interface State {
  user: AuthenticatedUser | null;
  loading: boolean;
  bootstrapped: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({ user: null, loading: false, bootstrapped: false }),

  getters: {
    isAuthenticated: (s): boolean => !!s.user,
    hasToken: (): boolean => !!getAccessToken(),
  },

  actions: {
    async login(username: string, password: string) {
      this.loading = true;
      try {
        this.user = await authService.login({ username, password });
      } finally {
        this.loading = false;
      }
    },

    /**
     * Called at app bootstrap to hydrate the user if a token is already stored.
     * Fails silently — auth guard redirects if no user ends up in state.
     */
    async restore(): Promise<void> {
      if (this.bootstrapped) return;
      this.bootstrapped = true;
      if (!getAccessToken()) return;
      try {
        this.user = await authService.fetchMe();
      } catch {
        authService.logout();
      }
    },

    logout() {
      authService.logout();
      this.user = null;
    },
  },
});
