export interface ConfirmConfig {
  title: string;
  message: string;
  actionLabel: string;
  confirmBtnVariant?: "default" | "destructive";
  onConfirm: () => void;
}

export const confirmState = $state<{ open: boolean; cfg: ConfirmConfig | null }>({
  open: false,
  cfg: null,
});

let pendingResolve: (() => void) | null = null;

export function openConfirmDialog(cfg: ConfirmConfig): Promise<void> {
  confirmState.open = true;
  confirmState.cfg = cfg;
  return new Promise<void>((resolve) => {
    pendingResolve = resolve;
  });
}

export function resolveConfirm(confirmed: boolean): void {
  const cfg = confirmState.cfg;
  confirmState.open = false;
  confirmState.cfg = null;
  if (confirmed && cfg) {
    try {
      cfg.onConfirm();
    } catch {
    }
  }
  pendingResolve?.();
  pendingResolve = null;
}
