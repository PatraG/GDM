/**
 * Sessions Page
 * Manage survey sessions - create, view, and close
 *
 * Features:
 * - Display active session with timeout warning
 * - Create new session with respondent selection
 * - List session history
 * - Close session manually
 * - T103: Support pre-selected respondent via query parameter
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useSessions } from '@/lib/hooks/useSessions';
import { SessionCard } from '@/components/enumerator/SessionCard';
import { SessionSummary } from '@/components/enumerator/SessionSummary';
import { RespondentSearch } from '@/components/enumerator/RespondentSearch';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Respondent } from '@/lib/types/respondent';
import { getRespondent } from '@/lib/services/respondentService';

type ViewMode = 'active' | 'create' | 'summary' | 'history';

export default function SessionsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const {
    activeSession,
    sessions,
    isLoading,
    error,
    timeRemaining,
    isNearTimeout,
    createSession,
    closeSession,
    refreshActiveSession,
    refreshSessions,
  } = useSessions({
    enumeratorId: user?.$id || '',
    autoRefresh: true,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Store respondent info for active session
  const [activeRespondent, setActiveRespondent] = useState<Respondent | null>(null);

  // T103: Handle pre-selected respondent from query parameter
  useEffect(() => {
    const respondentId = searchParams.get('respondent');
    if (respondentId && !activeSession) {
      // Auto-navigate to create mode and load respondent
      setViewMode('create');
      
      // Load and auto-create session for this respondent
      getRespondent(respondentId)
        .then((respondent) => {
          handleCreateSession(respondent);
        })
        .catch((err) => {
          console.error('Failed to load pre-selected respondent:', err);
          setCreateError('Failed to load selected respondent');
        });
    }
  }, [searchParams, activeSession]);

  // Load respondent info for active session
  const loadActiveRespondent = useCallback(async () => {
    if (activeSession) {
      try {
        const respondent = await getRespondent(activeSession.respondentId);
        setActiveRespondent(respondent);
      } catch (err) {
        console.error('Failed to load respondent:', err);
      }
    }
  }, [activeSession]);

  // Load respondent when active session changes
  useState(() => {
    loadActiveRespondent();
  });

  const handleCreateSession = async (respondent: Respondent) => {
    try {
      setCreateError(null);
      setIsCreating(true);

      await createSession({
        respondentId: respondent.$id,
        enumeratorId: user?.$id || '',
      });

      setSuccessMessage(`Session started with respondent ${respondent.pseudonym}`);
      setViewMode('active');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    // Confirm before closing
    const confirmed = window.confirm(
      'Are you sure you want to close this session? Any unsaved work will be preserved as drafts.'
    );

    if (!confirmed) return;

    try {
      setIsClosing(true);
      await closeSession(sessionId, 'manual');
      setSuccessMessage('Session closed successfully');
      setViewMode('history');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to close session:', err);
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading && !activeSession) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage data collection sessions with respondents
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewMode('active')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <svg
              className="mr-2 inline-block h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Active Session
            {activeSession && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                1
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('create')}
            disabled={!!activeSession}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            <svg
              className="mr-2 inline-block h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Session
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            <svg
              className="mr-2 inline-block h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </button>
          <button
            onClick={() => setViewMode('summary')}
            disabled={!activeSession}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50'
            }`}
          >
            <svg
              className="mr-2 inline-block h-5 w-5"
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
            Summary
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* Active Session View */}
        {viewMode === 'active' && (
          <div>
            {activeSession ? (
              <div className="space-y-6">
                <SessionCard
                  session={activeSession}
                  respondentPseudonym={activeRespondent?.pseudonym}
                  timeRemaining={timeRemaining}
                  isNearTimeout={isNearTimeout}
                  onClose={handleCloseSession}
                  isClosing={isClosing}
                />

                {/* Quick Actions for Active Session */}
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      onClick={() => {
                        // Navigate to surveys page (will implement later)
                        window.location.href = '/enumerator/surveys';
                      }}
                      className="flex items-center justify-center rounded-lg border border-blue-600 bg-blue-50 px-6 py-4 text-blue-600 hover:bg-blue-100"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
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
                      Fill Survey
                    </button>
                    <button
                      onClick={() => handleCloseSession(activeSession.$id)}
                      disabled={isClosing}
                      className="flex items-center justify-center rounded-lg border border-red-600 bg-red-50 px-6 py-4 text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      {isClosing ? 'Closing...' : 'Close Session'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No Active Session
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Start a new session to begin data collection
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Start New Session
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create Session View */}
        {viewMode === 'create' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Start New Session
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Search for a respondent to begin a new data collection session. You can
              only have one active session at a time.
            </p>

            {createError && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-800">{createError}</p>
              </div>
            )}

            {activeSession ? (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
                <p className="text-sm text-yellow-800">
                  You already have an active session. Please close it before starting a
                  new one.
                </p>
              </div>
            ) : (
              <RespondentSearch
                enumeratorId={user?.$id || ''}
                onSelect={handleCreateSession}
              />
            )}
          </div>
        )}

        {/* History View */}
        {viewMode === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Session History ({sessions.length})
            </h2>

            {sessions.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No Sessions Yet
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Start your first session to begin collecting data
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <SessionCard key={session.$id} session={session} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary View - T096 */}
        {viewMode === 'summary' && (
          <div>
            {activeSession ? (
              <SessionSummary session={activeSession} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
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
                  No Active Session
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Start a session to view its summary
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
