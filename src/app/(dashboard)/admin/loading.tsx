/**
 * Admin Dashboard Loading State
 * 
 * Displays loading skeleton while admin pages are loading
 * 
 * @module app/(dashboard)/admin/loading
 */

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-96 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="h-64 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Loading Spinner Fallback */}
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    </div>
  );
}
