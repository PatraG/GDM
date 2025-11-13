/**
 * Surveys Page
 * Browse and fill surveys during an active session
 * 
 * T089: Post-submission flow - return to SurveySelector without closing session
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSessions } from '@/lib/hooks/useSessions';
import { useSurveys } from '@/lib/hooks/useSurveys';
import { SurveySelector } from '@/components/enumerator/SurveySelector';
import { SurveyForm } from '@/components/enumerator/SurveyForm';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Survey, SurveyWithQuestions } from '@/lib/types/survey';
import { getSessionResponses } from '@/lib/services/responseService';
import { getSurveyWithQuestions } from '@/lib/services/surveyService';

export default function SurveysPage() {
  const { user } = useAuth();
  const { activeSession, isLoading: sessionsLoading } = useSessions({
    enumeratorId: user?.$id || '',
  });
  const { surveys, isLoading: surveysLoading } = useSurveys({ autoLoad: true });

  const [selectedSurvey, setSelectedSurvey] = useState<SurveyWithQuestions | null>(null);
  const [completedSurveyIds, setCompletedSurveyIds] = useState<string[]>([]);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(false);

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
        toast.error('Failed to load completed surveys', {
          description: error instanceof Error ? error.message : 'Please try again',
        });
      } finally {
        setIsLoadingCompleted(false);
      }
    }

    loadCompletedSurveys();
  }, [activeSession]);

  // Handle survey selection - load full survey with questions
  const handleSelectSurvey = async (survey: Survey) => {
    // T092: Prevent duplicate survey submission
    if (completedSurveyIds.includes(survey.$id)) {
      const confirmReopen = confirm(
        'You have already completed this survey in the current session. Do you want to view it again? (You cannot submit it twice.)'
      );
      if (!confirmReopen) {
        return;
      }
    }

    try {
      setIsLoadingSurvey(true);
      const fullSurvey = await getSurveyWithQuestions(survey.$id);
      setSelectedSurvey(fullSurvey);
    } catch (error) {
      console.error('Failed to load survey:', error);
      toast.error('Failed to load survey', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setIsLoadingSurvey(false);
    }
  };

  // Handle survey submission success
  const handleSubmissionSuccess = async () => {
    // Reload completed surveys
    if (activeSession) {
      try {
        const responses = await getSessionResponses(activeSession.$id);
        const completed = responses
          .filter((r) => r.status === 'submitted')
          .map((r) => r.surveyId);
        setCompletedSurveyIds(completed);
        
        toast.success('Survey submitted successfully!', {
          description: 'Your responses have been recorded.',
        });
      } catch (error) {
        console.error('Failed to reload completed surveys:', error);
      }
    }

    // Return to survey selector
    setSelectedSurvey(null);
  };

  // Handle cancel - return to survey list
  const handleCancel = () => {
    setSelectedSurvey(null);
  };

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
          {isLoadingSurvey ? (
            <div className="flex h-64 items-center justify-center">
              <LoadingSpinner size="lg" text="Loading survey..." />
            </div>
          ) : (
            <SurveySelector
              surveys={surveys}
              completedSurveyIds={completedSurveyIds}
              onSelect={handleSelectSurvey}
            />
          )}
        </div>
      )}

      {/* Survey Form View */}
      {selectedSurvey && activeSession && (
        <div>
          <button
            onClick={handleCancel}
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

            {/* T092: Warning for completed surveys */}
            {completedSurveyIds.includes(selectedSurvey.$id) && (
              <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-yellow-600"
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
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-yellow-800">
                      Survey Already Completed
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      You have already submitted this survey in the current session. You cannot submit it again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!completedSurveyIds.includes(selectedSurvey.$id) && (
              <SurveyForm
                survey={selectedSurvey}
                session={activeSession}
                respondentId={activeSession.respondentId || ''}
                onSuccess={handleSubmissionSuccess}
                onCancel={handleCancel}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
