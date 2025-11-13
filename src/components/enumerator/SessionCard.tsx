/**
 * SessionCard Component
 * Display session information with status and actions
 *
 * Features:
 * - Show session status and timing
 * - Display respondent information
 * - Close session action
 * - Timeout warning
 */

'use client';

import { memo } from 'react';
import type { Session } from '@/lib/types/session';
import { formatSessionStatus, formatDuration, formatRelativeTime } from '@/lib/utils/formatters';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SessionCardProps {
  session: Session;
  respondentPseudonym?: string;
  timeRemaining?: number;
  isNearTimeout?: boolean;
  onClose?: (sessionId: string) => void;
  isClosing?: boolean;
}

export const SessionCard = memo(function SessionCard({
  session,
  respondentPseudonym,
  timeRemaining,
  isNearTimeout = false,
  onClose,
  isClosing = false,
}: SessionCardProps) {
  const { label: statusLabel, colorClass: statusColor } = formatSessionStatus(session.status);

  const isActive = session.status === 'open';

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm ${
        isNearTimeout && isActive
          ? 'border-yellow-300 bg-yellow-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Status Badge */}
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
            >
              {statusLabel}
            </span>
            {isNearTimeout && isActive && (
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                <svg
                  className="mr-1 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Expiring Soon
              </span>
            )}
          </div>

          {/* Session Info */}
          <div className="space-y-2 text-sm">
            {respondentPseudonym && (
              <div className="flex items-center text-gray-700">
                <svg
                  className="mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium">{respondentPseudonym}</span>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <svg
                className="mr-2 h-5 w-5 text-gray-400"
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
              <span>Started {formatRelativeTime(session.startTime)}</span>
            </div>

            {session.endTime && (
              <div className="flex items-center text-gray-600">
                <svg
                  className="mr-2 h-5 w-5 text-gray-400"
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
                <span>Ended {formatRelativeTime(session.endTime)}</span>
              </div>
            )}

            {isActive && timeRemaining !== undefined && (
              <div
                className={`flex items-center ${
                  isNearTimeout ? 'font-semibold text-yellow-800' : 'text-gray-600'
                }`}
              >
                <svg
                  className="mr-2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Time remaining: {formatDuration(timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {isActive && onClose && (
          <button
            onClick={() => onClose(session.$id)}
            disabled={isClosing}
            className="ml-4 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isClosing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Closing...
              </>
            ) : (
              <>
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close Session
              </>
            )}
          </button>
        )}
      </div>

      {/* Warning Message */}
      {isNearTimeout && isActive && (
        <div className="mt-4 rounded-md bg-yellow-100 border border-yellow-200 p-3">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> This session will automatically close in{' '}
            {timeRemaining !== undefined && formatDuration(timeRemaining)}. Any unsaved
            work will be preserved as drafts.
          </p>
        </div>
      )}
    </div>
  );
});
