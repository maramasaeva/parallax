create table topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  source_url text,
  source_text text not null default '',
  summary text,
  key_points jsonb,
  suggested_angles jsonb,
  created_at timestamptz default now()
);

create table perspectives (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  creator_name text not null,
  angle text not null,
  description text,
  created_at timestamptz default now()
);

alter table topics enable row level security;
alter table perspectives enable row level security;

create policy "topics are readable by everyone" on topics for select using (true);
create policy "topics are insertable by everyone" on topics for insert with check (true);

create policy "perspectives are readable by everyone" on perspectives for select using (true);
create policy "perspectives are insertable by everyone" on perspectives for insert with check (true);
