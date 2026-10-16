import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ChatBubble({
  role,
  children,
  state = "sent",
  onRetry,
}: {
  role: "user" | "assistant";
  children: ReactNode;
  state?: "sending" | "streaming" | "sent" | "error";
  onRetry?: () => void;
}) {
  return (
    <div className={cn("flex flex-col gap-1", role === "user" ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-4 py-2.5 text-base",
          role === "user" ? "rounded-br-sm bg-accent-soft text-on-accent-soft" : "rounded-bl-sm bg-surface text-fg",
          state === "sending" && "opacity-70",
        )}
      >
        {children}
        {state === "streaming" && <span aria-hidden className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current align-middle" />}
      </div>
      {state === "error" && (
        <button type="button" onClick={onRetry} className="h-9 text-sm font-semibold text-danger underline underline-offset-2">
          Not sent. Try again
        </button>
      )}
    </div>
  );
}
