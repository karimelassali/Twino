'use client';

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/navbar";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [isSignedUp, setIsSignedUp] = useState(false);
  const router = useRouter();

  // Handle successful sign-up
  const handleSignUp = async (userData) => {
    setIsSignedUp(true);
    try {
      // Attempt to create the user in Supabase immediately
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .insert({
          id: userData.id,
          email: userData.emailAddress,
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username || userData.emailAddress.split('@')[0],
          avatar_url: userData.imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          active: true,
        });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        toast.error('Error syncing user data. Please try again.');
      } else {
        toast.success('Account created successfully!');
        router.push('/');
      }
    } catch (error) {
      console.error('Error in sign-up flow:', error);
      toast.error('There was an error creating your account.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mt-10">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Create Your Account
          </h1>
          
          <SignUp 
            signInUrl="/sign-in"
            redirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-all duration-200",
                card: "rounded-xl shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: 
                  "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700",
                formFieldInput: 
                  "rounded border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white",
                formFieldLabel: "dark:text-gray-300",
                footer: "hidden"
              },
            }}
          />
          
          <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
            <p>Already have an account? <a href="/sign-in" className="text-blue-500 hover:underline">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
