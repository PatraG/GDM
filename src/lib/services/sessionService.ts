/**
 * Session Service
 * Business logic for managing survey sessions in the field workflow
 *
 * Responsibilities:
 * - Create new sessions (link respondent to enumerator)
 * - Track active sessions and auto-close on timeout
 * - Close sessions manually
 * - Prevent reopening closed sessions
 * - Preserve draft responses on timeout
 */

import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
} from '@/lib/appwrite/databases';
import { COLLECTIONS } from '@/lib/appwrite/constants';
import type {
  Session,
  SessionCreate,
} from '@/lib/types/session';
import { Query } from 'appwrite';

// Re-export SessionStatus from constants since it's used in this service
import { SessionStatus } from '@/lib/appwrite/constants';

/**
 * Session timeout configuration
 * FR-015: 2-hour inactivity timeout with warning at 1:45
 */
export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
export const SESSION_WARNING_MS = 1 * 60 * 60 * 1000 + 45 * 60 * 1000; // 1 hour 45 minutes

/**
 * Create a new survey session
 * Links a respondent to an enumerator for data collection
 */
export async function createSession(
  input: SessionCreate
): Promise<Session> {
  // Prepare document data
  const now = new Date().toISOString();
  const documentData = {
    respondentId: input.respondentId,
    enumeratorId: input.enumeratorId,
    startTime: now,
    endTime: null,
    status: 'open' as SessionStatus,
    createdAt: now,
    updatedAt: now,
    metadata: input.metadata || {},
  };

  // Create document in database
  const document = await createDocument(COLLECTIONS.SESSIONS, documentData);

  return document as Session;
}

/**
 * Get a single session by ID
 */
export async function getSession(sessionId: string): Promise<Session> {
  const document = await getDocument(COLLECTIONS.SESSIONS, sessionId);
  return document as Session;
}

/**
 * List sessions for an enumerator
 * Optionally filter by status
 */
export async function listSessions(
  enumeratorId: string,
  status?: SessionStatus,
  limit = 50,
  offset = 0
): Promise<{ sessions: Session[]; total: number }> {
  const queries = [
    Query.equal('enumeratorId', enumeratorId),
    Query.orderDesc('startTime'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  // Add status filter if provided
  if (status) {
    queries.push(Query.equal('status', status));
  }

  const result = await listDocuments(COLLECTIONS.SESSIONS, queries);

  return {
    sessions: result.documents as Session[],
    total: result.total,
  };
}

/**
 * Get active session for an enumerator
 * Returns null if no active session exists
 */
export async function getActiveSession(
  enumeratorId: string
): Promise<Session | null> {
  const queries = [
    Query.equal('enumeratorId', enumeratorId),
    Query.equal('status', 'open'),
    Query.orderDesc('startTime'),
    Query.limit(1),
  ];

  const result = await listDocuments(COLLECTIONS.SESSIONS, queries);

  if (result.documents.length === 0) {
    return null;
  }

  return result.documents[0] as Session;
}

/**
 * Update session activity timestamp
 * Called whenever user interacts with the session to reset timeout
 * Note: Session type tracks activity via updatedAt timestamp
 */
export async function updateSessionActivity(
  sessionId: string
): Promise<Session> {
  const updates = {
    updatedAt: new Date().toISOString(),
  };

  const document = await updateDocument(
    COLLECTIONS.SESSIONS,
    sessionId,
    updates
  );

  return document as Session;
}

/**
 * Close a session
 * Sets status to closed, records end time
 * Validates that session is not already closed (FR-069a)
 */
export async function closeSession(
  sessionId: string,
  reason: 'manual' | 'timeout' | 'completed'
): Promise<Session> {
  // Get current session to validate status
  const session = await getSession(sessionId);

  // Prevent reopening closed sessions
  if (session.status === 'closed' || session.status === 'timeout') {
    throw new Error('Cannot close a session that is already closed');
  }

  // Determine final status based on reason
  const finalStatus: SessionStatus = reason === 'timeout' ? 'timeout' : 'closed';

  // Update session with closed status
  const updates = {
    status: finalStatus,
    endTime: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const document = await updateDocument(
    COLLECTIONS.SESSIONS,
    sessionId,
    updates
  );

  return document as Session;
}

/**
 * Check if session has timed out
 * Returns true if session exceeded inactivity timeout
 */
export function isSessionTimedOut(session: Session): boolean {
  if (session.status === 'closed' || session.status === 'timeout') {
    return false; // Closed sessions don't timeout
  }

  const lastActivity = new Date(session.updatedAt).getTime();
  const now = Date.now();
  const inactivityDuration = now - lastActivity;

  return inactivityDuration >= SESSION_TIMEOUT_MS;
}

/**
 * Check if session is near timeout (warning threshold)
 * Returns true if session is within warning period (1:45 to 2:00)
 */
export function isSessionNearTimeout(session: Session): boolean {
  if (session.status === 'closed' || session.status === 'timeout') {
    return false;
  }

  const lastActivity = new Date(session.updatedAt).getTime();
  const now = Date.now();
  const inactivityDuration = now - lastActivity;

  return (
    inactivityDuration >= SESSION_WARNING_MS &&
    inactivityDuration < SESSION_TIMEOUT_MS
  );
}

/**
 * Get remaining time until session timeout (in milliseconds)
 * Returns 0 if already timed out
 */
export function getSessionTimeRemaining(session: Session): number {
  if (session.status === 'closed' || session.status === 'timeout') {
    return 0;
  }

  const lastActivity = new Date(session.updatedAt).getTime();
  const now = Date.now();
  const inactivityDuration = now - lastActivity;
  const remaining = SESSION_TIMEOUT_MS - inactivityDuration;

  return Math.max(0, remaining);
}

/**
 * Get sessions for a specific respondent
 * Useful for viewing session history
 */
export async function getRespondentSessions(
  respondentId: string,
  limit = 10,
  offset = 0
): Promise<{ sessions: Session[]; total: number }> {
  const queries = [
    Query.equal('respondentId', respondentId),
    Query.orderDesc('startTime'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  const result = await listDocuments(COLLECTIONS.SESSIONS, queries);

  return {
    sessions: result.documents as Session[],
    total: result.total,
  };
}

/**
 * Check if an enumerator has any active sessions
 * Used for validation before status changes
 */
export async function hasActiveSessions(
  enumeratorId: string
): Promise<boolean> {
  const activeSession = await getActiveSession(enumeratorId);
  return activeSession !== null;
}
