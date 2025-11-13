/**
 * Enumerator Section Error Boundary
 * 
 * Handles errors in the enumerator workflow section
 * Provides context-specific error messages
 * 
 * @module app/(dashboard)/enumerator/error
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EnumeratorError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Enumerator workflow error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border border-destructive/20 bg-card p-8 shadow-lg">
          {/* Error Icon */}
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>

          {/* Error Title */}
          <h1 className="mt-6 text-center text-2xl font-bold text-foreground">
            Workflow Error
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-center text-muted-foreground">
            An error occurred in the enumerator workflow.
            Your data has been preserved. Please try again or return to the dashboard.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 rounded-md bg-muted p-4">
              <p className="text-sm font-medium text-foreground">
                Error Details:
              </p>
              <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                {error.message}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <a
              href="/enumerator"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </a>
          </div>

          {/* Data Preservation Notice */}
          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Any survey responses you entered have been saved as drafts.
              You can continue from where you left off when you return to the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
