-- Where each lead came from: the campaign link, ad click or referring site
-- that brought the visitor (see lib/attribution.ts). Shown in admin and in
-- the team's lead alert. Existing leads keep these empty.

alter table public.leads
  add column if not exists source text,
  add column if not exists medium text,
  add column if not exists campaign text,
  add column if not exists referrer text,
  add column if not exists landing_page text;

create index if not exists leads_source_idx on public.leads (source);
