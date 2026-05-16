-- Optional longer text for deck list / detail UIs
alter table public.decks
  add column if not exists description text;
