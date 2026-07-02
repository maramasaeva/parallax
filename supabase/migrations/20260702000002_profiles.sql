create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  interests jsonb default '[]',
  audience text default 'general',
  complexity_pref text default 'accessible',
  formats jsonb default '[]',
  tone jsonb default '[]',
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "profiles are readable by everyone" on profiles for select using (true);
create policy "profiles are insertable by everyone" on profiles for insert with check (true);
create policy "profiles are updatable by everyone" on profiles for update using (true);
