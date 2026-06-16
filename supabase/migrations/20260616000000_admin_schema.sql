-- maggie admin schema
-- Run this in Supabase SQL editor or via Supabase CLI.

do $$ begin
  create type public.app_role as enum ('owner', 'project_lead', 'editor', 'viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.lead_status as enum ('new', 'contacted', 'converted', 'lost');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.project_status as enum ('ongoing', 'on_hold', 'delivered', 'closed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.blog_status as enum ('draft', 'published');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.funnel_action as enum ('entered', 'completed');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role public.app_role not null default 'viewer',
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact_email text,
  contact_phone text,
  persona text,
  needs text[],
  stage text,
  brief_text text,
  ai_tier text,
  ai_price_low integer,
  ai_price_high integer,
  ai_summary text,
  ai_included text[],
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  service_type text not null,
  value integer,
  status public.project_status not null default 'ongoing',
  assigned_to uuid references public.profiles(id) on delete set null,
  deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null default '',
  cover_image_url text,
  status public.blog_status not null default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  viewed_at timestamptz not null default now(),
  referrer text,
  session_id text
);

create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  step_name text not null,
  action public.funnel_action not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pricing_config (
  id uuid primary key default gen_random_uuid(),
  service_key text not null,
  tier text not null check (tier in ('simple', 'medium', 'complex')),
  price_low integer not null,
  price_high integer not null,
  label text,
  updated_at timestamptz not null default now(),
  unique(service_key, tier)
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();

drop trigger if exists blog_posts_touch_updated_at on public.blog_posts;
create trigger blog_posts_touch_updated_at
before update on public.blog_posts
for each row execute function public.touch_updated_at();

drop trigger if exists pricing_config_touch_updated_at on public.pricing_config;
create trigger pricing_config_touch_updated_at
before update on public.pricing_config
for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_role(allowed public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_app_role() = any(allowed), false)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.app_role;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'viewer')::public.app_role;
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    requested_role
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(public.profiles.name, excluded.name),
    role = coalesce(public.profiles.role, excluded.role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.page_views enable row level security;
alter table public.funnel_events enable row level security;
alter table public.pricing_config enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "profiles select admins" on public.profiles;
create policy "profiles select admins"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.is_admin_role(array['owner','project_lead','viewer','editor']::public.app_role[])
);

drop policy if exists "profiles owner write" on public.profiles;
create policy "profiles owner write"
on public.profiles for all to authenticated
using (public.is_admin_role(array['owner']::public.app_role[]))
with check (public.is_admin_role(array['owner']::public.app_role[]));

drop policy if exists "leads read allowed roles" on public.leads;
create policy "leads read allowed roles"
on public.leads for select to authenticated
using (public.is_admin_role(array['owner','project_lead','viewer']::public.app_role[]));

drop policy if exists "leads update allowed roles" on public.leads;
create policy "leads update allowed roles"
on public.leads for update to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]))
with check (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

drop policy if exists "projects read allowed roles" on public.projects;
create policy "projects read allowed roles"
on public.projects for select to authenticated
using (public.is_admin_role(array['owner','project_lead','viewer']::public.app_role[]));

drop policy if exists "projects write allowed roles" on public.projects;
create policy "projects write allowed roles"
on public.projects for all to authenticated
using (public.is_admin_role(array['owner','project_lead']::public.app_role[]))
with check (public.is_admin_role(array['owner','project_lead']::public.app_role[]));

drop policy if exists "published blog public read" on public.blog_posts;
create policy "published blog public read"
on public.blog_posts for select to anon, authenticated
using (status = 'published');

drop policy if exists "blog owner editor write" on public.blog_posts;
create policy "blog owner editor write"
on public.blog_posts for all to authenticated
using (public.is_admin_role(array['owner','editor']::public.app_role[]))
with check (public.is_admin_role(array['owner','editor']::public.app_role[]));

drop policy if exists "page views insert public" on public.page_views;
create policy "page views insert public"
on public.page_views for insert to anon, authenticated
with check (true);

drop policy if exists "page views admin read" on public.page_views;
create policy "page views admin read"
on public.page_views for select to authenticated
using (public.is_admin_role(array['owner','project_lead','viewer']::public.app_role[]));

drop policy if exists "funnel events insert public" on public.funnel_events;
create policy "funnel events insert public"
on public.funnel_events for insert to anon, authenticated
with check (true);

drop policy if exists "funnel events admin read" on public.funnel_events;
create policy "funnel events admin read"
on public.funnel_events for select to authenticated
using (public.is_admin_role(array['owner','project_lead','viewer']::public.app_role[]));

drop policy if exists "pricing owner read write" on public.pricing_config;
create policy "pricing owner read write"
on public.pricing_config for all to authenticated
using (public.is_admin_role(array['owner']::public.app_role[]))
with check (public.is_admin_role(array['owner']::public.app_role[]));

drop policy if exists "settings owner read write" on public.site_settings;
create policy "settings owner read write"
on public.site_settings for all to authenticated
using (public.is_admin_role(array['owner']::public.app_role[]))
with check (public.is_admin_role(array['owner']::public.app_role[]));

insert into public.pricing_config (service_key, tier, price_low, price_high)
values
  ('brand_logo','simple',8000,20000),
  ('brand_logo','medium',20000,50000),
  ('brand_logo','complex',50000,120000),
  ('website','simple',15000,35000),
  ('website','medium',40000,120000),
  ('website','complex',150000,500000),
  ('app','simple',60000,150000),
  ('app','medium',200000,600000),
  ('app','complex',700000,2500000),
  ('design_prototype','simple',20000,40000),
  ('design_prototype','medium',50000,120000),
  ('design_prototype','complex',150000,400000),
  ('ai_integration','simple',25000,60000),
  ('ai_integration','medium',80000,250000),
  ('ai_integration','complex',300000,1000000),
  ('content','simple',10000,25000),
  ('content','medium',30000,80000),
  ('content','complex',100000,300000),
  ('security','simple',15000,40000),
  ('security','medium',50000,150000),
  ('security','complex',200000,600000)
on conflict (service_key, tier) do nothing;

insert into public.site_settings (key, value)
values
  ('cal_url', '"https://cal.com/your-handle/intro"'::jsonb),
  ('whatsapp_number', '"910000000000"'::jsonb),
  ('site_title', '"maggie - one studio. from idea to launch."'::jsonb),
  ('meta_description', '"One studio, from idea to launch."'::jsonb),
  ('og_image', '"/opengraph-image.png"'::jsonb)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

drop policy if exists "blog covers public read" on storage.objects;
create policy "blog covers public read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'blog-covers');

drop policy if exists "blog covers owner editor upload" on storage.objects;
create policy "blog covers owner editor upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'blog-covers'
  and public.is_admin_role(array['owner','editor']::public.app_role[])
);

drop policy if exists "blog covers owner editor update" on storage.objects;
create policy "blog covers owner editor update"
on storage.objects for update to authenticated
using (
  bucket_id = 'blog-covers'
  and public.is_admin_role(array['owner','editor']::public.app_role[])
)
with check (
  bucket_id = 'blog-covers'
  and public.is_admin_role(array['owner','editor']::public.app_role[])
);

drop policy if exists "blog covers owner editor delete" on storage.objects;
create policy "blog covers owner editor delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'blog-covers'
  and public.is_admin_role(array['owner','editor']::public.app_role[])
);
