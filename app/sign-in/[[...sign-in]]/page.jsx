'use client';

import { SignIn } from "@clerk/nextjs";
import Navbar from "@/components/navbar"; // Assuming this is the enhanced navbar from our previous work
import { motion } from "framer-motion";
import { Lock, LogIn } from "lucide-react";

// A component for some subtle, animated background shapes for visual flair
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden z-0">
    <motion.div
      animate={{
        x: ['-20%', '20%', '-20%'],
        y: ['-10%', '30%', '-10%'],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 50,
        ease: "linear",
        repeat: Infinity,
      }}
      className="absolute top-0 left-0 w-96 h-96 bg-blue-200/50 dark:bg-blue-900/50 rounded-full filter blur-3xl opacity-50"
    />
    <motion.div
      animate={{
        x: ['80%', '50%', '80%'],
        y: ['70%', '40%', '70%'],
        rotate: [0, -180, -360],
      }}
      transition={{
        duration: 60,
        ease: "linear",
        repeat: Infinity,
        delay: -15
      }}
      className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/50 dark:bg-purple-900/50 rounded-full filter blur-3xl opacity-50"
    />
  </div>
);

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-slate-900">
      {/* Assuming the enhanced Navbar component is used here */}
      <Navbar />
      
      {/* Background visual elements */}
      <BackgroundBlobs />

      {/* Main content area */}
      <main className="relative z-10 flex items-center justify-center min-h-screen pt-24 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-blue-500/10 border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Card Header */}
            <div className="p-8 border-b border-gray-200 dark:border-slate-700">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4 border border-blue-200 dark:border-blue-800">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Welcome Back
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Sign in to access your account
                </p>
              </div>
            </div>
            
            {/* Clerk Sign-In Component */}
            <div className="p-8">
              <SignIn 
                signUpUrl="/sign-up"
                redirectUrl="/"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none w-full",
                    header: "hidden", // We created a custom header
                    socialButtonsBlockButton: 
                      "border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200",
                    socialButtonsBlockButtonText: "dark:text-white",
                    dividerLine: "bg-gray-200 dark:bg-slate-700",
                    dividerText: "text-gray-500 dark:text-gray-400",
                    formFieldLabel: "text-gray-700 dark:text-gray-300",
                    formFieldInput: 
                      "rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 dark:text-white focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition",
                    formButtonPrimary: 
                      "bg-blue-600 hover:bg-blue-700 text-base font-semibold text-white py-3 px-4 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2",
                    footer: "hidden", // We created a custom footer
                  },
                }}
              />
            </div>

             {/* Card Footer */}
            <div className="px-8 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <a href="/sign-up" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Sign up now
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
