'use client'

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, ChevronDown, Globe, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, useUser, UserButton as ClerkUserButton } from "@clerk/nextjs";

// --- Custom Hook for localStorage ---
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  };

  return [storedValue, setValue];
}


// --- Main Navbar Component ---
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { user, isSignedIn } = useUser();

  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [language, setLanguage] = useLocalStorage("language", "en");

  const langDropdownRef = useRef(null);

  // --- Effects ---

  // Apply theme and language direction
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [theme, language]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Data and Text ---

  const languageLabels = {
    en: "English",
    fr: "Français",
    ar: "العربية",
  };

  const text = {
    en: {
      login: "Login",
      signup: "Sign Up",
      trial: "Start Free Trial",
      dark: "Enable Dark Mode",
      light: "Enable Light Mode",
      greeting: "Hello",
      tour: "Start Tour"
    },
    fr: {
      login: "Connexion",
      signup: "S'inscrire",
      trial: "Essai Gratuit",
      dark: "Activer le mode sombre",
      light: "Activer le mode clair",
      greeting: "Bonjour",
      tour: "Démarrer la visite"
    },
ar: {
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      trial: "ابدأ النسخة التجريبية",
      dark: "تفعيل الوضع المظلم",
      light: "تفعيل الوضع الفاتح",
      greeting: "مرحباً",
      tour: "ابدأ الجولة"
    },
  }[language];

  // --- Animation Variants ---

  const buttonHoverVariants = {
    hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    tap: { scale: 0.95 },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 30 } },
  };
  
  const mobileMenuVariants = {
    closed: { opacity: 0, y: "-100%" },
    open: { opacity: 1, y: "0%" },
  };

  const mobileLinkVariants = (delay) => ({
    initial: { opacity: 0, x: language === 'ar' ? 50 : -50 },
    animate: { opacity: 1, x: 0, transition: { delay: delay, ease: "easeOut" } },
  });

  // --- Render Components ---


  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
          scrolled
            ? `bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-md py-2 ${theme === 'dark' ? 'shadow-slate-800/20' : 'shadow-blue-100/50'}`
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center ${language === "ar" ? "flex-row-reverse" : ""}`}>
            {/* Logo and Branding */}
            <a href="/" className="flex items-center gap-3" aria-label="Twino Homepage">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                    <Image
                        src="/twino.webp"
                        alt="Twino Logo"
                        width={50}
                        height={50}
                        className="rounded-full shadow-md"
                        priority='true'
                    />
                </motion.div>
              <span className="text-xl font-black text-gray-800 dark:text-white tracking-tight hidden sm:inline">
                Tw<span className="text-blue-500">i</span>no
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className={`hidden md:flex items-center gap-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
              <motion.button
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`p-2.5 rounded-full transition-colors duration-300 ${
                  theme === "dark"
                    ? "bg-slate-800 text-yellow-300 border border-slate-700 hover:bg-slate-700"
                    : "bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100"
                }`}
                aria-label={theme === "dark" ? text.light : text.dark}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700"></div>

              <SignedIn>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {text.greeting}, <span className="font-bold text-blue-500">{user?.firstName}</span>!
                  </span>
                  <ClerkUserButton
                    className="px-6 py-3 text-base font-semibold"
                    afterSignOutUrl="/"
                  />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex items-center gap-2">
                  <motion.a href="/sign-in" variants={buttonHoverVariants} whileHover="hover" whileTap="tap" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    {text.login}
                  </motion.a>
                  <motion.a href="/sign-up" variants={buttonHoverVariants} whileHover="hover" whileTap="tap" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                    {text.signup}
                  </motion.a>
                </div>
              </SignedOut>
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 md:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className={`flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-800 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                <a href="/" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <Image src="/twino.webp" alt="Twino Logo" width={48} height={48} className="rounded-full"/>
                  <span className="text-xl font-black text-gray-800 dark:text-white">Twino</span>
                </a>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Mobile Menu Content */}
              <div className={`flex-grow p-6 flex flex-col gap-5 ${language === "ar" ? "text-right" : "text-left"}`}>
                <SignedIn>
                  <motion.div variants={mobileLinkVariants(0.1)} initial="initial" animate="animate" className={`flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                    <ClerkUserButton afterSignOutUrl="/" />
                    <div className="flex-grow">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{text.greeting},</p>
                      <p className="font-bold text-gray-800 dark:text-white">{user?.firstName}</p>
                    </div>
                  </motion.div>
                </SignedIn>
                <SignedOut>
                    <motion.a href="/sign-in" variants={mobileLinkVariants(0.1)} initial="initial" animate="animate" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      {text.login}
                    </motion.a>
                    <motion.a href="/sign-up" variants={mobileLinkVariants(0.2)} initial="initial" animate="animate" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-6 py-3 text-lg font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors">
                      {text.signup}
                    </motion.a>
                </SignedOut>

                <motion.a
                  href="#pricing"
                  variants={mobileLinkVariants(isSignedIn ? 0.2 : 0.3)}
                  initial="initial"
                  animate="animate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative group w-full text-center px-6 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles size={20} /> {text.trial}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                </motion.a>
              </div>
              
              {/* Mobile Menu Footer */}
              <div className={`p-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between gap-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                <motion.button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`flex-grow flex items-center justify-center gap-3 p-3 rounded-lg transition-colors duration-300 ${
                    theme === "dark"
                      ? "bg-slate-800 text-yellow-300 border border-slate-700"
                      : "bg-blue-50 text-blue-800 border border-blue-100"
                  }`}
                  aria-label={theme === "dark" ? text.light : text.dark}
                >
                  {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
                  <span className="text-base font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
