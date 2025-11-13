/**
 * ProtectedRoute Component
 * 
 * Wrapper component for route protection based on authentication and role
 * Redirects unauthenticated users to login
 * Handles role-based access control
 * 
 * @module components/auth/ProtectedRoute
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { PageLoading } from '@/components/shared/LoadingSpinner';
import type { Role } from '@/lib/appwrite/constants';

interface ProtectedRouteProps {
  /** Child components to render if authorized */
  children: React.ReactNode;
  
  /** Required role for access (optional - if not specified, any authenticated user can access) */
  requiredRole?: Role;
  
  /** Custom redirect path for unauthorized access */
  redirectTo?: string;
  
  /** Loading component (optional) */
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes requiring authentication and/or specific roles
 * Shows loading state while checking authentication
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if role doesn't match
 * 
 * @example
 * ```tsx
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo,
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role requirement
    if (requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on user's actual role
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        const defaultDashboard = user.role === 'admin' 
          ? '/dashboard/admin' 
          : '/dashboard/enumerator/home';
        router.push(defaultDashboard);
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, redirectTo, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return loadingComponent ?? <PageLoading text="Verifying authentication..." />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return loadingComponent ?? <PageLoading text="Redirecting to login..." />;
  }

  // Role mismatch
  if (requiredRole && user.role !== requiredRole) {
    return loadingComponent ?? <PageLoading text="Redirecting..." />;
  }

  // Authorized - render children
  return <>{children}</>;
}

/**
 * AdminRoute Component
 * Shorthand for admin-only routes
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
}

/**
 * EnumeratorRoute Component
 * Shorthand for enumerator-only routes
 */
export function EnumeratorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="enumerator">
      {children}
    </ProtectedRoute>
  );
}
