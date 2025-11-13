/**
 * SurveyForm Component
 * Dynamic form generator for survey responses with GPS capture
 * 
 * Features:
 * - Dynamic question rendering based on questionType (text, radio, checkbox, scale)
 * - React Hook Form with Zod validation
 * - GPS coordinate capture and display
 * - Response submission with retry mechanism and countdown timer
 * - Success confirmation with multi-survey workflow support
 * 
 * T075-T077, T080, T084-T085
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { SurveyWithQuestions, QuestionWithOptions } from '@/lib/types/survey';
import type { Session } from '@/lib/types/session';
import type { GPSCoordinates } from '@/lib/utils/gps';
import { captureGPSCoordinates, formatGPSCoordinates } from '@/lib/utils/gps';
import { submitResponse } from '@/lib/services/responseService';
import { RETRY_CONFIG } from '@/lib/appwrite/constants';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface SurveyFormProps {
  survey: SurveyWithQuestions;
  session: Session;
  respondentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  [questionId: string]: string | string[];
}

export function SurveyForm({
  survey,
  session,
  respondentId,
  onSuccess,
  onCancel,
}: SurveyFormProps) {
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [enumeratorId, setEnumeratorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Build dynamic Zod schema based on required questions
  const buildValidationSchema = () => {
    const schemaFields: Record<string, z.ZodType<string | string[] | undefined>> = {};

    survey.questions.forEach((question) => {
      if (question.required) {
        if (question.questionType === 'checkbox') {
          // Checkbox: array must have at least one item
          schemaFields[question.$id] = z
            .array(z.string())
            .min(1, 'At least one option must be selected');
        } else {
          // Text, radio, scale: string must not be empty
          schemaFields[question.$id] = z.string().min(1, 'This field is required');
        }
      } else {
        // Optional fields
        if (question.questionType === 'checkbox') {
          schemaFields[question.$id] = z.array(z.string()).optional();
        } else {
          schemaFields[question.$id] = z.string().optional();
        }
      }
    });

    return z.object(schemaFields);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(buildValidationSchema()) as any,
    mode: 'onBlur',
  });

  // Capture GPS on component mount
  useEffect(() => {
    async function captureGps() {
      setIsCapturingGps(true);
      const result = await captureGPSCoordinates();

      if (result.success) {
        setGpsCoordinates(result.coordinates!);
        setGpsError(null);
      } else {
        setGpsError(result.error?.message || 'GPS capture failed');
      }
      setIsCapturingGps(false);
    }

    captureGps();
  }, []);

  // Get enumerator ID from session
  useEffect(() => {
    if (session.enumeratorId) {
      setEnumeratorId(session.enumeratorId);
    }
  }, [session]);

  // Retry countdown timer
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [retryCountdown]);

  const onSubmit = async (data: FormData) => {
    if (!gpsCoordinates) {
      alert('GPS coordinates are required. Please wait for GPS capture to complete.');
      return;
    }

    setIsSubmitting(true);
    setRetryAttempt(0);

    // Convert form data to response format
    const answers = Object.entries(data).map(([questionId, answer]) => {
      const question = survey.questions.find((q) => q.$id === questionId);
      if (!question) return null;

      // Serialize answer value
      let answerValue: string;
      if (Array.isArray(answer)) {
        // Checkbox: JSON array of selected option IDs
        answerValue = JSON.stringify(answer);
      } else {
        // Text, radio, scale: direct value
        answerValue = answer;
      }

      return {
        questionId,
        answerValue,
      };
    }).filter((a) => a !== null) as Array<{ questionId: string; answerValue: string }>;

    // Get required question IDs
    const requiredQuestionIds = survey.questions
      .filter((q) => q.required)
      .map((q) => q.$id);

    // Track retry attempts manually
    let attempts = 0;
    let success = false;
    let error: string | undefined;

    while (attempts < 3 && !success) {
      attempts++;
      setRetryAttempt(attempts);

      try {
        const result = await submitResponse(
          {
            sessionId: session.$id,
            respondentId,
            surveyId: survey.$id,
            surveyVersion: survey.version,
            enumeratorId,
            answers,
            gpsCoordinates,
          },
          requiredQuestionIds
        );

        if (result.success) {
          success = true;
        } else {
          error = result.error instanceof Error ? result.error.message : String(result.error);
          
          // Calculate backoff delay
          if (attempts < 3) {
            const delay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.MULTIPLIER, attempts - 1);
            const delaySeconds = Math.floor(delay / 1000);
            
            // Show countdown
            for (let i = delaySeconds; i > 0; i--) {
              setRetryCountdown(i);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setRetryCountdown(0);
          }
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Submission failed';
        
        // Calculate backoff delay for next attempt
        if (attempts < 3) {
          const delay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.MULTIPLIER, attempts - 1);
          const delaySeconds = Math.floor(delay / 1000);
          
          // Show countdown
          for (let i = delaySeconds; i > 0; i--) {
            setRetryCountdown(i);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
          setRetryCountdown(0);
        }
      }
    }

    setIsSubmitting(false);
    setRetryAttempt(0);
    setRetryCountdown(0);

    if (success) {
      setShowSuccess(true);
    } else {
      alert(`Submission failed after ${attempts} attempts: ${error}`);
    }
  };

  // Success confirmation modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-600"
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
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Survey Submitted Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your response has been saved.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onSuccess}
              className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              Fill Another Survey
            </button>
            <button
              onClick={onCancel}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Back to Survey List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* GPS Status */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          GPS Location
        </h3>
        {isCapturingGps && (
          <div className="flex items-center text-sm text-gray-600">
            <LoadingSpinner size="sm" />
            <span className="ml-2">Capturing GPS coordinates...</span>
          </div>
        )}
        {gpsCoordinates && (
          <div className="text-sm text-gray-700">
            <p className="font-mono">
              {formatGPSCoordinates(gpsCoordinates)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Captured at {new Date(gpsCoordinates.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
        {gpsError && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm font-medium text-red-800">GPS Error</p>
            <p className="mt-1 text-sm text-red-700">{gpsError}</p>
          </div>
        )}
      </div>

      {/* Questions */}
      {survey.questions
        .sort((a, b) => a.order - b.order)
        .map((question) => (
          <QuestionField
            key={question.$id}
            question={question}
            register={register}
            watch={watch}
            error={errors[question.$id]}
          />
        ))}

      {/* Retry Status */}
      {isSubmitting && retryAttempt > 0 && (
        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <div className="flex items-center">
            <LoadingSpinner size="sm" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Retry Attempt {retryAttempt} of 3
              </p>
              {retryCountdown > 0 && (
                <p className="mt-1 text-sm text-yellow-700">
                  Retrying in {retryCountdown}s...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isCapturingGps || !gpsCoordinates}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Submitting...</span>
            </span>
          ) : (
            'Submit Survey'
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * QuestionField Component
 * Renders a single question based on its type
 * T076: Dynamic question rendering
 */
interface QuestionFieldProps {
  question: QuestionWithOptions;
  register: ReturnType<typeof useForm<FormData>>['register'];
  watch: ReturnType<typeof useForm<FormData>>['watch'];
  error?: { message?: string };
}

function QuestionField({ question, register, watch, error }: QuestionFieldProps) {
  const currentValue = watch(question.$id);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <label className="mb-4 block">
        <div className="mb-2 flex items-start">
          <span className="text-sm font-medium text-gray-900">
            {question.questionText}
          </span>
          {question.required && (
            <span className="ml-1 text-red-600" title="Required">
              *
            </span>
          )}
        </div>

        {/* Text Input */}
        {question.questionType === 'text' && (
          <textarea
            {...register(question.$id)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your answer..."
          />
        )}

        {/* Radio Buttons */}
        {question.questionType === 'radio' && (
          <div className="space-y-2">
            {question.options
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <label
                  key={option.$id}
                  className="flex items-center rounded-md border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    {...register(question.$id)}
                    value={option.value}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {option.optionText}
                  </span>
                </label>
              ))}
          </div>
        )}

        {/* Checkboxes */}
        {question.questionType === 'checkbox' && (
          <div className="space-y-2">
            {question.options
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <label
                  key={option.$id}
                  className="flex items-center rounded-md border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    {...register(question.$id)}
                    value={option.value}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    {option.optionText}
                  </span>
                </label>
              ))}
          </div>
        )}

        {/* Scale (Numeric) */}
        {question.questionType === 'scale' && (
          <div className="flex justify-between gap-2">
            {question.options
              .sort((a, b) => a.order - b.order)
              .map((option) => (
                <label
                  key={option.$id}
                  className={`flex-1 cursor-pointer rounded-md border-2 p-4 text-center transition-colors ${
                    currentValue === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    {...register(question.$id)}
                    value={option.value}
                    className="sr-only"
                  />
                  <div className="text-2xl font-bold text-gray-900">
                    {option.value}
                  </div>
                  {option.optionText && (
                    <div className="mt-1 text-xs text-gray-600">
                      {option.optionText}
                    </div>
                  )}
                </label>
              ))}
          </div>
        )}
      </label>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error.message}</p>
      )}
    </div>
  );
}
