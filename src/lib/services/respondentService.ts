/**
 * Respondent Service
 * Business logic for managing respondents in the field survey workflow
 *
 * Responsibilities:
 * - Create new respondents with demographic data
 * - List respondents for an enumerator
 * - Search respondents by code or demographics
 * - Validate respondent data (name-pattern blocking, consent requirement)
 */

import {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
} from '@/lib/appwrite/databases';
import { COLLECTIONS } from '@/lib/appwrite/constants';
import type {
  Respondent,
  RespondentCreate,
  RespondentSearch,
} from '@/lib/types/respondent';
import { generateRespondentCode } from '@/lib/utils/respondentCode';
import { Query } from 'appwrite';

/**
 * Name-pattern validation
 * Detect capitalized words that look like names (e.g., "John", "Mary")
 * Block common name patterns to enforce anonymity (FR-058a)
 */
const NAME_PATTERN_REGEX = /^[A-Z][a-z]+$/; // Simple capitalized word pattern
const COMMON_NAME_WORDS = [
  'john',
  'mary',
  'jose',
  'maria',
  'pedro',
  'juan',
  'ana',
  'carlos',
  'luis',
  'david',
  'michael',
  'sarah',
  'emma',
  'olivia',
  'sophia',
  'isabella',
  'mia',
  'charlotte',
  'amelia',
  'harper',
];

/**
 * Check if a value matches name-like patterns
 */
function containsNamePattern(value: string): boolean {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();

  // Check for capitalized word pattern
  if (NAME_PATTERN_REGEX.test(trimmed)) {
    return true;
  }

  // Check against common name dictionary (case-insensitive)
  const lowerValue = trimmed.toLowerCase();
  if (COMMON_NAME_WORDS.includes(lowerValue)) {
    return true;
  }

  // Check for multiple capitalized words (full names)
  const words = trimmed.split(/\s+/);
  if (words.length >= 2 && words.every((w) => NAME_PATTERN_REGEX.test(w))) {
    return true;
  }

  return false;
}

/**
 * Validate respondent input data
 * Throws error if validation fails
 */
function validateRespondentInput(input: RespondentCreate): void {
  // Check consent requirement
  if (!input.consentGiven) {
    throw new Error('Consent must be given before creating a respondent');
  }

  // Check for name-like patterns in demographics (FR-058a)
  // Note: RespondentCreate only has ageRange, sex, adminArea fields
  // Additional demographic fields would be checked here if they existed
  const fieldsToCheck = [
    { field: 'adminArea', value: input.adminArea },
  ];

  for (const { field, value } of fieldsToCheck) {
    if (value && containsNamePattern(value)) {
      throw new Error(
        `The ${field} field appears to contain a name. Please use anonymous descriptors only.`
      );
    }
  }
}

/**
 * Create a new respondent
 * Generates unique respondent code, validates input, saves to database
 */
export async function createRespondent(
  input: RespondentCreate
): Promise<Respondent> {
  // Validate input
  validateRespondentInput(input);

  // Generate unique respondent code
  const pseudonym = await generateRespondentCode();

  // Prepare document data
  const now = new Date().toISOString();
  const documentData = {
    pseudonym,
    enumeratorId: input.enumeratorId,
    adminArea: input.adminArea,
    ageRange: input.ageRange,
    sex: input.sex,
    consentGiven: input.consentGiven,
    consentTimestamp: now,
    createdAt: now,
  };

  // Create document in database
  const document = await createDocument(
    COLLECTIONS.RESPONDENTS,
    documentData
  );

  return document as Respondent;
}

/**
 * List respondents for an enumerator
 * Optionally filter by admin area
 */
export async function listRespondents(
  enumeratorId: string,
  adminArea?: string,
  limit = 50,
  offset = 0
): Promise<{ respondents: Respondent[]; total: number }> {
  const queries = [
    Query.equal('enumeratorId', enumeratorId),
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  // Add adminArea filter if provided
  if (adminArea) {
    queries.push(Query.equal('adminArea', adminArea));
  }

  const result = await listDocuments(COLLECTIONS.RESPONDENTS, queries);

  return {
    respondents: result.documents as Respondent[],
    total: result.total,
  };
}

/**
 * Get a single respondent by ID
 */
export async function getRespondent(
  respondentId: string
): Promise<Respondent> {
  const document = await getDocument(COLLECTIONS.RESPONDENTS, respondentId);
  return document as Respondent;
}

/**
 * Search respondents by code or demographics
 * Implements flexible search across multiple fields
 */
export async function searchRespondents(
  enumeratorId: string,
  params: RespondentSearch
): Promise<{ respondents: Respondent[]; total: number }> {
  const queries = [Query.equal('enumeratorId', enumeratorId)];

  // Search by respondent code (exact match)
  if (params.pseudonym) {
    queries.push(Query.equal('pseudonym', params.pseudonym));
  }

  // Filter by admin area
  if (params.adminArea) {
    queries.push(Query.equal('adminArea', params.adminArea));
  }

  // Filter by age range
  if (params.ageRange) {
    queries.push(Query.equal('ageRange', params.ageRange));
  }

  // Filter by sex
  if (params.sex) {
    queries.push(Query.equal('sex', params.sex));
  }

  // Add pagination
  queries.push(Query.orderDesc('$createdAt'));
  queries.push(Query.limit(params.limit || 50));
  queries.push(Query.offset(params.offset || 0));

  const result = await listDocuments(COLLECTIONS.RESPONDENTS, queries);

  return {
    respondents: result.documents as Respondent[],
    total: result.total,
  };
}

/**
 * Get respondent statistics for an enumerator
 * Returns counts by demographics
 */
export async function getRespondentStats(enumeratorId: string): Promise<{
  total: number;
  byAdminArea: Record<string, number>;
  bySex: Record<string, number>;
  byAgeRange: Record<string, number>;
}> {
  // Get all respondents for this enumerator
  const { respondents } = await listRespondents(enumeratorId, undefined, 1000);

  // Aggregate statistics
  const stats = {
    total: respondents.length,
    byAdminArea: {} as Record<string, number>,
    bySex: {} as Record<string, number>,
    byAgeRange: {} as Record<string, number>,
  };

  respondents.forEach((r) => {
    // Count by admin area
    stats.byAdminArea[r.adminArea] = (stats.byAdminArea[r.adminArea] || 0) + 1;

    // Count by sex
    stats.bySex[r.sex] = (stats.bySex[r.sex] || 0) + 1;

    // Count by age range
    stats.byAgeRange[r.ageRange] = (stats.byAgeRange[r.ageRange] || 0) + 1;
  });

  return stats;
}
