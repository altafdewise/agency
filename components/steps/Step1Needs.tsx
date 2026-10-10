"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { usePath } from "@/components/PathProvider";
import { HeroServices, SERVICES_ANCHOR_ID } from "@/components/home/HeroServices";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { StorySection } from "@/components/home/StorySection";
import { PostsSection, type HomePost } from "@/components/home/PostsSection";
import { QuotesSection } from "@/components/home/QuotesSection";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { ImpactStatSection } from "@/components/impact/ImpactStatSection";
import { WorkTeaserSection } from "@/components/home/WorkTeaserSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { AnonymousFeedbackSection } from "@/components/feedback/AnonymousFeedbackSection";
import { SiteFooter } from "@/components/SiteFooter";
import { attachChapterScroll } from "@/lib/chapter-scroll";

// Proof sections wait until there are real clients, numbers and work to show.
// Flip a flag to bring one back — they render between the story and the posts.
const HIDDEN_HOME_SECTIONS = {
  testimonials: true,
  impact: true,
  selectedWork: true,
  faq: true,
} as const;

export function Step1Needs({ posts = [] }: { posts?: HomePost[] }) {
  const router = useRouter();
  const { update, next, brief } = usePath();
  const reduce = useReducedMotion();
  const [showOther, setShowOther] = useState(brief.needs.includes("other"));
  const [other, setOther] = useState(brief.customNeed ?? "");
  const rootRef = useRef<HTMLDivElement>(null);

  // Phones: the same interruptible glide as the portfolio. A small swipe
  // carries you to the next stop (each service, then each section) and holds;
  // fast flings and long sections stay native. Desktop scrolls as normal.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia("(pointer: coarse)").matches) return;
    return attachChapterScroll(root);
  }, []);

  const choose = (key: string) => {
    if (key === "legal_help") {
      router.push("/legal-help");
      return;
    }
    if (key === "other") {
      setShowOther(true);
      update({ needs: ["other"] });
      return;
    }
    update({ needs: [key], customNeed: undefined });
    next();
  };

  const submitOther = () => {
    if (!other.trim()) return;
    update({ needs: ["other"], customNeed: other.trim() });
    next();
  };

  const scrollToServices = () => {
    document.getElementById(SERVICES_ANCHOR_ID)?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div ref={rootRef} data-chapter-surface>
      <HeroServices
        onChoose={choose}
        showOther={showOther}
        other={other}
        setOther={setOther}
        submitOther={submitOther}
      />

      <HowItWorksSection />

      <StorySection />

      {!HIDDEN_HOME_SECTIONS.testimonials && <TestimonialsSection />}
      {!HIDDEN_HOME_SECTIONS.impact && <ImpactStatSection />}
      {!HIDDEN_HOME_SECTIONS.selectedWork && <WorkTeaserSection />}

      <PostsSection posts={posts} />

      <QuotesSection onStart={scrollToServices} />

      {!HIDDEN_HOME_SECTIONS.faq && <FaqSection />}

      <AnonymousFeedbackSection />

      <SiteFooter />
    </div>
  );
}
