'use server';

import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

/**
 * Server action to save user data to Supabase
 * This is a more reliable way to sync data vs. client-side code
 */
export async function syncUserToSupabase(formData) {
  try {
    // Get the current authenticated user from Clerk
    const { userId } = auth();
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Parse form data
    const userData = Object.fromEntries(formData.entries());
    console.log('Server Action: Received user data', userData);
    
    // Initialize Supabase admin client
    const supabase = createClient();
    
    // Insert or update the user in the Supabase users table
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userData.email,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        username: userData.username || userData.email.split('@')[0],
        avatar_url: userData.avatarUrl || '',
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Server Action: Error saving user to Supabase:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Server Action: User successfully saved to Supabase');
    return { success: true };
  } catch (error) {
    console.error('Server Action: Unexpected error:', error);
    return { success: false, error: error.message };
  }
}
