import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageCompression";

const BUCKET = "user-avatars";

export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const compressed = await compressImage(file, 800, 800, 0.88);
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed.file, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
