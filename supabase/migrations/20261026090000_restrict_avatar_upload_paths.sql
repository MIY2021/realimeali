-- Restrict avatar uploads to the authenticated user's own folder.
-- Existing update/delete policies already use this ownership convention.
drop policy if exists "Authenticated users can upload their avatar" on storage.objects;

create policy "Authenticated users can upload their avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
