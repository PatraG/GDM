/**
 * Export Service
 * Functions for exporting submission data to CSV and JSON formats
 *
 * Responsibilities:
 * - Export responses to CSV format (T118)
 * - Export responses to JSON format (T119)
 * - Respect applied filters from dashboard (T121)
 * - Format data for download
 */

import { Response, ResponseWithDetails } from '@/lib/types/response';
import { formatDate, formatGPSCoordinates } from '@/lib/utils/formatters';

/**
 * Export format types
 */
export type ExportFormat = 'csv' | 'json';

/**
 * Export options for data filtering
 */
export interface ExportOptions {
  /** Date range start (ISO string) */
  dateFrom?: string;
  
  /** Date range end (ISO string) */
  dateTo?: string;
  
  /** Filter by enumerator ID */
  enumeratorId?: string;
  
  /** Filter by survey ID */
  surveyId?: string;
  
  /** Include voided responses */
  includeVoided?: boolean;
}

/**
 * Convert responses to CSV format
 * 
 * @param responses Array of response records with details
 * @returns CSV string ready for download
 */
export function exportToCSV(responses: ResponseWithDetails[]): string {
  if (responses.length === 0) {
    return 'No data to export';
  }

  // CSV Headers
  const headers = [
    'Response ID',
    'Respondent',
    'Enumerator',
    'Survey',
    'Survey Version',
    'Status',
    'Submitted At',
    'GPS Latitude',
    'GPS Longitude',
    'GPS Accuracy (m)',
    'Voided By',
    'Void Reason',
  ];

  // Build CSV rows
  const rows = responses.map((response) => {
    const location = response.parsedLocation;
    
    return [
      response.$id,
      response.respondentPseudonym,
      response.enumeratorEmail,
      response.surveyTitle,
      response.surveyVersion,
      response.status,
      response.submittedAt ? formatDate(response.submittedAt) : '',
      location?.latitude?.toFixed(6) || '',
      location?.longitude?.toFixed(6) || '',
      location?.accuracy?.toFixed(2) || '',
      response.voidedBy || '',
      response.voidReason || '',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
}

/**
 * Convert responses to JSON format
 * 
 * @param responses Array of response records with details
 * @returns JSON string ready for download
 */
export function exportToJSON(responses: ResponseWithDetails[]): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalRecords: responses.length,
    data: responses.map((response) => ({
      responseId: response.$id,
      respondent: {
        id: response.respondentId,
        pseudonym: response.respondentPseudonym,
      },
      enumerator: {
        id: response.sessionId, // Assuming enumerator info is in session
        email: response.enumeratorEmail,
      },
      survey: {
        id: response.surveyId,
        title: response.surveyTitle,
        version: response.surveyVersion,
      },
      status: response.status,
      submittedAt: response.submittedAt || null,
      location: response.parsedLocation
        ? {
            latitude: response.parsedLocation.latitude,
            longitude: response.parsedLocation.longitude,
            accuracy: response.parsedLocation.accuracy,
            capturedAt: response.parsedLocation.capturedAt,
          }
        : null,
      voidInfo:
        response.status === 'voided'
          ? {
              voidedBy: response.voidedBy,
              voidReason: response.voidReason,
            }
          : null,
      timestamps: {
        created: response.createdAt,
        updated: response.updatedAt,
      },
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Trigger browser download of exported data
 * 
 * @param content File content (CSV or JSON string)
 * @param filename Downloaded file name
 * @param mimeType MIME type for the download
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 * 
 * @param format Export format (csv or json)
 * @returns Filename with timestamp
 */
export function generateFilename(format: ExportFormat): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19); // Remove milliseconds and timezone
  
  return `survey-submissions-${timestamp}.${format}`;
}

/**
 * Export responses with automatic download
 * Main entry point for export functionality
 * 
 * @param responses Array of response records with details
 * @param format Export format (csv or json)
 */
export function exportResponses(
  responses: ResponseWithDetails[],
  format: ExportFormat
): void {
  let content: string;
  let mimeType: string;

  if (format === 'csv') {
    content = exportToCSV(responses);
    mimeType = 'text/csv;charset=utf-8;';
  } else {
    content = exportToJSON(responses);
    mimeType = 'application/json;charset=utf-8;';
  }

  const filename = generateFilename(format);
  downloadFile(content, filename, mimeType);
}

/**
 * Get export summary message
 * 
 * @param count Number of records exported
 * @param format Export format
 * @returns User-friendly summary message
 */
export function getExportSummary(
  count: number,
  format: ExportFormat
): string {
  const formatName = format.toUpperCase();
  
  if (count === 0) {
    return `No data to export`;
  }
  
  if (count === 1) {
    return `1 submission exported to ${formatName}`;
  }
  
  return `${count} submissions exported to ${formatName}`;
}
