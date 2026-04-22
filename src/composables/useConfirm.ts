import { useUiStore } from '@/stores/uiStore';
import type { ConfirmOptions } from '@/types';

export function useConfirm() {
  const ui = useUiStore();
  return (opts: ConfirmOptions) => ui.confirm(opts);
}
