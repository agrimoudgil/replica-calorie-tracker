import type { ReactNode } from "react";
import Link from "next/link";
import { Screen, ScreenHeader } from "@/components/screen";
import { SITE } from "@/lib/site";

export const metadata = { title: "Terms of use", alternates: { canonical: "/terms" } };

const mail = <a href={`mailto:${SITE.contactEmail}`} className="font-semibold text-accent underline underline-offset-2">{SITE.contactEmail}</a>;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const list = "flex list-disc flex-col gap-1.5 pl-5";

/** Public: the plain rules of using Oswald during its free public test. Goes with the privacy policy. */
export default function TermsPage() {
  return (
    <Screen className="text-base leading-relaxed">
      <ScreenHeader title="Terms of use" subtitle={`Last updated ${SITE.termsUpdated}`} />

      <p>
        {SITE.name} is a free calorie and nutrition tracker, run by {SITE.operator} as a public test. By starting or signing in, you agree to these terms
        and to the{" "}
        <Link href="/privacy" className="font-semibold text-accent underline underline-offset-2">
          privacy policy
        </Link>
        . They&apos;re short on purpose. Questions: {mail}.
      </p>

      <Section id="who" title="Who can use it">
        <p>People aged 18 and over. If you&apos;re younger, please don&apos;t use {SITE.name}.</p>
      </Section>

      <Section id="medical" title="Not medical advice">
        <p>
          {SITE.name}&apos;s numbers are estimates for general wellness. They aren&apos;t medical advice and aren&apos;t meant to diagnose, treat or manage any
          condition. For a medical diet, a condition such as diabetes, a food allergy or pregnancy, follow your doctor or dietitian, not {SITE.name}.
        </p>
      </Section>

      <Section id="account" title="Your account">
        <ul className={list}>
          <li>
            If you start with just your email, your account lives in that browser. If you clear the browser, sign out or lose the device, we can&apos;t
            give it back, because there&apos;s nothing to prove it&apos;s yours. Download your data from Profile whenever you want a copy.
          </li>
          <li>Keep the device you use {SITE.name} on locked: anyone who can open your browser can see your meals.</li>
        </ul>
      </Section>

      <Section id="data" title="Your data">
        <p>
          What you log is yours. We keep it only to run {SITE.name}, as the privacy policy explains, and you can download it or delete your account at any
          time.
        </p>
      </Section>

      <Section id="fair" title="Fair use">
        <p>Please don&apos;t:</p>
        <ul className={list}>
          <li>try to see or change anyone else&apos;s data, or get around how {SITE.name} keeps accounts apart;</li>
          <li>use bots or scripts to create accounts, copy the food list or overload the service;</li>
          <li>use {SITE.name} for anything unlawful.</li>
        </ul>
        <p>We may remove accounts that do.</p>
      </Section>

      <Section id="service" title="The service">
        <p>
          {SITE.name} is free and offered as it is, while it&apos;s being tested: features may change, and it may sometimes be unavailable. If we plan to
          close it, we&apos;ll say so on the site first, so you can download your data.
        </p>
      </Section>

      <Section id="liability" title="Responsibility">
        <p>
          We work to keep {SITE.name} accurate and available, but as far as the law allows, we aren&apos;t responsible for losses that come from relying on
          its estimates or from it being unavailable. Nothing here takes away rights you have under Indian consumer law.
        </p>
      </Section>

      <Section id="changes" title="Changes and law">
        <p>
          When these terms change, we update the date at the top; if a change matters, we&apos;ll say so in the app. These terms are governed by the laws of
          India.
        </p>
      </Section>

      <p className="text-sm text-muted">
        {SITE.name} is run by {SITE.operator}. Contact: {mail}.
      </p>
      <Link href="/" className="inline-flex h-11 items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-surface">
        Back to {SITE.name}
      </Link>
    </Screen>
  );
}
