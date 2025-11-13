/**
 * Surveys Page
 * Browse and fill surveys during an active session
 *
 * Note: Full SurveyForm implementation with dynamic rendering, GPS capture,
 * and retry submission will be completed in Phase 6. This provides
 * the foundation and structure for Phase 5 completion.
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSessions } from '@/lib/hooks/useSessions';
import { useSurveys } from '@/lib/hooks/useSurveys';
import { SurveySelector } from '@/components/enumerator/SurveySelector';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Survey } from '@/lib/types/survey';
import { getSessionResponses } from '@/lib/services/responseService';

export default function SurveysPage() {
  const { user } = useAuth();
  const { activeSession, isLoading: sessionsLoading } = useSessions({
    enumeratorId: user?.$id || '',
  });
  const { surveys, isLoading: surveysLoading } = useSurveys({ autoLoad: true });

  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<string[]>([]);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  // Load completed surveys for active session
  useEffect(() => {
    async function loadCompletedSurveys() {
      if (!activeSession) return;

      try {
        setIsLoadingCompleted(true);
        const responses = await getSessionResponses(activeSession.$id);
        const completed = responses
          .filter((r) => r.status === 'submitted')
          .map((r) => r.surveyId);
        setCompletedSurveyIds(completed);
      } catch (error) {
        console.error('Failed to load completed surveys:', error);
      } finally {
        setIsLoadingCompleted(false);
      }
    }

    loadCompletedSurveys();
  }, [activeSession]);

  if (sessionsLoading || surveysLoading || isLoadingCompleted) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No Active Session</h3>
          <p className="mt-2 text-sm text-gray-600">
            You must have an active session to fill surveys.
          </p>
          <a
            href="/enumerator/sessions"
            className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Start a Session
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
        <p className="mt-2 text-sm text-gray-600">
          Select a survey to begin data collection
        </p>
      </div>

      {/* Survey List View */}
      {!selectedSurvey && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Available Surveys ({surveys.length})
          </h2>
          <SurveySelector
            surveys={surveys}
            completedSurveyIds={completedSurveyIds}
            onSelect={(survey) => setSelectedSurvey(survey)}
          />
        </div>
      )}

      {/* Survey Form View - Phase 6 Implementation */}
      {selectedSurvey && (
        <div>
          <button
            onClick={() => setSelectedSurvey(null)}
            className="mb-6 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Survey List
          </button>

          <div className="rounded-lg border border-gray-200 bg-white p-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {selectedSurvey.title}
            </h2>
            {selectedSurvey.description && (
              <p className="mb-6 text-gray-600">{selectedSurvey.description}</p>
            )}

            {/* Placeholder for Phase 6 */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Survey Form - Phase 6
              </h3>
              <p className="mt-2 max-w-md mx-auto text-sm text-gray-600">
                Dynamic survey form with question rendering, GPS capture, and retry
                submission will be implemented in Phase 6 (User Story 2).
                <br />
                <br />
                Foundation complete: Services, hooks, and UI structure are ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
