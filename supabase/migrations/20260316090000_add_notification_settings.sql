-- Create per-user notification settings for meal reminders and household activity

create table if not exists public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_dinner_push_enabled boolean not null default true,
  daily_dinner_email_enabled boolean not null default false,
  daily_dinner_time text not null default '17:00',
  daily_dinner_days_of_week smallint[] not null default '{1,2,3,4,5}', -- 0=Sunday
  weekly_kickoff_push_enabled boolean not null default false,
  weekly_kickoff_email_enabled boolean not null default true,
  weekly_kickoff_day smallint not null default 0,
  weekly_kickoff_time text not null default '15:00',
  household_activity_push_enabled boolean not null default true,
  household_activity_email_enabled boolean not null default false,
  inserted_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Ensure updated_at is maintained automatically
create or replace function public.set_notification_settings_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_notification_settings_updated_at on public.notification_settings;

create trigger set_notification_settings_updated_at
before update on public.notification_settings
for each row
execute procedure public.set_notification_settings_updated_at();

