/**
 * EnumeratorList Component
 * 
 * Displays list of enumerators with actions
 * Supports filtering by status and pagination
 * 
 * @module components/admin/EnumeratorList
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@/lib/types/auth';
import { formatDate, formatUserRole } from '@/lib/utils/formatters';
import { InlineSpinner } from '@/components/shared/LoadingSpinner';

interface EnumeratorListProps {
  /** List of enumerators */
  enumerators: User[];
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Callback when status is toggled */
  onStatusToggle?: (userId: string, newStatus: 'active' | 'suspended') => Promise<void>;
  
  /** Callback when refresh is requested */
  onRefresh?: () => void;
}

export function EnumeratorList({
  enumerators,
  isLoading = false,
  onStatusToggle,
  onRefresh,
}: EnumeratorListProps) {
  const [togglingStatus, setTogglingStatus] = useState<string | null>(null);

  const handleStatusToggle = async (user: User) => {
    if (!onStatusToggle) return;
    
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    
    try {
      setTogglingStatus(user.$id);
      await onStatusToggle(user.$id, newStatus);
    } catch (error) {
      console.error('Status toggle error:', error);
    } finally {
      setTogglingStatus(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <InlineSpinner className="h-8 w-8" />
        <span className="ml-3 text-muted-foreground">Loading enumerators...</span>
      </div>
    );
  }

  if (enumerators.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No enumerators found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Create your first enumerator account to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {enumerators.length} enumerator{enumerators.length !== 1 ? 's' : ''}
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-primary hover:underline"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {enumerators.map((enumerator) => (
              <tr key={enumerator.$id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/admin/enumerators/${enumerator.$id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {enumerator.email}
                    </Link>
                    {enumerator.name && (
                      <span className="text-sm text-muted-foreground">
                        {enumerator.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {formatUserRole(enumerator.role)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      enumerator.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {enumerator.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDate(enumerator.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/admin/enumerators/${enumerator.$id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                    {onStatusToggle && (
                      <button
                        onClick={() => handleStatusToggle(enumerator)}
                        disabled={togglingStatus === enumerator.$id}
                        className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {togglingStatus === enumerator.$id ? (
                          <InlineSpinner className="h-4 w-4" />
                        ) : enumerator.status === 'active' ? (
                          'Suspend'
                        ) : (
                          'Activate'
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
