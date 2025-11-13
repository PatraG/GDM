/**
 * GPS Utilities
 * Helper functions for capturing and handling GPS coordinates
 *
 * Features:
 * - Browser Geolocation API integration
 * - Permission handling
 * - Error states
 * - Accuracy tracking
 */

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface GPSError {
  code: number;
  message: string;
}

export type GPSResult =
  | { success: true; coordinates: GPSCoordinates }
  | { success: false; error: GPSError };

/**
 * Check if Geolocation API is supported
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator;
}

/**
 * Capture current GPS coordinates
 * Uses browser Geolocation API
 */
export async function captureGPSCoordinates(): Promise<GPSResult> {
  if (!isGeolocationSupported()) {
    return {
      success: false,
      error: {
        code: 0,
        message: 'Geolocation is not supported by this browser',
      },
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          },
        });
      },
      (error) => {
        let message: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'GPS permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'GPS position unavailable. Please check your device settings.';
            break;
          case error.TIMEOUT:
            message = 'GPS request timed out. Please try again.';
            break;
          default:
            message = 'An unknown GPS error occurred.';
        }

        resolve({
          success: false,
          error: {
            code: error.code,
            message,
          },
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0, // Don't use cached position
      }
    );
  });
}

/**
 * Get human-readable GPS permission state
 */
export async function getGPSPermissionState(): Promise<PermissionState | 'unsupported'> {
  if (!navigator.permissions) {
    return 'unsupported';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return 'unsupported';
  }
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(coords: GPSCoordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (±${coords.accuracy.toFixed(0)}m)`;
}
