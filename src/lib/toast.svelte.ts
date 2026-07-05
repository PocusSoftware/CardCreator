export type ToastType = "default" | "loading" | "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  msg: string;
  duration?: number;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `toast_${Date.now()}_${counter}`;
}

export const toasts = $state<ToastItem[]>([]);

function upsert(item: Omit<ToastItem, "id"> & { id?: string }): string {
  const id = item.id ?? nextId();
  const idx = toasts.findIndex((t) => t.id === id);
  const full: ToastItem = { id, type: item.type, title: item.title, msg: item.msg, duration: item.duration };
  if (idx >= 0) {
    toasts[idx] = full;
  } else {
    toasts.push(full);
  }
  scheduleRemoval(full);
  return id;
}

function scheduleRemoval(item: ToastItem) {
  if (item.type === "loading") return;
  const ms = item.duration ?? 4000;
  setTimeout(() => dismiss(item.id), ms);
}

export function dismiss(id: string): void {
  const idx = toasts.findIndex((t) => t.id === id);
  if (idx >= 0) toasts.splice(idx, 1);
}

export const toast = {
  show(item: { type?: ToastType; title?: string; msg: string; id?: string; duration?: number }, opts?: { id?: string }) {
    return upsert({ type: item.type ?? "default", title: item.title, msg: item.msg, id: opts?.id ?? item.id, duration: item.duration });
  },
  loading(msg: string, opts?: { id?: string }): string {
    return upsert({ type: "loading", msg, id: opts?.id });
  },
  success(item: { title?: string; msg: string }, opts?: { id?: string }): string {
    return upsert({ type: "success", title: item.title, msg: item.msg, id: opts?.id });
  },
  error(item: { title?: string; msg: string }, opts?: { id?: string }): string {
    return upsert({ type: "error", title: item.title, msg: item.msg, id: opts?.id });
  },
  warning(item: { title?: string; msg: string }, opts?: { id?: string }): string {
    return upsert({ type: "warning", title: item.title, msg: item.msg, id: opts?.id });
  },
  info(item: { title?: string; msg: string }, opts?: { id?: string }): string {
    return upsert({ type: "info", title: item.title, msg: item.msg, id: opts?.id });
  },
};
