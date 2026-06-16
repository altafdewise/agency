# maggie — the path

A premium, dark, interactive single-page experience for the creative studio
**maggie** (maggie.agency). Not a scrolling landing page — a guided "path" the
visitor walks one full-screen step at a time. It quietly qualifies them as a
lead and ends with an **AI-generated project estimate**.

Built with Next.js (App Router, TS), Tailwind, Framer Motion, and the Claude
API. Design system: _Exaggerated Minimalism_ — Apple's SF Pro type system
(SF Pro / `-apple-system` on Apple devices, **Inter** as the open fallback
everywhere else), extreme negative space, one accent (Signal Red `#FF4438`).

## Run

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev                        # http://localhost:3000
npm run build && npm start         # production
```

> The path works **without any keys** — the estimate route falls back to a
> grounded heuristic from `PRICING_TABLE`. Add the keys below to go live.

## ✎ What you need to fill in

| Thing | Where | Status |
|---|---|---|
| **Claude API key** | `.env.local` → `ANTHROPIC_API_KEY` | needed for real estimates (else heuristic) |
| **Pricing ranges** | `PRICING_TABLE` in [`app/api/estimate/route.ts`](app/api/estimate/route.ts) | ✅ pre-filled with 2026 INR rates — adjust freely |
| **Cal.com link** | `.env.local` → `NEXT_PUBLIC_CAL_LINK` | placeholder |
| **WhatsApp number** | `.env.local` → `NEXT_PUBLIC_WHATSAPP` (digits + country code) | placeholder |
| **Contact email** | `.env.local` → `NEXT_PUBLIC_CONTACT_EMAIL` | placeholder |
| **Work images** | drop files at `public/work/*.jpg` (names in [`lib/content.ts`](lib/content.ts)) | elegant placeholders until added |
| **Logo** | `public/Logo/logo.png` | ✅ done (see below) |

## The 8-step path

1. **Hero = first question** — the animated `7.` mark + "what brings you here?" service cards
2. **Who's it for** — persona cards
3. **Stage** — startup persona gets a gamified scroll-timeline (Ideation → Scaling); others get a goal select
4. **Work preview** — sample cards matched to the chosen service
5. **The brief** — one calm textarea
6. **Contact** — optional email, skippable
7. **The estimate** — POSTs the brief to `/api/estimate`, renders the range
8. **The close** — CTAs; the "delivered in 24 hours" promise shows **only** for the simple tier

State accumulates in one `brief` object via `components/PathProvider.tsx`.

## The logo animation

`public/Logo/logo.png` is the raw black `7.` mark. At build-of-asset time,
[`scripts/analyze-logo.mjs`](scripts/analyze-logo.mjs) (run with `node`) used
`sharp` to measure the dot's exact position and generate
`public/Logo/logo-mark.png` — the `7` **without** its dot. The component
([`components/Logo.tsx`](components/Logo.tsx)) renders the `7` as a bone-coloured
CSS mask (so it recolours + glows) and overlays a **separate** Framer Motion dot
that, at rest, sits exactly where the original dot was. On loop the dot detaches,
travels a clockwise elliptical orbit around the whole `7`, returns precisely to
rest, holds, and breathes. `prefers-reduced-motion` → static dot, glow on, no orbit.

Re-derive the asset any time: `node scripts/analyze-logo.mjs`.

## How the estimate works

`app/api/estimate/route.ts` (server-only, model `claude-sonnet-4-6`) sends the
brief + `PRICING_TABLE` + estimator rules to Claude and asks for JSON only. It
strips stray ``` fences, validates the shape, and on **any** failure (no key,
bad JSON, network) falls back to a deterministic estimate from the same table —
so the journey never dead-ends. Returns:

```ts
{ tier: "simple"|"medium"|"complex", priceLow, priceHigh, timeline, summary, included[] }
```

## Structure

```
app/
  layout.tsx            fonts (Inter as SF Pro fallback + mono), metadata
  page.tsx              PathProvider → Path
  globals.css           tokens, base, component classes, grain, reduced-motion
  api/estimate/route.ts the Claude route + PRICING_TABLE + heuristic
components/
  Path.tsx              step orchestrator + chrome (index, back)
  PathProvider.tsx      brief state machine (context)
  Logo.tsx              masked 7 + orbiting dot
  steps/Step1..8        the eight steps
  ui/                   Button, OptionCard, inputs, StepShell, OtherInput
lib/
  brief.ts              shared types (Brief, Estimate)
  content.ts            services, personas, stages, goals, work samples
  cn.ts                 class merge helper
```

## Notes

- Fully responsive (375 → 1440), no horizontal scroll; the Step-3 timeline works on touch.
- `prefers-reduced-motion` respected everywhere (no orbit, no scroll-linked fades, instant step changes).
- One accent only. Icons are Lucide. Semantic Tailwind tokens, no hardcoded hex in components.
