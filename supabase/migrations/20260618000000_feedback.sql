-- Anonymous issue and feedback drop.
-- No identifying fields: message + timestamp only.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

-- Reads restricted to owner + project_lead (admin "Feedback" view).
drop policy if exists "feedback read owner project lead" on public.feedback;
create policy "feedback read owner project lead"
on public.feedback for select to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

-- Writes happen server-side via the service-role key, which bypasses RLS, so
-- no public insert policy is granted here.
