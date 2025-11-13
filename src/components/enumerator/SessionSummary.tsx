/**
 * SessionSummary Component
 * Display overview of submitted surveys in a session
 * 
 * Features (T093-T095):
 * - List all submitted surveys with timestamps
 * - Display GPS coordinates for each submission
 * - Show respondent information
 * - Session timing and status
 */

'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@/lib/types/session';
import type { Response } from '@/lib/types/response';
import type { Survey } from '@/lib/types/survey';
import type { Respondent } from '@/lib/types/respondent';
import { getSessionResponses } from '@/lib/services/responseService';
import { getSurvey } from '@/lib/services/surveyService';
import { getRespondent } from '@/lib/services/respondentService';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDateTime, formatDuration } from '@/lib/utils/formatters';
import { SESSION_STATUS } from '@/lib/appwrite/constants';

interface SessionSummaryProps {
  session: Session;
}

interface ResponseWithSurvey extends Response {
  survey?: Survey;
}

export function SessionSummary({ session }: SessionSummaryProps) {
  const [responses, setResponses] = useState<ResponseWithSurvey[]>([]);
  const [respondent, setRespondent] = useState<Respondent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessionData() {
      try {
        setIsLoading(true);
        setError(null);

        // Load responses
        const responseList = await getSessionResponses(session.$id);
        const submittedResponses = responseList.filter((r) => r.status === 'submitted');

        // Load survey details for each response
        const responsesWithSurveys = await Promise.all(
          submittedResponses.map(async (response) => {
            try {
              const survey = await getSurvey(response.surveyId);
              return { ...response, survey };
            } catch (err) {
              console.error(`Failed to load survey ${response.surveyId}:`, err);
              return response;
            }
          })
        );

        setResponses(responsesWithSurveys);

        // Load respondent
        if (session.respondentId) {
          const respondentData = await getRespondent(session.respondentId);
          setRespondent(respondentData);
        }
      } catch (err) {
        console.error('Failed to load session data:', err);
        setError('Failed to load session data');
      } finally {
        setIsLoading(false);
      }
    }

    loadSessionData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading session summary..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
      </div>
    );
  }

  // Calculate session duration
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  const duration = endTime.getTime() - startTime.getTime();

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Session Information</h3>
        
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Respondent</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {respondent?.pseudonym || 'Unknown'}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  session.status === SESSION_STATUS.OPEN
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.status}
              </span>
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Started</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDateTime(session.startTime)}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-gray-500">Duration</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formatDuration(duration)}
            </dd>
          </div>

          {session.endTime && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Ended</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDateTime(session.endTime)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Submitted Surveys */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Submitted Surveys ({responses.length})
        </h3>

        {responses.length === 0 ? (
          <p className="text-sm text-gray-600">No surveys submitted in this session yet.</p>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => {
              // Parse GPS location
              let gpsData: { latitude: number; longitude: number; accuracy?: number; capturedAt: string } | null = null;
              try {
                if (response.location) {
                  gpsData = JSON.parse(response.location);
                }
              } catch (err) {
                console.error('Failed to parse GPS data:', err);
              }

              return (
                <div
                  key={response.$id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {response.survey?.title || `Survey ${response.surveyId.slice(-8)}`}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Version: {response.surveyVersion}
                      </p>
                    </div>
                    
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Submitted At</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {response.submittedAt
                          ? formatDateTime(response.submittedAt)
                          : 'Not submitted'}
                      </dd>
                    </div>

                    {gpsData && (
                      <>
                        <div>
                          <dt className="text-xs font-medium text-gray-500">GPS Coordinates</dt>
                          <dd className="mt-1 font-mono text-sm text-gray-900">
                            {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
                          </dd>
                        </div>

                        {gpsData.accuracy !== undefined && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500">GPS Accuracy</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              ±{Math.round(gpsData.accuracy)}m
                            </dd>
                          </div>
                        )}

                        <div>
                          <dt className="text-xs font-medium text-gray-500">GPS Captured</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {formatDateTime(gpsData.capturedAt)}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
