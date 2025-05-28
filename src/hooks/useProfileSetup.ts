
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  id: string;
  full_name: string | null;
  auth_provider: string;
  avatar_type: string;
  avatar_data: string | null;
  profile_completed: boolean;
}

export const useProfileSetup = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setNeedsSetup(false);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, auth_provider, avatar_type, avatar_data, profile_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
        
        // Show setup dialog if user signed up with email and hasn't completed profile
        const shouldShowSetup = data.auth_provider === 'email' && !data.profile_completed;
        setNeedsSetup(shouldShowSetup);
        
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const completeSetup = () => {
    setNeedsSetup(false);
    if (profile) {
      setProfile({ ...profile, profile_completed: true });
    }
  };

  return { profile, isLoading, needsSetup, completeSetup };
};
