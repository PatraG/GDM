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
import { COLLECTIONS, RETRY_CONFIG, RESPONSE_STATUS } from '@/lib/appwrite/constants';
import type { Response, ResponseCreate, ResponseVoid } from '@/lib/types/response';
import type { Answer, AnswerCreate } from '@/lib/types/response';
import { Query } from 'appwrite';
import { logger } from '@/lib/services/loggingService';

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

    // Log successful survey submission
    logger.survey.submitted(
      response.$id,
      input.surveyId,
      input.enumeratorId,
      {
        respondentId: input.respondentId,
        sessionId: input.sessionId,
        gpsLatitude: input.gpsCoordinates.latitude,
        gpsLongitude: input.gpsCoordinates.longitude,
      }
    );

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

  // Log draft save
  logger.survey.draftSaved(
    response.$id,
    input.surveyId,
    input.enumeratorId
  );

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

/**
 * Void a response (admin only, FR-040, FR-047)
 * Marks a submitted response as voided with reason
 * Creates audit trail for the void action
 * 
 * @param responseId Response ID to void
 * @param voidData Void metadata (admin ID and reason)
 * @returns Updated response with voided status
 * @throws Error if response not found or already voided
 */
export async function voidResponse(
  responseId: string,
  voidData: ResponseVoid
): Promise<Response> {
  // Get current response
  const response = await getResponse(responseId);

  // Validation: Cannot void draft responses
  if (response.status === RESPONSE_STATUS.DRAFT) {
    throw new Error('Cannot void draft responses. Only submitted responses can be voided.');
  }

  // Validation: Cannot void already voided responses
  if (response.status === RESPONSE_STATUS.VOIDED) {
    throw new Error('Response is already voided.');
  }

  // Validation: Void reason is required
  if (!voidData.voidReason || voidData.voidReason.trim() === '') {
    throw new Error('Void reason is required.');
  }

  // Update response with void status
  const updateData = {
    status: RESPONSE_STATUS.VOIDED,
    voidedBy: voidData.voidedBy,
    voidReason: voidData.voidReason.trim(),
    updatedAt: new Date().toISOString(),
  };

  const updated = await updateDocument(
    COLLECTIONS.RESPONSES,
    responseId,
    updateData
  );

  // Log void action
  logger.survey.voided(
    responseId,
    voidData.voidedBy,
    voidData.voidReason.trim()
  );

  // TODO (T113): Create audit trail entry in a separate audit collection
  // For now, the void action is logged in the response record itself
  // Future enhancement: Create AUDIT_LOGS collection with entries like:
  // {
  //   action: 'VOID_RESPONSE',
  //   entityType: 'response',
  //   entityId: responseId,
  //   performedBy: voidData.voidedBy,
  //   reason: voidData.voidReason,
  //   timestamp: new Date().toISOString(),
  //   metadata: { previousStatus: response.status }
  // }

  return updated as Response;
}

/**
 * Search and list responses with filters (admin dashboard)
 * Supports pagination and multiple filter criteria
 * 
 * @param filters Filter criteria
 * @param limit Results per page
 * @param offset Page offset
 * @returns Paginated list of responses
 */
export async function listResponses(
  filters?: {
    sessionId?: string;
    respondentId?: string;
    surveyId?: string;
    status?: string;
    submittedFrom?: string;
    submittedTo?: string;
    enumeratorId?: string;
  },
  limit = 50,
  offset = 0
): Promise<{ responses: Response[]; total: number }> {
  const queries: string[] = [
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc('$createdAt'),
  ];

  // Add filters
  if (filters?.sessionId) {
    queries.push(Query.equal('sessionId', filters.sessionId));
  }
  if (filters?.respondentId) {
    queries.push(Query.equal('respondentId', filters.respondentId));
  }
  if (filters?.surveyId) {
    queries.push(Query.equal('surveyId', filters.surveyId));
  }
  if (filters?.status) {
    queries.push(Query.equal('status', filters.status));
  }
  if (filters?.submittedFrom) {
    queries.push(Query.greaterThanEqual('submittedAt', filters.submittedFrom));
  }
  if (filters?.submittedTo) {
    queries.push(Query.lessThanEqual('submittedAt', filters.submittedTo));
  }

  // Note: enumeratorId filter requires joining with sessions
  // For MVP, we'll handle this client-side or through session pre-filtering

  const result = await listDocuments(COLLECTIONS.RESPONSES, queries);

  return {
    responses: result.documents as Response[],
    total: result.total,
  };
}

/**
 * Get dashboard statistics for admin overview
 * Returns aggregate counts and metrics
 * 
 * @returns Dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  totalResponses: number;
  responsesSubmitted: number;
  responsesVoided: number;
  responsesDraft: number;
  responsesToday: number;
}> {
  // Get all responses
  const allResult = await listDocuments(COLLECTIONS.RESPONSES, [
    Query.limit(10000), // Assume max 10k for MVP
  ]);

  const responses = allResult.documents as Response[];

  // Calculate statistics
  const stats = {
    totalResponses: responses.length,
    responsesSubmitted: responses.filter((r) => r.status === RESPONSE_STATUS.SUBMITTED).length,
    responsesVoided: responses.filter((r) => r.status === RESPONSE_STATUS.VOIDED).length,
    responsesDraft: responses.filter((r) => r.status === RESPONSE_STATUS.DRAFT).length,
    responsesToday: 0,
  };

  // Count responses submitted today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  stats.responsesToday = responses.filter((r) => {
    if (!r.submittedAt) return false;
    return r.submittedAt >= todayISO;
  }).length;

  return stats;
}
