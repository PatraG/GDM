/**
 * useAuth Hook
 * 
 * React hook for authentication state management
 * Provides authentication status, user data, and auth operations
 * 
 * @module lib/hooks/useAuth
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Models } from 'appwrite';
import type { User, LoginCredentials } from '@/lib/types/auth';
import * as authService from '@/lib/appwrite/auth';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/lib/appwrite/constants';

interface UseAuthReturn {
  /** Current authenticated user */
  user: User | null;
  
  /** Current Appwrite session */
  session: Models.Session | null;
  
  /** Loading state during auth operations */
  isLoading: boolean;
  
  /** Error message from auth operations */
  error: string | null;
  
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether user is an admin */
  isAdmin: boolean;
  
  /** Whether user is an enumerator */
  isEnumerator: boolean;
  
  /** Time remaining until session expires (ms) */
  sessionTimeRemaining: number | null;
  
  /** Whether session is near expiration */
  isSessionNearExpiration: boolean;
  
  /** Login function */
  login: (credentials: LoginCredentials) => Promise<void>;
  
  /** Logout function */
  logout: () => Promise<void>;
  
  /** Refresh session function */
  refreshSession: () => Promise<void>;
  
  /** Extend session to prevent timeout */
  extendSession: () => Promise<void>;
}

/**
 * useAuth Hook
 * 
 * Manages authentication state and provides auth operations
 * Handles session timeout detection and warnings (FR-015, T043)
 * 
 * @returns Authentication state and operations
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Models.Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

  /**
   * Load current session and user data
   */
  const loadSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentSession = await authService.getSession();
      
      if (currentSession) {
        const currentUser = await authService.getUser();
        setSession(currentSession);
        setUser(currentUser);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Load session error:', err);
      setSession(null);
      setUser(null);
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login with credentials
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authSession = await authService.login(credentials);
      
      setSession(authSession.session);
      setUser(authSession.user);
      
      // Redirect based on role
      if (authSession.user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/enumerator/home');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Logout and clear session
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      
      setSession(null);
      setUser(null);
      setError(null);
      
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Clear state even if logout fails
      setSession(null);
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  /**
   * Refresh current session
   */
  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  /**
   * Extend session to prevent timeout
   */
  const extendSession = useCallback(async () => {
    try {
      const updatedSession = await authService.extendSession();
      setSession(updatedSession);
    } catch (err) {
      console.error('Extend session error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extend session');
    }
  }, []);

  /**
   * Calculate session time remaining
   */
  useEffect(() => {
    if (!session) {
      setSessionTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const expiresAt = new Date(session.expire).getTime();
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      setSessionTimeRemaining(remaining);
      
      // Auto-logout if session expired
      if (remaining === 0) {
        logout();
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every 10 seconds
    const interval = setInterval(updateTimeRemaining, 10000);

    return () => clearInterval(interval);
  }, [session, logout]);

  /**
   * Load session on mount
   */
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Computed values
  const isAuthenticated = user !== null && session !== null;
  const isAdmin = user?.role === 'admin';
  const isEnumerator = user?.role === 'enumerator';
  const isSessionNearExpiration = sessionTimeRemaining !== null && 
    sessionTimeRemaining > 0 && 
    sessionTimeRemaining <= SESSION_WARNING_MS;

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isEnumerator,
    sessionTimeRemaining,
    isSessionNearExpiration,
    login,
    logout,
    refreshSession,
    extendSession,
  };
}
