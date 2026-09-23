-- Admin operations and authorization hardening. Apply after the existing migrations.
-- Public visitors cannot create admin profiles or select an admin role through
-- auth user metadata. Team invitations create profiles with the service key.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop policy if exists "profiles select admins" on public.profiles;
create policy "profiles select admins"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.is_admin_role(array['owner','project_lead']::public.app_role[])
);

alter type public.lead_status add value if not exists 'qualified';
alter type public.lead_status add value if not exists 'proposal';
alter type public.lead_status add value if not exists 'won';

alter table public.leads add column if not exists company text;
alter table public.leads add column if not exists estimate_status text;
alter table public.leads add column if not exists ai_timeline text;
alter table public.leads add column if not exists updated_at timestamptz;
update public.leads set updated_at = created_at where updated_at is null;
alter table public.leads alter column updated_at set default now();
alter table public.leads alter column updated_at set not null;
alter table public.leads drop constraint if exists leads_estimate_status_check;
alter table public.leads add constraint leads_estimate_status_check
  check (estimate_status is null or estimate_status in ('new','reviewing','sent','accepted','rejected'));
update public.leads set estimate_status = 'new'
where estimate_status is null and ai_price_low is not null;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
before update on public.leads
for each row execute function public.touch_updated_at();

drop policy if exists "leads delete owner project lead" on public.leads;
create policy "leads delete owner project lead"
on public.leads for delete to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

alter table public.bookings add column if not exists status text;
alter table public.bookings add column if not exists updated_at timestamptz;
update public.bookings set status = 'pending' where status is null;
update public.bookings set updated_at = created_at where updated_at is null;
alter table public.bookings alter column status set default 'pending';
alter table public.bookings alter column status set not null;
alter table public.bookings alter column updated_at set default now();
alter table public.bookings alter column updated_at set not null;
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('pending','confirmed','cancelled'));

-- Cancelled records remain visible in history but no longer reserve a slot.
alter table public.bookings drop constraint if exists bookings_date_time_key;
create unique index if not exists bookings_active_slot_key
  on public.bookings (date, time) where status <> 'cancelled';

drop trigger if exists bookings_touch_updated_at on public.bookings;
create trigger bookings_touch_updated_at
before update on public.bookings
for each row execute function public.touch_updated_at();

drop policy if exists "bookings delete owner project lead" on public.bookings;
create policy "bookings delete owner project lead"
on public.bookings for delete to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

alter table public.feedback add column if not exists name text;
alter table public.feedback add column if not exists rating smallint;
alter table public.feedback add column if not exists project text;
alter table public.feedback drop constraint if exists feedback_rating_check;
alter table public.feedback add constraint feedback_rating_check
  check (rating is null or rating between 1 and 5);

drop policy if exists "feedback delete owner project lead" on public.feedback;
create policy "feedback delete owner project lead"
on public.feedback for delete to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_created_at_idx on public.leads (status, created_at desc);
create index if not exists bookings_date_time_idx on public.bookings (date, time);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
