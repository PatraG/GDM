/**
 * useSessions Hook
 * Manages session state and operations for enumerators
 *
 * Features:
 * - Track active session with auto-refresh
 * - Monitor session timeout with warning
 * - Create and close sessions
 * - Handle session activity updates
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Session } from '@/lib/types/session';
import {
  getActiveSession,
  createSession as createSessionService,
  closeSession as closeSessionService,
  updateSessionActivity,
  isSessionTimedOut,
  isSessionNearTimeout,
  getSessionTimeRemaining,
  listSessions,
  SESSION_TIMEOUT_MS,
} from '@/lib/services/sessionService';
import type { SessionCreate } from '@/lib/types/session';

interface UseSessionsOptions {
  enumeratorId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface UseSessionsReturn {
  activeSession: Session | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  timeRemaining: number; // milliseconds
  isNearTimeout: boolean;
  hasTimedOut: boolean;
  createSession: (input: SessionCreate) => Promise<Session>;
  closeSession: (sessionId: string, reason: 'manual' | 'timeout' | 'completed') => Promise<Session>;
  refreshActiveSession: () => Promise<void>;
  refreshSessions: () => Promise<void>;
  updateActivity: () => Promise<void>;
}

/**
 * Hook for managing sessions
 * Tracks active session, monitors timeout, and provides CRUD operations
 */
export function useSessions({
  enumeratorId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: UseSessionsOptions): UseSessionsReturn {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isNearTimeout, setIsNearTimeout] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const activityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const refreshTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Fetch active session
   */
  const refreshActiveSession = useCallback(async () => {
    try {
      setError(null);
      const session = await getActiveSession(enumeratorId);
      setActiveSession(session);

      // Update timeout states
      if (session) {
        setTimeRemaining(getSessionTimeRemaining(session));
        setIsNearTimeout(isSessionNearTimeout(session));
        setHasTimedOut(isSessionTimedOut(session));

        // Auto-close if timed out
        if (isSessionTimedOut(session)) {
          await closeSessionService(session.$id, 'timeout');
          setActiveSession(null);
          setHasTimedOut(true);
        }
      } else {
        setTimeRemaining(0);
        setIsNearTimeout(false);
        setHasTimedOut(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch active session';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enumeratorId]);

  /**
   * Fetch all sessions for this enumerator
   */
  const refreshSessions = useCallback(async () => {
    try {
      setError(null);
      const { sessions: fetchedSessions } = await listSessions(enumeratorId, undefined, 50);
      setSessions(fetchedSessions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sessions';
      setError(message);
    }
  }, [enumeratorId]);

  /**
   * Create a new session
   */
  const createSession = useCallback(async (input: SessionCreate): Promise<Session> => {
    try {
      setError(null);
      setIsLoading(true);
      const newSession = await createSessionService(input);
      setActiveSession(newSession);
      setTimeRemaining(SESSION_TIMEOUT_MS);
      setIsNearTimeout(false);
      setHasTimedOut(false);
      await refreshSessions();
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [refreshSessions]);

  /**
   * Close a session
   */
  const closeSession = useCallback(async (
    sessionId: string,
    reason: 'manual' | 'timeout' | 'completed'
  ): Promise<Session> => {
    try {
      setError(null);
      setIsLoading(true);
      const closedSession = await closeSessionService(sessionId, reason);
      
      // Clear active session if it was the one closed
      if (activeSession && activeSession.$id === sessionId) {
        setActiveSession(null);
        setTimeRemaining(0);
        setIsNearTimeout(false);
        setHasTimedOut(false);
      }
      
      await refreshSessions();
      return closedSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to close session';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, refreshSessions]);

  /**
   * Update session activity to reset timeout
   */
  const updateActivity = useCallback(async () => {
    if (!activeSession) return;

    try {
      const updatedSession = await updateSessionActivity(activeSession.$id);
      setActiveSession(updatedSession);
      setTimeRemaining(SESSION_TIMEOUT_MS);
      setIsNearTimeout(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session activity';
      setError(message);
    }
  }, [activeSession]);

  /**
   * Initial load
   */
  useEffect(() => {
    refreshActiveSession();
    refreshSessions();
  }, [refreshActiveSession, refreshSessions]);

  /**
   * Auto-refresh active session
   */
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimerRef.current = setInterval(() => {
      refreshActiveSession();
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refreshActiveSession]);

  /**
   * Update time remaining every second when session is active
   */
  useEffect(() => {
    if (!activeSession) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getSessionTimeRemaining(activeSession);
      setTimeRemaining(remaining);
      setIsNearTimeout(isSessionNearTimeout(activeSession));
      setHasTimedOut(isSessionTimedOut(activeSession));
    };

    // Update immediately
    updateTimer();

    // Then update every second
    activityTimerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, [activeSession]);

  return {
    activeSession,
    sessions,
    isLoading,
    error,
    timeRemaining,
    isNearTimeout,
    hasTimedOut,
    createSession,
    closeSession,
    refreshActiveSession,
    refreshSessions,
    updateActivity,
  };
}
