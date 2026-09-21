import * as Linking from 'expo-linking';

import { supabase } from './supabase';

export async function signInWithEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: Linking.createURL('/'),
    },
  });
  if (error) {
    throw error;
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Completes the magic-link sign-in when the app is opened via the deep
 * link Supabase redirects to. Supabase's client uses the PKCE flow, so
 * the link carries a `code` query param we exchange for a session; links
 * without one (e.g. the app's own scheme opened for other reasons) are
 * ignored.
 */
export async function handleAuthDeepLink(url: string): Promise<void> {
  const { queryParams } = Linking.parse(url);
  const code = queryParams?.code;
  if (typeof code !== 'string') {
    return;
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    throw error;
  }
}
