/**
 * Dashboard Layout
 * 
 * Authenticated layout for dashboard pages
 * Includes header with navigation and user info
 * Protected by authentication
 * 
 * @module app/(dashboard)/layout
 */

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Header } from '@/components/shared/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PageLoading } from '@/components/shared/LoadingSpinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {isLoading || !user ? (
          <PageLoading text="Loading dashboard..." />
        ) : (
          <>
            <Header
              userName={user.name || user.email}
              userRole={user.role}
              isAuthenticated={true}
              onLogout={logout}
            />
            
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
