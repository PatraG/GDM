/**
 * Survey Service
 * Business logic for fetching surveys and questions for the field workflow
 *
 * Responsibilities:
 * - List available active surveys
 * - Get survey details with questions
 * - Fetch question options for choice-based questions
 * - Validate survey version locking (deferred to Phase 7)
 */

import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
} from '@/lib/appwrite/databases';
import { COLLECTIONS, SURVEY_STATUS } from '@/lib/appwrite/constants';
import type {
  Survey,
  SurveyWithQuestions,
  Question,
  Option,
  QuestionWithOptions,
  SurveyCreate,
  SurveyUpdate,
} from '@/lib/types/survey';
import { Query } from 'appwrite';

/**
 * List all active surveys
 * Returns surveys that are ready for field use (status='locked')
 */
export async function listActiveSurveys(
  limit = 50,
  offset = 0
): Promise<{ surveys: Survey[]; total: number }> {
  const queries = [
    Query.equal('status', 'locked'),
    Query.orderAsc('$createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  const result = await listDocuments(COLLECTIONS.SURVEYS, queries);

  return {
    surveys: result.documents as Survey[],
    total: result.total,
  };
}

/**
 * Get a single survey by ID
 */
export async function getSurvey(surveyId: string): Promise<Survey> {
  const document = await getDocument(COLLECTIONS.SURVEYS, surveyId);
  return document as Survey;
}

/**
 * Get questions for a survey
 * Ordered by order field
 */
export async function getSurveyQuestions(
  surveyId: string
): Promise<Question[]> {
  const queries = [
    Query.equal('surveyId', surveyId),
    Query.orderAsc('order'),
    Query.limit(100), // Assume max 100 questions per survey
  ];

  const result = await listDocuments(COLLECTIONS.QUESTIONS, queries);

  return result.documents as Question[];
}

/**
 * Get options for a question
 * Only applicable for radio and checkbox questions
 */
export async function getQuestionOptions(
  questionId: string
): Promise<Option[]> {
  const queries = [
    Query.equal('questionId', questionId),
    Query.orderAsc('order'),
    Query.limit(50), // Assume max 50 options per question
  ];

  const result = await listDocuments(COLLECTIONS.OPTIONS, queries);

  return result.documents as Option[];
}

/**
 * Get survey with all questions and options
 * Comprehensive fetch for rendering a complete survey form
 */
export async function getSurveyWithQuestions(
  surveyId: string
): Promise<SurveyWithQuestions> {
  // Fetch survey
  const survey = await getSurvey(surveyId);

  // Fetch questions
  const questions = await getSurveyQuestions(surveyId);

  // Fetch options for all choice-based questions
  const questionsWithOptions: QuestionWithOptions[] = await Promise.all(
    questions.map(async (question) => {
      if (
        question.questionType === 'radio' ||
        question.questionType === 'checkbox' ||
        question.questionType === 'scale'
      ) {
        const options = await getQuestionOptions(question.$id);
        return { ...question, options };
      }
      return { ...question, options: [] };
    })
  );

  return {
    ...survey,
    questions: questionsWithOptions,
  };
}

/**
 * Search surveys by title or description
 * Useful for survey selector UI
 */
export async function searchSurveys(
  searchTerm: string,
  limit = 20,
  offset = 0
): Promise<{ surveys: Survey[]; total: number }> {
  const queries = [
    Query.equal('status', 'locked'),
    Query.search('title', searchTerm),
    Query.orderAsc('$createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  const result = await listDocuments(COLLECTIONS.SURVEYS, queries);

  return {
    surveys: result.documents as Survey[],
    total: result.total,
  };
}

/**
 * Get survey statistics
 * Returns metadata about survey usage
 * Note: This requires querying responses (implemented in responseService)
 */
export async function getSurveyStats(surveyId: string): Promise<{
  totalResponses: number;
  completedResponses: number;
  draftResponses: number;
}> {
  // Query responses for this survey
  const queries = [
    Query.equal('surveyId', surveyId),
    Query.limit(5000), // Count up to 5000 responses
  ];

  const result = await listDocuments(COLLECTIONS.RESPONSES, queries);

  const responses = result.documents as unknown as Array<{ status: string }>;

  // Aggregate statistics
  const stats = {
    totalResponses: responses.length,
    completedResponses: responses.filter((r) => r.status === 'submitted')
      .length,
    draftResponses: responses.filter((r) => r.status === 'draft').length,
  };

  return stats;
}

/**
 * Validate survey is active and ready for data collection
 * Throws error if survey is not available
 */
export async function validateSurveyActive(surveyId: string): Promise<void> {
  const survey = await getSurvey(surveyId);

  if (survey.status !== 'locked') {
    throw new Error(
      `Survey "${survey.title}" is not locked and cannot be used for data collection`
    );
  }
}

/**
 * Create a new survey (admin only)
 * Initial status defaults to 'draft'
 * @param data Survey creation data
 * @returns Created survey document
 */
export async function createSurvey(data: SurveyCreate): Promise<Survey> {
  const surveyData = {
    title: data.title,
    description: data.description || '',
    version: data.version || '1.0.0',
    status: data.status || SURVEY_STATUS.DRAFT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const document = await createDocument(COLLECTIONS.SURVEYS, surveyData);
  return document as Survey;
}

/**
 * Update a survey (admin only)
 * Implements version locking logic per FR-042:
 * - If status is 'locked': can only update status to 'archived'
 * - If status is 'archived': cannot make any updates
 * - If status is 'draft': can update all fields
 * 
 * @param surveyId Survey ID to update
 * @param data Survey update data
 * @returns Updated survey document
 * @throws Error if survey is locked/archived and trying to update non-status fields
 */
export async function updateSurvey(
  surveyId: string,
  data: SurveyUpdate
): Promise<Survey> {
  // Get current survey state
  const currentSurvey = await getSurvey(surveyId);

  // --- Version Locking Logic (T020a) ---
  
  // Rule 1: Archived surveys cannot be modified
  if (currentSurvey.status === SURVEY_STATUS.ARCHIVED) {
    throw new Error(
      `Cannot modify archived survey "${currentSurvey.title}". Survey is permanently archived.`
    );
  }

  // Rule 2: Locked surveys can only change status to 'archived'
  if (currentSurvey.status === SURVEY_STATUS.LOCKED) {
    // Check if trying to update fields other than status
    const hasNonStatusUpdates =
      data.title !== undefined ||
      data.description !== undefined ||
      data.version !== undefined;

    if (hasNonStatusUpdates) {
      throw new Error(
        `Cannot modify locked survey "${currentSurvey.title}". Survey is locked for data collection. Only status transitions to 'archived' are allowed.`
      );
    }

    // If updating status, it must be to 'archived'
    if (data.status !== undefined && data.status !== SURVEY_STATUS.ARCHIVED) {
      throw new Error(
        `Cannot change locked survey status to '${data.status}'. Only transition to 'archived' is allowed.`
      );
    }
  }

  // Rule 3: Draft surveys can update all fields
  // Rule 4: Validate status transitions
  if (data.status !== undefined) {
    const validTransitions: Record<string, string[]> = {
      [SURVEY_STATUS.DRAFT]: [SURVEY_STATUS.LOCKED],
      [SURVEY_STATUS.LOCKED]: [SURVEY_STATUS.ARCHIVED],
      [SURVEY_STATUS.ARCHIVED]: [], // No transitions allowed from archived
    };

    const allowedStatuses = validTransitions[currentSurvey.status] || [];
    
    if (
      data.status !== currentSurvey.status &&
      !allowedStatuses.includes(data.status)
    ) {
      throw new Error(
        `Invalid status transition from '${currentSurvey.status}' to '${data.status}'. Allowed transitions: ${allowedStatuses.join(', ') || 'none'}.`
      );
    }
  }

  // --- End Version Locking Logic ---

  // Build update payload
  const updateData: Partial<Survey> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.version !== undefined) updateData.version = data.version;
  if (data.status !== undefined) updateData.status = data.status;

  // Perform update
  const document = await updateDocument(
    COLLECTIONS.SURVEYS,
    surveyId,
    updateData
  );

  return document as Survey;
}

/**
 * Delete a survey (admin only)
 * Can only delete surveys in 'draft' status
 * Locked/archived surveys cannot be deleted to preserve data integrity
 * 
 * @param surveyId Survey ID to delete
 * @throws Error if survey is locked or archived
 */
export async function deleteSurvey(surveyId: string): Promise<void> {
  const survey = await getSurvey(surveyId);

  if (survey.status !== SURVEY_STATUS.DRAFT) {
    throw new Error(
      `Cannot delete survey "${survey.title}" with status '${survey.status}'. Only draft surveys can be deleted.`
    );
  }

  // Note: Actual deletion logic would need to handle cascading deletes
  // for questions and options (to be implemented in Phase 8)
  throw new Error('Survey deletion not yet implemented. Use archive instead.');
}
