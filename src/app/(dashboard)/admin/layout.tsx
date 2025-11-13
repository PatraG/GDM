/**
 * Admin Layout
 * 
 * Layout for admin-only pages
 * Enforces admin role requirement
 * 
 * @module app/(dashboard)/admin/layout
 */

'use client';

import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      {children}
    </AdminRoute>
  );
}
