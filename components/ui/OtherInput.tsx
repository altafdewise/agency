"use client";

import { ArrowRight } from "lucide-react";
import { TextInput } from "@/components/ui/inputs";

interface OtherInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  label?: string;
}

/** The inline free-text row revealed by a "Something else" option. */
export function OtherInput({
  value,
  onChange,
  onSubmit,
  placeholder = "tell us in your own words…",
  label = "Describe what you need",
}: OtherInputProps) {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-xl animate-fade-up items-end gap-4">
      <TextInput
        autoFocus
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        aria-label={label}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value.trim()}
        aria-label="Continue"
        className="mb-1 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-background transition-all duration-200 ease-out-soft hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ArrowRight className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}
