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
} from '@/lib/appwrite/databases';
import { COLLECTIONS } from '@/lib/appwrite/constants';
import type {
  Survey,
  SurveyWithQuestions,
  Question,
  Option,
  QuestionWithOptions,
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
