'use client';

import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

/**
 * Provider component that syncs Clerk user data with Supabase
 * This runs whenever authentication state changes
 */
export function AuthSyncProvider() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [synced, setSynced] = useState(false);
  
  useEffect(() => {
    // Only run if Clerk has loaded and user is signed in
    if (!isLoaded || !userId || !user) {
      console.log("AuthSyncProvider: Not ready to sync", { isLoaded, userId: !!userId, user: !!user });
      return;
    }

    // Skip if already synced this session
    if (synced) {
      console.log("AuthSyncProvider: Already synced this session");
      return;
    }

    console.log("AuthSyncProvider: Starting user sync to Supabase");
    
    async function syncUserToSupabase() {
      try {
        // Get user data from Clerk
        const primaryEmail = user.emailAddresses.find(
          email => email.id === user.primaryEmailAddressId
        )?.emailAddress;

        // First approach - Direct Supabase API call
        const supabase = createClient();
        console.log("AuthSyncProvider: Direct Supabase insertion attempt", { userId });
        
        const { error: directError } = await supabase
          .from('users')
          .upsert({
            id: userId,
            email: primaryEmail,
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username || primaryEmail.split('@')[0],
            avatar_url: user.imageUrl,
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (directError) {
          console.error('AuthSyncProvider: Direct Supabase insertion failed:', directError);
          
          // Second approach - Call server endpoint
          console.log("AuthSyncProvider: Attempting server API call for sync");
          const response = await fetch('/api/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: primaryEmail,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username || primaryEmail.split('@')[0],
              imageUrl: user.imageUrl
            }),
          });

          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.error || 'Failed to sync user data');
          }
          
          console.log("AuthSyncProvider: Server sync result", result);
        } else {
          localStorage.setItem('userId',userId)
          console.log("AuthSyncProvider: Direct Supabase insertion successful");
        }
        
        // Mark as synced for this session
        setSynced(true);
      } catch (error) {
        console.error('AuthSyncProvider: Error syncing user to Supabase:', error);
        toast.error('Failed to sync user data');
      }
    }

    // Sync user data when component mounts and user is authenticated
    syncUserToSupabase();
  }, [isLoaded, userId, user, synced]);

  // This is a background component, doesn't render anything
  return null;
}
