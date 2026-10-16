import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[var(--content-max)] flex-1 flex-col justify-center gap-4 px-4 py-12">
      <h1 className="text-xl font-bold">Replica calorie tracker</h1>
      <p className="text-base text-muted">The app screens come next. For now, the design system is ready to review.</p>
      <Link href="/design" className="inline-flex h-11 w-fit items-center rounded-md bg-accent px-4 text-sm font-semibold text-on-accent">
        Open the design system
      </Link>
    </main>
  );
}
