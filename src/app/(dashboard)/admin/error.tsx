/**
 * Admin Section Error Boundary
 * 
 * Handles errors in the admin dashboard section
 * Provides context-specific error messages
 * 
 * @module app/(dashboard)/admin/error
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Admin dashboard error:', error);
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
            Dashboard Error
          </h1>

          {/* Error Message */}
          <p className="mt-4 text-center text-muted-foreground">
            An error occurred while loading the admin dashboard.
            This could be due to a network issue or a problem with the data.
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
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
