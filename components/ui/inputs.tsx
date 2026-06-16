"use client";

import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/* Shared underline-style field — transparent, hairline base, accent on focus. */
const fieldBase =
  "w-full border-0 border-b border-border bg-transparent pb-3 text-foreground placeholder:text-muted/70 outline-none transition-colors duration-200 ease-out-soft focus:border-accent";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        fieldBase,
        "min-h-[44px] font-sans text-lg font-light",
        className
      )}
      {...rest}
    />
  )
);
TextInput.displayName = "TextInput";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  autoGrow?: boolean;
}

/** Large, calm textarea that grows to fit its content. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, autoGrow = true, onInput, value, ...rest }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const resize = (el: HTMLTextAreaElement | null) => {
      if (!el || !autoGrow) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    };

    useEffect(() => {
      resize(innerRef.current);
    }, [value]);

    return (
      <textarea
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        rows={3}
        value={value}
        onInput={(e) => {
          resize(e.currentTarget);
          onInput?.(e);
        }}
        className={cn(
          fieldBase,
          "resize-none font-display text-2xl font-normal leading-snug sm:text-3xl",
          className
        )}
        {...rest}
      />
    );
  }
);
TextArea.displayName = "TextArea";
