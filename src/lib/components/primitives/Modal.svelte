<script lang="ts">
  import type { Snippet } from "svelte";
  import { cn } from "../../cn";
  import { portal } from "../portal";

  let {
    open,
    onClose,
    labelledby,
    variant = "center",
    zIndex = 100,
    class: cls = "",
    children,
  }: {
    open: boolean;
    onClose: () => void;
    labelledby?: string;
    variant?: "center" | "sheet";
    zIndex?: number;
    class?: string;
    children?: Snippet;
  } = $props();

  let restoreFocus: HTMLElement | null = null;

  const focusable = (root: HTMLElement) =>
    [
      ...root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((el) => el.offsetParent !== null);

  const attachPanel = (node: HTMLElement) => {
    restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const first = focusable(node)[0];
    (first ?? node).focus({ preventScroll: true });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocus?.focus({ preventScroll: true });
    };
  };

  const onKeydown = (e: KeyboardEvent, panel: HTMLElement) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const items = focusable(panel);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
</script>

{#if open}
  <div
    use:portal
    class={cn(
      "modal-backdrop fixed inset-0 flex bg-black/65 backdrop-blur-[2px]",
      variant === "center" ? "items-center justify-center p-4" : "justify-end",
    )}
    style:z-index={zIndex}
    onclick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}
    role="presentation"
  >
    <div
      {@attach attachPanel}
      class={cn(
        "modal-panel bg-card text-card-foreground flex flex-col border shadow-2xl shadow-black/60 outline-none",
        variant === "center"
          ? "max-h-[calc(100vh-2rem)] w-full rounded-[var(--radius-card)]"
          : "modal-sheet h-full w-full max-w-3xl border-y-0 border-r-0",
        cls,
      )}
      onkeydown={(e) => onKeydown(e, e.currentTarget)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledby}
      tabindex="-1"
    >
      {@render children?.()}
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    animation: fade-in 140ms ease-out;
  }
  .modal-panel {
    animation: pop-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .modal-sheet {
    animation: slide-in 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }
  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.985);
    }
  }
  @keyframes slide-in {
    from {
      opacity: 0.6;
      transform: translateX(24px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .modal-backdrop,
    .modal-panel,
    .modal-sheet {
      animation: none;
    }
  }
</style>
