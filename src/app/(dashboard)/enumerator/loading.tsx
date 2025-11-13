/**
 * Enumerator Dashboard Loading State
 * 
 * Displays loading skeleton while enumerator pages are loading
 * 
 * @module app/(dashboard)/enumerator/loading
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function EnumeratorLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Action Button Skeleton */}
      <div className="h-10 w-40 animate-pulse rounded-md bg-muted" />

      {/* Content Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Loading Spinner Fallback */}
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    </div>
  );
}
