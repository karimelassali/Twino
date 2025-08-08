'use client';

import { SignUp } from "@clerk/nextjs";
import Navbar from "@/components/navbar"; // Assuming this is the enhanced navbar
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Assuming react-hot-toast is installed for notifications

// A component for some subtle, animated background shapes for visual flair
// This can be extracted to a shared file to be used on both sign-in and sign-up pages
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

export default function SignUpPage() {
  const router = useRouter();

  // This function will be called by Clerk after a successful sign-up.
  // The user object is passed automatically.
  const handleSignUpComplete = (user) => {
    // We can add the Supabase logic here or trigger a webhook.
    // For now, we'll show a success toast and redirect.
    // The Supabase logic from your original code can be integrated here.
    console.log("A new user has signed up:", user);
    toast.success('Account created successfully! Redirecting...');
    // Redirect after a short delay to allow the user to see the message
    setTimeout(() => {
        router.push('/');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Navbar />
      
      <BackgroundBlobs />

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
                  <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Create Your Account
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Join us and start your journey
                </p>
              </div>
            </div>
            
            {/* Clerk Sign-Up Component */}
            <div className="p-8">
              <SignUp 
                signInUrl="/sign-in"
                redirectUrl="/"
                afterSignUp={handleSignUpComplete} // Use Clerk's built-in callback
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none w-full",
                    header: "hidden",
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
                    footer: "hidden",
                  },
                }}
              />
            </div>

             {/* Card Footer */}
            <div className="px-8 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/sign-in" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
