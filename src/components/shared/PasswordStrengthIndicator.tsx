/**
 * PasswordStrengthIndicator Component
 * 
 * Visual indicator for password strength
 * Calculates strength based on multiple criteria
 * 
 * @module components/shared/PasswordStrengthIndicator
 */

'use client';

import { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  /** Password value to evaluate */
  password: string;
  
  /** Minimum acceptable strength level (default: 'medium') */
  minStrength?: PasswordStrength;
  
  /** Show detailed strength breakdown */
  showDetails?: boolean;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

interface StrengthResult {
  score: number; // 0-4
  strength: PasswordStrength;
  color: string;
  label: string;
  width: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

/**
 * Calculate password strength based on multiple criteria
 */
function calculatePasswordStrength(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      strength: 'weak',
      color: 'bg-gray-300',
      label: 'No password',
      width: '0%',
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    };
  }

  // Check individual criteria
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  // Calculate score (0-4)
  let score = 0;
  
  // Length scoring
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;
  
  // Character variety scoring
  if (checks.uppercase && checks.lowercase) score += 1;
  if (checks.number) score += 1;
  if (checks.special) score += 1;
  
  // Normalize score to 0-4 range
  score = Math.min(4, score);

  // Determine strength level
  let strength: PasswordStrength;
  let color: string;
  let label: string;
  let width: string;

  if (score <= 1) {
    strength = 'weak';
    color = 'bg-red-500';
    label = 'Weak';
    width = '25%';
  } else if (score <= 2) {
    strength = 'medium';
    color = 'bg-yellow-500';
    label = 'Medium';
    width = '50%';
  } else if (score <= 3) {
    strength = 'strong';
    color = 'bg-blue-500';
    label = 'Strong';
    width = '75%';
  } else {
    strength = 'very-strong';
    color = 'bg-green-500';
    label = 'Very Strong';
    width = '100%';
  }

  return { score, strength, color, label, width, checks };
}

export function PasswordStrengthIndicator({
  password,
  minStrength = 'medium',
  showDetails = false,
}: PasswordStrengthIndicatorProps) {
  const result = useMemo(() => calculatePasswordStrength(password), [password]);

  // Don't show anything if no password yet
  if (!password) {
    return null;
  }

  // Check if meets minimum strength requirement
  const strengthOrder: PasswordStrength[] = ['weak', 'medium', 'strong', 'very-strong'];
  const meetsMinimum = strengthOrder.indexOf(result.strength) >= strengthOrder.indexOf(minStrength);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${result.color}`}
              style={{ width: result.width }}
              role="progressbar"
              aria-valuenow={result.score}
              aria-valuemin={0}
              aria-valuemax={4}
              aria-label={`Password strength: ${result.label}`}
            />
          </div>
        </div>
        <span className={`text-sm font-medium ${meetsMinimum ? 'text-foreground' : 'text-destructive'}`}>
          {result.label}
        </span>
      </div>

      {/* Detailed Checks */}
      {showDetails && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className={result.checks.length ? 'text-green-600' : 'text-gray-400'}>
              {result.checks.length ? '✓' : '○'}
            </span>
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={result.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
              {result.checks.uppercase ? '✓' : '○'}
            </span>
            <span>Contains uppercase letter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={result.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
              {result.checks.lowercase ? '✓' : '○'}
            </span>
            <span>Contains lowercase letter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={result.checks.number ? 'text-green-600' : 'text-gray-400'}>
              {result.checks.number ? '✓' : '○'}
            </span>
            <span>Contains number</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={result.checks.special ? 'text-green-600' : 'text-gray-400'}>
              {result.checks.special ? '✓' : '○'}
            </span>
            <span>Contains special character (optional)</span>
          </div>
        </div>
      )}

      {/* Minimum Requirement Warning */}
      {!meetsMinimum && (
        <p className="text-xs text-destructive">
          Password must be at least &quot;{minStrength}&quot; strength
        </p>
      )}
    </div>
  );
}
