create table if not exists public.deal_sources (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  source_amount numeric not null check (source_amount > 0),
  source_rate numeric not null check (source_rate > 0),
  created_at timestamptz not null default now()
);

create index if not exists deal_sources_deal_id_idx on public.deal_sources (deal_id);

alter table public.deal_sources enable row level security;

create policy "Users can manage their own deal sources"
  on public.deal_sources for all
  using (
    deal_id in (
      select d.id from public.deals d
      join public.shops s on d.shop_id = s.id
      where s.owner_id = auth.uid()
    )
  )
  with check (
    deal_id in (
      select d.id from public.deals d
      join public.shops s on d.shop_id = s.id
      where s.owner_id = auth.uid()
    )
  );

