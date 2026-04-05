import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthProfilePhotoFromMetadata } from "@/utils/resolveProfilePhotoUrl";

export function useAvatarSync() {
  const syncGoogleAvatarUrl = useCallback(async (userId: string) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const photoUrl = oauthProfilePhotoFromMetadata(authUser);

      if (authUser?.id === userId && photoUrl) {
        const { error } = await supabase
          .from("profiles")
          .update({
            avatar_url: photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .eq("avatar_type", "google");

        if (error) {
          console.error("Avatar sync: failed to write profiles.avatar_url:", error);
        }
      }
    } catch (error) {
      console.error("Avatar sync error:", error);
    }
  }, []);

  return {
    syncGoogleAvatarUrl,
  };
}
