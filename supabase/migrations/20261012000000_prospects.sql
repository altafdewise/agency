-- The outreach list at /leads: local businesses our researchers find, which
-- tele-callers phone and log. Separate from `leads` (people who asked us for
-- an estimate). Only the server (service key) reads or writes it: RLS is on
-- and no policy grants anyone else access; /leads is guarded by its passcode.

create table if not exists public.prospects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  phone_key text not null,                 -- last 10 digits, for de-duplication
  city text not null default 'Hyderabad',
  area text,
  category text not null default 'other',  -- clinic, salon, gym, coaching, cafe, shop, services, realty, auto, events, other
  subtype text,
  need text not null default 'website',    -- website, app, content
  website_status text not null default 'unknown', -- none, bad, ok, unknown
  website_url text,
  source_url text,
  notes text,
  status text not null default 'new',      -- new, no_answer, call_back, interested, not_interested, won
  attempts integer not null default 0,
  last_called_at timestamptz,
  follow_up_on date,
  added_by text,
  called_by text
);

alter table public.prospects enable row level security;

create unique index if not exists prospects_city_phone_key_idx
  on public.prospects (city, phone_key);
create index if not exists prospects_status_idx on public.prospects (status);
create index if not exists prospects_follow_up_idx on public.prospects (follow_up_on)
  where follow_up_on is not null;
create index if not exists prospects_city_area_idx on public.prospects (city, area);
