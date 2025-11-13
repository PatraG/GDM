/**
 * RespondentSearch Component
 * Search and filter respondents with advanced criteria
 *
 * Features:
 * - Search by pseudonym (respondent code)
 * - Filter by age range, sex, admin area
 * - Display results in table format
 * - Select respondent for session creation
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { searchRespondents } from '@/lib/services/respondentService';
import type { Respondent, AgeRange, Sex } from '@/lib/types/respondent';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatAgeRange, formatSex, formatRelativeTime } from '@/lib/utils/formatters';

interface RespondentSearchProps {
  enumeratorId: string;
  onSelect?: (respondent: Respondent) => void;
}

interface SearchFormData {
  pseudonym: string;
  ageRange: AgeRange | '';
  sex: Sex | '';
  adminArea: string;
}

export function RespondentSearch({ enumeratorId, onSelect }: RespondentSearchProps) {
  const [results, setResults] = useState<Respondent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<SearchFormData>({
    defaultValues: {
      pseudonym: '',
      ageRange: '',
      sex: '',
      adminArea: '',
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    try {
      setError(null);
      setIsSearching(true);
      setHasSearched(true);

      const searchParams = {
        pseudonym: data.pseudonym || undefined,
        ageRange: data.ageRange || undefined,
        sex: data.sex || undefined,
        adminArea: data.adminArea || undefined,
      };

      const { respondents } = await searchRespondents(enumeratorId, searchParams);
      setResults(respondents);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search respondents';
      setError(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    reset();
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pseudonym Search */}
          <div>
            <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-700">
              Respondent Code
            </label>
            <input
              type="text"
              id="pseudonym"
              {...register('pseudonym')}
              placeholder="R-00001"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Age Range Filter */}
          <div>
            <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">
              Age Range
            </label>
            <select
              id="ageRange"
              {...register('ageRange')}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All ages</option>
              <option value="18-24">18-24 years</option>
              <option value="25-34">25-34 years</option>
              <option value="35-44">35-44 years</option>
              <option value="45-54">45-54 years</option>
              <option value="55-64">55-64 years</option>
              <option value="65+">65+ years</option>
            </select>
          </div>

          {/* Sex Filter */}
          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
              Sex
            </label>
            <select
              id="sex"
              {...register('sex')}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Admin Area Filter */}
          <div>
            <label htmlFor="adminArea" className="block text-sm font-medium text-gray-700">
              Administrative Area
            </label>
            <input
              type="text"
              id="adminArea"
              {...register('adminArea')}
              placeholder="Barangay, District..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSearching ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Searching...
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSearching}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">
            Search Results ({results.length})
          </h3>

          {results.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                No respondents found matching your search criteria
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Age Range
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Sex
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Admin Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Created
                    </th>
                    {onSelect && (
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((respondent) => (
                    <tr key={respondent.$id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {respondent.pseudonym}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatAgeRange(respondent.ageRange)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatSex(respondent.sex)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {respondent.adminArea}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {formatRelativeTime(respondent.createdAt)}
                      </td>
                      {onSelect && (
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => onSelect(respondent)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Select
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
