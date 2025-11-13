/**
 * Enumerators Management Page
 * 
 * Admin page for managing enumerator accounts
 * List, create, activate, and suspend enumerators
 * 
 * @module app/(dashboard)/admin/enumerators/page
 */

'use client';

import { useState, useEffect } from 'react';
import { EnumeratorList } from '@/components/admin/EnumeratorList';
import { EnumeratorForm } from '@/components/admin/EnumeratorForm';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import type { User } from '@/lib/types/auth';
import type { UserCreate } from '@/lib/types/auth';

export default function EnumeratorsPage() {
  const [enumerators, setEnumerators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Load enumerators
  const loadEnumerators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/enumerators');
      
      if (!response.ok) {
        throw new Error('Failed to load enumerators');
      }
      
      const data = await response.json();
      setEnumerators(data.documents || []);
    } catch (err) {
      console.error('Load enumerators error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load enumerators');
    } finally {
      setIsLoading(false);
    }
  };

  // Create enumerator
  const handleCreate = async (data: UserCreate) => {
    try {
      const response = await fetch('/api/enumerators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create enumerator');
      }
      
      setCreateSuccess(true);
      setShowCreateForm(false);
      
      // Reload list
      await loadEnumerators();
      
      // Clear success message after 5 seconds
      setTimeout(() => setCreateSuccess(false), 5000);
    } catch (err) {
      console.error('Create enumerator error:', err);
      throw err; // Re-throw to be handled by form
    }
  };

  // Toggle enumerator status
  const handleStatusToggle = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      const response = await fetch(`/api/enumerators/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.hasActiveSessions) {
          alert('Cannot suspend enumerator with active sessions. Please ask them to close their sessions first.');
          return;
        }
        
        throw new Error(errorData.error || 'Failed to update status');
      }
      
      // Reload list
      await loadEnumerators();
    } catch (err) {
      console.error('Toggle status error:', err);
      throw err;
    }
  };

  // Load on mount
  useEffect(() => {
    loadEnumerators();
  }, []);

  if (isLoading && enumerators.length === 0) {
    return <PageLoading text="Loading enumerators..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enumerators</h1>
        <p className="mt-2 text-muted-foreground">
          Manage enumerator accounts and permissions
        </p>
      </div>

      {/* Success Message */}
      {createSuccess && (
        <div className="rounded-md bg-green-100 p-4 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
          <p className="font-medium">Success!</p>
          <p className="mt-1">Enumerator account created successfully.</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Create Button */}
      {!showCreateForm && (
        <div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Enumerator
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Enumerator</h2>
          <EnumeratorForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            mode="create"
          />
        </div>
      )}

      {/* Enumerators List */}
      <EnumeratorList
        enumerators={enumerators}
        isLoading={isLoading}
        onStatusToggle={handleStatusToggle}
        onRefresh={loadEnumerators}
      />
    </div>
  );
}
