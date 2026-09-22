import { supabase } from './supabase';

/** Sends a one-time sign-in code to the given email address. */
export async function sendSignInCode(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    throw error;
  }
}

/** Verifies the code emailed by {@link sendSignInCode}, completing sign-in. */
export async function verifySignInCode(email: string, code: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
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
