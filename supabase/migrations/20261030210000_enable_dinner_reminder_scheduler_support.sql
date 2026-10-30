-- Enable the recurring scheduler and support local-time, duplicate-safe dinner reminders.
create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.notification_settings
  add column if not exists timezone text not null default 'Europe/London';

create table if not exists public.daily_dinner_reminder_sends (
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  attempted_at timestamptz not null default now(),
  sent_at timestamptz,
  error_message text,
  primary key (user_id, local_date)
);

alter table public.daily_dinner_reminder_sends enable row level security;
revoke all on public.daily_dinner_reminder_sends from anon, authenticated;
