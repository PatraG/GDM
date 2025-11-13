/**
 * Global Error Boundary Component
 * 
 * Catches errors in the root layout and provides a fallback UI
 * Only used in production for critical errors
 * 
 * @module app/global-error
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Critical application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:px-8">
          <div className="mx-auto max-w-lg">
            <div className="rounded-lg border border-red-200 bg-white p-8 shadow-lg dark:border-red-800 dark:bg-gray-800">
              {/* Error Icon */}
              <div className="flex items-center justify-center">
                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                Critical Error
              </h1>

              {/* Error Message */}
              <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
                A critical error occurred and the application needs to be restarted.
                Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 rounded-md bg-gray-100 p-4 dark:bg-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Error Details (Development Only):
                  </p>
                  <pre className="mt-2 overflow-auto text-xs text-gray-600 dark:text-gray-300">
                    {error.message}
                  </pre>
                  {error.stack && (
                    <pre className="mt-2 overflow-auto text-xs text-gray-500 dark:text-gray-400">
                      {error.stack}
                    </pre>
                  )}
                  {error.digest && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Restart Application
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Go Home
                </button>
              </div>

              {/* Support Link */}
              <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                Error ID: {error.digest || 'N/A'} | Contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
