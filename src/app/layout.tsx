/**
 * Root Layout Component
 * 
 * Main layout wrapper for the entire application
 * Includes Tailwind CSS imports and global configuration
 * 
 * @module app/layout
 */

import type { Metadata } from 'next';
import './app.css';

export const metadata: Metadata = {
  title: 'Oral Health Survey - Data Collection System',
  description: 'Field data collection system for oral health surveys with role-based access control',
  icons: {
    icon: '/appwrite.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
