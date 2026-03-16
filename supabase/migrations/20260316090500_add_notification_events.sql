-- Basic event log for notification sends/opens to support engagement tuning

create table if not exists public.notification_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  channel text not null check (channel in ('push', 'email')),
  action text not null check (action in ('sent', 'opened', 'clicked')),
  metadata jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists notification_events_user_id_idx
  on public.notification_events (user_id);

create index if not exists notification_events_type_channel_idx
  on public.notification_events (type, channel);

