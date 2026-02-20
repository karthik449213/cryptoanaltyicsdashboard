create extension if not exists "pgcrypto";

create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coin_id text not null,
  symbol text not null,
  quantity numeric(28, 10) not null check (quantity > 0),
  buy_price numeric(18, 8) not null check (buy_price > 0),
  buy_date timestamptz not null default timezone('utc', now()),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_portfolio_holdings_user_id on public.portfolio_holdings(user_id);
create index if not exists idx_portfolio_holdings_coin_id on public.portfolio_holdings(coin_id);

create or replace function public.set_updated_at_portfolio_holdings()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_portfolio_holdings_updated_at on public.portfolio_holdings;
create trigger trg_portfolio_holdings_updated_at
before update on public.portfolio_holdings
for each row
execute function public.set_updated_at_portfolio_holdings();

alter table public.portfolio_holdings enable row level security;

create policy "portfolio_select_own"
on public.portfolio_holdings
for select
using (auth.uid() = user_id);

create policy "portfolio_insert_own"
on public.portfolio_holdings
for insert
with check (auth.uid() = user_id);

create policy "portfolio_update_own"
on public.portfolio_holdings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "portfolio_delete_own"
on public.portfolio_holdings
for delete
using (auth.uid() = user_id);
