/**
 * Utility Formatters
 * 
 * Common formatting functions for dates, GPS coordinates, and display values
 * 
 * @module lib/utils/formatters
 */

import type { Location, ParsedLocation } from '@/lib/types/response';

/**
 * Format date to localized string
 * @param date - ISO date string or Date object
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', options).format(dateObj);
}

/**
 * Format datetime to localized string with time
 * @param datetime - ISO datetime string or Date object
 * @returns Formatted datetime string
 */
export function formatDateTime(datetime: string | Date): string {
  return formatDate(datetime, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only
 * @param datetime - ISO datetime string or Date object
 * @returns Formatted time string (HH:MM)
 */
export function formatTime(datetime: string | Date): string {
  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Format duration in milliseconds to human-readable string
 * @param durationMs - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);

  return parts.length > 0 ? parts.join(' ') : '0s';
}

/**
 * Format GPS coordinates to display string (FR-033a)
 * @param location - Location object or parsed location
 * @param precision - Number of decimal places (default: 6)
 * @returns Formatted coordinates string
 */
export function formatGPSCoordinates(
  location: Location | ParsedLocation | null | undefined,
  precision: number = 6
): string {
  if (!location) {
    return 'No location data';
  }

  const lat = location.latitude.toFixed(precision);
  const lng = location.longitude.toFixed(precision);
  
  return `${lat}, ${lng}`;
}

/**
 * Format GPS coordinates with direction indicators (N/S, E/W)
 * @param location - Location object
 * @returns Formatted coordinates with directions (e.g., "6.2088° S, 106.8456° E")
 */
export function formatGPSWithDirection(
  location: Location | ParsedLocation | null | undefined
): string {
  if (!location) {
    return 'No location data';
  }

  const latDir = location.latitude >= 0 ? 'N' : 'S';
  const lngDir = location.longitude >= 0 ? 'E' : 'W';
  const lat = Math.abs(location.latitude).toFixed(4);
  const lng = Math.abs(location.longitude).toFixed(4);
  
  return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
}

/**
 * Format GPS coordinates for Google Maps link
 * @param location - Location object
 * @returns Google Maps URL
 */
export function formatGoogleMapsLink(
  location: Location | ParsedLocation | null | undefined
): string {
  if (!location) {
    return '';
  }

  return `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
}

/**
 * Format respondent code for display
 * Already formatted in database as "R-00001", just ensures uppercase
 * @param code - Respondent pseudonym code
 * @returns Formatted code
 */
export function formatRespondentCode(code: string): string {
  return code.toUpperCase();
}

/**
 * Format respondent code with label
 * @param code - Respondent pseudonym code
 * @returns Formatted string with label
 */
export function formatRespondentCodeWithLabel(code: string): string {
  return `Respondent ${formatRespondentCode(code)}`;
}

/**
 * Parse location JSON string to Location object
 * @param locationJson - JSON string from database
 * @returns Parsed location or null
 */
export function parseLocation(locationJson: string | null | undefined): ParsedLocation | null {
  if (!locationJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(locationJson);
    return {
      ...parsed,
      raw: locationJson,
    };
  } catch (error) {
    console.error('Failed to parse location JSON:', error);
    return null;
  }
}

/**
 * Serialize location object to JSON string for database
 * @param location - Location object
 * @returns JSON string
 */
export function serializeLocation(location: Location): string {
  return JSON.stringify(location);
}

/**
 * Format session status with color indicator
 * @param status - Session status
 * @returns Object with label and color class
 */
export function formatSessionStatus(status: 'open' | 'closed' | 'timeout'): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'open':
      return { label: 'Active', colorClass: 'text-green-600' };
    case 'closed':
      return { label: 'Closed', colorClass: 'text-gray-600' };
    case 'timeout':
      return { label: 'Timed Out', colorClass: 'text-orange-600' };
    default:
      return { label: status, colorClass: 'text-gray-600' };
  }
}

/**
 * Format response status with color indicator
 * @param status - Response status
 * @returns Object with label and color class
 */
export function formatResponseStatus(status: 'draft' | 'submitted' | 'voided'): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'draft':
      return { label: 'Draft', colorClass: 'text-yellow-600' };
    case 'submitted':
      return { label: 'Submitted', colorClass: 'text-green-600' };
    case 'voided':
      return { label: 'Voided', colorClass: 'text-red-600' };
    default:
      return { label: status, colorClass: 'text-gray-600' };
  }
}

/**
 * Format survey status with color indicator
 * @param status - Survey status
 * @returns Object with label and color class
 */
export function formatSurveyStatus(status: 'draft' | 'locked' | 'archived'): {
  label: string;
  colorClass: string;
} {
  switch (status) {
    case 'draft':
      return { label: 'Draft', colorClass: 'text-blue-600' };
    case 'locked':
      return { label: 'Locked', colorClass: 'text-green-600' };
    case 'archived':
      return { label: 'Archived', colorClass: 'text-gray-600' };
    default:
      return { label: status, colorClass: 'text-gray-600' };
  }
}

/**
 * Format user role for display
 * @param role - User role
 * @returns Formatted role string
 */
export function formatUserRole(role: 'admin' | 'enumerator'): string {
  return role === 'admin' ? 'Administrator' : 'Enumerator';
}

/**
 * Format age range for display
 * @param ageRange - Age range value
 * @returns Formatted age range string
 */
export function formatAgeRange(ageRange: string): string {
  return `${ageRange} years`;
}

/**
 * Format sex for display
 * @param sex - Sex value
 * @returns Formatted sex string
 */
export function formatSex(sex: 'M' | 'F' | 'Other'): string {
  switch (sex) {
    case 'M':
      return 'Male';
    case 'F':
      return 'Female';
    case 'Other':
      return 'Other';
    default:
      return sex;
  }
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format percentage
 * @param value - Decimal value (0-1)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
