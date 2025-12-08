
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ProfileSetupDialog } from "@/components/auth/ProfileSetupDialog";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility to clear corrupted auth data from localStorage
const clearAuthData = () => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const hadSessionRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsLoading(false);
          
          // Only show toast if user previously had a session (unexpected logout)
          if (hadSessionRef.current) {
            toast.info("Your session has expired. Please sign in again.");
            hadSessionRef.current = false;
          }
        } else if (event === 'TOKEN_REFRESHED') {
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            hadSessionRef.current = true;
          } else {
            // Token refresh returned no session - clear corrupted data
            console.warn('Token refresh failed - clearing auth data');
            clearAuthData();
            setSession(null);
            setUser(null);
            toast.info("Your session has expired. Please sign in again.");
          }
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          hadSessionRef.current = !!newSession;
          setIsLoading(false);
        } else {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession) hadSessionRef.current = true;
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session: existingSession }, error }) => {
        if (error) {
          console.error('Session retrieval error:', error);
          clearAuthData();
          setSession(null);
          setUser(null);
        } else {
          setSession(existingSession);
          setUser(existingSession?.user ?? null);
          hadSessionRef.current = !!existingSession;
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Critical session error:', error);
        clearAuthData();
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    hadSessionRef.current = false;
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
