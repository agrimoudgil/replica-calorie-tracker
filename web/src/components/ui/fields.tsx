"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: string;
};

export function TextField({ label, help, error, icon, suffix, className, id, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : help ? `${inputId}-help` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-md border bg-bg px-3",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
          error ? "border-danger" : "border-input",
          rest.disabled && "opacity-50",
        )}
      >
        {icon && <span aria-hidden className="text-muted">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted read-only:text-muted"
          {...rest}
        />
        {suffix && <span className="text-sm text-muted">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">{error}</p>
      ) : help ? (
        <p id={`${inputId}-help`} className="text-xs text-muted">{help}</p>
      ) : null}
    </div>
  );
}

type SearchOption = { id: string; label: string; detail?: string };

type SearchFieldProps = {
  label: string;
  options: SearchOption[];
  onPick: (option: SearchOption) => void;
  placeholder?: string;
  /** false when `options` already come filtered (e.g. from a server search). */
  filter?: boolean;
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: (query: string) => string;
  autoFocus?: boolean;
};

/** Combobox: type to filter, arrow keys move, Enter picks, Esc clears. */
export function SearchField({
  label,
  options,
  onPick,
  placeholder,
  filter = true,
  onQueryChange,
  loading = false,
  emptyMessage = (q) => `No foods match “${q}”. You can add it as a custom food.`,
  autoFocus,
}: SearchFieldProps) {
  const id = useId();
  const [query, setQueryState] = useState("");
  const [active, setActive] = useState(0);
  const setQuery = (value: string) => {
    setQueryState(value);
    onQueryChange?.(value);
  };
  const q = query.trim().toLowerCase();
  const results = !q ? [] : filter ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  const open = q.length > 0;

  const pick = (o: SearchOption) => {
    onPick(o);
    setQuery("");
  };

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <div className="flex h-11 items-center gap-2 rounded-md border border-input bg-bg px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
        <Search aria-hidden className="size-4 text-muted" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${id}-${results[active].id}` : undefined}
          value={query}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault(); // never submits a surrounding form, even with no results yet
              if (results[active]) pick(results[active]);
            } else if (e.key === "Escape") {
              setQuery("");
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
        />
        {query && (
          <button type="button" aria-label="Clear search" onClick={() => setQuery("")} className="grid size-8 place-items-center rounded-sm text-muted hover:bg-surface">
            <X aria-hidden className="size-4" />
          </button>
        )}
      </div>
      {open && (
        <ul id={`${id}-list`} role="listbox" aria-label={`${label} results`} className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-md border border-border bg-bg shadow-pop">
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted">{loading ? "Searching…" : emptyMessage(query.trim())}</li>
          ) : (
            results.map((o, i) => (
              <li
                key={o.id}
                id={`${id}-${o.id}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                className={cn("flex min-h-11 cursor-pointer items-center justify-between px-3 text-sm", i === active && "bg-accent-soft text-on-accent-soft")}
              >
                <span className="font-medium">{o.label}</span>
                {o.detail && <span className="text-xs text-muted">{o.detail}</span>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

type SegmentedProps<T extends string> = {
  legend: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

/** Native radio group styled as a segmented control; arrow keys move between options. */
export function SegmentedControl<T extends string>({ legend, options, value, onChange }: SegmentedProps<T>) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-semibold">{legend}</legend>
      <div className="flex rounded-pill bg-surface p-1">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex h-9 flex-1 cursor-pointer items-center justify-center rounded-pill text-sm font-medium transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
              value === o.value ? "bg-bg shadow-card text-fg" : "text-muted",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Chip({
  selected,
  onClick,
  children,
  disabled,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-medium transition-colors disabled:opacity-50",
        selected ? "border-transparent bg-accent-soft text-on-accent-soft" : "border-border bg-bg text-fg hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

export function Switch({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <span className="text-base">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-pill transition-colors disabled:opacity-50",
          "before:absolute before:-inset-2 before:content-['']",
          checked ? "bg-accent" : "bg-input",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1 size-5 rounded-pill bg-bg shadow-card transition-[left] duration-[var(--motion-fast)]",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
    </div>
  );
}
