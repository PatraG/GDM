/**
 * Enumerator Layout
 * Protected layout for field enumerator pages
 * 
 * Enforces enumerator role access and provides consistent navigation
 */

import { EnumeratorRoute } from '@/components/auth/ProtectedRoute';

export default function EnumeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnumeratorRoute>
      {children}
    </EnumeratorRoute>
  );
}
