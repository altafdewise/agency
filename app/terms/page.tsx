import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";
import { CONTACT, mailtoHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using zev.world and working with Zev's Agency — estimates, projects, ownership and more, in plain language.",
  alternates: { canonical: "/terms" },
};

const UPDATED = "11 October 2026";

const SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        These terms cover your use of zev.world, run by Zev&apos;s Agency (&ldquo;Zev&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site you agree to them. Any project we take
        on is also governed by the written proposal or agreement we share with you; if the two ever
        differ, that agreement wins.
      </p>
    ),
  },
  {
    id: "estimates",
    title: "Estimates",
    body: (
      <>
        <p>
          The estimates on this site are indicative. They come from our standard rates and the brief
          you give us, scoped with the help of AI. A &ldquo;from&rdquo; price is the starting point
          for that kind of project; a range is our best reading of a detailed brief.
        </p>
        <p>
          An estimate is not an offer or a binding quote. The final scope, price and timeline are
          confirmed with you in writing before any work starts.
        </p>
      </>
    ),
  },
  {
    id: "projects",
    title: "Working together",
    body: (
      <>
        <p>
          Before a project begins, we agree in writing on what we&apos;ll deliver, the timeline, the
          price and the payment schedule. Work starts once that&apos;s agreed.
        </p>
        <p>
          Changes in scope can change the price or timeline; we&apos;ll tell you before making any
          change that does. Timelines depend on getting feedback, content and approvals from you on
          time.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    body: (
      <p>
        You keep ownership of the material you give us: text, images, logos, data and so on. You
        confirm you have the right to use it and to let us use it for your project, and that it
        doesn&apos;t break any law or anyone else&apos;s rights.
      </p>
    ),
  },
  {
    id: "ownership",
    title: "Who owns the work",
    body: (
      <>
        <p>
          Once a project is paid in full, you own the final deliverables we create specifically for
          you, unless our agreement says otherwise. We keep ownership of our own tools, code
          libraries, methods and know-how, and you get the right to use any of them that are part of
          your deliverables.
        </p>
        <p>
          We may show finished work in our portfolio and social channels. If your project is
          confidential, tell us and we&apos;ll keep it private.
        </p>
      </>
    ),
  },
  {
    id: "using-the-site",
    title: "Using the site",
    body: (
      <>
        <p>Please don&apos;t:</p>
        <ul>
          <li>misuse the estimate tool, for example with automated or bulk requests;</li>
          <li>try to break, overload or get unauthorised access to the site or its systems;</li>
          <li>submit anything unlawful, harmful or that you don&apos;t have the right to share.</li>
        </ul>
        <p>We may limit or block access if the site is being misused.</p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Other services",
    body: (
      <p>
        The site links to and relies on services run by others (for example email, booking and
        hosting providers). Their own terms apply to them, and we&apos;re not responsible for their
        content or availability.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <>
        <p>
          We work hard to keep the site accurate and available, but it&apos;s provided &ldquo;as
          is&rdquo; and may sometimes be unavailable or contain mistakes.
        </p>
        <p>
          As far as the law allows, we&apos;re not liable for indirect or consequential losses (such
          as lost profits or data), and our total liability for any project is limited to the amount
          you paid us for it. Nothing here limits liability that can&apos;t be limited by law.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. If a dispute comes up, we&apos;ll first try to
        resolve it by talking it through; if that doesn&apos;t work, the courts of India will have
        jurisdiction.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <p>
        We may update these terms; the effective date above shows the latest version. Questions? Email{" "}
        <a href={mailtoHref("Question about the terms")}>{CONTACT.email}</a>, or read our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="Terms"
      title="clear terms. no fine print games."
      updated={UPDATED}
      intro={
        <p>
          The short version: estimates are a starting point, everything is agreed in writing before
          work begins, and you own what we make for you once it&apos;s paid for.
        </p>
      }
      sections={SECTIONS}
    />
  );
}
