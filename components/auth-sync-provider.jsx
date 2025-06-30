'use client';

import { useEffect, useState } from 'react';
import FirstUserModal from '@/components/first-user-modal';
import { useAuth, useUser } from '@clerk/nextjs';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

/**
 * Provider component that syncs Clerk user data with Supabase
 * This runs whenever authentication state changes
 */
export function AuthSyncProvider({ children }) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [synced, setSynced] = useState(false);
  const [showEarlyModal, setShowEarlyModal] = useState(false);

  // Show the confetti modal only once per browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const flag = localStorage.getItem('twino_credits_modal');
      if (!flag) {
        setShowEarlyModal(true);
      }
    }
  }, []);

  const handleModalChange = (open) => {
    setShowEarlyModal(open);
    if (!open) {
      localStorage.setItem('twino_credits_modal', 'shown');
    }
  };
  
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

        const supabase = createClient();
        console.log("AuthSyncProvider: Direct Supabase insertion attempt", { userId });
        
        // First, upsert user data into 'users' table
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
          
          // Second approach - Call server endpoint if the direct upsert fails
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
          localStorage.setItem('userId', userId);
          console.log("AuthSyncProvider: Direct Supabase insertion successful");
        }
        
        // Check if the user has existing credits
        const { data: userCredits, error: creditsCheckError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('user_id', userId);

        if (creditsCheckError) {
          console.error('Error checking user credits:', creditsCheckError);
        } else {
          if (userCredits.length === 0) {
            // If no credits record exists, insert a new record with 5000 credits
            const { error: creditsError } = await supabase
              .from('user_credits')
              .upsert({
                credits: 5000,
                user_id: userId
              }, { onConflict: 'user_id' });

            if (creditsError) {
              toast.error('Error updating credits in Supabase');
              console.error('Error updating credits in Supabase:', creditsError);
            } else {
              console.log('Credits updated in Supabase');
            }
          } else {
            console.log('User already has credits, no update necessary');
          }
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
  return (
    <>
      {children}
      {showEarlyModal && (
        <FirstUserModal open={showEarlyModal} onOpenChange={handleModalChange} />
      )}
    </>
  );
}
