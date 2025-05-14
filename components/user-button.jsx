'use client';

import { 
  UserButton as ClerkUserButton, 
  useUser, 
  SignInButton, 
  SignUpButton,
  SignedIn,
  SignedOut
} from "@clerk/nextjs";
import { motion } from "framer-motion";

// Button hover animation variants
const buttonHoverVariants = {
  hover: { 
    scale: 1.05, 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  }
};

export function UserButton({ theme, language, buttonText }) {
  const { user } = useUser();
  return (
    <div className={`flex items-center gap-3 ${language === "ar" ? "flex-row-reverse" : ""}`}>
      <SignedIn>
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <p className={`text-sm font-medium ${
              theme === "dark" ? "text-white" : "text-gray-700"
            }`}>
              <span className="text-sm font-medium">
                {user?.fullName ? `Hello, ${user.fullName}` : 'Welcome back!'}
              </span>
            </p>
          </div>
          <ClerkUserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 rounded-full border-2 border-blue-400"
              }
            }}
          />
        </div>
      </SignedIn>
      
      <SignedOut>
        {/* Login Button */}
        <SignInButton mode="modal">
          <motion.button
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full border font-medium transition-all duration-300 ${
              theme === "dark"
                ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="Login"
          >
            {buttonText.login}
          </motion.button>
        </SignInButton>

        {/* Sign Up Button */}
        <SignUpButton mode="modal">
          <motion.button
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full border font-medium transition-all duration-300 ${
              theme === "dark"
                ? "border-blue-700 text-blue-400 hover:bg-slate-800"
                : "border-blue-300 text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="Sign Up"
          >
            {buttonText.signup}
          </motion.button>
        </SignUpButton>
      </SignedOut>
    </div>
  );
}
