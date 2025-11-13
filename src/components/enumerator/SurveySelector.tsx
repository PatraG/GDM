/**
 * Survey Selector Component
 * Display available surveys with completion status
 */

'use client';

import type { Survey } from '@/lib/types/survey';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SurveyCard {
  survey: Survey;
  isCompleted: boolean;
}

interface SurveySelectorProps {
  surveys: Survey[];
  completedSurveyIds: string[];
  onSelect: (survey: Survey) => void;
  isLoading?: boolean;
}

export function SurveySelector({
  surveys,
  completedSurveyIds,
  onSelect,
  isLoading = false,
}: SurveySelectorProps) {
  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading surveys..." />;
  }

  if (surveys.length === 0) {
    return (
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
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No Surveys Available</h3>
        <p className="mt-2 text-sm text-gray-600">
          There are no active surveys to fill at this time
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {surveys.map((survey) => {
        const isCompleted = completedSurveyIds.includes(survey.$id);

        return (
          <button
            key={survey.$id}
            onClick={() => onSelect(survey)}
            className={`relative flex flex-col rounded-lg border p-6 text-left shadow-sm transition-shadow hover:shadow-md ${
              isCompleted
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            {isCompleted && (
              <div className="absolute right-4 top-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <h3 className="mb-2 text-lg font-semibold text-gray-900 pr-8">
              {survey.title}
            </h3>
            {survey.description && (
              <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                {survey.description}
              </p>
            )}
            <div className="mt-auto">
              <span className="text-xs text-gray-500">v{survey.version}</span>
              {isCompleted && (
                <span className="ml-2 inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Completed
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
