'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * NetworkStatus Component
 * 
 * Displays a persistent banner when the user's device goes offline.
 * Auto-hides when connection is restored.
 * 
 * Features:
 * - Detects online/offline status via navigator.onLine
 * - Shows warning banner when offline
 * - Auto-dismisses when back online
 * - Positioned fixed at top of viewport
 * 
 * @example
 * ```tsx
 * // Add to root layout
 * <NetworkStatus />
 * ```
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Initialize state based on current connection
    setIsOnline(navigator.onLine);
    setShowOfflineBanner(!navigator.onLine);

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if online
  if (isOnline && !showOfflineBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
      <Alert 
        variant="destructive" 
        className="rounded-none border-x-0 border-t-0 shadow-md"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="font-medium">
            You are currently offline. Some features may not be available.
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
}

/**
 * NetworkStatusIndicator Component
 * 
 * Compact indicator showing current network status.
 * Useful for dashboard headers or status bars.
 * 
 * @example
 * ```tsx
 * <NetworkStatusIndicator />
 * ```
 */
export function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-600">Offline</span>
        </>
      )}
    </div>
  );
}
