/**
 * Appwrite Constants
 * 
 * Centralized configuration for database and collection IDs
 * used throughout the application.
 * 
 * @module lib/appwrite/constants
 */

/**
 * Database ID for the oral health survey application
 * Must match the database created in Appwrite Console
 */
export const DATABASE_ID = 'oral_health_survey';

/**
 * Collection IDs for all database collections
 * Must match the collections created in Appwrite Console
 */
export const COLLECTIONS = {
  /** User accounts with role-based access (admin, enumerator) */
  USERS: 'users',
  
  /** Respondent records with pseudonymized data */
  RESPONDENTS: 'respondents',
  
  /** Enumerator session tracking */
  SESSIONS: 'sessions',
  
  /** Survey instrument definitions */
  SURVEYS: 'surveys',
  
  /** Questions belonging to surveys */
  QUESTIONS: 'questions',
  
  /** Answer options for questions */
  OPTIONS: 'options',
  
  /** Survey response submissions */
  RESPONSES: 'responses',
  
  /** Individual answers to questions */
  ANSWERS: 'answers',
} as const;

/**
 * User roles for role-based access control
 */
export const ROLES = {
  /** Administrator with full system access */
  ADMIN: 'admin',
  
  /** Field enumerator with limited access to own data */
  ENUMERATOR: 'enumerator',
} as const;

/**
 * Session status values
 */
export const SESSION_STATUS = {
  /** Active session */
  OPEN: 'open',
  
  /** Manually closed session */
  CLOSED: 'closed',
  
  /** Auto-closed due to inactivity timeout */
  TIMEOUT: 'timeout',
} as const;

/**
 * Response status values
 */
export const RESPONSE_STATUS = {
  /** Response in progress, not yet submitted */
  DRAFT: 'draft',
  
  /** Response successfully submitted */
  SUBMITTED: 'submitted',
  
  /** Response voided by admin */
  VOIDED: 'voided',
} as const;

/**
 * Survey status values
 */
export const SURVEY_STATUS = {
  /** Survey editable, not yet used in field */
  DRAFT: 'draft',
  
  /** Survey locked for field use, immutable */
  LOCKED: 'locked',
  
  /** Survey archived, no longer active */
  ARCHIVED: 'archived',
} as const;

/**
 * User account status values
 */
export const USER_STATUS = {
  /** Active user account */
  ACTIVE: 'active',
  
  /** Suspended user account */
  SUSPENDED: 'suspended',
} as const;

/**
 * Question types for survey questions
 */
export const QUESTION_TYPES = {
  /** Free text input */
  TEXT: 'text',
  
  /** Single choice (radio buttons) */
  RADIO: 'radio',
  
  /** Multiple choice (checkboxes) */
  CHECKBOX: 'checkbox',
  
  /** Numeric scale (1-5, etc.) */
  SCALE: 'scale',
} as const;

/**
 * Session timeout duration in milliseconds
 * 2 hours = 7,200,000 ms
 */
export const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;

/**
 * Retry configuration for network operations
 * Based on FR-036: exponential backoff with initial delay 2s, multiplier 2x, max 3 attempts
 */
export const RETRY_CONFIG = {
  /** Initial delay in milliseconds */
  INITIAL_DELAY_MS: 2000,
  
  /** Backoff multiplier */
  MULTIPLIER: 2,
  
  /** Maximum retry attempts */
  MAX_ATTEMPTS: 3,
} as const;

/**
 * Type exports for constants
 */
export type Role = typeof ROLES[keyof typeof ROLES];
export type SessionStatus = typeof SESSION_STATUS[keyof typeof SESSION_STATUS];
export type ResponseStatus = typeof RESPONSE_STATUS[keyof typeof RESPONSE_STATUS];
export type SurveyStatus = typeof SURVEY_STATUS[keyof typeof SURVEY_STATUS];
export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];
export type QuestionType = typeof QUESTION_TYPES[keyof typeof QUESTION_TYPES];
