/**
 * useSurveys Hook
 * Manages survey data fetching for enumerators
 *
 * Features:
 * - List all active surveys
 * - Get survey with questions and options
 * - Search surveys
 * - Cache survey data to reduce API calls
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Survey, SurveyWithQuestions } from '@/lib/types/survey';
import {
  listActiveSurveys,
  getSurveyWithQuestions as getSurveyWithQuestionsService,
  searchSurveys as searchSurveysService,
} from '@/lib/services/surveyService';

interface UseSurveysOptions {
  autoLoad?: boolean;
}

interface UseSurveysReturn {
  surveys: Survey[];
  isLoading: boolean;
  error: string | null;
  refreshSurveys: () => Promise<void>;
  getSurveyWithQuestions: (surveyId: string) => Promise<SurveyWithQuestions>;
  searchSurveys: (searchTerm: string) => Promise<Survey[]>;
}

/**
 * Hook for managing surveys
 * Provides access to active surveys and survey details
 */
export function useSurveys({
  autoLoad = true,
}: UseSurveysOptions = {}): UseSurveysReturn {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Cache for survey details (surveyId -> SurveyWithQuestions)
  const [surveyCache] = useState<Map<string, SurveyWithQuestions>>(new Map());

  /**
   * Fetch all active surveys
   */
  const refreshSurveys = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { surveys: fetchedSurveys } = await listActiveSurveys();
      setSurveys(fetchedSurveys);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch surveys';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get survey with all questions and options
   * Uses cache to avoid redundant API calls
   */
  const getSurveyWithQuestions = useCallback(async (
    surveyId: string
  ): Promise<SurveyWithQuestions> => {
    // Check cache first
    if (surveyCache.has(surveyId)) {
      return surveyCache.get(surveyId)!;
    }

    try {
      setError(null);
      const surveyWithQuestions = await getSurveyWithQuestionsService(surveyId);
      
      // Cache the result
      surveyCache.set(surveyId, surveyWithQuestions);
      
      return surveyWithQuestions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch survey details';
      setError(message);
      throw err;
    }
  }, [surveyCache]);

  /**
   * Search surveys by title
   */
  const searchSurveys = useCallback(async (searchTerm: string): Promise<Survey[]> => {
    try {
      setError(null);
      const { surveys: searchResults } = await searchSurveysService(searchTerm);
      return searchResults;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search surveys';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    if (autoLoad) {
      refreshSurveys();
    }
  }, [autoLoad, refreshSurveys]);

  return {
    surveys,
    isLoading,
    error,
    refreshSurveys,
    getSurveyWithQuestions,
    searchSurveys,
  };
}
