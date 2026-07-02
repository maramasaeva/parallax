alter table topics add column if not exists tags jsonb default '[]';
alter table topics add column if not exists featured boolean default false;
alter table topics add column if not exists source_type text default 'manual';

alter table perspectives add column if not exists video_url text;
