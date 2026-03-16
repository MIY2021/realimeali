-- Extend household activity notification options for push level and email digest frequency

alter table public.notification_settings
add column if not exists household_activity_push_level text not null default 'important',
add column if not exists household_activity_email_frequency text not null default 'none';

