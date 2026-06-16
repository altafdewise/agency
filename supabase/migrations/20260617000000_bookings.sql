create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date not null,
  time text not null,
  timezone text not null default 'Asia/Kolkata',
  contact_name text,
  contact_email text not null,
  contact_phone text,
  note text,
  brief jsonb not null,
  estimate jsonb,
  unique (date, time)
);

alter table public.bookings enable row level security;

drop policy if exists "bookings read allowed roles" on public.bookings;
create policy "bookings read allowed roles"
on public.bookings for select to authenticated
using (public.is_admin_role(array['owner','project_lead','viewer']::public.app_role[]));

drop policy if exists "bookings owner project lead update" on public.bookings;
create policy "bookings owner project lead update"
on public.bookings for update to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]))
with check (public.is_admin_role(array['owner','project_lead']::public.app_role[]));
