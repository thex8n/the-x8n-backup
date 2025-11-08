'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AUTH_MESSAGES } from '@/constants/validation'

/**
 * Helper to get the origin URL from request headers
 * Handles special case for 0.0.0.0 host by using environment variable
 */
async function getOriginUrl() {
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'http'

  // Si el host es 0.0.0.0, usar la variable de entorno
  if (host?.includes('0.0.0.0')) {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }

  return `${protocol}://${host}`
}

/**
 * Initiates Google OAuth sign-in flow
 * Redirects to Google for authentication
 */
export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = await getOriginUrl()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=auth_error')
  }

  redirect(data.url)
}

/**
 * Signs in a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns Error message if authentication fails
 */
export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: AUTH_MESSAGES.INVALID_CREDENTIALS }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Creates a new user account with email and password
 * @param email - User's email address
 * @param password - User's password
 * @param fullName - User's full name
 * @returns Error message if signup fails
 */
export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: 'Error al crear la cuenta. El email podría estar en uso.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Signs out the current user
 * Clears session and redirects to login page
 */
export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

/**
 * Gets the currently authenticated user
 * @returns User object or null if not authenticated
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}