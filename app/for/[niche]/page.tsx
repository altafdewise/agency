import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { LineReveal } from "@/components/ui/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { StartBrief } from "@/components/niche/StartBrief";
import { CheckList } from "@/components/niche/CheckList";
import { DayTimeline } from "@/components/niche/DayTimeline";
import { NICHES, getNiche } from "@/lib/niches";
import { loadPricingTable } from "@/lib/pricing-config";
import { SCOPE_INCLUDES, TIMELINES } from "@/lib/pricing";
import { whatsappHref } from "@/lib/contact";
import { LOCATION, ORG_ID, SITE_URL } from "@/lib/site";

// The rate card can be edited in admin; pick up changes within the hour.
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return NICHES.map((niche) => ({ niche: niche.slug }));
}

type Props = { params: Promise<{ niche: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const niche = getNiche((await params).niche);
  if (!niche) return {};
  return {
    title: `Websites for ${niche.audience} in ${LOCATION.city}, live in 24 hours`,
    description: niche.metaDescription,
    alternates: { canonical: `/for/${niche.slug}` },
  };
}

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const sectionHeading =
  "mt-5 font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.04] tracking-tightest text-foreground";


export default async function NichePage({ params }: Props) {
  const niche = getNiche((await params).niche);
  if (!niche) notFound();

  const table = await loadPricingTable();
  const [onePageLow, onePageHigh] = table.website.simple;
  const [fullLow, fullHigh] = table.website.medium;

  const tiers = [
    {
      name: "one page",
      fit: "Everything your customers look for, on one fast page.",
      price: `${inr(onePageLow)} – ${inr(onePageHigh)}`,
      time: TIMELINES.website.simple.label,
      includes: SCOPE_INCLUDES.website.simple,
    },
    {
      name: "full site",
      fit: "More pages, and you update it yourself.",
      price: `${inr(fullLow)} – ${inr(fullHigh)}`,
      time: TIMELINES.website.medium.label,
      includes: SCOPE_INCLUDES.website.medium,
    },
  ];

  const faqs = [
    {
      q: "is it really 24 hours?",
      a: `Yes, for the one-page site. The clock starts once we have your details and the go-ahead. A full site takes ${TIMELINES.website.medium.label}.`,
    },
    {
      q: "what do I need to send?",
      a: "Your business name, address, timings, what you offer, a few photos and your logo if you have one. Missing something? Tell us, and we'll tell you what to do about it.",
    },
    {
      q: "who owns the website?",
      a: "You do, once it's paid for. We hand over the files and the access.",
    },
    {
      q: `are you in ${LOCATION.city}?`,
      a: `Yes, our office is in ${LOCATION.area}, ${LOCATION.city}. Most of the work happens over WhatsApp and one short call, so it fits around your day.`,
    },
    {
      q: "is the price fixed?",
      a: "Your estimate comes from a two-minute brief, from the same rates for everyone. The final price is agreed in writing before any work starts, and doesn't change unless you change what we're making.",
    },
  ];

  const whatsapp = whatsappHref(niche.whatsapp);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Websites for ${niche.audience} in ${LOCATION.city}`,
    serviceType: "Website design and development",
    url: `${SITE_URL}/for/${niche.slug}`,
    description: niche.metaDescription,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "City", name: LOCATION.city },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: onePageLow,
      highPrice: fullHigh,
    },
  };

  return (
    <PageShell className="max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <p className="eyebrow">
        for {niche.audience} in {LOCATION.city}
      </p>
      <LineReveal
        as="h1"
        lines={[niche.yours, "online by tomorrow"]}
        dot
        amount={0.2}
        className="headline mt-6 sm:text-[clamp(2.75rem,8vw,6.5rem)]"
      />
      <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-muted sm:text-lg">{niche.intro}</p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <StartBrief starter={niche.briefStarter}>see your price</StartBrief>
        <LinkButton href={whatsapp} target="_blank" rel="noopener noreferrer" variant="ghost" size="lg">
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          WhatsApp us
        </LinkButton>
      </div>

      <dl className="mt-16 grid grid-cols-3 border-y border-foreground/15 sm:mt-20">
        {[
          { value: "24 hours", label: "from your details to live" },
          { value: inr(onePageLow), label: "starting price" },
          { value: "2 minutes", label: "to see your price" },
        ].map((stat, i) => (
          <div key={stat.label} className={i ? "border-l border-foreground/15 py-6 pl-4 sm:py-8 sm:pl-8" : "py-6 pr-4 sm:py-8 sm:pr-8"}>
            <dt className="sr-only">{stat.label}</dt>
            <dd className="font-display text-[clamp(1.15rem,3.4vw,2.25rem)] font-semibold leading-none tracking-tightest text-foreground">
              {stat.value}
            </dd>
            <dd aria-hidden className="mt-3 text-xs leading-snug text-muted sm:text-sm">{stat.label}</dd>
          </div>
        ))}
      </dl>

      {/* What their customers look for */}
      <section aria-labelledby="checks" className="mt-28 sm:mt-36">
        <p className="eyebrow">what your site covers</p>
        <LineReveal id="checks" lines={[niche.checksHeading]} dot className={sectionHeading} />
        <CheckList items={niche.checks} />
      </section>

      {/* The 24 hours */}
      <section aria-labelledby="day" className="mt-28 sm:mt-40">
        <p className="eyebrow">how it happens</p>
        <LineReveal id="day" lines={["24 hours, start to live"]} dot className={sectionHeading} />
        <DayTimeline />
        <p className="mt-14 max-w-2xl text-sm font-light leading-relaxed text-muted">
          The 24 hours start once we have your details and the go-ahead. Want more than one page?
          A full site takes {TIMELINES.website.medium.label}.
        </p>
      </section>

      {/* Price */}
      <section aria-labelledby="price" className="mt-28 sm:mt-40">
        <p className="eyebrow">what it costs</p>
        <LineReveal id="price" lines={["two ways to start"]} dot className={sectionHeading} />
        <div className="mt-14 grid border-t border-foreground/15 sm:grid-cols-2">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={
                i
                  ? "border-t border-foreground/15 pt-10 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-10"
                  : "py-10 sm:pr-10"
              }
            >
              <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">{tier.name}</h3>
              <p className="mt-2 text-sm font-light text-muted">{tier.fit}</p>
              <p className="mt-8 font-display text-[clamp(1.6rem,3.6vw,2.5rem)] font-semibold leading-none tracking-tightest text-foreground">
                {tier.price}
              </p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-accent">{tier.time}</p>
              <ul className="mt-8 space-y-3">
                {tier.includes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-light leading-relaxed text-foreground/85">
                    <span aria-hidden className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm font-light leading-relaxed text-muted">
          Where you land in the range depends on what you need. Your brief gives you a price straight
          away, and the final one is agreed in writing before we start.
        </p>
      </section>

      {/* Questions */}
      <section aria-labelledby="questions" className="mt-28 sm:mt-40">
        <p className="eyebrow">questions</p>
        <LineReveal id="questions" lines={["the short answers"]} dot className={sectionHeading} />
        <dl className="mt-14 border-b border-foreground/15">
          {faqs.map((faq) => (
            <div key={faq.q} className="grid gap-3 border-t border-foreground/15 py-8 sm:grid-cols-2 sm:gap-10">
              <dt className="font-display text-xl font-semibold tracking-tight text-foreground">{faq.q}</dt>
              <dd className="text-base font-light leading-relaxed text-muted">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Close */}
      <section aria-labelledby="start" className="mt-28 sm:mt-40">
        <LineReveal id="start" lines={["see your price", "in two minutes"]} dot className={sectionHeading} />
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted sm:text-lg">
          A few questions about your business, and you get a price straight away. No call needed.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <StartBrief starter={niche.briefStarter}>start</StartBrief>
          <LinkButton href={whatsapp} target="_blank" rel="noopener noreferrer" variant="ghost" size="lg">
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
            WhatsApp us
          </LinkButton>
        </div>
      </section>
    </PageShell>
  );
}
