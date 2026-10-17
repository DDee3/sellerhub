alter table public.shops 
add column if not exists rate_display_mode text not null default 'mmk_per_thb' check (rate_display_mode in ('mmk_per_thb', 'thb_per_lakh'));

