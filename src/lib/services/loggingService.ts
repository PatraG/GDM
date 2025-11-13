/**
 * Logging Service
 * 
 * Centralized logging service for the application
 * Supports multiple log levels and optional cloud integration
 * 
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Structured logging with metadata
 * - Environment-based log filtering
 * - Optional cloud logging integration
 * 
 * @module lib/services/loggingService
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  error?: Error;
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get minimum log level from environment
 * Defaults to 'info' in production, 'debug' in development
 */
function getMinLogLevel(): LogLevel {
  const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel;
  }
  
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

const MIN_LOG_LEVEL = getMinLogLevel();

/**
 * Check if a log level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL];
}

/**
 * Format log entry for console output
 */
function formatConsoleLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
  return `${prefix} ${entry.message}${metadata}`;
}

/**
 * Send log to cloud service (if configured)
 * Currently a placeholder - can be extended with Sentry, LogRocket, etc.
 */
async function sendToCloudLogger(entry: LogEntry): Promise<void> {
  // TODO: Implement cloud logging integration
  // Example: Send to Sentry, LogRocket, or custom logging service
  
  // For now, only log errors to cloud in production
  if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
    // Placeholder for future implementation
    // await sendToSentry(entry);
  }
}

/**
 * Core logging function
 */
function log(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: Error
): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    metadata,
    error,
  };

  // Console logging
  const formattedMessage = formatConsoleLog(entry);
  
  switch (level) {
    case 'debug':
      console.debug(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      if (entry.error) console.warn(entry.error);
      break;
    case 'error':
      console.error(formattedMessage);
      if (entry.error) console.error(entry.error);
      break;
  }

  // Cloud logging (async, fire-and-forget)
  sendToCloudLogger(entry).catch((err) => {
    console.error('Failed to send log to cloud service:', err);
  });
}

/**
 * Public logging API
 */
export const logger = {
  /**
   * Log debug messages (development only)
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    log('debug', message, metadata);
  },

  /**
   * Log informational messages
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    log('info', message, metadata);
  },

  /**
   * Log warning messages
   */
  warn(message: string, metadata?: Record<string, unknown>, error?: Error): void {
    log('warn', message, metadata, error);
  },

  /**
   * Log error messages
   */
  error(message: string, metadata?: Record<string, unknown>, error?: Error): void {
    log('error', message, metadata, error);
  },

  /**
   * Log authentication attempts
   */
  auth: {
    loginSuccess(userId: string, email: string): void {
      log('info', 'Login successful', {
        userId,
        email,
        timestamp: new Date().toISOString(),
      });
    },

    loginFailure(email: string, reason: string): void {
      log('warn', 'Login failed', {
        email,
        reason,
        timestamp: new Date().toISOString(),
      });
    },

    logout(userId: string, email: string): void {
      log('info', 'Logout', {
        userId,
        email,
        timestamp: new Date().toISOString(),
      });
    },
  },

  /**
   * Log survey submission events
   */
  survey: {
    submitted(
      responseId: string,
      surveyId: string,
      enumeratorId: string,
      metadata?: {
        respondentId?: string;
        sessionId?: string;
        gpsLatitude?: number;
        gpsLongitude?: number;
      }
    ): void {
      log('info', 'Survey submitted', {
        responseId,
        surveyId,
        enumeratorId,
        timestamp: new Date().toISOString(),
        ...metadata,
      });
    },

    draftSaved(
      responseId: string,
      surveyId: string,
      enumeratorId: string
    ): void {
      log('debug', 'Survey draft saved', {
        responseId,
        surveyId,
        enumeratorId,
        timestamp: new Date().toISOString(),
      });
    },

    voided(
      responseId: string,
      voidedBy: string,
      reason: string
    ): void {
      log('warn', 'Survey response voided', {
        responseId,
        voidedBy,
        reason,
        timestamp: new Date().toISOString(),
      });
    },
  },

  /**
   * Log session events
   */
  session: {
    created(
      sessionId: string,
      enumeratorId: string,
      respondentId: string
    ): void {
      log('info', 'Session created', {
        sessionId,
        enumeratorId,
        respondentId,
        timestamp: new Date().toISOString(),
      });
    },

    closed(
      sessionId: string,
      reason: 'manual' | 'timeout' | 'auto',
      duration?: number
    ): void {
      log('info', 'Session closed', {
        sessionId,
        reason,
        duration,
        timestamp: new Date().toISOString(),
      });
    },
  },

  /**
   * Log API errors
   */
  api: {
    error(
      endpoint: string,
      method: string,
      statusCode: number,
      error: Error
    ): void {
      log('error', 'API request failed', {
        endpoint,
        method,
        statusCode,
        timestamp: new Date().toISOString(),
      }, error);
    },

    retry(
      endpoint: string,
      attempt: number,
      maxAttempts: number
    ): void {
      log('warn', 'API request retry', {
        endpoint,
        attempt,
        maxAttempts,
        timestamp: new Date().toISOString(),
      });
    },
  },
};

/**
 * Example usage:
 * 
 * // Basic logging
 * logger.info('User logged in');
 * logger.error('Failed to save data', { userId: '123' }, error);
 * 
 * // Authentication logging
 * logger.auth.loginSuccess(userId, email);
 * logger.auth.loginFailure(email, 'Invalid password');
 * 
 * // Survey logging
 * logger.survey.submitted(responseId, surveyId, enumeratorId, {
 *   respondentId,
 *   sessionId,
 *   gpsLatitude: 123.456,
 *   gpsLongitude: 789.012,
 * });
 * 
 * // Session logging
 * logger.session.created(sessionId, enumeratorId, respondentId);
 * logger.session.closed(sessionId, 'manual', 3600);
 */
