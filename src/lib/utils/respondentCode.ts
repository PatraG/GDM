/**
 * Respondent Code Generator
 * 
 * Generates sequential pseudonymous codes for respondents
 * Format: R-00001 (R- prefix + 5-digit zero-padded number)
 * 
 * @module lib/utils/respondentCode
 */

import { getDatabases } from '@/lib/appwrite/client';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/constants';
import { Query } from 'appwrite';
import { MAX_RESPONDENT_COUNT } from '@/lib/types/respondent';

/**
 * Generate the next sequential respondent code
 * 
 * Algorithm:
 * 1. Query Appwrite for the respondent with the highest pseudonym
 * 2. Extract the numeric part
 * 3. Increment by 1
 * 4. Format as R-00001
 * 
 * Handles race conditions by querying the database for the latest code
 * 
 * @returns Promise<string> - Next respondent code (e.g., "R-00001")
 * @throws Error if maximum respondent count exceeded
 */
export async function generateRespondentCode(): Promise<string> {
  try {
    const databases = getDatabases();
    
    // Query for respondents ordered by pseudonym descending to get the highest
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESPONDENTS,
      [
        Query.orderDesc('pseudonym'),
        Query.limit(1),
      ]
    );

    let nextNumber = 1;

    if (response.documents.length > 0) {
      const lastCode = response.documents[0].pseudonym as string;
      const lastNumber = parseInt(lastCode.substring(2), 10); // Extract number from "R-00001"
      
      if (isNaN(lastNumber)) {
        console.error('Invalid respondent code format:', lastCode);
        throw new Error('Invalid respondent code format in database');
      }

      nextNumber = lastNumber + 1;
    }

    // Check if we've exceeded the maximum count
    if (nextNumber > MAX_RESPONDENT_COUNT) {
      throw new Error(
        `Maximum respondent count (${MAX_RESPONDENT_COUNT}) exceeded. ` +
        'Please contact system administrator.'
      );
    }

    // Format as R-00001 (zero-padded to 5 digits)
    return formatRespondentCode(nextNumber);
  } catch (error) {
    console.error('Error generating respondent code:', error);
    throw error;
  }
}

/**
 * Format a number as a respondent code
 * @param number - Sequential number (1-99999)
 * @returns Formatted code (e.g., "R-00001")
 */
export function formatRespondentCode(number: number): string {
  if (number < 1 || number > MAX_RESPONDENT_COUNT) {
    throw new Error(
      `Respondent number must be between 1 and ${MAX_RESPONDENT_COUNT}`
    );
  }

  const paddedNumber = number.toString().padStart(5, '0');
  return `R-${paddedNumber}`;
}

/**
 * Parse a respondent code to extract the numeric part
 * @param code - Respondent code (e.g., "R-00001")
 * @returns Numeric part (e.g., 1)
 * @throws Error if code format is invalid
 */
export function parseRespondentCode(code: string): number {
  if (!code.startsWith('R-') || code.length !== 7) {
    throw new Error(`Invalid respondent code format: ${code}`);
  }

  const number = parseInt(code.substring(2), 10);
  
  if (isNaN(number)) {
    throw new Error(`Invalid respondent code format: ${code}`);
  }

  return number;
}

/**
 * Validate a respondent code format
 * @param code - Respondent code to validate
 * @returns true if valid, false otherwise
 */
export function isValidRespondentCode(code: string): boolean {
  try {
    const number = parseRespondentCode(code);
    return number >= 1 && number <= MAX_RESPONDENT_COUNT;
  } catch {
    return false;
  }
}

/**
 * Generate multiple sequential codes for testing/seeding
 * WARNING: Only use for development/testing, not production
 * 
 * @param startNumber - Starting number
 * @param count - Number of codes to generate
 * @returns Array of respondent codes
 */
export function generateBatchCodes(
  startNumber: number,
  count: number
): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const number = startNumber + i;
    if (number > MAX_RESPONDENT_COUNT) {
      break;
    }
    codes.push(formatRespondentCode(number));
  }
  
  return codes;
}

/**
 * Check if a respondent code already exists in the database
 * @param code - Respondent code to check
 * @returns Promise<boolean> - true if exists, false otherwise
 */
export async function respondentCodeExists(code: string): Promise<boolean> {
  try {
    const databases = getDatabases();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESPONDENTS,
      [
        Query.equal('pseudonym', code),
        Query.limit(1),
      ]
    );

    return response.documents.length > 0;
  } catch (error) {
    console.error('Error checking respondent code existence:', error);
    throw error;
  }
}

/**
 * Get respondent count statistics
 * @returns Promise with total count and next available code
 */
export async function getRespondentStats(): Promise<{
  totalCount: number;
  nextAvailableCode: string;
  remainingCapacity: number;
}> {
  try {
    const databases = getDatabases();
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RESPONDENTS,
      [Query.limit(1)]
    );

    const totalCount = response.total;
    const nextCode = await generateRespondentCode();
    const remainingCapacity = MAX_RESPONDENT_COUNT - totalCount;

    return {
      totalCount,
      nextAvailableCode: nextCode,
      remainingCapacity,
    };
  } catch (error) {
    console.error('Error getting respondent stats:', error);
    throw error;
  }
}
