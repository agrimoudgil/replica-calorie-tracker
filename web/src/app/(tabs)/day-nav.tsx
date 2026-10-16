import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays } from "@/lib/dates";
import { cn } from "@/lib/cn";

const dayHref = (date: string, today: string) => (date === today ? "/" : `/?date=${date}`);
const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });
const dayNum = new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "UTC" });
const long = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export const longDate = (date: string) => long.format(new Date(`${date}T00:00:00Z`));

/** Previous / next day arrows around the selected day, and a strip of the last 7 days. */
export function DayNav({ selected, today, stripDates, loggedDates }: { selected: string; today: string; stripDates: string[]; loggedDates: Set<string> }) {
  const prev = addDays(selected, -1);
  const next = addDays(selected, 1);
  return (
    <nav aria-label="Choose a day" className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Link href={dayHref(prev, today)} aria-label={`Previous day, ${longDate(prev)}`} className="grid size-11 place-items-center rounded-md hover:bg-surface">
          <ChevronLeft aria-hidden className="size-5" />
        </Link>
        <span className="text-sm font-semibold">{selected === today ? "Today" : longDate(selected)}</span>
        {selected < today ? (
          <Link href={dayHref(next, today)} aria-label={`Next day, ${next === today ? "today" : longDate(next)}`} className="grid size-11 place-items-center rounded-md hover:bg-surface">
            <ChevronRight aria-hidden className="size-5" />
          </Link>
        ) : (
          <span aria-hidden className="size-11" />
        )}
      </div>
      <ol className="grid grid-cols-7 gap-1">
        {stripDates.map((d) => {
          const current = d === selected;
          const logged = loggedDates.has(d);
          return (
            <li key={d}>
              <Link
                href={dayHref(d, today)}
                aria-current={current ? "date" : undefined}
                aria-label={`${d === today ? "Today" : longDate(d)}${logged ? ", meals logged" : ", nothing logged"}`}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 rounded-md text-xs",
                  current ? "bg-accent text-on-accent" : "hover:bg-surface",
                )}
              >
                <span aria-hidden className={current ? "" : "text-muted"}>{d === today ? "Today" : weekday.format(new Date(`${d}T00:00:00Z`))}</span>
                <span aria-hidden className="text-base font-semibold tabular-nums">{dayNum.format(new Date(`${d}T00:00:00Z`))}</span>
                <span aria-hidden className={cn("size-1.5 rounded-pill", logged ? (current ? "bg-on-accent" : "bg-accent") : "bg-transparent")} />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
