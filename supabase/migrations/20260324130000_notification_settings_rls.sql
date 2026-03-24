-- Allow each signed-in user to read and upsert their own notification_settings row.
-- Without these policies, RLS (if enabled) would block all access.

alter table public.notification_settings enable row level security;

drop policy if exists "Users can read own notification_settings" on public.notification_settings;
drop policy if exists "Users can insert own notification_settings" on public.notification_settings;
drop policy if exists "Users can update own notification_settings" on public.notification_settings;

create policy "Users can read own notification_settings"
on public.notification_settings
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own notification_settings"
on public.notification_settings
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own notification_settings"
on public.notification_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
