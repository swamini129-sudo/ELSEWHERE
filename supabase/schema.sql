-- ELSEWHERE — secure Supabase schema
-- Fresh-project setup. Run once in Supabase SQL Editor.
-- Public item data is separated from private contact information.

create extension if not exists pgcrypto;

-- 1. Student profiles: private by default (email is not publicly readable).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'student'), '@', 1)),
    new.email
  )
  on conflict (id) do update set
    display_name = excluded.display_name,
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 2. Public registry items: no contact email column here.
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reporter_name text not null default 'Student',
  title text not null,
  category text not null check (category in ('Keys', 'Bottles', 'Stationery', 'Electronics', 'ID Cards', 'Other')),
  colour text not null,
  description text not null,
  campus_location text not null,
  type text not null check (type in ('lost', 'found')),
  approximate_date date not null default current_date,
  image_url text,
  status text not null default 'Available' check (status in ('Available', 'Claim Pending', 'Returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_items_type on public.items(type);
create index if not exists idx_items_category on public.items(category);
create index if not exists idx_items_status on public.items(status);
create index if not exists idx_items_campus_location on public.items(campus_location);
create index if not exists idx_items_created_at on public.items(created_at desc);
create index if not exists idx_items_reporter_id on public.items(reporter_id);

-- 3. Private contact details; readable only by the item's reporter.
create table if not exists public.item_contacts (
  item_id uuid primary key references public.items(id) on delete cascade,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Claims.
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references auth.users(id) on delete cascade,
  claimant_name text not null,
  claimant_email text,
  claim_message text not null,
  claim_status text not null default 'pending' check (claim_status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_claims_item_id on public.claims(item_id);
create index if not exists idx_claims_claimant_id on public.claims(claimant_id);
create index if not exists idx_claims_created_at on public.claims(created_at desc);
create unique index if not exists idx_unique_claimant_item_pending
  on public.claims(item_id, claimant_id) where claim_status = 'pending';

-- 5. RLS.
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_contacts enable row level security;
alter table public.claims enable row level security;

-- Policies are dropped first so this script can be safely re-run on this schema.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Anyone can browse items" on public.items;
drop policy if exists "Authenticated users can create own items" on public.items;
drop policy if exists "Reporters can update own items" on public.items;
drop policy if exists "Reporters can delete own items" on public.items;
create policy "Anyone can browse items" on public.items
  for select to anon, authenticated using (true);
create policy "Authenticated users can create own items" on public.items
  for insert to authenticated with check (auth.uid() = reporter_id);
create policy "Reporters can update own items" on public.items
  for update to authenticated using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);
create policy "Reporters can delete own items" on public.items
  for delete to authenticated using (auth.uid() = reporter_id);

drop policy if exists "Reporter can read item contact" on public.item_contacts;
drop policy if exists "Reporter can insert item contact" on public.item_contacts;
drop policy if exists "Reporter can update item contact" on public.item_contacts;
create policy "Reporter can read item contact" on public.item_contacts
  for select to authenticated using (
    exists (select 1 from public.items i where i.id = item_contacts.item_id and i.reporter_id = auth.uid())
  );
create policy "Reporter can insert item contact" on public.item_contacts
  for insert to authenticated with check (
    exists (select 1 from public.items i where i.id = item_contacts.item_id and i.reporter_id = auth.uid())
  );
create policy "Reporter can update item contact" on public.item_contacts
  for update to authenticated using (
    exists (select 1 from public.items i where i.id = item_contacts.item_id and i.reporter_id = auth.uid())
  ) with check (
    exists (select 1 from public.items i where i.id = item_contacts.item_id and i.reporter_id = auth.uid())
  );

drop policy if exists "Claimants and reporters can read relevant claims" on public.claims;
drop policy if exists "Authenticated users can claim another user's item" on public.claims;
drop policy if exists "Reporters can update claims for their items" on public.claims;
create policy "Claimants and reporters can read relevant claims" on public.claims
  for select to authenticated using (
    auth.uid() = claimant_id or exists (
      select 1 from public.items i where i.id = claims.item_id and i.reporter_id = auth.uid()
    )
  );
create policy "Authenticated users can claim another user's item" on public.claims
  for insert to authenticated with check (
    auth.uid() = claimant_id and exists (
      select 1 from public.items i
      where i.id = claims.item_id and i.reporter_id <> auth.uid() and i.status = 'Available'
    )
  );
create policy "Reporters can update claims for their items" on public.claims
  for update to authenticated using (
    exists (select 1 from public.items i where i.id = claims.item_id and i.reporter_id = auth.uid())
  ) with check (
    exists (select 1 from public.items i where i.id = claims.item_id and i.reporter_id = auth.uid())
  );

-- 6. Keep item status in sync when claims change. Trigger functions are privileged
-- only for this narrow operation; users cannot directly update other users' items.
create or replace function public.sync_item_status_from_claim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.items set status = 'Claim Pending', updated_at = now()
      where id = new.item_id and status = 'Available';
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.claim_status = 'accepted' then
      update public.items set status = 'Returned', updated_at = now() where id = new.item_id;
    elsif new.claim_status = 'rejected' and not exists (
      select 1 from public.claims c where c.item_id = new.item_id and c.claim_status = 'pending' and c.id <> new.id
    ) then
      update public.items set status = 'Available', updated_at = now()
        where id = new.item_id and status = 'Claim Pending';
    end if;
    return new;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists on_claim_insert_sync_item on public.claims;
drop trigger if exists on_claim_update_sync_item on public.claims;
create trigger on_claim_insert_sync_item after insert on public.claims
for each row execute function public.sync_item_status_from_claim();
create trigger on_claim_update_sync_item after update of claim_status on public.claims
for each row execute function public.sync_item_status_from_claim();

-- 7. Storage bucket and policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('item-photos', 'item-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Item photos are publicly accessible" on storage.objects;
drop policy if exists "Authenticated users can upload item photos" on storage.objects;
drop policy if exists "Users can delete their uploaded photos" on storage.objects;
create policy "Item photos are publicly accessible" on storage.objects
  for select to anon, authenticated using (bucket_id = 'item-photos');
create policy "Authenticated users can upload item photos to own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'item-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users can delete their uploaded photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'item-photos' and owner_id = auth.uid()::text
  );

-- Explicit table privileges: RLS policies still decide which rows are visible.
grant select on public.items to anon, authenticated;
grant insert, update, delete on public.items to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.item_contacts to authenticated;
grant select, insert, update on public.claims to authenticated;
