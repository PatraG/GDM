/**
 * Response Service
 * Business logic for submitting survey responses with retry mechanism
 *
 * Responsibilities:
 * - Submit responses with answers
 * - Save draft responses
 * - Retry with exponential backoff (FR-036)
 * - Validate required fields
 */

import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
} from '@/lib/appwrite/databases';
import { COLLECTIONS, RETRY_CONFIG } from '@/lib/appwrite/constants';
import type { Response, ResponseCreate } from '@/lib/types/response';
import type { Answer, AnswerCreate } from '@/lib/types/response';
import { Query } from 'appwrite';

/**
 * GPS coordinates for response
 */
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

/**
 * Answer data for submission
 */
export interface ResponseAnswerInput {
  questionId: string;
  answerValue: string; // Serialized value (text, number, or JSON for multi-select)
}

/**
 * Response submission input
 */
export interface ResponseSubmitInput {
  sessionId: string;
  surveyId: string;
  enumeratorId: string;
  respondentId: string;
  surveyVersion: string;
  gpsCoordinates: GPSCoordinates;
  answers: ResponseAnswerInput[];
}

/**
 * Retry result
 */
interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Exponential backoff retry helper
 * FR-036: Initial delay 2s, multiplier 2x, max 3 attempts
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = RETRY_CONFIG.MAX_ATTEMPTS
): Promise<RetryResult<T>> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await operation();
      return {
        success: true,
        data,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // If this was the last attempt, don't delay
      if (attempt < maxAttempts) {
        const delay =
          RETRY_CONFIG.INITIAL_DELAY_MS *
          Math.pow(RETRY_CONFIG.MULTIPLIER, attempt - 1);
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: maxAttempts,
  };
}

/**
 * Validate response has all required question answers
 */
function validateRequiredAnswers(
  answers: ResponseAnswerInput[],
  requiredQuestionIds: string[]
): void {
  const answeredQuestionIds = new Set(answers.map((a) => a.questionId));

  const missingQuestions = requiredQuestionIds.filter(
    (qid) => !answeredQuestionIds.has(qid)
  );

  if (missingQuestions.length > 0) {
    throw new Error(
      `Missing answers for ${missingQuestions.length} required question(s)`
    );
  }
}

/**
 * Create response document
 */
async function createResponseDocument(
  input: ResponseSubmitInput,
  status: 'draft' | 'submitted'
): Promise<Response> {
  const now = new Date().toISOString();

  // Serialize GPS coordinates as JSON
  const locationData = JSON.stringify({
    latitude: input.gpsCoordinates.latitude,
    longitude: input.gpsCoordinates.longitude,
    accuracy: input.gpsCoordinates.accuracy,
    capturedAt: input.gpsCoordinates.timestamp,
  });

  const documentData = {
    sessionId: input.sessionId,
    surveyId: input.surveyId,
    respondentId: input.respondentId,
    surveyVersion: input.surveyVersion,
    location: locationData,
    status,
    submittedAt: status === 'submitted' ? now : null,
    createdAt: now,
    updatedAt: now,
  };

  const document = await createDocument(COLLECTIONS.RESPONSES, documentData);
  return document as Response;
}

/**
 * Create answer documents for a response
 */
async function createAnswerDocuments(
  responseId: string,
  answers: ResponseAnswerInput[]
): Promise<Answer[]> {
  const answerPromises = answers.map(async (answer) => {
    const documentData: AnswerCreate = {
      responseId,
      questionId: answer.questionId,
      answerValue: answer.answerValue,
    };

    const document = await createDocument(COLLECTIONS.ANSWERS, documentData);
    return document as Answer;
  });

  return Promise.all(answerPromises);
}

/**
 * Submit a complete response with retry mechanism
 * FR-036: Exponential backoff with 3 attempts
 */
export async function submitResponse(
  input: ResponseSubmitInput,
  requiredQuestionIds: string[] = []
): Promise<RetryResult<{ response: Response; answers: Answer[] }>> {
  // Validate required answers before attempting submission
  validateRequiredAnswers(input.answers, requiredQuestionIds);

  // Define the submission operation
  const submitOperation = async () => {
    // Create response document
    const response = await createResponseDocument(input, 'submitted');

    // Create answer documents
    const answers = await createAnswerDocuments(response.$id, input.answers);

    return { response, answers };
  };

  // Execute with retry
  return retryWithBackoff(submitOperation);
}

/**
 * Save response as draft (no retry needed for drafts)
 */
export async function saveDraft(
  input: ResponseSubmitInput
): Promise<{ response: Response; answers: Answer[] }> {
  // Create response document as draft
  const response = await createResponseDocument(input, 'draft');

  // Create answer documents
  const answers = await createAnswerDocuments(response.$id, input.answers);

  return { response, answers };
}

/**
 * Get response by ID
 */
export async function getResponse(responseId: string): Promise<Response> {
  const document = await getDocument(COLLECTIONS.RESPONSES, responseId);
  return document as Response;
}

/**
 * Get answers for a response
 */
export async function getResponseAnswers(
  responseId: string
): Promise<Answer[]> {
  const queries = [
    Query.equal('responseId', responseId),
    Query.limit(100), // Assume max 100 answers per response
  ];

  const result = await listDocuments(COLLECTIONS.ANSWERS, queries);
  return result.documents as Answer[];
}

/**
 * List responses for a session
 */
export async function getSessionResponses(
  sessionId: string
): Promise<Response[]> {
  const queries = [
    Query.equal('sessionId', sessionId),
    Query.orderDesc('$createdAt'),
    Query.limit(100),
  ];

  const result = await listDocuments(COLLECTIONS.RESPONSES, queries);
  return result.documents as Response[];
}

/**
 * Update draft response to submitted
 * Useful for retrying failed submissions
 */
export async function submitDraft(
  responseId: string
): Promise<Response> {
  const updates = {
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const document = await updateDocument(
    COLLECTIONS.RESPONSES,
    responseId,
    updates
  );

  return document as Response;
}

/**
 * Check if survey has been completed in a session
 * Returns true if a submitted response exists for the survey in the session
 */
export async function isSurveyCompleted(
  sessionId: string,
  surveyId: string
): Promise<boolean> {
  const queries = [
    Query.equal('sessionId', sessionId),
    Query.equal('surveyId', surveyId),
    Query.equal('status', 'submitted'),
    Query.limit(1),
  ];

  const result = await listDocuments(COLLECTIONS.RESPONSES, queries);
  return result.total > 0;
}
