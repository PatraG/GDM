/**
 * Respondent Detail Page
 * View respondent information and session history
 * 
 * T100-T102: Respondent detail view with session/survey history
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Respondent } from '@/lib/types/respondent';
import type { Session } from '@/lib/types/session';
import type { Response } from '@/lib/types/response';
import type { Survey } from '@/lib/types/survey';
import { getRespondent } from '@/lib/services/respondentService';
import { listDocuments } from '@/lib/appwrite/databases';
import { COLLECTIONS } from '@/lib/appwrite/constants';
import { getSurvey } from '@/lib/services/surveyService';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDateTime, formatAgeRange, formatSex, formatSessionStatus } from '@/lib/utils/formatters';
import { Query } from 'appwrite';

interface RespondentDetailPageProps {
  params: {
    id: string;
  };
}

interface SessionWithResponses extends Session {
  responses?: Array<Response & { survey?: Survey }>;
}

export default function RespondentDetailPage({ params }: RespondentDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [respondent, setRespondent] = useState<Respondent | null>(null);
  const [sessions, setSessions] = useState<SessionWithResponses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRespondentData() {
      try {
        setIsLoading(true);
        setError(null);

        // Load respondent
        const respondentData = await getRespondent(params.id);
        setRespondent(respondentData);

        // Load sessions for this respondent
        const sessionsResult = await listDocuments(COLLECTIONS.SESSIONS, [
          Query.equal('respondentId', params.id),
          Query.orderDesc('startTime'),
          Query.limit(100),
        ]);

        const sessionsData = sessionsResult.documents as Session[];

        // Load responses and surveys for each session
        const sessionsWithResponses = await Promise.all(
          sessionsData.map(async (session) => {
            try {
              const responsesResult = await listDocuments(COLLECTIONS.RESPONSES, [
                Query.equal('sessionId', session.$id),
                Query.equal('status', 'submitted'),
              ]);

              const responses = responsesResult.documents as Response[];

              // Load survey details for each response
              const responsesWithSurveys = await Promise.all(
                responses.map(async (response) => {
                  try {
                    const survey = await getSurvey(response.surveyId);
                    return { ...response, survey };
                  } catch (err) {
                    console.error(`Failed to load survey ${response.surveyId}:`, err);
                    return response;
                  }
                })
              );

              return { ...session, responses: responsesWithSurveys };
            } catch (err) {
              console.error(`Failed to load responses for session ${session.$id}:`, err);
              return { ...session, responses: [] };
            }
          })
        );

        setSessions(sessionsWithResponses);
      } catch (err) {
        console.error('Failed to load respondent data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load respondent data');
      } finally {
        setIsLoading(false);
      }
    }

    loadRespondentData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex h-96 items-center justify-center">
          <LoadingSpinner size="lg" text="Loading respondent..." />
        </div>
      </div>
    );
  }

  if (error || !respondent) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h3 className="text-lg font-semibold text-red-900">Error</h3>
          <p className="mt-2 text-sm text-red-700">
            {error || 'Respondent not found'}
          </p>
          <button
            onClick={() => router.push('/enumerator/respondents')}
            className="mt-4 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Back to Respondents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/enumerator/respondents')}
          className="mb-4 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
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
          Back to Respondents
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {respondent.pseudonym}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Respondent Details and Session History
            </p>
          </div>

          {/* T103: Start New Session button */}
          <button
            onClick={() => {
              // Navigate to sessions page with pre-selected respondent
              router.push(`/enumerator/sessions?respondent=${respondent.$id}`);
            }}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
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
      </div>

      {/* Respondent Information */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Respondent Information
        </h2>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Respondent Code</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900">
              {respondent.pseudonym}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Age Range</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatAgeRange(respondent.ageRange)}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Sex</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatSex(respondent.sex)}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Administrative Area</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {respondent.adminArea}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Consent Given</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {respondent.consentGiven ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Yes
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  No
                </span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Registered</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDateTime(respondent.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Session History - T102 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Session History ({sessions.length})
        </h2>

        {sessions.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-4 text-sm font-semibold text-gray-900">
              No Sessions Yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Start a new session to begin collecting data for this respondent
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const { label, colorClass } = formatSessionStatus(session.status);

              return (
                <div
                  key={session.$id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-gray-900">
                          Session {session.$id.slice(-8)}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
                        >
                          {label}
                        </span>
                      </div>

                      <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <dt className="text-xs font-medium text-gray-500">Started</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDateTime(session.startTime)}
                          </dd>
                        </div>

                        {session.endTime && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">Ended</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {formatDateTime(session.endTime)}
                            </dd>
                          </div>
                        )}

                        <div>
                          <dt className="text-xs font-medium text-gray-500">
                            Surveys Submitted
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {session.responses?.length || 0}
                          </dd>
                        </div>
                      </dl>

                      {/* Submitted Surveys */}
                      {session.responses && session.responses.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-xs font-medium text-gray-500">
                            Submitted Surveys:
                          </h4>
                          <ul className="mt-2 space-y-1">
                            {session.responses.map((response) => (
                              <li
                                key={response.$id}
                                className="flex items-center text-sm text-gray-700"
                              >
                                <svg
                                  className="mr-2 h-4 w-4 text-green-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {response.survey?.title || `Survey ${response.surveyId.slice(-8)}`}
                                <span className="ml-2 text-xs text-gray-500">
                                  v{response.surveyVersion}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
