import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Hammer } from "lucide-react";
import { EmptyState } from "@/components/ui/feedback";

/** Page column used by every screen: one column, phone width, 16 px gutter. */
export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-6 px-4 pb-8 pt-4 ${className}`}>{children}</main>;
}

export function ScreenHeader({ title, back, subtitle, action }: { title: string; back?: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex min-h-14 items-center gap-2">
      {back && (
        <Link href={back} aria-label="Back" className="-ml-2 grid size-11 shrink-0 place-items-center rounded-md hover:bg-surface">
          <ArrowLeft aria-hidden className="size-5" />
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/** Placeholder for screens on the route map that are not built yet. */
export function ComingSoon({ screen, title, body, back }: { screen: string; title: string; body: string; back?: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} back={back} />
      <EmptyState icon={<Hammer />} title="Not built yet" body={body} />
      <p className="text-center text-xs text-muted">Screen {screen}</p>
    </Screen>
  );
}
