/**
 * Root Loading State
 * 
 * Displays loading state for the entire application
 * 
 * @module app/loading
 */

import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function Loading() {
  return <PageLoading text="Loading application..." />;
}
