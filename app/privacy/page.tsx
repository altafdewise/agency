import type { Metadata } from "next";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";
import { CONTACT, mailtoHref } from "@/lib/contact";
import { FOUNDER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Zev's Agency collects, uses and protects the details you share on zev.world — in plain language.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "11 October 2026";

const email = (
  <a href={mailtoHref("Privacy request")}>{CONTACT.email}</a>
);

const SECTIONS: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <p>
        Zev&apos;s Agency (&ldquo;Zev&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a creative and
        technology studio founded by {FOUNDER.name}, based in India. We run zev.world and decide how
        the personal data described here is used. You can reach us at {email}.
      </p>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <p>Only what you choose to share, plus a little about how the site is used:</p>
        <ul>
          <li>
            <strong>Your project brief.</strong> The services you pick, who the project is for, your
            stage or goal, and what you write about the project.
          </li>
          <li>
            <strong>Contact details, if you give them.</strong> Your name and email when you ask for
            your estimate to be sent to you; your name, email, phone number (optional) and chosen time
            when you book a call.
          </li>
          <li>
            <strong>Anonymous feedback.</strong> The message and type you choose. We don&apos;t ask for
            a name or email.
          </li>
          <li>
            <strong>Basic usage.</strong> The pages you visit, the page that referred you, and which
            steps of the estimate you reach, tied to a random session ID. That ID, and your answers
            so far (so a refresh doesn&apos;t lose them), live in your browser&apos;s session storage
            and disappear when you close the tab. We don&apos;t use advertising cookies or cross-site
            trackers.
          </li>
          <li>
            <strong>Technical data.</strong> To keep the estimate tool from being abused, we limit how
            many estimates one connection can request and how many estimate emails one address
            receives. For that we keep only scrambled (hashed) versions of your IP address and email,
            for up to two days. We don&apos;t use them to identify you.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    body: (
      <ul>
        <li>To scope your project and show you an estimate.</li>
        <li>To email you the estimate and reply about your project, if you shared your email.</li>
        <li>To schedule and hold the calls you book.</li>
        <li>To understand which parts of the site help people, and improve them.</li>
        <li>To keep the site secure and prevent misuse.</li>
      </ul>
    ),
  },
  {
    id: "ai",
    title: "AI estimates",
    body: (
      <p>
        Your brief (the services, who it&apos;s for, your stage and what you wrote) is sent to
        Anthropic&apos;s Claude AI to scope the estimate. Your name and email are not sent with it.
        Prices come from our own rate card, not from the AI, and every estimate is confirmed with you
        by a person before any work starts.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>
          We don&apos;t sell your data or share it for advertising. We use a few service providers to
          run the site, each only for its part:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong> hosts the website.
          </li>
          <li>
            <strong>Supabase</strong> stores briefs, estimates, bookings and feedback.
          </li>
          <li>
            <strong>Resend</strong> delivers our emails.
          </li>
          <li>
            <strong>Anthropic</strong> runs the AI that scopes estimates.
          </li>
        </ul>
        <p>
          Some of these providers process data outside India. We may also disclose data where the law
          requires it.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep briefs, estimates and booking details for as long as we need them to respond to you,
        work on your project and keep reasonable business records. Usage data is kept in aggregate
        form. You can ask us to delete your details at any time.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          Under India&apos;s Digital Personal Data Protection Act, 2023 and other applicable laws, you
          can ask us to:
        </p>
        <ul>
          <li>tell you what personal data we hold about you and how it&apos;s used;</li>
          <li>correct or update it;</li>
          <li>delete it;</li>
          <li>stop using it where you gave consent, by withdrawing that consent.</li>
        </ul>
        <p>
          Email {email} and we&apos;ll respond as soon as we can, and within 30 days. For grievances,
          contact our grievance officer, {FOUNDER.name}, at the same address.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        Data travels over encrypted connections and is stored with providers that protect it with
        access controls. Only our team can see leads and bookings. No system is perfectly secure, so
        please don&apos;t put passwords or other secrets in a brief.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        zev.world is meant for adults planning projects. We don&apos;t knowingly collect data from
        anyone under 18; if you think we have, tell us and we&apos;ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change how we handle your data, we&apos;ll update this page and the effective date
        above. Significant changes will be made clear on the site.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="Privacy"
      title="your details, handled with care."
      updated={UPDATED}
      intro={
        <p>
          This policy explains, in plain language, what we collect when you use zev.world, why, and
          what you can ask us to do with it.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
