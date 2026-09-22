-- Baseline schema for the Learning Needs Navigator.
-- Captured from the live database during the move off Lovable-managed hosting.
-- Superseded migrations are kept under migrations/_archive_lovable/ for reference;
-- they never described the live schema accurately (reports was missing entirely).

create type public.app_role as enum ('admin', 'user');

create table public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- user_id intentionally carries no foreign key, matching the live schema.
create table public.reports (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null default 'Learning Needs Analysis Report'::text,
  problem_summary text not null,
  learning_recommendations jsonb not null default '[]'::jsonb,
  instructional_approach jsonb not null default '{}'::jsonb,
  key_insights jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_reports_user_created
  on public.reports using btree (user_id, created_at desc);

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path to 'public'
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable set search_path to 'public'
as $function$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$function$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public'
as $function$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

create trigger update_reports_updated_at
before update on public.reports
for each row execute function public.update_updated_at_column();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles   enable row level security;
alter table public.reports    enable row level security;
alter table public.user_roles enable row level security;

create policy "Users can view their own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles"       on public.profiles for select using (public.has_role(auth.uid(), 'admin'));
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can view their own reports"   on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert their own reports" on public.reports for insert with check (auth.uid() = user_id);
create policy "Users can update their own reports" on public.reports for update using (auth.uid() = user_id);
create policy "Users can delete their own reports" on public.reports for delete using (auth.uid() = user_id);

create policy "Users can view their own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "Admins can view all roles"      on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));

grant all on public.profiles   to anon, authenticated, service_role;
grant all on public.reports    to anon, authenticated, service_role;
grant all on public.user_roles to anon, authenticated, service_role;

revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant  execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
