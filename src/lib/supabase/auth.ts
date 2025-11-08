/**
 * Authentication utilities for Supabase server actions
 * Provides helper functions to reduce boilerplate code
 */

import type { User } from '@supabase/supabase-js';
import { createClient } from './server';
import { AUTH_MESSAGES } from '@/constants/validation';
import type { SupabaseActionError } from '@/types/errors';
import { createAuthError } from '@/types/errors';

// ============================================================================
// Authentication Result Types
// ============================================================================

/**
 * Result of authentication check
 */
export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: SupabaseActionError };

// ============================================================================
// Authentication Helper Functions
// ============================================================================

/**
 * Gets the authenticated user from Supabase session
 * Use this in all server actions to ensure user is authenticated
 *
 * This function:
 * 1. Creates a Supabase client
 * 2. Retrieves the current user from the session
 * 3. Returns user data or error
 *
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function addProduct(data: ProductFormData) {
 *   const authResult = await getAuthenticatedUser();
 *
 *   if (!authResult.success) {
 *     return authResult.error;
 *   }
 *
 *   const user = authResult.user;
 *   // Continue with action logic...
 * }
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: createAuthError(),
    };
  }

  return {
    success: true,
    user,
  };
}

/**
 * Type guard to check if auth result is successful
 *
 * @param result - Auth result to check
 * @returns true if authentication was successful
 *
 * @example
 * ```typescript
 * const authResult = await getAuthenticatedUser();
 *
 * if (!isAuthSuccess(authResult)) {
 *   return authResult.error;
 * }
 *
 * // TypeScript now knows authResult.user exists
 * const userId = authResult.user.id;
 * ```
 */
export function isAuthSuccess(result: AuthResult): result is { success: true; user: User } {
  return result.success === true;
}

/**
 * Gets authenticated user or returns early with error
 * Simplified version that directly returns User or null
 *
 * @returns User object if authenticated, null otherwise
 *
 * @example
 * ```typescript
 * export async function addProduct(data: ProductFormData) {
 *   const user = await requireAuth();
 *
 *   if (!user) {
 *     return { error: AUTH_MESSAGES.NOT_AUTHENTICATED };
 *   }
 *
 *   // Continue with action logic using user.id
 * }
 * ```
 */
export async function requireAuth(): Promise<User | null> {
  const result = await getAuthenticatedUser();

  if (!result.success) {
    return null;
  }

  return result.user;
}

/**
 * Gets the current user ID if authenticated
 *
 * @returns User ID string or null if not authenticated
 *
 * @example
 * ```typescript
 * const userId = await getCurrentUserId();
 * if (!userId) {
 *   return { error: 'Not authenticated' };
 * }
 * ```
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await requireAuth();
  return user?.id ?? null;
}

/**
 * Checks if a user is authenticated
 *
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await requireAuth();
  return user !== null;
}

// ============================================================================
// User Information Helpers
// ============================================================================

/**
 * Gets the current user's email
 *
 * @returns User email or null if not authenticated
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await requireAuth();
  return user?.email ?? null;
}

/**
 * Gets the current user's metadata
 *
 * @returns User metadata object or null if not authenticated
 */
export async function getCurrentUserMetadata(): Promise<Record<string, unknown> | null> {
  const user = await requireAuth();
  return user?.user_metadata ?? null;
}

/**
 * Gets the current user's full name from metadata
 *
 * @returns User's full name or null if not available
 */
export async function getCurrentUserName(): Promise<string | null> {
  const metadata = await getCurrentUserMetadata();
  return (metadata?.full_name as string) ?? null;
}
