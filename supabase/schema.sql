-- AI Calorie Tracker - Supabase şeması
-- Supabase Dashboard > SQL Editor'de çalıştır.

-- 1) meals tablosu
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  image_url text,
  foods jsonb not null default '[]'::jsonb,
  total_calories numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  health_score smallint check (health_score between 1 and 10),
  created_at timestamptz not null default now()
);

-- Meal History ve günlük toplamlar için (user_id, created_at) sorgularını hızlandırır
create index if not exists meals_user_id_created_at_idx
  on public.meals (user_id, created_at desc);

-- 2) Row Level Security: her kullanıcı yalnızca kendi kayıtlarını görebilir/değiştirebilir
alter table public.meals enable row level security;

drop policy if exists "Users can view their own meals" on public.meals;
create policy "Users can view their own meals"
  on public.meals for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own meals" on public.meals;
create policy "Users can insert their own meals"
  on public.meals for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own meals" on public.meals;
create policy "Users can update their own meals"
  on public.meals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own meals" on public.meals;
create policy "Users can delete their own meals"
  on public.meals for delete
  using (auth.uid() = user_id);

-- 3) Storage: yemek fotoğrafları için bucket
insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', true)
on conflict (id) do nothing;

-- Not: Dosyaları "{user_id}/dosya-adi.jpg" yolu ile yükle,
-- aşağıdaki policy'ler bu klasör yapısına göre yetkilendirme yapar.
drop policy if exists "Users can upload their own meal photos" on storage.objects;
create policy "Users can upload their own meal photos"
  on storage.objects for insert
  with check (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Anyone can view meal photos" on storage.objects;
create policy "Anyone can view meal photos"
  on storage.objects for select
  using (bucket_id = 'meal-photos');

drop policy if exists "Users can delete their own meal photos" on storage.objects;
create policy "Users can delete their own meal photos"
  on storage.objects for delete
  using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
