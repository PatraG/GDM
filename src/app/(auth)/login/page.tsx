/**
 * Login Page
 * 
 * Email/password authentication page
 * Redirects authenticated users to appropriate dashboard
 * 
 * @module app/(auth)/login/page
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Redirect authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirect = searchParams.get('redirect');
      
      if (redirect) {
        // Redirect to intended destination
        router.push(redirect);
      } else {
        // Redirect to role-based dashboard
        const dashboard = user.role === 'admin'
          ? '/dashboard/admin'
          : '/dashboard/enumerator/home';
        router.push(dashboard);
      }
    }
  }, [isAuthenticated, user, isLoading, router, searchParams]);

  // Show loading while checking auth
  if (isLoading) {
    return <PageLoading text="Checking authentication..." />;
  }

  // Already authenticated
  if (isAuthenticated) {
    return <PageLoading text="Redirecting..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Sign In
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your credentials to access the system
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
