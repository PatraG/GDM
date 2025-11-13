/**
 * User Service
 * 
 * Business logic for user/enumerator management
 * Handles creation, listing, status updates
 * 
 * @module lib/services/userService
 */

import { ID, Models } from 'appwrite';
import { getAccount, getClient } from '@/lib/appwrite/client';
import { COLLECTIONS, DATABASE_ID, USER_STATUS } from '@/lib/appwrite/constants';
import {
  listDocuments,
  createDocument,
  updateDocument,
  getDocument,
  QueryBuilder,
} from '@/lib/appwrite/databases';
import type { User, UserCreate, UserUpdate } from '@/lib/types/auth';

/**
 * Create a new enumerator account
 * Creates both Appwrite Auth account and users collection document
 * This function must be called from a server-side API route
 * 
 * @param userData - User creation data
 * @returns Created user document
 */
export async function createEnumerator(userData: UserCreate): Promise<User> {
  try {
    // Import server-side Appwrite SDK
    const { Client, Users, Databases } = await import('node-appwrite');
    
    // Create server client with API key
    const serverClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    
    const users = new Users(serverClient);
    const databases = new Databases(serverClient);
    
    // Create Appwrite Auth account
    const accountId = ID.unique();
    const appwriteUser = await users.create(
      accountId,
      userData.email,
      undefined, // phone (not used)
      userData.password,
      userData.email.split('@')[0] // name from email
    );
    
    // Create user document in users collection
    const userDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      accountId, // Use same ID for both Auth and document
      {
        userId: appwriteUser.$id,
        email: userData.email,
        name: appwriteUser.name,
        role: userData.role,
        status: userData.status || USER_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
    
    return userDoc as unknown as User;
  } catch (error) {
    console.error('Create enumerator error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create enumerator account'
    );
  }
}

/**
 * List all enumerators
 * Optionally filter by status
 * 
 * @param status - Filter by status (optional)
 * @param limit - Maximum results
 * @param offset - Pagination offset
 * @returns List of enumerator users
 */
export async function listEnumerators(
  status?: 'active' | 'suspended',
  limit: number = 100,
  offset: number = 0
): Promise<Models.DocumentList<User>> {
  try {
    const queries = [
      QueryBuilder.equal('role', 'enumerator'),
      QueryBuilder.orderDesc('$createdAt'),
      QueryBuilder.limit(limit),
      QueryBuilder.offset(offset),
    ];
    
    if (status) {
      queries.push(QueryBuilder.equal('status', status));
    }
    
    return await listDocuments<User>(COLLECTIONS.USERS, queries);
  } catch (error) {
    console.error('List enumerators error:', error);
    throw new Error('Failed to list enumerators');
  }
}

/**
 * Get enumerator by ID
 * 
 * @param userId - User document ID
 * @returns User document
 */
export async function getEnumerator(userId: string): Promise<User> {
  try {
    return await getDocument<User>(COLLECTIONS.USERS, userId);
  } catch (error) {
    console.error('Get enumerator error:', error);
    throw new Error('Failed to get enumerator details');
  }
}

/**
 * Update enumerator status
 * 
 * @param userId - User document ID
 * @param status - New status
 * @returns Updated user document
 */
export async function updateEnumeratorStatus(
  userId: string,
  status: 'active' | 'suspended'
): Promise<User> {
  try {
    return await updateDocument<User>(COLLECTIONS.USERS, userId, {
      status,
      updatedAt: new Date().toISOString(),
    } as Partial<Omit<User, keyof Models.Document>>);
  } catch (error) {
    console.error('Update enumerator status error:', error);
    throw new Error('Failed to update enumerator status');
  }
}

/**
 * Update enumerator details
 * 
 * @param userId - User document ID
 * @param updates - Fields to update
 * @returns Updated user document
 */
export async function updateEnumerator(
  userId: string,
  updates: UserUpdate
): Promise<User> {
  try {
    return await updateDocument<User>(COLLECTIONS.USERS, userId, {
      ...updates,
      updatedAt: new Date().toISOString(),
    } as Partial<Omit<User, keyof Models.Document>>);
  } catch (error) {
    console.error('Update enumerator error:', error);
    throw new Error('Failed to update enumerator');
  }
}

/**
 * Check if enumerator has active sessions
 * Used before suspension to warn about active work
 * 
 * @param userId - User document ID (enumerator)
 * @returns True if has active sessions
 */
export async function hasActiveSessions(userId: string): Promise<boolean> {
  try {
    const sessions = await listDocuments(COLLECTIONS.SESSIONS, [
      QueryBuilder.equal('enumeratorId', userId),
      QueryBuilder.equal('status', 'active'),
      QueryBuilder.limit(1),
    ]);
    
    return sessions.total > 0;
  } catch (error) {
    console.error('Check active sessions error:', error);
    // Default to false to allow suspension
    return false;
  }
}

/**
 * Get enumerator statistics
 * Returns counts of total enumerators by status
 * 
 * @returns Statistics object
 */
export async function getEnumeratorStats(): Promise<{
  total: number;
  active: number;
  suspended: number;
}> {
  try {
    const [all, active, suspended] = await Promise.all([
      listDocuments<User>(COLLECTIONS.USERS, [
        QueryBuilder.equal('role', 'enumerator'),
        QueryBuilder.limit(1),
      ]),
      listDocuments<User>(COLLECTIONS.USERS, [
        QueryBuilder.equal('role', 'enumerator'),
        QueryBuilder.equal('status', USER_STATUS.ACTIVE),
        QueryBuilder.limit(1),
      ]),
      listDocuments<User>(COLLECTIONS.USERS, [
        QueryBuilder.equal('role', 'enumerator'),
        QueryBuilder.equal('status', USER_STATUS.SUSPENDED),
        QueryBuilder.limit(1),
      ]),
    ]);
    
    return {
      total: all.total,
      active: active.total,
      suspended: suspended.total,
    };
  } catch (error) {
    console.error('Get enumerator stats error:', error);
    return { total: 0, active: 0, suspended: 0 };
  }
}
