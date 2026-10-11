-- Shared limits for the public estimate endpoint. Every serverless instance
-- counts against the same rows, so limits hold no matter which instance a
-- request lands on. Visitors are stored only as salted hashes.
-- Only the server (service key) reads or writes this table: RLS is on and no
-- policy grants visitors or admins access.

create table if not exists public.estimate_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_hash text not null,
  email_hash text,
  emailed boolean not null default false
);

alter table public.estimate_requests enable row level security;

create index if not exists estimate_requests_created_at_idx
  on public.estimate_requests (created_at desc);
create index if not exists estimate_requests_client_created_idx
  on public.estimate_requests (client_hash, created_at desc);
create index if not exists estimate_requests_email_created_idx
  on public.estimate_requests (email_hash, created_at desc)
  where email_hash is not null;
