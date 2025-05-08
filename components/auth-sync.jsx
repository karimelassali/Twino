'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

/**
 * This component syncs Clerk user data with Supabase
 * It runs whenever the authentication state changes
 */
export function AuthSync() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // Only run if Clerk has loaded and user is signed in
    if (!isLoaded || !userId || !user) return;

    async function syncUserToSupabase() {
      try {
        // Initialize Supabase client
        const supabase = createClient();

        // Get user data from Clerk
        const primaryEmail = user.emailAddresses.find(
          email => email.id === user.primaryEmailAddressId
        )?.emailAddress;

        // Get JWT for potential future use (optional)
        const token = await getToken({ template: 'supabase' });

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();

        if (existingUser) {
          // User exists, update their data
          const { error: updateError } = await supabase
            .from('users')
            .update({
              email: primaryEmail,
              first_name: user.firstName,
              last_name: user.lastName,
              username: user.username,
              avatar_url: user.imageUrl,
              updated_at: new Date().toISOString(),
              // Additional fields you might want to track
              last_sign_in: new Date().toISOString(),
            })
            .eq('id', userId);

          if (updateError) {
            console.error('Error updating user in Supabase:', updateError);
          } else {
            console.log('User data updated in Supabase');
          }
        } else {
          // User doesn't exist, create a new record
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email: primaryEmail,
              first_name: user.firstName,
              last_name: user.lastName,
              username: user.username,
              avatar_url: user.imageUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Additional fields
              last_sign_in: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Error creating user in Supabase:', insertError);
          } else {
            console.log('User created in Supabase');
          }
        }

        // Refresh the page to ensure UI updates correctly
        router.refresh();
      } catch (error) {
        console.error('Error syncing user to Supabase:', error);
      }
    }

    syncUserToSupabase();
  }, [isLoaded, userId, user, getToken, router]);

  // This is a background component, doesn't render anything
  return null;
}
