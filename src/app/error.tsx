/**
 * Error Boundary Component
 * 
 * Handles runtime errors in the application with user-friendly messages
 * Shows reset button to retry the operation
 * 
 * @module app/error
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 sm:px-6 sm:py-24 md:px-8">
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
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-center text-muted-foreground">
            We encountered an unexpected error while processing your request.
            Please try again or contact support if the problem persists.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 rounded-md bg-muted p-4">
              <p className="text-sm font-medium text-foreground">
                Error Details (Development Only):
              </p>
              <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Go Home
            </Link>
          </div>

          {/* Support Link */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            If you continue to experience issues, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
