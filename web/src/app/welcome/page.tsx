import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { BookOpen, ChartColumn, Download, Leaf, Scale, Utensils } from "lucide-react";
import { currentUserId } from "@/lib/data/session";
import { SITE } from "@/lib/site";
import addFoodShot from "./shots/add-food.png";
import diaryShot from "./shots/diary.png";
import typeShot from "./shots/type.png";
import weekShot from "./shots/week.png";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: free calorie tracker for Indian meals` },
  description: "Type “2 roti, 1 katori dal aur dahi” and see calories, protein, carbs, fat and fibre. Free, with no paywall and no ads.",
  openGraph: {
    title: `${SITE.name}: free calorie tracker for Indian meals`,
    description: "Type what you ate the way you'd say it. Calories and every macro, free.",
    siteName: SITE.name,
    type: "website",
    images: [SITE.shareImage],
  },
  twitter: { card: "summary_large_image", images: [SITE.shareImage] },
};

const cta = "inline-flex h-12 items-center justify-center rounded-pill bg-accent px-6 text-base font-semibold text-on-accent hover:brightness-110";

/** A phone-sized screenshot, cropped to its top (or bottom) part. */
function Shot({ src, alt, from = "top" }: { src: StaticImageData; alt: string; from?: "top" | "bottom" }) {
  return (
    <div className="relative aspect-[390/700] w-full max-w-[300px] overflow-hidden rounded-[28px] border border-border bg-bg shadow-pop">
      <Image src={src} alt={alt} fill sizes="300px" className={from === "top" ? "object-cover object-top" : "object-cover object-bottom"} />
    </div>
  );
}

const STEPS = [
  {
    title: "Type it the way you'd say it",
    body: "“2 roti, 1 katori rajma aur salad.” Hindi and English words, katori, piece, glass or grams. Or search the food list.",
    shot: typeShot,
    alt: "Add food screen with “2 roti, 1 katori rajma aur salad” typed in the box",
  },
  {
    title: "Oswald finds each food",
    body: "Every food with its portion and calories, and the meal's protein, carbs, fat and fibre. Change a portion and the numbers follow.",
    shot: addFoodShot,
    alt: "The meal Oswald found: 2 phulka, 1 katori rajma curry and green salad, 423 kcal in total, with protein, carbs, fat and fibre",
    from: "bottom" as const,
  },
  {
    title: "See your day, meal by meal",
    body: "Breakfast, lunch, snack and dinner each get a share of your daily calories, so you can see where the day is going.",
    shot: diaryShot,
    alt: "Today's meals: breakfast 480 of 440 kcal with poha and masala chai, lunch 479 of 530 kcal with phulka, dal tadka and curd",
  },
  {
    title: "Learn from your week",
    body: "After a few days, Oswald shows your average against your target, what's low, and foods that fit how you eat.",
    shot: weekShot,
    alt: "This week: a bar chart of calories per day, the average, days on target, and a note that protein is low with food ideas",
  },
];

const FEATURES = [
  { icon: Utensils, title: "Built for Indian food", body: "383 dishes and staples, from poha and dal makhani to litti and idli, with Hindi names and everyday portions." },
  { icon: ChartColumn, title: "Every number, free", body: "Calories, protein, carbs, fat and fibre, plus iron, calcium and salt. No paywall, no ads, no sales calls." },
  { icon: Scale, title: "Your targets", body: "Worked out from your body and goal, or set your own calories and macros." },
  { icon: Leaf, title: "Fits how you eat", body: "Vegetarian, eggetarian, Jain, vegan or non-vegetarian: ideas only suggest food you'd eat." },
  { icon: BookOpen, title: "Your recipes", body: "Save your own dal or sabzi once, then log a serving in one tap." },
  { icon: Download, title: "Your data stays yours", body: "Download everything you've logged as a spreadsheet, or delete your account, whenever you like." },
];

/** The public landing page: what Oswald is, then "Try Oswald free" (the email start). */
export default async function WelcomePage() {
  const signedIn = Boolean(await currentUserId());
  const start = signedIn ? { href: "/", label: `Open ${SITE.name}` } : { href: "/sign-in", label: `Try ${SITE.name} free` };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <span className="text-xl font-bold">{SITE.name}</span>
        <Link href={start.href} className="inline-flex h-11 items-center rounded-pill border border-border px-4 text-sm font-semibold hover:bg-surface">
          {signedIn ? start.label : "Try it free"}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 pb-16">
        <section aria-labelledby="hero-heading" className="grid items-center gap-10 pt-6 md:grid-cols-[1fr_300px] md:pt-12">
          <div className="flex flex-col gap-5">
            <p className="w-fit rounded-pill bg-accent-soft px-3 py-1 text-sm font-semibold text-on-accent-soft">Free public test</p>
            <h1 id="hero-heading" className="text-display font-bold">Count calories the way India eats.</h1>
            <p className="text-lg text-muted">
              Type “2 roti, 1 katori dal aur dahi” and {SITE.name} finds each food, its portion, and its calories, protein, carbs, fat and fibre. Free, with
              no paywall and no ads.
            </p>
            <div className="flex flex-col gap-2">
              <Link href={start.href} className={`${cta} w-fit`}>
                {start.label}
              </Link>
              {!signedIn && <p className="text-sm text-muted">Just your email. No password, nothing to download.</p>}
            </div>
          </div>
          {/* Desktop only: on a phone the steps below come straight after, starting with this screen. */}
          <div className="hidden justify-center md:flex">
            <Shot src={addFoodShot} alt={STEPS[1].alt} from="bottom" />
          </div>
        </section>

        <section aria-labelledby="how-heading" className="flex flex-col gap-8">
          <h2 id="how-heading" className="text-xl font-bold">How it works</h2>
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center gap-4 sm:items-start">
                <Shot src={s.shot} alt={s.alt} from={s.from} />
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold">
                    <span className="text-accent">{i + 1}.</span> {s.title}
                  </h3>
                  <p className="text-sm text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="features-heading" className="flex flex-col gap-8">
          <h2 id="features-heading" className="text-xl font-bold">What you get</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex flex-col gap-2 rounded-lg bg-surface p-5">
                <Icon aria-hidden className="size-6 text-accent" />
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="test-heading" className="flex flex-col items-start gap-4 rounded-lg border border-border p-6">
          <h2 id="test-heading" className="text-xl font-bold">Try it while it&apos;s new</h2>
          <p className="text-base">
            {SITE.name} is in a free public test, so things will change and your feedback shapes what comes next. Tell us what works and what doesn&apos;t:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-accent underline underline-offset-2">
              {SITE.contactEmail}
            </a>
            .
          </p>
          <Link href={start.href} className={cta}>
            {start.label}
          </Link>
          <p className="text-sm text-muted">For people aged 18 and over. Numbers are estimates for general wellness, not medical advice.</p>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted">
          <span>
            {SITE.name} is run by {SITE.operator}.
          </span>
          <Link href="/privacy" className="font-semibold text-fg underline underline-offset-2">
            Privacy policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
