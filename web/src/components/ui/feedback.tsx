import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
      <span aria-hidden className="text-muted [&>svg]:size-10">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-72 text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function Skeleton({ shape = "line", className }: { shape?: "line" | "card" | "ring"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse bg-surface",
        shape === "line" && "h-4 w-full rounded-sm",
        shape === "card" && "h-24 w-full rounded-lg",
        shape === "ring" && "size-44 rounded-pill",
        className,
      )}
    />
  );
}
