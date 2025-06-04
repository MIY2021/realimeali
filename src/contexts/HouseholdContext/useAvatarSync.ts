
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAvatarSync() {
  const syncGoogleAvatarUrl = useCallback(async (userId: string) => {
    try {
      console.log('DEBUG AVATAR SYNC: Starting sync for user:', userId);
      
      // Get the current user's auth data to access Google avatar
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      console.log('DEBUG AVATAR SYNC: Auth user data:', {
        authUserId: authUser?.id,
        targetUserId: userId,
        hasAvatarUrl: !!authUser?.user_metadata?.avatar_url,
        avatarUrl: authUser?.user_metadata?.avatar_url
      });
      
      if (authUser?.id === userId && authUser?.user_metadata?.avatar_url) {
        console.log('DEBUG AVATAR SYNC: Syncing Google avatar for user:', userId, authUser.user_metadata.avatar_url);
        
        // Update the profile with the Google avatar URL
        const { error } = await supabase
          .from('profiles')
          .update({ 
            avatar_url: authUser.user_metadata.avatar_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('DEBUG AVATAR SYNC: Error syncing Google avatar:', error);
        } else {
          console.log('DEBUG AVATAR SYNC: Successfully synced Google avatar to profiles table');
        }
      } else {
        console.log('DEBUG AVATAR SYNC: Skipping sync - not current user or no avatar URL');
      }
    } catch (error) {
      console.error('DEBUG AVATAR SYNC: Error in syncGoogleAvatarUrl:', error);
    }
  }, []);

  return {
    syncGoogleAvatarUrl,
  };
}
