/**
 * Appwrite Authentication Helpers
 * 
 * Provides authentication functionality using Appwrite Auth service
 * Supports email/password authentication, session management, and user retrieval
 * 
 * @module lib/appwrite/auth
 */

import { ID, Models } from 'appwrite';
import { getAccount, getClient, getDatabases } from './client';
import { COLLECTIONS, DATABASE_ID } from './constants';
import type { User, LoginCredentials, AuthSession } from '@/lib/types/auth';

/**
 * Login with email and password
 * Creates an Appwrite session and retrieves user data
 * 
 * @param credentials - Email and password
 * @returns User session data with role
 * @throws Error if login fails or user is inactive
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  try {
    const account = getAccount();
    
    // Delete any existing session first to prevent "session already exists" error
    try {
      await account.deleteSession('current');
    } catch (err) {
      // Ignore error if no session exists
    }
    
    // Create email session
    const session = await account.createEmailPasswordSession(
      credentials.email,
      credentials.password
    );
    
    // Get user data with role
    const user = await getUser();
    
    // Check if user is suspended (T051a)
    if (user.status === 'suspended') {
      await logout();
      throw new Error('Account is suspended. Please contact an administrator.');
    }
    
    return {
      session,
      user,
      isAuthenticated: true,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Login failed. Please check your credentials.');
  }
}

/**
 * Logout and delete current session
 * Clears the authentication state
 * 
 * @throws Error if logout fails
 */
export async function logout(): Promise<void> {
  try {
    const account = getAccount();
    await account.deleteSession('current');
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw - allow logout to complete even if session is already invalid
  }
}

/**
 * Get current Appwrite session
 * Returns null if no active session
 * 
 * @returns Current session or null
 */
export async function getSession(): Promise<Models.Session | null> {
  try {
    const account = getAccount();
    const session = await account.getSession('current');
    return session;
  } catch (error) {
    // No active session
    return null;
  }
}

/**
 * Get current authenticated user with role and status
 * Fetches user data from both Appwrite Auth and users collection
 * 
 * @returns User data with role
 * @throws Error if not authenticated or user data not found
 */
export async function getUser(): Promise<User> {
  try {
    const account = getAccount();
    const databases = getDatabases();
    
    // Get Appwrite account
    const appwriteAccount = await account.get();
    
    // Get user data from users collection
    const userDoc = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      appwriteAccount.$id
    );
    
    // Combine Appwrite account and user document data
    return {
      ...userDoc,
      userId: userDoc.userId as string,
      email: appwriteAccount.email,
      name: appwriteAccount.name,
      role: userDoc.role as 'admin' | 'enumerator',
      status: userDoc.status as 'active' | 'suspended',
      createdAt: userDoc.$createdAt,
      updatedAt: userDoc.$updatedAt,
    } as User;
  } catch (error) {
    console.error('Get user error:', error);
    throw new Error('Failed to retrieve user data');
  }
}

/**
 * Check if user is authenticated
 * Quick check without fetching full user data
 * 
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return session !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get user role
 * Helper to quickly determine user's role
 * 
 * @returns User role or null if not authenticated
 */
export async function getUserRole(): Promise<'admin' | 'enumerator' | null> {
  try {
    const user = await getUser();
    return user.role;
  } catch (error) {
    return null;
  }
}

/**
 * Check if current session is near expiration
 * Used for session timeout warnings (FR-015)
 * 
 * @param warningThresholdMs - Warning threshold in milliseconds (default: 15 minutes)
 * @returns True if session is near expiration
 */
export async function isSessionNearExpiration(
  warningThresholdMs: number = 15 * 60 * 1000
): Promise<boolean> {
  try {
    const session = await getSession();
    if (!session) return false;
    
    const expiresAt = new Date(session.expire).getTime();
    const now = Date.now();
    const timeRemaining = expiresAt - now;
    
    return timeRemaining > 0 && timeRemaining <= warningThresholdMs;
  } catch (error) {
    return false;
  }
}

/**
 * Extend current session
 * Refreshes the session to prevent timeout
 * 
 * @returns Updated session
 */
export async function extendSession(): Promise<Models.Session> {
  try {
    const account = getAccount();
    const session = await account.getSession('current');
    
    // Update session by calling updateSession
    const updatedSession = await account.updateSession(session.$id);
    
    return updatedSession;
  } catch (error) {
    console.error('Extend session error:', error);
    throw new Error('Failed to extend session');
  }
}
