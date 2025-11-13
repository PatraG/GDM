/**
 * Appwrite Database Helpers
 * 
 * CRUD wrapper functions for Appwrite database operations
 * Provides type-safe database access with error handling
 * 
 * @module lib/appwrite/databases
 */

import { ID, Query, Models } from 'appwrite';
import { getDatabases } from './client';
import { DATABASE_ID } from './constants';

/**
 * List documents with optional queries
 */
export async function listDocuments<T extends Models.Document>(
  collectionId: string,
  queries: string[] = []
): Promise<Models.DocumentList<T>> {
  try {
    const databases = getDatabases();
    return await databases.listDocuments<T>(DATABASE_ID, collectionId, queries);
  } catch (error) {
    console.error('List documents error:', error);
    throw new Error(`Failed to list documents from ${collectionId}`);
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument<T extends Models.Document>(
  collectionId: string,
  documentId: string
): Promise<T> {
  try {
    const databases = getDatabases();
    return await databases.getDocument<T>(DATABASE_ID, collectionId, documentId);
  } catch (error) {
    console.error('Get document error:', error);
    throw new Error(`Failed to get document ${documentId} from ${collectionId}`);
  }
}

/**
 * Create a new document
 */
export async function createDocument<T extends Models.Document>(
  collectionId: string,
  data: Omit<T, keyof Models.Document>,
  documentId: string = ID.unique(),
  permissions?: string[]
): Promise<T> {
  try {
    const databases = getDatabases();
    return await databases.createDocument<T>(
      DATABASE_ID,
      collectionId,
      documentId,
      data,
      permissions
    );
  } catch (error) {
    console.error('Create document error:', error);
    throw new Error(`Failed to create document in ${collectionId}`);
  }
}

/**
 * Update an existing document
 */
export async function updateDocument<T extends Models.Document>(
  collectionId: string,
  documentId: string,
  data: Partial<Omit<T, keyof Models.Document>>,
  permissions?: string[]
): Promise<T> {
  try {
    const databases = getDatabases();
    return await databases.updateDocument<T>(
      DATABASE_ID,
      collectionId,
      documentId,
      data,
      permissions
    );
  } catch (error) {
    console.error('Update document error:', error);
    throw new Error(`Failed to update document ${documentId} in ${collectionId}`);
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  collectionId: string,
  documentId: string
): Promise<void> {
  try {
    const databases = getDatabases();
    await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
  } catch (error) {
    console.error('Delete document error:', error);
    throw new Error(`Failed to delete document ${documentId} from ${collectionId}`);
  }
}

/**
 * Query builder helper
 */
export const QueryBuilder = {
  /**
   * Equal to
   */
  equal: (attribute: string, value: string | number | boolean) =>
    Query.equal(attribute, value),

  /**
   * Not equal to
   */
  notEqual: (attribute: string, value: string | number | boolean) =>
    Query.notEqual(attribute, value),

  /**
   * Less than
   */
  lessThan: (attribute: string, value: string | number) =>
    Query.lessThan(attribute, value),

  /**
   * Greater than
   */
  greaterThan: (attribute: string, value: string | number) =>
    Query.greaterThan(attribute, value),

  /**
   * Search (contains)
   */
  search: (attribute: string, value: string) =>
    Query.search(attribute, value),

  /**
   * Order by ascending
   */
  orderAsc: (attribute: string) => Query.orderAsc(attribute),

  /**
   * Order by descending
   */
  orderDesc: (attribute: string) => Query.orderDesc(attribute),

  /**
   * Limit results
   */
  limit: (limit: number) => Query.limit(limit),

  /**
   * Offset results
   */
  offset: (offset: number) => Query.offset(offset),

  /**
   * Cursor pagination
   */
  cursorAfter: (documentId: string) => Query.cursorAfter(documentId),

  /**
   * Cursor pagination (before)
   */
  cursorBefore: (documentId: string) => Query.cursorBefore(documentId),
};
