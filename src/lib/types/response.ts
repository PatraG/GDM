/**
 * Response Type Definitions
 * 
 * Types for survey submissions and answers
 * Based on Response and Answer entities from spec.md
 * 
 * @module lib/types/response
 */

import { Models } from 'appwrite';
import { ResponseStatus } from '@/lib/appwrite/constants';

/**
 * GPS coordinates for response location (FR-033a)
 */
export interface Location {
  /** Latitude coordinate */
  latitude: number;
  
  /** Longitude coordinate */
  longitude: number;
  
  /** Accuracy in meters (optional) */
  accuracy?: number;
  
  /** Timestamp when coordinates were captured */
  capturedAt: string;
}

/**
 * Response document stored in the 'responses' collection
 * Represents a completed survey submission within a session
 */
export interface Response extends Models.Document {
  /** Parent session ID */
  sessionId: string;
  
  /** Respondent ID */
  respondentId: string;
  
  /** Survey ID */
  surveyId: string;
  
  /** Survey version (for immutability tracking, FR-043) */
  surveyVersion: string;
  
  /** GPS coordinates captured at submission (JSON string) */
  location?: string;
  
  /** Response status (draft | submitted | voided) */
  status: ResponseStatus;
  
  /** Submission timestamp (null for drafts) */
  submittedAt?: string;
  
  /** Admin user ID who voided this response (if status is 'voided') */
  voidedBy?: string;
  
  /** Reason for voiding (if status is 'voided', FR-047) */
  voidReason?: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Answer document stored in the 'answers' collection
 * Represents an individual answer to a question within a response
 */
export interface Answer extends Models.Document {
  /** Parent response ID */
  responseId: string;
  
  /** Question ID being answered */
  questionId: string;
  
  /** Answer value (text, numeric, or JSON array for multiple choice) */
  answerValue: string;
  
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Parsed location object (from JSON string)
 */
export interface ParsedLocation extends Location {
  /** Original JSON string */
  raw: string;
}

/**
 * Response with parsed location
 */
export interface ResponseWithLocation extends Omit<Response, 'location'> {
  /** Parsed location object (null if not available) */
  location: ParsedLocation | null;
}

/**
 * Data for creating a new response (FR-032)
 */
export interface ResponseCreate {
  /** Session ID */
  sessionId: string;
  
  /** Respondent ID */
  respondentId: string;
  
  /** Survey ID */
  surveyId: string;
  
  /** Survey version */
  surveyVersion: string;
  
  /** GPS location (optional based on device capability) */
  location?: Location;
  
  /** Initial status (defaults to 'draft') */
  status?: ResponseStatus;
}

/**
 * Data for creating a new answer (FR-033)
 */
export interface AnswerCreate {
  /** Response ID */
  responseId: string;
  
  /** Question ID */
  questionId: string;
  
  /** Answer value (serialized as string) */
  answerValue: string;
}

/**
 * Complete response submission data
 * Combines response metadata with all answers
 */
export interface ResponseSubmission {
  /** Response metadata */
  response: ResponseCreate;
  
  /** Array of answers to questions */
  answers: Omit<AnswerCreate, 'responseId'>[];
}

/**
 * Data for voiding a response (admin only, FR-040, FR-047)
 */
export interface ResponseVoid {
  /** Admin user ID performing the void action */
  voidedBy: string;
  
  /** Reason for voiding (required) */
  voidReason: string;
}

/**
 * Response with related data for display
 */
export interface ResponseWithDetails extends Response {
  /** Respondent pseudonym */
  respondentPseudonym: string;
  
  /** Enumerator email */
  enumeratorEmail: string;
  
  /** Survey title */
  surveyTitle: string;
  
  /** Survey version */
  surveyVersion: string;
  
  /** Number of answers */
  answerCount: number;
  
  /** Parsed location */
  parsedLocation?: ParsedLocation;
}

/**
 * Answer with question context for display
 */
export interface AnswerWithQuestion extends Answer {
  /** Question text */
  questionText: string;
  
  /** Question type */
  questionType: string;
  
  /** Parsed answer value (for display) */
  displayValue: string;
}

/**
 * Complete response with all answers
 */
export interface ResponseWithAnswers extends Response {
  /** Array of answers */
  answers: AnswerWithQuestion[];
}

/**
 * Response search/filter criteria
 */
export interface ResponseSearch {
  /** Filter by session ID */
  sessionId?: string;
  
  /** Filter by respondent ID */
  respondentId?: string;
  
  /** Filter by enumerator ID */
  enumeratorId?: string;
  
  /** Filter by survey ID */
  surveyId?: string;
  
  /** Filter by status */
  status?: ResponseStatus;
  
  /** Filter by submission date (ISO string) */
  submittedFrom?: string;
  
  /** Filter by submission date (ISO string) */
  submittedTo?: string;
  
  /** Pagination: number of results per page */
  limit?: number;
  
  /** Pagination: offset for results */
  offset?: number;
}

/**
 * Response list response with pagination
 */
export interface ResponseListResponse {
  /** Array of response records */
  responses: Response[];
  
  /** Total count of responses matching criteria */
  total: number;
  
  /** Current page offset */
  offset: number;
  
  /** Results per page */
  limit: number;
}

/**
 * Response submission result
 */
export interface SubmissionResult {
  /** Whether submission was successful */
  success: boolean;
  
  /** Created response ID (if successful) */
  responseId?: string;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Number of retry attempts made */
  retryCount?: number;
}

/**
 * Retry state for failed submissions (FR-036)
 */
export interface RetryState {
  /** Current attempt number (1-indexed) */
  attempt: number;
  
  /** Maximum retry attempts */
  maxAttempts: number;
  
  /** Delay before next retry (milliseconds) */
  nextRetryDelay: number;
  
  /** Whether retries are exhausted */
  isExhausted: boolean;
  
  /** Last error message */
  lastError?: string;
}

/**
 * Draft response for saving progress
 */
export interface DraftResponse {
  /** Response metadata */
  response: ResponseCreate;
  
  /** Partial answers (may not be complete) */
  answers: Partial<AnswerCreate>[];
  
  /** Timestamp when draft was saved */
  savedAt: string;
}
