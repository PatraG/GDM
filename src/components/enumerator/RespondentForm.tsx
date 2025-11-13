/**
 * RespondentForm Component
 * Form for creating new respondents with validation
 *
 * Features:
 * - Name-pattern blocking (FR-058a)
 * - Consent requirement validation
 * - Age range and sex selection
 * - Administrative area input
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRespondent } from '@/lib/services/respondentService';
import type { AgeRange, Sex, RespondentCreate } from '@/lib/types/respondent';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { FieldError, FormErrorAlert, RequiredIndicator } from '@/components/shared/FormErrors';

// Validation schema with name-pattern blocking
const respondentSchema = z.object({
  ageRange: z.enum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+'], {
    message: 'Please select an age range',
  }),
  sex: z.enum(['M', 'F', 'Other'], {
    message: 'Please select a sex',
  }),
  adminArea: z
    .string()
    .min(1, 'Administrative area is required')
    .max(100, 'Administrative area is too long')
    .refine(
      (val) => {
        // Block capitalized words that look like names
        const namePattern = /^[A-Z][a-z]+$/;
        const words = val.trim().split(/\s+/);
        return !words.some((word) => namePattern.test(word));
      },
      {
        message:
          'Administrative area appears to contain a name. Please use location identifiers only (e.g., "District 5", "Barangay 12").',
      }
    ),
  consentGiven: z.literal(true, {
    message: 'Consent must be given to create a respondent',
  }),
});

type RespondentFormData = z.infer<typeof respondentSchema>;

interface RespondentFormProps {
  enumeratorId: string;
  onSuccess: (respondent: { $id: string; pseudonym: string }) => void;
  onCancel?: () => void;
}

export function RespondentForm({
  enumeratorId,
  onSuccess,
  onCancel,
}: RespondentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RespondentFormData>({
    resolver: zodResolver(respondentSchema),
  });

  const onSubmit = async (data: RespondentFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const input: RespondentCreate = {
        ...data,
        enumeratorId,
      };

      const respondent = await createRespondent(input);

      // Reset form and notify success
      reset();
      onSuccess(respondent);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create respondent';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && <FormErrorAlert message={error} />}

      {/* Age Range */}
      <div>
        <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">
          Age Range <RequiredIndicator />
        </label>
        <select
          id="ageRange"
          {...register('ageRange')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select age range</option>
          <option value="18-24">18-24 years</option>
          <option value="25-34">25-34 years</option>
          <option value="35-44">35-44 years</option>
          <option value="45-54">45-54 years</option>
          <option value="55-64">55-64 years</option>
          <option value="65+">65+ years</option>
        </select>
        <FieldError message={errors.ageRange?.message} />
      </div>

      {/* Sex */}
      <div>
        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">
          Sex <RequiredIndicator />
        </label>
        <select
          id="sex"
          {...register('sex')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select sex</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="Other">Other</option>
        </select>
        <FieldError message={errors.sex?.message} />
      </div>

      {/* Administrative Area */}
      <div>
        <label htmlFor="adminArea" className="block text-sm font-medium text-gray-700">
          Administrative Area <RequiredIndicator />
        </label>
        <input
          type="text"
          id="adminArea"
          {...register('adminArea')}
          placeholder="e.g., Barangay 12, District 5, Zone A"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use location identifiers only. Do not include personal names.
        </p>
        <FieldError message={errors.adminArea?.message} />
      </div>

      {/* Consent Checkbox */}
      <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="consentGiven"
              type="checkbox"
              {...register('consentGiven')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="consentGiven" className="font-medium text-gray-700">
              Informed Consent <RequiredIndicator />
            </label>
            <p className="text-gray-600">
              I confirm that the respondent has been informed about the survey purpose,
              data collection, and their rights. The respondent has given explicit
              consent to participate.
            </p>
          </div>
        </div>
        <FieldError message={errors.consentGiven?.message} className="mt-2" />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            'Create Respondent'
          )}
        </button>
      </div>
    </form>
  );
}
