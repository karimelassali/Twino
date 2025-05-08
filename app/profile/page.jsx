'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import Navbar from '@/components/navbar';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Fetch user data from Supabase when the component mounts
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    const fetchSupabaseUser = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user from Supabase:', error);
          return;
        }
        
        setSupabaseUser(data);
        setSyncStatus(data ? 'synced' : 'not-synced');
      } catch (error) {
        console.error('Error in fetchSupabaseUser:', error);
      }
    };
    
    fetchSupabaseUser();
  }, [isLoaded, isSignedIn, user]);

  // Function to manually sync user data to Supabase
  const syncUserToSupabase = async () => {
    if (!isSignedIn) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    try {
      // Get primary email address
      const primaryEmail = user.emailAddresses.find(
        email => email.id === user.primaryEmailAddressId
      )?.emailAddress;
      
      // Call API endpoint to sync user
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
          imageUrl: user.imageUrl,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync user data');
      }
      
      // Try direct Supabase upsert as a backup
      const supabase = createClient();
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: primaryEmail,
          first_name: user.firstName,
          last_name: user.lastName,
          username: user.username || primaryEmail.split('@')[0],
          avatar_url: user.imageUrl,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      // Fetch the updated user data
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setSupabaseUser(data);
      setSyncStatus('synced');
      toast.success('User data synced to database successfully!');
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
      setSyncStatus('error');
      toast.error('Failed to sync user data');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {user.emailAddresses[0]?.emailAddress}
              </p>
              
              <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <button
                  onClick={syncUserToSupabase}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>Sync to Database</>
                  )}
                </button>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  syncStatus === 'synced' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  syncStatus === 'not-synced' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  syncStatus === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {syncStatus === 'synced' ? 'Synced to Database' :
                   syncStatus === 'not-synced' ? 'Not Synced' :
                   syncStatus === 'syncing' ? 'Syncing...' :
                   syncStatus === 'error' ? 'Sync Error' : 'Unknown Status'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Your Database Record
            </h2>
            
            {supabaseUser ? (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg overflow-auto">
                <pre className="text-xs text-gray-800 dark:text-gray-200">
                  {JSON.stringify(supabaseUser, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  No user record found in database. Click the "Sync to Database" button above to create one.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
