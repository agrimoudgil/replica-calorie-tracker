import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ChartColumn, Download, Leaf, Lock, MonitorSmartphone, Pencil, PhoneOff, Scale, SunMoon, Utensils } from "lucide-react";
import { currentUserId } from "@/lib/data/session";
import { SITE } from "@/lib/site";
import addFoodShot from "./shots/add-food.png";
import diaryShot from "./shots/diary.png";
import typeShot from "./shots/type.png";
import weekShot from "./shots/week.png";

/*
 * The public landing page, built from the angle "Just track, in peace" (replica/launch/landing.md).
 * Rules: no invented proof, no reviewer quotes, no other app named, every claim true today.
 */

export const metadata: Metadata = {
  title: { absolute: `${SITE.name}: free calorie tracker for Indian meals` },
  description: "Track what you eat. That's it. Type “2 roti, 1 katori dal aur dahi” and see calories, protein, carbs, fat and fibre. Free, with no paywall, no sales calls and no pop-ups.",
  openGraph: {
    title: `${SITE.name}: track what you eat. That's it.`,
    description: "A free calorie and protein tracker for Indian meals. No paywall, no sales calls, no pop-ups.",
    siteName: SITE.name,
    type: "website",
    images: [SITE.shareImage],
  },
  twitter: { card: "summary_large_image", images: [SITE.shareImage] },
};

const cta = "inline-flex h-12 items-center justify-center rounded-pill bg-accent px-6 text-base font-semibold text-on-accent hover:brightness-110";
const link = "font-semibold text-accent underline underline-offset-2";

/** A phone-sized screenshot, cropped to its top (or bottom) part. */
function Shot({ src, alt, from = "top" }: { src: StaticImageData; alt: string; from?: "top" | "bottom" }) {
  return (
    <div className="relative aspect-[390/700] w-full max-w-[300px] overflow-hidden rounded-[28px] border border-border bg-bg shadow-pop">
      <Image src={src} alt={alt} fill sizes="300px" className={from === "top" ? "object-cover object-top" : "object-cover object-bottom"} />
    </div>
  );
}

const PROBLEMS = [
  {
    icon: Lock,
    title: "The useful numbers get locked",
    body: "Many trackers show calories for free, then put protein, macros or nutrients behind a subscription, and remind you on every screen.",
  },
  {
    icon: PhoneOff,
    title: "Signing up starts the selling",
    body: "A “free consultation” that turns into an upgrade pitch, then offers and pop-ups, when all you wanted was to log lunch.",
  },
];

const STEPS = [
  {
    title: "Type it the way you'd say it",
    body: "Hindi and English words, katori, piece, glass or grams. Or search 383 Indian foods.",
    shot: typeShot,
    alt: "Add food screen with “2 roti, 1 katori rajma aur salad” typed in the box",
  },
  {
    title: "See your day, meal by meal",
    body: "Each meal shows its foods and its share of your day's calories, so you can see where the day is going.",
    shot: diaryShot,
    alt: "Today's meals: breakfast 480 of 440 kcal with poha and masala chai, lunch 479 of 530 kcal with phulka, dal tadka and curd",
  },
  {
    title: "Learn from your week",
    body: "Your average against your target, what's running low, and foods that fit how you eat.",
    shot: weekShot,
    alt: "This week: a bar chart of calories per day, the average, days on target, and a note that protein is low with food ideas",
  },
];

/** The fixes first (fixes.md 1 to 5): what people asked for and didn't get elsewhere. */
const FIXES = [
  { icon: ChartColumn, title: "Every number, free", body: "Calories, protein, carbs, fat and fibre, plus iron, calcium and salt. No paywall, no ads, no sales calls, no pop-ups." },
  { icon: Pencil, title: "Fix anything we got wrong", body: "Rename a food, swap it, or type your own numbers. Quick-add calories and protein. Save your own foods and recipes." },
  { icon: Download, title: "Your data, out any time", body: "Download everything you've logged as a spreadsheet, or delete your account, whenever you like." },
  { icon: MonitorSmartphone, title: "Nothing to install", body: "It runs in your phone's or laptop's browser. Start with just your email; your meals stay in that browser." },
  { icon: SunMoon, title: "Light, dark or auto", body: "Pick the look in Profile, or let it follow your phone." },
];

const BASICS = [
  { icon: Utensils, title: "Indian food first", body: "383 dishes and staples, from poha and dal makhani to litti and idli, with Hindi names and everyday portions." },
  { icon: Scale, title: "Your targets, your budgets", body: "Worked out from your body and goal, or your own, split into a budget for each meal." },
  { icon: Leaf, title: "Ideas that fit how you eat", body: "Vegetarian, eggetarian, Jain, vegan or non-vegetarian: suggestions only include food you'd eat." },
];

const FAQ = [
  {
    q: "Is it really free? What's the catch?",
    a: `It's a free public test, run by one person. There are no ads and no paid plan, and your data is never sold. It stays free because it runs on free hosting and the one costly feature, AI photo scanning, is switched off.`,
  },
  {
    q: "How accurate are the numbers?",
    a: "They come from a list of 383 Indian foods, with dishes worked out from typical home recipes. They're estimates for general wellness, not medical advice, and you can fix anything we got wrong.",
  },
  { q: "Can I log by photo?", a: "Not yet. Typing is quick: “2 roti, 1 katori dal aur dahi” becomes three foods with their numbers." },
  {
    q: "What if I change phones or clear my browser?",
    a: "If you started with just your email, your meals live in that browser. Download them as a spreadsheet any time from Profile. Using one account on several devices isn't available yet.",
  },
  { q: "Who can see my data?", a: "Only you. It isn't sold, and there are no ads or trackers.", privacy: true },
  { q: "Can I use it for diabetes or a medical diet?", a: "It's for general wellness, for people aged 18 and over. For a medical diet, talk to a doctor or dietitian." },
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
        {/* 1. Hero: the angle, one line, one button, the real product */}
        <section aria-labelledby="hero-heading" className="grid items-center gap-10 pt-6 md:grid-cols-[1fr_300px] md:pt-12">
          <div className="flex flex-col gap-5">
            <p className="w-fit rounded-pill bg-accent-soft px-3 py-1 text-sm font-semibold text-on-accent-soft">Free public test</p>
            <h1 id="hero-heading" className="text-display font-bold">Track what you eat. That&apos;s it.</h1>
            <p className="text-lg text-muted">
              A free calorie and protein tracker for Indian meals. Type “2 roti, 1 katori dal aur dahi” and see calories, protein, carbs, fat and fibre
              straight away. No paywall, no sales calls, no pop-ups.
            </p>
            <div className="flex flex-col gap-2">
              <Link href={start.href} className={`${cta} w-fit`}>
                {start.label}
              </Link>
              {!signedIn && <p className="text-sm text-muted">Just your email. No password, nothing to download.</p>}
            </div>
          </div>
          <div className="flex justify-center">
            <Shot src={addFoodShot} alt="The meal Oswald found: 2 phulka, 1 katori rajma curry and green salad, 423 kcal in total, with protein, carbs, fat and fibre" from="bottom" />
          </div>
        </section>

        {/* 2. The problem: the top two complaints, in plain words */}
        <section aria-labelledby="problem-heading" className="flex flex-col gap-6">
          <h2 id="problem-heading" className="text-xl font-bold">Counting calories shouldn&apos;t come with a sales pitch.</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {PROBLEMS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-lg border border-border p-5">
                <Icon aria-hidden className="size-6 shrink-0 text-muted" />
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-lg">
            {SITE.name} does one job: it counts what you eat. <strong>Every number is free, and there&apos;s nothing to sell you.</strong>
          </p>
        </section>

        {/* 3. How it works: three steps from the core flow */}
        <section aria-labelledby="how-heading" className="flex flex-col gap-8">
          <h2 id="how-heading" className="text-xl font-bold">How it works</h2>
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col items-center gap-4 sm:items-start">
                <Shot src={s.shot} alt={s.alt} />
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

        {/* 4. Features: the fixes first, then the basics */}
        <section aria-labelledby="features-heading" className="flex flex-col gap-8">
          <h2 id="features-heading" className="text-xl font-bold">What you get</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FIXES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex flex-col gap-2 rounded-lg bg-surface p-5">
                <Icon aria-hidden className="size-6 text-accent" />
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted">{body}</p>
              </li>
            ))}
          </ul>
          <h3 className="text-lg font-semibold">And the basics, done for Indian food</h3>
          <ul className="grid gap-4 md:grid-cols-3">
            {BASICS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <Icon aria-hidden className="size-5 shrink-0 text-accent" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-base font-semibold">{title}</h4>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Pricing: free, and how it stays free */}
        <section aria-labelledby="pricing-heading" className="flex flex-col gap-6">
          <h2 id="pricing-heading" className="text-xl font-bold">Free. That&apos;s the whole plan.</h2>
          <div className="flex max-w-md flex-col gap-3 rounded-lg border-2 border-accent p-6">
            <p className="text-base font-semibold">Everyone</p>
            <p>
              <span className="text-display font-bold">₹0</span>
            </p>
            <p className="text-sm">Every feature on this page. No trial, no card, no upgrade screen.</p>
            <Link href={start.href} className={`${cta} w-fit`}>
              {start.label}
            </Link>
          </div>
          <p className="max-w-2xl text-sm text-muted">
            How it stays free: {SITE.name} runs on free hosting, the one costly feature (AI photo scanning) is switched off, and there&apos;s no sales team
            to pay for.
          </p>
        </section>

        {/* 6. FAQ: the real objections */}
        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
          <h2 id="faq-heading" className="text-xl font-bold">Questions</h2>
          <div className="flex flex-col rounded-lg border border-border">
            {FAQ.map(({ q, a, privacy }) => (
              <details key={q} className="group border-b border-border last:border-b-0">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-base font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-sm text-muted">
                  {a}
                  {privacy && (
                    <>
                      {" "}
                      <Link href="/privacy" className={link}>
                        Read the privacy policy
                      </Link>
                      .
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 7. Final call to action */}
        <section aria-labelledby="final-heading" className="flex flex-col items-start gap-4 rounded-lg bg-surface p-6">
          <h2 id="final-heading" className="text-xl font-bold">Ready when you are.</h2>
          <p className="text-base">Type your first meal and see its numbers straight away.</p>
          <Link href={start.href} className={cta}>
            {start.label}
          </Link>
          <p className="text-sm text-muted">
            {SITE.name} is in a free public test, so things will change. Tell us what works and what doesn&apos;t:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className={link}>
              {SITE.contactEmail}
            </a>
            . For people aged 18 and over. Numbers are estimates for general wellness, not medical advice.
          </p>
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
