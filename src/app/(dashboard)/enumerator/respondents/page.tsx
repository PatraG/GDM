/**
 * Respondents Page
 * Manage respondents - create new and search existing
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { RespondentForm } from '@/components/enumerator/RespondentForm';
import { RespondentSearch } from '@/components/enumerator/RespondentSearch';
import type { Respondent } from '@/lib/types/respondent';

type ViewMode = 'create' | 'search';

export default function RespondentsPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreateSuccess = (respondent: { $id: string; pseudonym: string }) => {
    setSuccessMessage(`Respondent ${respondent.pseudonym} created successfully!`);
    setViewMode('search');
    
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleRespondentSelect = (respondent: Respondent) => {
    // Navigate to session creation with this respondent
    // This will be implemented when we build the sessions page
    console.log('Selected respondent:', respondent);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Respondents</h1>
        <p className="mt-2 text-sm text-gray-600">
          Register new survey participants or search existing records
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

      {/* View Mode Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setViewMode('search')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'search'
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Respondents
          </button>
          <button
            onClick={() => setViewMode('create')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              viewMode === 'create'
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            New Respondent
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {viewMode === 'create' ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Register New Respondent
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Fill in the respondent's demographic information. All data is anonymized
              with a unique code.
            </p>
            <RespondentForm
              enumeratorId={user?.$id || ''}
              onSuccess={handleCreateSuccess}
              onCancel={() => setViewMode('search')}
            />
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Search Respondents
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Find existing respondents by code or demographic criteria. Select a
              respondent to start a new session.
            </p>
            <RespondentSearch
              enumeratorId={user?.$id || ''}
              onSelect={handleRespondentSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
}
