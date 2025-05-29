
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { passwordSchema } from '@/utils/inputValidation';

interface SecurityMetrics {
  lastLoginTime: number;
  loginAttempts: number;
  sessionStartTime: number;
}

export function useSecureAuth() {
  const { user, session } = useAuth();
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Session timeout (24 hours)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
  
  // Suspicious activity detection
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    if (session) {
      const now = Date.now();
      setSecurityMetrics({
        lastLoginTime: now,
        loginAttempts: 0,
        sessionStartTime: now
      });

      // Set session timeout
      const timeout = setTimeout(() => {
        console.warn('Session timeout - please re-authenticate');
        // In a real app, you'd sign out the user here
      }, SESSION_TIMEOUT);

      setSessionTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [session]);

  const validatePassword = (password: string): { isValid: boolean; error?: string } => {
    const validation = passwordSchema.safeParse(password);
    return {
      isValid: validation.success,
      error: validation.success ? undefined : validation.error.errors[0]?.message
    };
  };

  const recordLoginAttempt = (success: boolean) => {
    if (!success && securityMetrics) {
      const attempts = securityMetrics.loginAttempts + 1;
      setSecurityMetrics({
        ...securityMetrics,
        loginAttempts: attempts
      });

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        console.warn('Multiple failed login attempts detected');
        // In a real app, you'd implement account lockout here
      }
    } else if (success) {
      setSecurityMetrics(prev => prev ? { ...prev, loginAttempts: 0 } : null);
    }
  };

  const isSessionActive = (): boolean => {
    if (!securityMetrics || !session) return false;
    
    const now = Date.now();
    const sessionAge = now - securityMetrics.sessionStartTime;
    
    return sessionAge < SESSION_TIMEOUT;
  };

  const getSecurityScore = (): number => {
    let score = 0;
    
    if (user?.email) score += 20;
    if (session) score += 30;
    if (isSessionActive()) score += 25;
    if (securityMetrics && securityMetrics.loginAttempts === 0) score += 25;
    
    return score;
  };

  return {
    securityMetrics,
    validatePassword,
    recordLoginAttempt,
    isSessionActive,
    getSecurityScore,
    isAuthenticated: !!user && isSessionActive()
  };
}
