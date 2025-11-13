/**
 * Respondent Type Definitions
 * 
 * Types for survey participants with pseudonymized identity
 * Based on Respondent entity from spec.md
 * 
 * @module lib/types/respondent
 */

import { Models } from 'appwrite';

/**
 * Age range options for respondents (FR-010)
 * Collected as range instead of exact birthdate for privacy
 */
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+';

/**
 * Sex options for respondents
 */
export type Sex = 'M' | 'F' | 'Other';

/**
 * Respondent document stored in the 'respondents' collection
 * Represents a survey participant with pseudonymized identity
 */
export interface Respondent extends Models.Document {
  /** Unique pseudonymous code (format: "R-00001" - 5-digit sequential) */
  pseudonym: string;
  
  /** Age range (e.g., "18-24") - privacy-compliant alternative to exact age */
  ageRange: AgeRange;
  
  /** Sex/gender */
  sex: Sex;
  
  /** Administrative area (e.g., district, village) */
  adminArea: string;
  
  /** Whether explicit consent was given (required per PDP Law) */
  consentGiven: boolean;
  
  /** Timestamp when consent was recorded */
  consentTimestamp?: string;
  
  /** ID of enumerator who created this respondent */
  enumeratorId: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last session date (computed or denormalized for performance) */
  lastSessionDate?: string;
}

/**
 * Data for creating a new respondent (FR-009, FR-010)
 */
export interface RespondentCreate {
  /** Age range */
  ageRange: AgeRange;
  
  /** Sex/gender */
  sex: Sex;
  
  /** Administrative area */
  adminArea: string;
  
  /** Consent confirmation (must be true) */
  consentGiven: boolean;
  
  /** ID of enumerator creating the respondent */
  enumeratorId: string;
}

/**
 * Data for updating a respondent
 * Limited fields can be updated to maintain data integrity
 */
export interface RespondentUpdate {
  /** Updated administrative area */
  adminArea?: string;
  
  /** Updated last session date */
  lastSessionDate?: string;
}

/**
 * Respondent search/filter criteria
 */
export interface RespondentSearch {
  /** Filter by pseudonym (exact match or partial) */
  pseudonym?: string;
  
  /** Filter by age range */
  ageRange?: AgeRange;
  
  /** Filter by sex */
  sex?: Sex;
  
  /** Filter by administrative area */
  adminArea?: string;
  
  /** Filter by consent status */
  consentGiven?: boolean;
  
  /** Filter by enumerator ID (for role-based access) */
  enumeratorId?: string;
  
  /** Pagination: number of results per page */
  limit?: number;
  
  /** Pagination: offset for results */
  offset?: number;
}

/**
 * Respondent list response with pagination
 */
export interface RespondentListResponse {
  /** Array of respondent records */
  respondents: Respondent[];
  
  /** Total count of respondents matching criteria */
  total: number;
  
  /** Current page offset */
  offset: number;
  
  /** Results per page */
  limit: number;
}

/**
 * Respondent with session statistics
 * Used in admin dashboard views
 */
export interface RespondentWithStats extends Respondent {
  /** Total number of sessions */
  sessionCount: number;
  
  /** Total number of completed surveys */
  surveyCount: number;
  
  /** Most recent session date */
  lastSessionDate: string;
}

/**
 * Respondent code format validation
 */
export const RESPONDENT_CODE_PATTERN = /^R-\d{5}$/;

/**
 * Maximum number of respondents (based on code format)
 */
export const MAX_RESPONDENT_COUNT = 99999;
