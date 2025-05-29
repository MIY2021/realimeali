
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user for development
  useEffect(() => {
    // Simulate loading and set mock user
    setTimeout(() => {
      setUser({
        id: 'mock-user-1',
        name: 'Mock User',
        email: 'mock@example.com',
        avatar: undefined,
        user_metadata: {
          name: 'Mock User',
          full_name: 'Mock User',
          avatar_url: undefined,
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    // Mock sign in
    setTimeout(() => {
      setUser({
        id: 'mock-user-1',
        name: 'Mock User',
        email: email,
        avatar: undefined,
        user_metadata: {
          name: 'Mock User',
          full_name: 'Mock User',
          avatar_url: undefined,
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    // Mock sign up
    setTimeout(() => {
      setUser({
        id: 'mock-user-1',
        name: name,
        email: email,
        avatar: undefined,
        user_metadata: {
          name: name,
          full_name: name,
          avatar_url: undefined,
        }
      });
      setIsLoading(false);
    }, 1000);
  };

  const signOut = async () => {
    setIsLoading(true);
    // Mock sign out
    setTimeout(() => {
      setUser(null);
      setIsLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
