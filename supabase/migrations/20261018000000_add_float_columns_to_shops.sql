alter table public.shops 
add column if not exists float_mmk numeric(20,2) not null default 0,
add column if not exists float_thb numeric(20,2) not null default 0;

