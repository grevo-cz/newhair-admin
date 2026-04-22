import { defineStore } from 'pinia';
import type { Toast, ToastType, ConfirmOptions, ConfirmState } from '@/types';

interface State {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  confirmState: ConfirmState;
}

export const useUiStore = defineStore('ui', {
  state: (): State => ({
    sidebarCollapsed: false,
    toasts: [],
    confirmState: {
      open: false,
      title: '',
      text: '',
    },
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    toast(opts: { type?: ToastType; title?: string; text: string; duration?: number }) {
      const id = crypto.randomUUID();
      const toast: Toast = {
        id,
        type: opts.type ?? 'info',
        title: opts.title,
        text: opts.text,
      };
      this.toasts.push(toast);
      const ms = opts.duration ?? 3500;
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, ms);
    },
    dismissToast(id: string) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
    confirm(opts: ConfirmOptions): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        this.confirmState = {
          ...opts,
          open: true,
          resolve,
        };
      });
    },
    closeConfirm(result: boolean) {
      this.confirmState.resolve?.(result);
      this.confirmState = { open: false, title: '', text: '' };
    },
  },
});
