<script lang="ts" module>
  export type ButtonVariant =
    | "default"
    | "destructive"
    | "secondary"
    | "outline"
    | "ghost"
    | "muted"
    | "outline-secondary"
    | "ghost-secondary";
  export type ButtonSize = "default" | "xs" | "sm" | "icon";

  const VARIANT: Record<ButtonVariant, string> = {
    default: "border border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
    destructive: "border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
    secondary: "border bg-card text-foreground hover:border-border-strong hover:bg-muted",
    outline: "border border-border-strong text-foreground hover:bg-hover",
    ghost: "text-muted-foreground hover:bg-hover hover:text-foreground",
    muted: "bg-muted text-muted-foreground hover:text-foreground",
    "outline-secondary": "border bg-transparent text-foreground hover:border-border-strong hover:bg-hover",
    "ghost-secondary": "text-foreground hover:bg-hover",
  };
  const SIZE: Record<ButtonSize, string> = {
    default: "h-10 px-4",
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3",
    icon: "size-8",
  };
</script>

<script lang="ts">
  import { cn } from "../../cn";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    variant = "default",
    size = "default",
    type = "button",
    class: cls = "",
    disabled = false,
    children,
    ...rest
  }: HTMLButtonAttributes & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
    children?: import("svelte").Snippet;
  } = $props();
</script>

<button
  {type}
  {disabled}
  class={cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] text-sm leading-none font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45",
    VARIANT[variant],
    SIZE[size],
    cls,
  )}
  {...rest}
>
  {@render children?.()}
</button>
