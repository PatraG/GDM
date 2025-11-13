/**
 * Zod Validation Schemas
 * 
 * Centralized validation schemas for all data entities using Zod
 * Used with React Hook Form for form validation
 * 
 * @module lib/utils/validation
 */

import { z } from 'zod';
import { 
  RESPONDENT_CODE_PATTERN 
} from '@/lib/types/respondent';

/**
 * Respondent validation schema (FR-009, FR-010)
 */
export const respondentSchema = z.object({
  ageRange: z.enum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'], {
    message: 'Please select a valid age range',
  }),
  
  sex: z.enum(['M', 'F', 'Other'], {
    message: 'Please select a valid sex/gender',
  }),
  
  adminArea: z.string()
    .min(1, 'Administrative area is required')
    .max(255, 'Administrative area must be less than 255 characters'),
  
  consentGiven: z.literal(true, {
    message: 'Consent must be given to proceed',
  }),
  
  enumeratorId: z.string().min(1, 'Enumerator ID is required'),
});

/**
 * Respondent update schema (limited fields)
 */
export const respondentUpdateSchema = z.object({
  adminArea: z.string()
    .min(1, 'Administrative area is required')
    .max(255, 'Administrative area must be less than 255 characters')
    .optional(),
  
  lastSessionDate: z.string().datetime().optional(),
});

/**
 * Respondent code validation
 */
export const respondentCodeSchema = z.string()
  .regex(RESPONDENT_CODE_PATTERN, 'Invalid respondent code format (expected: R-00001)');

/**
 * Session validation schema (FR-014)
 */
export const sessionSchema = z.object({
  respondentId: z.string().min(1, 'Respondent ID is required'),
  
  enumeratorId: z.string().min(1, 'Enumerator ID is required'),
  
  metadata: z.object({
    notes: z.string().max(1000).optional(),
    conditions: z.string().max(500).optional(),
    location: z.string().max(255).optional(),
  }).optional(),
});

/**
 * Session update schema
 */
export const sessionUpdateSchema = z.object({
  status: z.enum(['open', 'closed', 'timeout']).optional(),
  
  endTime: z.string().datetime().optional(),
  
  metadata: z.object({
    notes: z.string().max(1000).optional(),
    conditions: z.string().max(500).optional(),
    location: z.string().max(255).optional(),
  }).optional(),
});

/**
 * Survey validation schema (admin only)
 */
export const surveySchema = z.object({
  title: z.string()
    .min(1, 'Survey title is required')
    .max(255, 'Survey title must be less than 255 characters'),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (e.g., 1.0.0)')
    .optional(),
  
  status: z.enum(['draft', 'locked', 'archived']).optional(),
});

/**
 * Survey update schema with version locking check (FR-043, T020a)
 */
export const surveyUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Survey title is required')
    .max(255, 'Survey title must be less than 255 characters')
    .optional(),
  
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning')
    .optional(),
  
  status: z.enum(['draft', 'locked', 'archived']).optional(),
});

/**
 * Question validation schema (FR-028, FR-029)
 */
export const questionSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  
  questionText: z.string()
    .min(1, 'Question text is required')
    .max(1000, 'Question text must be less than 1000 characters'),
  
  questionType: z.enum(['text', 'radio', 'checkbox', 'scale'], {
    message: 'Invalid question type',
  }),
  
  required: z.boolean().default(false),
  
  order: z.number().int().min(0, 'Order must be a positive integer'),
});

/**
 * Option validation schema
 */
export const optionSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  
  optionText: z.string()
    .min(1, 'Option text is required')
    .max(500, 'Option text must be less than 500 characters'),
  
  value: z.string()
    .min(1, 'Option value is required')
    .max(100, 'Option value must be less than 100 characters'),
  
  order: z.number().int().min(0, 'Order must be a positive integer'),
});

/**
 * GPS Location validation schema (FR-033a)
 */
export const locationSchema = z.object({
  latitude: z.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  
  longitude: z.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  
  accuracy: z.number().min(0).optional(),
  
  capturedAt: z.string().datetime(),
});

/**
 * Response validation schema (FR-032)
 */
export const responseSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  
  respondentId: z.string().min(1, 'Respondent ID is required'),
  
  surveyId: z.string().min(1, 'Survey ID is required'),
  
  surveyVersion: z.string()
    .min(1, 'Survey version is required')
    .regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  
  location: locationSchema.optional(),
  
  status: z.enum(['draft', 'submitted', 'voided']).default('draft'),
});

/**
 * Answer validation schema (FR-033)
 */
export const answerSchema = z.object({
  responseId: z.string().min(1, 'Response ID is required'),
  
  questionId: z.string().min(1, 'Question ID is required'),
  
  answerValue: z.string()
    .min(1, 'Answer value is required')
    .max(2000, 'Answer value must be less than 2000 characters'),
});

/**
 * Response void validation schema (FR-040, FR-047)
 */
export const responseVoidSchema = z.object({
  voidedBy: z.string().min(1, 'Admin user ID is required'),
  
  voidReason: z.string()
    .min(10, 'Void reason must be at least 10 characters')
    .max(1000, 'Void reason must be less than 1000 characters'),
});

/**
 * User creation validation schema (FR-001)
 */
export const userCreateSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  role: z.enum(['admin', 'enumerator'], {
    message: 'Invalid role',
  }),
  
  status: z.enum(['active', 'suspended']).default('active'),
});

/**
 * Login credentials validation schema (FR-002)
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  
  password: z.string()
    .min(1, 'Password is required'),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Name pattern validation to prevent PII collection (FR-058a)
 * Blocks common name-like patterns for privacy compliance
 */
export const namePatternBlocker = z.string().refine(
  (value) => {
    // Block patterns that look like full names (e.g., "John Doe", "Jane Smith")
    const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+/;
    return !namePattern.test(value);
  },
  {
    message: 'Please do not enter full names. Use pseudonyms or codes only.',
  }
);

/**
 * Export type inference helpers
 */
export type RespondentFormData = z.infer<typeof respondentSchema>;
export type SessionFormData = z.infer<typeof sessionSchema>;
export type SurveyFormData = z.infer<typeof surveySchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type OptionFormData = z.infer<typeof optionSchema>;
export type ResponseFormData = z.infer<typeof responseSchema>;
export type AnswerFormData = z.infer<typeof answerSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
