/**
 * Authentication Type Definitions
 * 
 * Types for user authentication, roles, and session management
 * Based on User / Appwrite Account entity from spec.md
 * 
 * @module lib/types/auth
 */

import { Models } from 'appwrite';
import { Role, UserStatus } from '@/lib/appwrite/constants';

/**
 * User document stored in the 'users' collection
 * Extends Appwrite Account with application-specific fields
 */
export interface User extends Models.Document {
  /** Appwrite Account ID */
  userId: string;
  
  /** User email address */
  email: string;
  
  /** User role (admin | enumerator) */
  role: Role;
  
  /** Account status (active | suspended) */
  status: UserStatus;
  
  /** Account creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Last successful login timestamp (optional) */
  lastLoginAt?: string;
}

/**
 * Authentication session information
 * Combines Appwrite session with user profile data
 */
export interface AuthSession {
  /** Appwrite session object */
  session: Models.Session;
  
  /** User profile from users collection */
  user: User;
  
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  /** User email address */
  email: string;
  
  /** User password */
  password: string;
}

/**
 * User creation data for new accounts
 */
export interface UserCreate {
  /** User email address */
  email: string;
  
  /** User password (min 8 characters with complexity) */
  password: string;
  
  /** User role (admin | enumerator) */
  role: Role;
  
  /** Account status (defaults to active) */
  status?: UserStatus;
}

/**
 * User update data
 */
export interface UserUpdate {
  /** Updated email address */
  email?: string;
  
  /** Updated role */
  role?: Role;
  
  /** Updated account status */
  status?: UserStatus;
  
  /** Last login timestamp */
  lastLoginAt?: string;
}

/**
 * Authentication state for React context
 */
export interface AuthState {
  /** Current user (null if not authenticated) */
  user: User | null;
  
  /** Current session (null if not authenticated) */
  session: Models.Session | null;
  
  /** Loading state during authentication checks */
  isLoading: boolean;
  
  /** Error message from authentication operations */
  error: string | null;
}

/**
 * Authentication context value
 */
export interface AuthContextValue extends AuthState {
  /** Login function */
  login: (credentials: LoginCredentials) => Promise<void>;
  
  /** Logout function */
  logout: () => Promise<void>;
  
  /** Refresh current session */
  refreshSession: () => Promise<void>;
  
  /** Check if user has specific role */
  hasRole: (role: Role) => boolean;
  
  /** Check if user is admin */
  isAdmin: boolean;
  
  /** Check if user is enumerator */
  isEnumerator: boolean;
}

/**
 * Password validation requirements
 */
export interface PasswordRequirements {
  /** Minimum length (8 characters) */
  minLength: number;
  
  /** Requires uppercase letter */
  requiresUppercase: boolean;
  
  /** Requires lowercase letter */
  requiresLowercase: boolean;
  
  /** Requires number */
  requiresNumber: boolean;
  
  /** Requires special character */
  requiresSpecial: boolean;
}

/**
 * Default password requirements per FR-003
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
  requiresSpecial: false, // Not explicitly required in spec
};
