'use client';

import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/navbar";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mt-10">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Sign In to Your Account
          </h1>
          
          <SignIn 
            signUpUrl="/sign-up"
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
            <p>Don't have an account? <a href="/sign-up" className="text-blue-500 hover:underline">Sign up</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
