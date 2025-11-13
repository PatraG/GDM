/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the component tree
 * Displays a fallback UI instead of crashing the entire app
 * 
 * @module components/shared/ErrorBoundary
 */

'use client';

import React from 'react';

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  
  /** Optional custom fallback UI */
  fallback?: React.ReactNode;
  
  /** Optional error handler callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary class component
 * React Error Boundaries must be class components
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Log to external error tracking service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <div className="w-full max-w-md space-y-4 text-center">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
              <h2 className="text-lg font-semibold text-destructive">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                An unexpected error occurred. Please try again.
              </p>
              
              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={this.resetError}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try again
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="ml-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Go to home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional wrapper for convenience
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
