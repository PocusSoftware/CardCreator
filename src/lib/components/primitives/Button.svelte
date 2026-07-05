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
    default: "bg-primary text-primary-foreground hover:bg-primary/75",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/75",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75",
    outline: "border border-foreground hover:bg-primary hover:text-primary-foreground",
    ghost: "hover:bg-primary hover:text-primary-foreground",
    muted: "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
    "outline-secondary": "border border-secondary bg-transparent text-secondary-foreground hover:bg-secondary/20",
    "ghost-secondary": "text-secondary-foreground hover:bg-secondary/20",
  };
  const SIZE: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2",
    xs: "h-7 rounded-sm px-2 text-sm",
    sm: "h-9 rounded-md px-3",
    icon: "size-10",
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
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    VARIANT[variant],
    SIZE[size],
    cls,
  )}
  {...rest}
>
  {@render children?.()}
</button>
