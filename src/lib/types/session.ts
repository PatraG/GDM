/**
 * Session Type Definitions
 * 
 * Types for enumerator field visit sessions with respondents
 * Based on Session entity from spec.md
 * 
 * @module lib/types/session
 */

import { Models } from 'appwrite';
import { SessionStatus } from '@/lib/appwrite/constants';

/**
 * Session document stored in the 'sessions' collection
 * Represents a single field visit/encounter with a respondent
 */
export interface Session extends Models.Document {
  /** ID of the respondent being interviewed */
  respondentId: string;
  
  /** ID of the enumerator conducting the session */
  enumeratorId: string;
  
  /** Session start timestamp */
  startTime: string;
  
  /** Session end timestamp (null for open sessions) */
  endTime?: string;
  
  /** Session status (open | closed | timeout) */
  status: SessionStatus;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Optional metadata (notes, conditions, etc.) */
  metadata?: SessionMetadata;
}

/**
 * Optional session metadata
 */
export interface SessionMetadata {
  /** Field notes or observations */
  notes?: string;
  
  /** Environmental or contextual conditions */
  conditions?: string;
  
  /** Location where session was conducted */
  location?: string;
  
  /** Any other custom metadata */
  [key: string]: unknown;
}

/**
 * Data for creating a new session (FR-014)
 */
export interface SessionCreate {
  /** ID of the respondent for this session */
  respondentId: string;
  
  /** ID of the enumerator conducting the session */
  enumeratorId: string;
  
  /** Optional initial metadata */
  metadata?: SessionMetadata;
}

/**
 * Data for updating a session
 */
export interface SessionUpdate {
  /** Updated end time */
  endTime?: string;
  
  /** Updated status */
  status?: SessionStatus;
  
  /** Updated metadata */
  metadata?: SessionMetadata;
}

/**
 * Session with related data for display
 */
export interface SessionWithDetails extends Session {
  /** Respondent pseudonym */
  respondentPseudonym: string;
  
  /** Enumerator email */
  enumeratorEmail: string;
  
  /** Number of completed surveys in this session */
  surveyCount: number;
  
  /** Duration in milliseconds (for closed sessions) */
  duration?: number;
}

/**
 * Session search/filter criteria
 */
export interface SessionSearch {
  /** Filter by respondent ID */
  respondentId?: string;
  
  /** Filter by enumerator ID */
  enumeratorId?: string;
  
  /** Filter by status */
  status?: SessionStatus;
  
  /** Filter by start date (ISO string) */
  startDateFrom?: string;
  
  /** Filter by start date (ISO string) */
  startDateTo?: string;
  
  /** Pagination: number of results per page */
  limit?: number;
  
  /** Pagination: offset for results */
  offset?: number;
}

/**
 * Session list response with pagination
 */
export interface SessionListResponse {
  /** Array of session records */
  sessions: Session[];
  
  /** Total count of sessions matching criteria */
  total: number;
  
  /** Current page offset */
  offset: number;
  
  /** Results per page */
  limit: number;
}

/**
 * Session timeout configuration (FR-015)
 * 2 hours = 7,200,000 milliseconds
 */
export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;

/**
 * Warning threshold before timeout
 * 15 minutes before timeout = 1:45 into session
 */
export const SESSION_WARNING_MS = SESSION_TIMEOUT_MS - (15 * 60 * 1000);

/**
 * Session activity tracking
 */
export interface SessionActivity {
  /** Session ID */
  sessionId: string;
  
  /** Last activity timestamp */
  lastActivityAt: string;
  
  /** Time remaining before timeout (milliseconds) */
  timeRemaining: number;
  
  /** Whether session is about to timeout (within warning threshold) */
  isNearTimeout: boolean;
  
  /** Whether session has timed out */
  hasTimedOut: boolean;
}

/**
 * Session summary for enumerator view
 */
export interface SessionSummary {
  /** Session details */
  session: Session;
  
  /** Respondent pseudonym */
  respondentPseudonym: string;
  
  /** List of completed survey titles */
  completedSurveys: string[];
  
  /** Total number of responses submitted */
  responseCount: number;
  
  /** Session duration (for closed sessions) */
  duration?: string;
}
