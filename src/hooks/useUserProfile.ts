
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  auth_provider: string;
  avatar_type: string;
  avatar_data?: string;
}

export const useUserProfile = (user_id: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user_id) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url, auth_provider, avatar_type, avatar_data')
          .eq('id', user_id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user_id]);

  return { profile, isLoading };
};
