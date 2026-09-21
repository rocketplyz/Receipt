import { supabase } from '../../lib/supabase';

/**
 * Returns the current user's household. Every user has exactly one
 * (auto-created on sign-up) until Phase 5 adds invites/sharing.
 */
export async function getCurrentHouseholdId(): Promise<string> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Not signed in');
  }

  const { data, error } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (error) {
    throw error;
  }
  return data.household_id;
}
