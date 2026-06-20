import {
  Sparkles,
  Globe,
  Smartphone,
  Figma,
  Shapes,
  Clapperboard,
  ShieldCheck,
  Scale,
  PenLine,
  Rocket,
  Building2,
  Video,
  Lightbulb,
  User,
  Users,
  Eye,
  Wand2,
  RefreshCw,
  TrendingUp,
  Compass,
  type LucideIcon,
} from "lucide-react";

/* ── Step 1 · services ─────────────────────────────────────────────────────
   `pricingKey` lines up with PRICING_TABLE in app/api/estimate/route.ts. */
export interface Service {
  key: string;
  pricingKey: string | null;
  title: string;
  blurb: string;
  brief: string;
  Icon: LucideIcon;
}

export const SERVICES: Service[] = [
  {
    key: "ai_integration",
    pricingKey: "ai_integration",
    title: "AI features & integrations",
    blurb: "chatbots, AI tools in your product",
    brief: "Map the workflow, connect the tools, make it feel native.",
    Icon: Sparkles,
  },
  {
    key: "website",
    pricingKey: "website",
    title: "Websites",
    blurb: "full-stack, premium, dynamic",
    brief: "A fast first impression built to explain, sell, and scale.",
    Icon: Globe,
  },
  {
    key: "app",
    pricingKey: "app",
    title: "Apps",
    blurb: "android, ios, play store",
    brief: "Screens, flows, accounts, payments, and a real launch path.",
    Icon: Smartphone,
  },
  {
    key: "design_prototype",
    pricingKey: "design_prototype",
    title: "Design & prototypes",
    blurb: "UI/UX, figma",
    brief: "Turn the idea into something people can click and believe.",
    Icon: Figma,
  },
  {
    key: "brand_logo",
    pricingKey: "brand_logo",
    title: "Brand & logo",
    blurb: "identity, the whole look",
    brief: "A sharper system for how you show up everywhere.",
    Icon: Shapes,
  },
  {
    key: "content",
    pricingKey: "content",
    title: "Content",
    blurb: "reels, carousels, posts",
    brief: "Campaign pieces that make the offer easier to notice.",
    Icon: Clapperboard,
  },
  {
    key: "security",
    pricingKey: "security",
    title: "Security checks",
    blurb: "audits, pen testing",
    brief: "Find the weak spots before customers or attackers do.",
    Icon: ShieldCheck,
  },
  {
    key: "legal_help",
    pricingKey: null,
    title: "Legal help",
    blurb: "I need legal help",
    brief: "For legal clarity, documents, or lawyer-ready next steps.",
    Icon: Scale,
  },
  {
    key: "other",
    pricingKey: null,
    title: "Something else",
    blurb: "tell us in your words",
    brief: "Start loose. We will shape the scope from your own words.",
    Icon: PenLine,
  },
];

/* ── Step 2 · persona ─────────────────────────────────────────────────────── */
export interface Persona {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const PERSONAS: Persona[] = [
  { key: "startup", label: "I have a startup", Icon: Rocket },
  { key: "business", label: "I run a business", Icon: Building2 },
  { key: "creator", label: "I'm a creator", Icon: Video },
  { key: "idea", label: "I have an idea", Icon: Lightbulb },
  { key: "freelancer", label: "I'm a freelancer / solo", Icon: User },
  { key: "for-someone", label: "Doing this for someone else", Icon: Users },
  { key: "looking", label: "Just looking around", Icon: Eye },
  { key: "other", label: "Something else", Icon: PenLine },
];

/* ── Step 3 · startup timeline stages ─────────────────────────────────────── */
export interface Stage {
  key: string;
  title: string;
  blurb: string;
  index: string;
}

export const PERSONA_STAGES: Record<string, Stage[]> = {
  startup: [
    {
      key: "ideation",
      index: "01",
      title: "Ideation",
      blurb: "Still shaping the idea. We help you find the sharpest version of it.",
    },
    {
      key: "prototype",
      index: "02",
      title: "Prototype",
      blurb: "You need something clickable to test the idea and show people.",
    },
    {
      key: "mvp",
      index: "03",
      title: "MVP",
      blurb: "Time for the first real version - built to ship, not just to demo.",
    },
    {
      key: "scaling",
      index: "04",
      title: "Scaling",
      blurb: "It already works. Now make it faster, bigger, and harder to break.",
    },
  ],
  business: [
    {
      key: "business-started",
      index: "01",
      title: "Just started",
      blurb: "The business is real, but the first impression still needs shape.",
    },
    {
      key: "business-quiet",
      index: "02",
      title: "Running, but quiet",
      blurb: "You have the thing. Now it needs to be easier to find, trust, and choose.",
    },
    {
      key: "business-steady",
      index: "03",
      title: "Steady, want more",
      blurb: "There is momentum already. We help turn that into sharper demand.",
    },
    {
      key: "business-scale",
      index: "04",
      title: "Ready to scale up",
      blurb: "The foundation works. Now the brand, site, and systems need to keep up.",
    },
  ],
  creator: [
    {
      key: "creator-starting",
      index: "01",
      title: "Just starting out",
      blurb: "You are finding the voice, format, and world people should remember.",
    },
    {
      key: "creator-audience",
      index: "02",
      title: "Building an audience",
      blurb: "People are beginning to notice. The next move is clarity and consistency.",
    },
    {
      key: "creator-watching",
      index: "03",
      title: "Got people watching",
      blurb: "There is attention now. We make the experience feel intentional.",
    },
    {
      key: "creator-pro",
      index: "04",
      title: "Ready to look pro",
      blurb: "The work has grown up. The identity around it should feel just as sharp.",
    },
  ],
  idea: [
    {
      key: "idea-thought",
      index: "01",
      title: "Just a thought",
      blurb: "It is early, fuzzy, and worth protecting until the shape gets clearer.",
    },
    {
      key: "idea-real",
      index: "02",
      title: "Need it to look real",
      blurb: "You need something people can see, understand, and react to.",
    },
    {
      key: "idea-build",
      index: "03",
      title: "Ready to build it",
      blurb: "The direction is clear enough. Now it needs a real first version.",
    },
    {
      key: "idea-launch",
      index: "04",
      title: "Ready to launch",
      blurb: "The idea is about to meet the world. We make that first impression count.",
    },
  ],
  freelancer: [
    {
      key: "freelancer-clients",
      index: "01",
      title: "Finding clients",
      blurb: "You need to look credible fast and make the offer easier to understand.",
    },
    {
      key: "freelancer-steady",
      index: "02",
      title: "Got steady work",
      blurb: "The pipeline exists. Now the brand should make better clients say yes.",
    },
    {
      key: "freelancer-bigger",
      index: "03",
      title: "Need to look bigger",
      blurb: "You are doing serious work. The outside needs to match the inside.",
    },
    {
      key: "freelancer-team",
      index: "04",
      title: "Ready to grow a team",
      blurb: "The solo chapter is stretching. We help make the next version feel real.",
    },
  ],
};

export const STARTUP_STAGES: Stage[] = PERSONA_STAGES.startup;


/* ── Step 3 · goals (non-startup personas) ────────────────────────────────── */
export interface Goal {
  key: string;
  label: string;
  Icon: LucideIcon;
}

export const GOALS: Goal[] = [
  { key: "launch", label: "Launch something new", Icon: Rocket },
  { key: "revamp", label: "Revamp what I have", Icon: RefreshCw },
  { key: "grow", label: "Grow / reach more people", Icon: TrendingUp },
  { key: "automate", label: "Automate or add AI", Icon: Wand2 },
  { key: "secure", label: "Make sure it's secure", Icon: ShieldCheck },
  { key: "explore", label: "Just exploring options", Icon: Compass },
];

export const PROXY_GOALS: Goal[] = [
  { key: "proxy-launch", label: "They need to launch something", Icon: Rocket },
  { key: "proxy-revamp", label: "They need a revamp", Icon: RefreshCw },
  { key: "proxy-grow", label: "They need more reach", Icon: TrendingUp },
  { key: "proxy-automate", label: "They need AI or automation", Icon: Wand2 },
  { key: "proxy-secure", label: "They need a security check", Icon: ShieldCheck },
  { key: "proxy-unsure", label: "I'm not fully sure yet", Icon: Compass },
];

/* ── Step 4 · sample work, keyed by service ───────────────────────────────── */
export interface WorkSample {
  title: string;
  tag: string;
  /** Drop a real image at this /public path to replace the placeholder. */
  src: string;
  /** Card shape for the masonry layout. */
  ratio: "tall" | "wide" | "square";
}

const WORK: Record<string, WorkSample[]> = {
  brand_logo: [
    { title: "Møss Studio", tag: "Identity", src: "/work/brand-1.jpg", ratio: "square" },
    { title: "Aurelia", tag: "Logo system", src: "/work/brand-2.jpg", ratio: "tall" },
    { title: "Northbound", tag: "Brand kit", src: "/work/brand-3.jpg", ratio: "wide" },
    { title: "Pace Coffee", tag: "Wordmark", src: "/work/brand-4.jpg", ratio: "square" },
  ],
  website: [
    { title: "Lumen", tag: "Landing", src: "/work/web-1.jpg", ratio: "wide" },
    { title: "Form & Field", tag: "E-commerce", src: "/work/web-2.jpg", ratio: "tall" },
    { title: "Orbital", tag: "Web app", src: "/work/web-3.jpg", ratio: "square" },
    { title: "Semaphore", tag: "Marketing site", src: "/work/web-4.jpg", ratio: "wide" },
  ],
  app: [
    { title: "Tide", tag: "iOS · Android", src: "/work/app-1.jpg", ratio: "tall" },
    { title: "Ledgr", tag: "Fintech", src: "/work/app-2.jpg", ratio: "tall" },
    { title: "Routine", tag: "Health", src: "/work/app-3.jpg", ratio: "square" },
    { title: "Cargo", tag: "Play Store", src: "/work/app-4.jpg", ratio: "tall" },
  ],
  design_prototype: [
    { title: "Atlas Dashboard", tag: "UI/UX", src: "/work/design-1.jpg", ratio: "wide" },
    { title: "Bloom", tag: "Prototype", src: "/work/design-2.jpg", ratio: "square" },
    { title: "Vista", tag: "Design system", src: "/work/design-3.jpg", ratio: "tall" },
    { title: "Cadence", tag: "Figma flows", src: "/work/design-4.jpg", ratio: "wide" },
  ],
  ai_integration: [
    { title: "Ask Aria", tag: "Support agent", src: "/work/ai-1.jpg", ratio: "square" },
    { title: "Draftly", tag: "AI workflow", src: "/work/ai-2.jpg", ratio: "wide" },
    { title: "Insight", tag: "RAG search", src: "/work/ai-3.jpg", ratio: "tall" },
    { title: "Autopilot", tag: "Automation", src: "/work/ai-4.jpg", ratio: "square" },
  ],
  content: [
    { title: "Reel set · 6", tag: "Short form", src: "/work/content-1.jpg", ratio: "tall" },
    { title: "Carousel", tag: "Social", src: "/work/content-2.jpg", ratio: "square" },
    { title: "Campaign", tag: "Posts", src: "/work/content-3.jpg", ratio: "wide" },
    { title: "Brand film", tag: "Video", src: "/work/content-4.jpg", ratio: "tall" },
  ],
  security: [
    { title: "Recon report", tag: "Audit", src: "/work/sec-1.jpg", ratio: "wide" },
    { title: "Web pen-test", tag: "OWASP", src: "/work/sec-2.jpg", ratio: "square" },
    { title: "App hardening", tag: "Mobile", src: "/work/sec-3.jpg", ratio: "tall" },
    { title: "Remediation", tag: "Fixes", src: "/work/sec-4.jpg", ratio: "wide" },
  ],
};

const DEFAULT_WORK: WorkSample[] = [
  { title: "Lumen", tag: "Website", src: "/work/web-1.jpg", ratio: "wide" },
  { title: "Tide", tag: "App", src: "/work/app-1.jpg", ratio: "tall" },
  { title: "Møss Studio", tag: "Brand", src: "/work/brand-1.jpg", ratio: "square" },
  { title: "Ask Aria", tag: "AI", src: "/work/ai-1.jpg", ratio: "square" },
];

/** Pick the sample set that matches the visitor's first concrete need. */
export function getWorkSamples(needs: string[]): WorkSample[] {
  for (const n of needs) {
    if (WORK[n]) return WORK[n];
  }
  return DEFAULT_WORK;
}
