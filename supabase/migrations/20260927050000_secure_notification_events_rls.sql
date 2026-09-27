-- Keep notification event telemetry server-only.
-- Edge Functions use the service role, which bypasses RLS.
-- Direct browser access is explicitly denied so notification history
-- cannot be read or modified through the public Supabase API.

alter table public.notification_events enable row level security;

drop policy if exists "Block direct client access to notification events"
  on public.notification_events;

create policy "Block direct client access to notification events"
on public.notification_events
for all
to anon, authenticated
using (false)
with check (false);
