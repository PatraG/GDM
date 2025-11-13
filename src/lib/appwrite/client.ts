/**
 * Appwrite Client Initialization
 * 
 * Provides singleton client instances for Appwrite SDK:
 * - Client: For client-side operations (browser)
 * - Account: For authentication operations
 * - Databases: For database CRUD operations
 * 
 * @module lib/appwrite/client
 */

import { Client, Account, Databases } from 'appwrite';

/**
 * Singleton Appwrite client instance
 * Configured with endpoint and project from environment variables
 */
let client: Client | null = null;

/**
 * Get or create the Appwrite client instance
 * @returns Configured Appwrite Client
 */
export function getClient(): Client {
  if (!client) {
    client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
  }
  return client;
}

/**
 * Get Appwrite Account service instance
 * Used for authentication operations (login, logout, session management)
 * @returns Appwrite Account instance
 */
export function getAccount(): Account {
  return new Account(getClient());
}

/**
 * Get Appwrite Databases service instance
 * Used for CRUD operations on collections
 * @returns Appwrite Databases instance
 */
export function getDatabases(): Databases {
  return new Databases(getClient());
}

/**
 * Reset client instance (useful for testing)
 * @internal
 */
export function resetClient(): void {
  client = null;
}
