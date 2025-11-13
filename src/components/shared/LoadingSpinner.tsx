/**
 * Loading Spinner Component
 * 
 * Reusable loading indicator with various sizes
 * Used throughout the application for async operations
 * 
 * @module components/shared/LoadingSpinner
 */

'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Optional loading text */
  text?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to center the spinner */
  centered?: boolean;
  
  /** Full screen overlay mode */
  fullScreen?: boolean;
}

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 'md',
  text,
  className,
  centered = false,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center gap-3',
      centered && 'min-h-[200px]',
      fullScreen && 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'
    )}>
      {spinner}
      {text && (
        <p className="text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  );

  return content;
});

/**
 * Inline loading spinner for buttons and small spaces
 */
export const InlineSpinner = memo(function InlineSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
});

/**
 * Loading skeleton for content placeholders
 */
interface SkeletonProps {
  /** Optional CSS classes */
  className?: string;
  
  /** Number of lines to show */
  lines?: number;
}

export const Skeleton = memo(function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-md bg-muted',
          className
        )}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 animate-pulse rounded-md bg-muted',
            i === lines - 1 && 'w-4/5', // Last line shorter
            className
          )}
        />
      ))}
    </div>
  );
});

/**
 * Loading card skeleton
 */
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="mb-4 h-6 w-2/3" />
      <Skeleton lines={3} />
    </div>
  );
});

/**
 * Table skeleton
 */
export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 border-b pb-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
});

/**
 * Page loading state
 */
export const PageLoading = memo(function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
});

/**
 * Full screen loading overlay
 */
export const FullScreenLoading = memo(function FullScreenLoading({ text = 'Loading...' }: { text?: string }) {
  return <LoadingSpinner size="xl" text={text} fullScreen />;
});
