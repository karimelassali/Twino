'use client';

import { useUser } from '@clerk/nextjs';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Only fetch from Supabase if Clerk authentication is loaded and user is signed in
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }
    
    async function fetchSupabaseUser() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Check if user exists in Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching user from Supabase:', error);
        }
        
        // If user not found in Supabase, create them
        if (!data) {
          // Get primary email
          const primaryEmail = user.emailAddresses.find(
            email => email.id === user.primaryEmailAddressId
          )?.emailAddress;
          
          // Insert new user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: primaryEmail,
              first_name: user.firstName,
              last_name: user.lastName,
              username: user.username,
              avatar_url: user.imageUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating user in Supabase:', insertError);
          } else {
            setSupabaseUser(newUser);
          }
        } else {
          setSupabaseUser(data);
        }
      } catch (err) {
        console.error('Unexpected error in useAuth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSupabaseUser();
  }, [isLoaded, isSignedIn, user]);
  
  return {
    user: isSignedIn ? user : null,
    supabaseUser,
    isLoaded: isLoaded && !isLoading,
    isSignedIn
  };
}
