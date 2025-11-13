/**
 * Enumerator Detail Page
 * 
 * View and manage individual enumerator account
 * Shows account details, status, and activity
 * 
 * @module app/(dashboard)/admin/enumerators/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import { formatDate, formatUserRole } from '@/lib/utils/formatters';
import type { User } from '@/lib/types/auth';

export default function EnumeratorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [enumerator, setEnumerator] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Load enumerator
  const loadEnumerator = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/enumerators/${resolvedParams.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load enumerator');
      }
      
      const data = await response.json();
      setEnumerator(data);
    } catch (err) {
      console.error('Load enumerator error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load enumerator');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle status
  const handleStatusToggle = async () => {
    if (!enumerator) return;
    
    const newStatus = enumerator.status === 'active' ? 'suspended' : 'active';
    
    if (newStatus === 'suspended') {
      const confirmed = confirm(
        'Are you sure you want to suspend this enumerator? They will not be able to log in until reactivated.'
      );
      if (!confirmed) return;
    }
    
    try {
      setIsToggling(true);
      
      const response = await fetch(`/api/enumerators/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.hasActiveSessions) {
          toast.error('Cannot suspend enumerator', {
            description: 'Enumerator has active sessions. Please ask them to close their sessions first.',
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      toast.success('Status updated successfully');
      
      // Reload
      await loadEnumerator();
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error('Failed to update status', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Load on mount
  useEffect(() => {
    loadEnumerator();
  }, [resolvedParams.id]);

  if (isLoading) {
    return <PageLoading text="Loading enumerator details..." />;
  }

  if (error || !enumerator) {
    return (
      <div className="space-y-6">
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Error</p>
          <p className="mt-1">{error || 'Enumerator not found'}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin/enumerators')}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Enumerators
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/dashboard/admin/enumerators')}
            className="mb-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Enumerators
          </button>
          <h1 className="text-3xl font-bold tracking-tight">
            {enumerator.email}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Enumerator Account Details
          </p>
        </div>
        
        {/* Status Toggle */}
        <button
          onClick={handleStatusToggle}
          disabled={isToggling}
          className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
            enumerator.status === 'active'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isToggling
            ? 'Updating...'
            : enumerator.status === 'active'
            ? 'Suspend Account'
            : 'Activate Account'}
        </button>
      </div>

      {/* Account Details */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="mt-1 text-sm text-foreground">{enumerator.email}</dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Role</dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatUserRole(enumerator.role)}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  enumerator.status === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {enumerator.status}
              </span>
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
            <dd className="mt-1 text-sm font-mono text-foreground">
              {enumerator.userId}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Created</dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDate(enumerator.createdAt)}
            </dd>
          </div>
          
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDate(enumerator.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Activity Section - Placeholder for future implementation */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Activity</h2>
        <p className="text-sm text-muted-foreground">
          Session history and response statistics will be displayed here.
        </p>
      </div>
    </div>
  );
}
