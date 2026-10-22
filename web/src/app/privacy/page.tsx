import type { ReactNode } from "react";
import Link from "next/link";
import { Screen, ScreenHeader } from "@/components/screen";
import { SITE } from "@/lib/site";

export const metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

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

/** Public: readable without signing in. Lists only what the app really stores and who processes it. */
export default function PrivacyPage() {
  return (
    <Screen className="text-base leading-relaxed">
      <ScreenHeader title="Privacy policy" subtitle={`Last updated ${SITE.privacyUpdated}`} />

      <p>
        {SITE.name} is a free calorie and nutrition tracker for Indian meals, run by {SITE.operator} as a public test. This page explains what we store, why,
        who helps us run {SITE.name}, and how you can see, correct or delete your data. Questions or complaints: {mail}.
      </p>

      <Section id="what" title="What we store">
        <ul className={list}>
          <li>
            <strong>The email you start with:</strong> when you start with just your email, we keep the address you type, without checking it, to see how
            many people are interested in {SITE.name}. It isn&apos;t used to sign you in, and we don&apos;t send you emails. Your account is kept in this
            browser, so we also store a sign-in session there.
          </li>
          <li>
            <strong>If you sign in with an email link or Google instead:</strong> your email address, and for Google also the name and profile picture Google
            shares with us.
          </li>
          <li>
            <strong>Security records:</strong> our sign-in provider keeps a record of sign-ins (when, and technical details such as your IP address and
            browser).
          </li>
          <li>
            <strong>Your profile:</strong> the name you choose (optional), sex, birth year, height, weight, activity level, goal, how you eat (for example
            vegetarian or Jain), your daily targets and your time zone.
          </li>
          <li>
            <strong>What you log:</strong> your meals with their foods, portions, times and nutrients, including what you type when you log a meal; foods and
            recipes you create; and your favourites.
          </li>
          <li>
            <strong>Photos:</strong> photo logging is switched off, so we don&apos;t collect meal photos. If we switch it on, we&apos;ll update this page first.
          </li>
        </ul>
        <p>We don&apos;t show ads, we don&apos;t use analytics or tracking tools, and we never sell or rent your data.</p>
      </Section>

      <Section id="why" title="Why we use it">
        <ul className={list}>
          <li>To work out your daily targets, add up your meals, and show your insights and meal ideas.</li>
          <li>To keep your account secure and your data separate from everyone else&apos;s.</li>
          <li>To count how many people try {SITE.name}, from the emails people start with.</li>
        </ul>
        <p>
          Your body details and what you eat can say things about your health. We use them only for the above, with your consent, which you give when you set
          up your profile. {SITE.name}&apos;s numbers are estimates for general wellness, not medical advice.
        </p>
      </Section>

      <Section id="who" title="Who helps us run it">
        <p>These companies process data for us, only to provide their service:</p>
        <ul className={list}>
          <li><strong>Supabase:</strong> our database, sign-in and sign-in emails. Our project is hosted in Mumbai, India.</li>
          <li><strong>Vercel:</strong> hosts the app. Our server runs in Mumbai; like any website, requests pass through Vercel&apos;s network on the way.</li>
          <li><strong>Google:</strong> only if you choose to sign in with Google.</li>
        </ul>
      </Section>

      <Section id="keep" title="How long we keep it">
        <p>
          Until you delete your account. Deleting it removes your profile, meals, foods, recipes, the email you started with and your sign-in from our
          database straight away. Our providers may keep security logs for a short time after that. If you started with just your email, delete your
          account before signing out: without a password, you can&apos;t sign back in to delete it later.
        </p>
      </Section>

      <Section id="rights" title="Your choices and rights">
        <ul className={list}>
          <li><strong>See your data:</strong> Profile → Your data downloads everything you&apos;ve logged as spreadsheet files.</li>
          <li><strong>Correct it:</strong> edit your details, your targets and any meal you&apos;ve logged.</li>
          <li><strong>Delete it:</strong> Profile → Delete account. This also withdraws your consent.</li>
          <li>
            <strong>Anything else</strong>, such as a question, a complaint, or naming someone to act for you if you can&apos;t: email {mail}. We&apos;ll reply
            within 30 days.
          </li>
        </ul>
        <p>If you&apos;re not happy with our answer, you can complain to the Data Protection Board of India.</p>
      </Section>

      <Section id="age" title="Age">
        <p>
          {SITE.name} is for people aged 18 and over. We don&apos;t knowingly store data about anyone younger. If you think a child has an account, email us
          and we&apos;ll delete it.
        </p>
      </Section>

      <Section id="security" title="Security">
        <p>
          Every connection is encrypted (HTTPS). Rules in our database let each person read only their own data, and the keys that could see more stay on
          our server. No system is perfectly secure: if a breach affects your data, we&apos;ll tell you and the Data Protection Board, as the law requires.
        </p>
      </Section>

      <Section id="cookies" title="Cookies">
        <p>
          We use only the cookies {SITE.name} needs to work: ones that keep you signed in, and one that remembers Light, Dark or Auto. No advertising or
          analytics cookies.
        </p>
      </Section>

      <Section id="changes" title="Changes to this policy">
        <p>
          When we change this page, we update the date at the top. If a change affects how we use your data, we&apos;ll ask for your agreement again.
        </p>
      </Section>

      <p className="text-sm text-muted">
        {SITE.name} is run by {SITE.operator}. Contact: {mail}. See also the{" "}
        <Link href="/terms" className="font-semibold text-accent underline underline-offset-2">
          terms of use
        </Link>
        .
      </p>
      <Link href="/" className="inline-flex h-11 items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-surface">
        Back to {SITE.name}
      </Link>
    </Screen>
  );
}
