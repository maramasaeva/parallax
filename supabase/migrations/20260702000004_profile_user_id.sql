alter table profiles add column if not exists user_id uuid references auth.users(id);
create unique index if not exists profiles_user_id_idx on profiles(user_id);
