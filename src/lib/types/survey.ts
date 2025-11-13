/**
 * Survey Type Definitions
 * 
 * Types for survey instruments, questions, and options
 * Based on Survey, Question, and Option entities from spec.md
 * 
 * @module lib/types/survey
 */

import { Models } from 'appwrite';
import { QuestionType, SurveyStatus } from '@/lib/appwrite/constants';

/**
 * Survey document stored in the 'surveys' collection
 * Represents a structured questionnaire with versioning
 */
export interface Survey extends Models.Document {
  /** Survey title */
  title: string;
  
  /** Survey description/purpose */
  description?: string;
  
  /** Survey version (semantic versioning, e.g., "1.0.0") */
  version: string;
  
  /** Survey status (draft | locked | archived) */
  status: SurveyStatus;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Question document stored in the 'questions' collection
 * Represents an individual question within a survey
 */
export interface Question extends Models.Document {
  /** Parent survey ID */
  surveyId: string;
  
  /** Question text/prompt */
  questionText: string;
  
  /** Question type (text | radio | checkbox | scale) */
  questionType: QuestionType;
  
  /** Whether this question is required */
  required: boolean;
  
  /** Display order within survey (0-indexed) */
  order: number;
  
  /** Creation timestamp */
  createdAt: string;
}

/**
 * Option document stored in the 'options' collection
 * Represents answer choices for choice-based questions
 * For scale questions: options represent numeric values (1-5)
 * For choice questions: options are text responses
 */
export interface Option extends Models.Document {
  /** Parent question ID */
  questionId: string;
  
  /** Option display text */
  optionText: string;
  
  /** Option value (numeric or text) */
  value: string;
  
  /** Display order within question (0-indexed) */
  order: number;
}

/**
 * Complete question with its options
 * Used for form rendering
 */
export interface QuestionWithOptions extends Question {
  /** Array of options (for choice/scale questions) */
  options: Option[];
}

/**
 * Complete survey with all questions and options
 * Used for form rendering
 */
export interface SurveyWithQuestions extends Survey {
  /** Array of questions with their options */
  questions: QuestionWithOptions[];
}

/**
 * Data for creating a new survey (admin only)
 */
export interface SurveyCreate {
  /** Survey title */
  title: string;
  
  /** Survey description */
  description?: string;
  
  /** Initial version (defaults to "1.0.0") */
  version?: string;
  
  /** Initial status (defaults to "draft") */
  status?: SurveyStatus;
}

/**
 * Data for updating a survey
 * Limited updates allowed when status is 'locked' (FR-042)
 */
export interface SurveyUpdate {
  /** Updated title (only if status is 'draft') */
  title?: string;
  
  /** Updated description */
  description?: string;
  
  /** Updated version */
  version?: string;
  
  /** Updated status */
  status?: SurveyStatus;
}

/**
 * Data for creating a new question
 */
export interface QuestionCreate {
  /** Parent survey ID */
  surveyId: string;
  
  /** Question text */
  questionText: string;
  
  /** Question type */
  questionType: QuestionType;
  
  /** Whether required (defaults to false) */
  required?: boolean;
  
  /** Display order */
  order: number;
}

/**
 * Data for updating a question
 */
export interface QuestionUpdate {
  /** Updated question text */
  questionText?: string;
  
  /** Updated question type */
  questionType?: QuestionType;
  
  /** Updated required flag */
  required?: boolean;
  
  /** Updated order */
  order?: number;
}

/**
 * Data for creating a new option
 */
export interface OptionCreate {
  /** Parent question ID */
  questionId: string;
  
  /** Option display text */
  optionText: string;
  
  /** Option value */
  value: string;
  
  /** Display order */
  order: number;
}

/**
 * Data for updating an option
 */
export interface OptionUpdate {
  /** Updated option text */
  optionText?: string;
  
  /** Updated value */
  value?: string;
  
  /** Updated order */
  order?: number;
}

/**
 * Survey search/filter criteria
 */
export interface SurveySearch {
  /** Filter by title (partial match) */
  title?: string;
  
  /** Filter by status */
  status?: SurveyStatus;
  
  /** Filter by version */
  version?: string;
  
  /** Pagination: number of results per page */
  limit?: number;
  
  /** Pagination: offset for results */
  offset?: number;
}

/**
 * Survey list response with pagination
 */
export interface SurveyListResponse {
  /** Array of survey records */
  surveys: Survey[];
  
  /** Total count of surveys matching criteria */
  total: number;
  
  /** Current page offset */
  offset: number;
  
  /** Results per page */
  limit: number;
}

/**
 * Survey statistics for admin dashboard
 */
export interface SurveyStats {
  /** Survey details */
  survey: Survey;
  
  /** Total number of questions */
  questionCount: number;
  
  /** Total number of responses submitted */
  responseCount: number;
  
  /** Most recent response timestamp */
  lastResponseAt?: string;
}

/**
 * Question type validation helpers
 */
export const QUESTION_TYPE_CONFIG: Record<QuestionType, {
  label: string;
  requiresOptions: boolean;
  allowsMultiple: boolean;
}> = {
  text: {
    label: 'Free Text',
    requiresOptions: false,
    allowsMultiple: false,
  },
  radio: {
    label: 'Single Choice',
    requiresOptions: true,
    allowsMultiple: false,
  },
  checkbox: {
    label: 'Multiple Choice',
    requiresOptions: true,
    allowsMultiple: true,
  },
  scale: {
    label: 'Numeric Scale',
    requiresOptions: true,
    allowsMultiple: false,
  },
};
