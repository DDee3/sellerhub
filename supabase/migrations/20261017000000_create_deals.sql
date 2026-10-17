create table public.deals (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  direction text not null check (direction in ('mmk_to_thb','thb_to_mmk')),
  amount_in numeric(20,2) not null check (amount_in > 0),
  customer_rate numeric(20,6) not null check (customer_rate > 0),
  source_rate numeric(20,6) check (source_rate is null or source_rate > 0),
  amount_out numeric(20,2) not null check (amount_out > 0),
  profit_mmk numeric(20,2),
  note text,
  created_at timestamptz not null default now()
);

create index deals_shop_created_idx on public.deals (shop_id, created_at desc);

alter table public.deals enable row level security;

create policy "Users can manage their own deals"
  on public.deals for all
  using (
    shop_id in (
      select id from public.shops where owner_id = auth.uid()
    )
  );

