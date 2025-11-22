
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ProfileSetupDialog } from "@/components/auth/ProfileSetupDialog";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { achievementService } from "@/services/achievementService";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Track login for achievements
        if (event === 'SIGNED_IN' && session?.user) {
          await achievementService.recordLogin(session.user.id);
          // Dispatch engagement achievement check
          window.dispatchEvent(new CustomEvent('checkEngagementAchievements', {
            detail: { activityType: 'login' }
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Track login if session exists
      if (session?.user) {
        await achievementService.recordLogin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ProfileSetupWrapper />
    </AuthContext.Provider>
  );
};

const ProfileSetupWrapper = () => {
  const { needsSetup, completeSetup } = useProfileSetup();
  
  return (
    <ProfileSetupDialog 
      isOpen={needsSetup} 
      onComplete={completeSetup}
    />
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export the context itself
export { AuthContext };
