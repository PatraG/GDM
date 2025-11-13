/**
 * Appwrite Configuration and Environment Validation
 * 
 * Validates required environment variables at application startup
 * and provides type-safe access to configuration values.
 * 
 * @module lib/appwrite/config
 */

/**
 * Required environment variables for Appwrite configuration
 */
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
] as const;

/**
 * Configuration object with validated environment variables
 */
export interface AppwriteConfig {
  /** Appwrite API endpoint URL */
  endpoint: string;
  
  /** Appwrite project ID */
  projectId: string;
  
  /** Server API key (only available server-side) */
  apiKey?: string;
}

/**
 * Validation error thrown when required environment variables are missing
 */
export class ConfigValidationError extends Error {
  constructor(missingVars: string[]) {
    super(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate that all required environment variables are present
 * @throws {ConfigValidationError} If any required variables are missing
 */
export function validateEnv(): void {
  const missingVars: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new ConfigValidationError(missingVars);
  }
}

/**
 * Get validated Appwrite configuration
 * @returns Validated configuration object
 * @throws {ConfigValidationError} If required variables are missing
 */
export function getConfig(): AppwriteConfig {
  validateEnv();

  return {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
    apiKey: process.env.APPWRITE_API_KEY,
  };
}

/**
 * Check if configuration is valid without throwing
 * @returns true if all required variables are present, false otherwise
 */
export function isConfigValid(): boolean {
  try {
    validateEnv();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get configuration with fallback for development
 * Returns undefined values if environment variables are missing (for testing)
 * @returns Configuration object (may contain undefined values)
 */
export function getConfigOrDefault(): AppwriteConfig {
  return {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    apiKey: process.env.APPWRITE_API_KEY,
  };
}
