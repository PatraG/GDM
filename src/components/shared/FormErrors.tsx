/**
 * Form Validation Error Display Helpers
 * 
 * Provides consistent error message styling across all forms.
 * Uses shadcn/ui's destructive variant for consistency.
 * 
 * @module components/shared/FormErrors
 */

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FieldErrorProps {
  /**
   * Error message to display
   */
  message?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Field Error Component
 * 
 * Displays validation error for a single form field.
 * Consistent styling with destructive text color.
 * 
 * @example
 * ```tsx
 * {errors.email && <FieldError message={errors.email.message} />}
 * ```
 */
export function FieldError({ message, className = '' }: FieldErrorProps) {
  if (!message) return null;
  
  return (
    <p className={`mt-1 text-sm text-destructive ${className}`}>
      {message}
    </p>
  );
}

interface FormErrorAlertProps {
  /**
   * Error title (optional, defaults to "Error")
   */
  title?: string;
  
  /**
   * Error message or messages to display
   */
  message: string | string[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Form Error Alert Component
 * 
 * Displays form-level error (not field-specific).
 * Uses shadcn/ui Alert component with destructive variant.
 * 
 * @example
 * ```tsx
 * {submitError && <FormErrorAlert message={submitError} />}
 * ```
 */
export function FormErrorAlert({ 
  title = 'Error', 
  message, 
  className = '' 
}: FormErrorAlertProps) {
  const messages = Array.isArray(message) ? message : [message];
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <p className="font-medium">{title}</p>
        {messages.map((msg, index) => (
          <p key={index} className="mt-1">
            {msg}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
}

interface RequiredIndicatorProps {
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Required Field Indicator
 * 
 * Displays asterisk (*) for required fields.
 * Consistent color with form error messages.
 * 
 * @example
 * ```tsx
 * <Label>
 *   Email <RequiredIndicator />
 * </Label>
 * ```
 */
export function RequiredIndicator({ className = '' }: RequiredIndicatorProps) {
  return (
    <span 
      className={`text-destructive ${className}`} 
      title="Required field"
      aria-label="required"
    >
      *
    </span>
  );
}

/**
 * Helper function to check if form has any errors
 * 
 * @param errors - React Hook Form errors object
 * @returns true if any errors exist
 * 
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm();
 * const hasErrors = hasFormErrors(errors);
 * ```
 */
export function hasFormErrors(errors: Record<string, unknown>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Helper function to get all error messages from form
 * 
 * @param errors - React Hook Form errors object
 * @returns Array of error messages
 * 
 * @example
 * ```tsx
 * const { formState: { errors } } = useForm();
 * const errorMessages = getFormErrorMessages(errors);
 * // ['Email is required', 'Password must be at least 8 characters']
 * ```
 */
export function getFormErrorMessages(errors: Record<string, any>): string[] {
  return Object.values(errors)
    .map(error => error?.message)
    .filter((msg): msg is string => typeof msg === 'string');
}
