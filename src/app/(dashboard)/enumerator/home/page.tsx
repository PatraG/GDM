/**
 * Enumerator Home Page
 * Dashboard for field enumerators showing:
 * - Active session status
 * - Quick actions (new respondent, new session, surveys)
 * - Recent activity summary
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useSessions } from '@/lib/hooks/useSessions';
import { useSurveys } from '@/lib/hooks/useSurveys';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDuration, formatRelativeTime } from '@/lib/utils/formatters';

export default function EnumeratorHomePage() {
  const { user } = useAuth();
  const {
    activeSession,
    isLoading: sessionsLoading,
    timeRemaining,
    isNearTimeout,
  } = useSessions({
    enumeratorId: user?.$id || '',
    autoRefresh: true,
  });

  const { surveys, isLoading: surveysLoading } = useSurveys({ autoLoad: true });

  if (sessionsLoading || surveysLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Field enumerator dashboard - Manage respondents and conduct surveys
        </p>
      </div>

      {/* Active Session Alert */}
      {activeSession && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            isNearTimeout
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3
                className={`font-semibold ${
                  isNearTimeout ? 'text-yellow-800' : 'text-blue-800'
                }`}
              >
                {isNearTimeout ? '⚠️ Session Expiring Soon' : '✓ Active Session'}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  isNearTimeout ? 'text-yellow-700' : 'text-blue-700'
                }`}
              >
                Session started {formatRelativeTime(activeSession.startTime)}
                <br />
                Time remaining: {formatDuration(timeRemaining)}
              </p>
            </div>
            <Link
              href="/enumerator/sessions"
              className={`rounded px-4 py-2 text-sm font-medium ${
                isNearTimeout
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Manage Session
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* New Respondent */}
          <Link
            href="/enumerator/respondents"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              New Respondent
            </h3>
            <p className="text-sm text-gray-600">
              Register a new survey participant
            </p>
          </Link>

          {/* Start Session */}
          <Link
            href="/enumerator/sessions"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
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
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {activeSession ? 'Manage Session' : 'Start Session'}
            </h3>
            <p className="text-sm text-gray-600">
              {activeSession
                ? 'View or close current session'
                : 'Begin data collection with a respondent'}
            </p>
          </Link>

          {/* Browse Surveys */}
          <Link
            href="/enumerator/surveys"
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
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
            </div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Browse Surveys
            </h3>
            <p className="text-sm text-gray-600">
              {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'}{' '}
              available
            </p>
          </Link>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Active Session</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {activeSession ? '1' : '0'}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">
              Available Surveys
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {surveys.length}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Session Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {activeSession ? (
                <span className="text-green-600">In Progress</span>
              ) : (
                <span className="text-gray-500">No Active Session</span>
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">
              Time Remaining
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {activeSession ? (
                <span className={isNearTimeout ? 'text-yellow-600' : 'text-blue-600'}>
                  {formatDuration(timeRemaining)}
                </span>
              ) : (
                <span className="text-gray-500">--:--:--</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {!activeSession && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Getting Started
          </h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="mr-2 font-semibold">1.</span>
              <span>
                <Link href="/enumerator/respondents" className="text-blue-600 hover:underline">
                  Register a new respondent
                </Link>{' '}
                or search for an existing one
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-semibold">2.</span>
              <span>
                <Link href="/enumerator/sessions" className="text-blue-600 hover:underline">
                  Start a new session
                </Link>{' '}
                to begin data collection
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-semibold">3.</span>
              <span>
                Select a survey and fill out the questionnaire with GPS coordinates
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-semibold">4.</span>
              <span>
                Submit responses and continue with more surveys or close the session
              </span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
