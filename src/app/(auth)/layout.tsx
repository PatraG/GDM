/**
 * Auth Layout
 * 
 * Layout for authentication pages (login, etc.)
 * Simple centered layout with branding
 * 
 * @module app/(auth)/layout
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Oral Health Survey',
  description: 'Sign in to the Oral Health Survey data collection system',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Branding */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Oral Health Survey
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Data Collection System
          </p>
        </div>

        {/* Auth Content */}
        <div className="rounded-lg bg-card p-8 shadow-md">
          {children}
        </div>
      </div>
    </div>
  );
}
