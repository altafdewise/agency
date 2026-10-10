"use client";

import { forwardRef } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "link";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}

const sizes: Record<Size, string> = {
  md: "min-h-[44px] px-6 text-sm",
  lg: "min-h-[52px] px-8 text-base",
};

const variants: Record<Variant, string> = {
  // Filled signal-red; near-black label for AA contrast. Brightens on hover.
  primary:
    "bg-accent text-background font-medium hover:brightness-110 active:brightness-95",
  // Outline that fills with a faint bone wash on hover.
  ghost:
    "border border-foreground/25 text-foreground font-medium hover:border-foreground/45 hover:bg-foreground/[0.04]",
  // Quiet text link (used for "skip →").
  link: "text-muted font-medium hover:text-foreground px-0 min-h-[44px] underline-offset-4",
};

function content(children: React.ReactNode, withArrow?: boolean) {
  return (
    <span className="relative z-10 inline-flex items-center gap-2">
      {children}
      {withArrow && (
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      )}
    </span>
  );
}

const base =
  "group relative inline-flex select-none items-center justify-center rounded-full transition-all duration-200 ease-out-soft cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 tracking-tight";

export interface ButtonProps
  extends BaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", withArrow, className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], variant === "link" && "px-0", className)}
      {...rest}
    >
      {content(children, withArrow)}
    </button>
  )
);
Button.displayName = "Button";

export interface LinkButtonProps
  extends BaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> {}

/** Same look as Button, rendered as an anchor — for external CTAs. */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant = "primary", size = "md", withArrow, className, children, ...rest }, ref) => (
    <a
      ref={ref}
      className={cn(base, sizes[size], variants[variant], variant === "link" && "px-0", className)}
      {...rest}
    >
      {content(children, withArrow)}
    </a>
  )
);
LinkButton.displayName = "LinkButton";
