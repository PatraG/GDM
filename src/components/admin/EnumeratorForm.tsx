/**
 * EnumeratorForm Component
 * 
 * Form for creating/editing enumerator accounts
 * Validates email and password requirements
 * 
 * @module components/admin/EnumeratorForm
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userCreateSchema } from '@/lib/utils/validation';
import { InlineSpinner } from '@/components/shared/LoadingSpinner';
import { PasswordStrengthIndicator } from '@/components/shared/PasswordStrengthIndicator';
import type { UserCreate } from '@/lib/types/auth';

interface EnumeratorFormProps {
  /** Callback when form is submitted */
  onSubmit: (data: UserCreate) => Promise<void>;
  
  /** Callback when form is cancelled */
  onCancel?: () => void;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Form mode */
  mode?: 'create' | 'edit';
  
  /** Initial values for edit mode */
  defaultValues?: Partial<UserCreate>;
}

export function EnumeratorForm({
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  defaultValues,
}: EnumeratorFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserCreate>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      role: 'enumerator',
      status: 'active',
      ...defaultValues,
    },
  });

  const isFormLoading = isLoading || isSubmitting;
  const passwordValue = watch('password') || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email Address *
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          disabled={isFormLoading || mode === 'edit'}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="enumerator@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
        {mode === 'edit' && (
          <p className="mt-1 text-xs text-muted-foreground">
            Email cannot be changed after account creation
          </p>
        )}
      </div>

      {/* Password Field (Create mode only) */}
      {mode === 'create' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            Password *
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            disabled={isFormLoading}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="••••••••"
          />
          
          {/* Password Strength Indicator */}
          <PasswordStrengthIndicator 
            password={passwordValue} 
            minStrength="medium"
            showDetails={true}
          />
          
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum 8 characters with uppercase, lowercase, and number
          </p>
        </div>
      )}

      {/* Role Field (hidden, always enumerator) */}
      <input type="hidden" {...register('role')} value="enumerator" />

      {/* Status Field (optional) */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          {...register('status')}
          id="status"
          disabled={isFormLoading}
          className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-destructive">{errors.status.message}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Suspended accounts cannot log in
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormLoading}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isFormLoading}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isFormLoading ? (
            <>
              <InlineSpinner />
              <span>{mode === 'create' ? 'Creating...' : 'Saving...'}</span>
            </>
          ) : (
            <span>{mode === 'create' ? 'Create Enumerator' : 'Save Changes'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
