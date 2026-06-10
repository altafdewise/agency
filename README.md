# Seven — Under Maintenance

A single-page, premium dark-theme holding page built with Next.js (App
Router, TypeScript) and Framer Motion. Quiet luxury: a fine serif wordmark,
a shimmering hairline, a live status indicator, a slow aurora glow, and film
grain — all resolving from a soft blur on load.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production
```

## Structure

- `app/layout.tsx` — fonts (`next/font` → Cormorant Garamond + Inter), metadata
- `app/page.tsx` — composes backdrop, vignette, content, grain
- `app/globals.css` — dark base, radial depth, vignette, film grain, no-scroll
- `components/Backdrop.tsx` — slow drifting aurora glows
- `components/Content.tsx` — centred stack with entrance + ambient motion

## Customising

- **Brand name:** replace `Seven` in [`components/Content.tsx`](components/Content.tsx).
- **Copy:** the mandatory `Under maintenance` line and the serif closing line
  are adjacent in the same file.
- **Palette:** background `#0A0A0A` → `#141414`, light `#F2EEE3` (CSS vars in
  `globals.css`).

## Notes

- **Reduced motion:** with `prefers-reduced-motion`, entrance and all ambient
  loops are disabled — the final composition renders static (grain retained).
- **Responsive:** every size uses `clamp()`; no scrollbars, no header/footer.
- Statically prerendered for fast load.
