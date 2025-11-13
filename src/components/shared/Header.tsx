/**
 * Header Component
 * 
 * Shared header navigation component
 * Displays branding, navigation, and user info
 * 
 * @module components/shared/Header
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  /** Optional user name to display */
  userName?: string;
  
  /** Optional user role to display */
  userRole?: 'admin' | 'enumerator';
  
  /** Whether user is authenticated */
  isAuthenticated?: boolean;
  
  /** Logout handler */
  onLogout?: () => void;
}

export function Header({
  userName,
  userRole,
  isAuthenticated = false,
  onLogout,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo / Brand */}
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Oral Health Survey
            </span>
            <span className="font-bold sm:hidden">
              OHS
            </span>
          </Link>
        </div>

        {/* Navigation */}
        {isAuthenticated && (
          <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
            {userRole === 'enumerator' && (
              <>
                <Link
                  href="/enumerator"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === '/enumerator' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/enumerator/respondents"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname?.startsWith('/enumerator/respondents') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Respondents
                </Link>
                <Link
                  href="/enumerator/sessions"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname?.startsWith('/enumerator/sessions') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Sessions
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname === '/admin' ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/enumerators"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname?.startsWith('/admin/enumerators') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Enumerators
                </Link>
                <Link
                  href="/admin/surveys"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname?.startsWith('/admin/surveys') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Surveys
                </Link>
                <Link
                  href="/admin/responses"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname?.startsWith('/admin/responses') ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  Responses
                </Link>
              </>
            )}
          </nav>
        )}

        {/* User Menu */}
        {isAuthenticated && (
          <div className="flex flex-1 items-center justify-end space-x-4">
            <div className="flex flex-col items-end text-sm">
              {userName && (
                <span className="font-medium">{userName}</span>
              )}
              {userRole && (
                <span className="text-xs text-muted-foreground">
                  {userRole === 'admin' ? 'Administrator' : 'Enumerator'}
                </span>
              )}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
