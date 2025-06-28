'use client'

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Sun, Moon, ChevronDown, Globe } from "lucide-react";
import { UserButton } from "./user-button";
import { SignedIn, SignedOut , useUser} from "@clerk/nextjs";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";



// Custom hook for persisting state in localStorage
function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const {user} = useUser();

  const driverObj = driver({
    popoverClass: 'driverjs-theme'
  });

  
  
  
  // Local storage for theme and language
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [language, setLanguage] = useLocalStorage("language", "en");
  
  // Apply theme and language direction on mount and when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set theme class on document
      document.documentElement.classList.toggle("dark", theme === "dark");
      // Set RTL for Arabic
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }
  }, [theme, language]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Language label mapping
  const languageLabels = {
    en: "English",
    fr: "Français",
    ar: "العربية"
  };

  // Get button texts based on selected language
  const buttonText = {
    en: {
      login: "Login",
      signup: "Sign Up",
      trial: "Start free trial",
      dark: "Dark Mode",
      light: "Light Mode"
    },
    fr: {
      login: "Connexion",
      signup: "S'inscrire",
      trial: "Essai gratuit",
      dark: "Mode sombre",
      light: "Mode clair"
    },
    ar: {
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      trial: "ابدأ النسخة التجريبية",
      dark: "الوضع المظلم",
      light: "الوضع الفاتح"
    }
  }[language];

  // We're no longer closing the menu on auth button clicks
  // This function is kept but modified to do nothing, 
  // we'll only keep it for the free trial button
  const handleFreeTrialButtonClick = () => {
    // Only the free trial button will close the mobile menu
    setMobileMenuOpen(false);
  };

  // Variants for animations
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

  // Dropdown animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }
    }
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.8 
      }}
      className={`w-full z-50 fixed top-0 transition-all duration-500 ${
        scrolled 
          ? `bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-lg py-2 
             ${theme === "dark" ? "shadow-slate-800/30" : "shadow-blue-100/50"}` 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center ${language === "ar" ? "flex-row-reverse" : ""}`}>
          {/* Logo and Branding */}
          <motion.a 
            href="/" 
            className="flex items-center gap-3 relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              whileHover={{ 
                rotate: [0, 10, -10, 0],
                scale: 1.1,
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeInOut" 
              }}
              className="relative"
            >
              <div className={`absolute inset-0 rounded-full blur-md ${theme === "dark" ? "bg-blue-600/30" : "bg-blue-400/30"} scale-110 group-hover:scale-125 transition-all duration-300`}></div>
              <Image
                src="/twino.png"
                alt="Twino Logo"
                width={48}
                height={48}
                className={`rounded-full shadow-md ${theme === "dark" ? "shadow-blue-500/30" : "shadow-blue-300/50"} z-10`}
              />
              <motion.div 
                className="absolute -inset-1 rounded-full"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ 
                  opacity: [0, 0.2, 0], 
                  scale: [0.8, 1.2, 1.5],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 3,
                  ease: "easeInOut",
                }}
                style={{ 
                  background: `radial-gradient(circle, ${theme === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"} 0%, transparent 70%)` 
                }}
              />
            </motion.div>
            
            <motion.div className="relative overflow-hidden">
              <motion.span 
                className="text-xl font-black text-gray-800 dark:text-white tracking-tight hidden sm:inline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Tw
                <motion.span 
                  className="font-extrabold relative inline-block"
                  animate={{ 
                    color: theme === "dark" 
                      ? ["#ffffff", "#3B82F6", "#ffffff"]
                      : ["#1F2937", "#3B82F6", "#1F2937"] 
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >i</motion.span>
                no
              </motion.span>
              <motion.div 
                className="absolute bottom-0 left-0 h-0.5 bg-blue-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.a>

          {/* Desktop Navigation */}
          <div id="test" className={`hidden md:flex items-center gap-3 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            {/* Theme Toggle */}
            <motion.button
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-full ${
                theme === "dark" 
                  ? "bg-slate-800 text-yellow-300 border border-slate-700" 
                  : "bg-blue-50 text-blue-800 border border-blue-100"
              } transition-all duration-300`}
              aria-label={theme === "dark" ? buttonText.light : buttonText.dark}
            >
              {theme === "dark" ? (
                <motion.div
                  initial={{ rotate: 45 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sun size={20} className="text-yellow-300" />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ rotate: -45 }}
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Moon size={20} className="text-blue-800" />
                </motion.div>
              )}
            </motion.button>

            {/* Language Selector */}
            {/* <div className="relative">
              <motion.button
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`px-3 py-2 rounded-full flex items-center gap-2 ${
                  theme === "dark" 
                    ? "bg-slate-800 text-white border border-slate-700" 
                    : "bg-blue-50 text-blue-800 border border-blue-100"
                } transition-all duration-300`}
                aria-label="Change language"
              >
                <Globe size={18} />
                <span className="text-sm font-medium">{languageLabels[language]}</span>
                <motion.div
                  animate={{ rotate: langDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className={`absolute top-full mt-2 ${language === "ar" ? "right-0" : "left-0"} min-w-[140px] rounded-xl overflow-hidden
                      ${theme === "dark" 
                        ? "bg-slate-800 border border-slate-700 shadow-lg shadow-slate-900/30" 
                        : "bg-white border border-blue-100 shadow-lg shadow-blue-100/50"
                      }`}
                  >
                    {Object.entries(languageLabels).map(([code, label]) => (
                      <motion.button
                        key={code}
                        onClick={() => {
                          setLanguage(code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-2 text-sm font-medium
                          ${language === code 
                            ? theme === "dark" 
                              ? "bg-slate-700 text-blue-400" 
                              : "bg-blue-50 text-blue-600"
                            : theme === "dark"
                              ? "text-slate-200 hover:bg-slate-700" 
                              : "text-slate-700 hover:bg-blue-50"
                          } transition-colors duration-200`}
                        whileHover={{ x: language === "ar" ? -5 : 5 }}
                      >
                        <span>{label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div> */}

            {/* User Button (Login/Signup or User Profile) */}
            <UserButton theme={theme} language={language} buttonText={buttonText} />
          </div>

          {/* Mobile Menu Button */}
          <div className={`md:hidden flex items-center gap-3 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            {/* Theme Toggle Mobile */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`p-2 rounded-full ${
                theme === "dark" 
                  ? "bg-slate-800 text-yellow-300" 
                  : "bg-blue-50 text-blue-800"
              } transition-all duration-300`}
              aria-label={theme === "dark" ? buttonText.light : buttonText.dark}
            >
              {theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </motion.button>

            {/* Language Toggle Mobile - Icon Only */}
              {/* <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`p-2 rounded-full relative ${
                  theme === "dark" 
                    ? "bg-slate-800 text-white" 
                    : "bg-blue-50 text-blue-800"
                } transition-all duration-300`}
                aria-label="Change language"
              >
                <Globe size={18} />
                
                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className={`absolute top-full mt-2 ${language === "ar" ? "right-0" : "left-0"} min-w-[140px] rounded-xl overflow-hidden z-50
                        ${theme === "dark" 
                          ? "bg-slate-800 border border-slate-700 shadow-lg shadow-slate-900/30" 
                          : "bg-white border border-blue-100 shadow-lg shadow-blue-100/50"
                        }`}
                    >
                      {Object.entries(languageLabels).map(([code, label]) => (
                        <motion.button
                          key={code}
                          onClick={() => {
                            setLanguage(code);
                            setLangDropdownOpen(false);
                            // Don't close mobile menu when changing language
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm font-medium
                            ${language === code 
                              ? theme === "dark" 
                                ? "bg-slate-700 text-blue-400" 
                                : "bg-blue-50 text-blue-600"
                              : theme === "dark"
                                ? "text-slate-200 hover:bg-slate-700" 
                                : "text-slate-700 hover:bg-blue-50"
                            } transition-colors duration-200`}
                          whileHover={{ x: language === "ar" ? -5 : 5 }}
                        >
                          <span>{label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button> */}

            {/* Hamburger Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full z-50"
              aria-label="Toggle menu"
            >
              <div className="w-6 flex flex-col gap-1.5">
                <motion.div
                  animate={mobileMenuOpen ? { rotate: 45, y: 8, backgroundColor: theme === "dark" ? "#60A5FA" : "#3B82F6" } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`h-0.5 w-full ${theme === "dark" ? "bg-white" : "bg-gray-800"}`}
                />
                <motion.div
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`h-0.5 w-full ${theme === "dark" ? "bg-white" : "bg-gray-800"}`}
                />
                <motion.div
                  animate={mobileMenuOpen ? { rotate: -45, y: -8, backgroundColor: theme === "dark" ? "#60A5FA" : "#3B82F6" } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`h-0.5 w-full ${theme === "dark" ? "bg-white" : "bg-gray-800"}`}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.04, 0.62, 0.23, 0.98] 
            }}
            className={`md:hidden fixed inset-0 top-16 ${
              theme === "dark" 
                ? "bg-slate-900/95 backdrop-blur-md" 
                : "bg-white/95 backdrop-blur-md"
            } shadow-xl z-40`}
          >
            <div className={`flex flex-col gap-4  z-90 bg-white dark:bg-slate-800 h-full  p-5 ${language === "ar" ? "items-end" : ""}`}>
              <SignedOut>
                <motion.a
                  href="/sign-in"
                  initial={{ opacity: 0, x: language === "ar" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ x: language === "ar" ? -5 : 5, backgroundColor: theme === "dark" ? "#334155" : "#EFF6FF" }}
                  className={`px-4 py-3 rounded-xl border font-medium w-full text-left ${
                    theme === "dark"
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-blue-200 text-blue-600 hover:bg-blue-50"
                  } transition-all duration-300`}
                  aria-label="Login"
                >
                  {buttonText.login}
                </motion.a>
                
                <motion.a
                  href="/sign-up"
                  initial={{ opacity: 0, x: language === "ar" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ x: language === "ar" ? -5 : 5, backgroundColor: theme === "dark" ? "#334155" : "#EFF6FF" }}
                  className={`px-4 py-3 rounded-xl border font-medium w-full text-left ${
                    theme === "dark"
                      ? "border-blue-700 text-blue-400 hover:bg-slate-800"
                      : "border-blue-300 text-blue-600 hover:bg-blue-50"
                  } transition-all duration-300`}
                  aria-label="Sign Up"
                >
                  {buttonText.signup}
                </motion.a>
              </SignedOut>
              
              <SignedIn>
                <div className="w-full flex justify-end items-center mb-2 px-2">
                  <div className={`flex items-center gap-3 w-full justify-between ${language === "ar" ? "flex-row-reverse" : ""}`}>
                    <p className={`text-sm font-medium ${
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }`}>
                      Hello, <span className="font-semibold text-blue-500">{useUser().user?.firstName || 'User'}</span>!
                    </p>
                    <UserButton theme={theme} language={language} buttonText={buttonText} />
                  </div>
                </div>
              </SignedIn>
              
              <motion.a
                href='#topics'

                initial={{ opacity: 0, x: language === "ar" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ x: language === "ar" ? -5 : 5 }}
                className={`relative px-4 py-3 rounded-xl font-semibold w-full text-left flex items-center gap-2
                  ${theme === "dark"
                    ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white"
                    : "bg-gradient-to-r from-blue-600 to-blue-400 text-white"
                  } overflow-hidden group`}
                aria-label="Start free trial"
                onClick={handleFreeTrialButtonClick}
              >
                {/* Gradient background animation */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    duration: 5, 
                    ease: "linear", 
                    repeat: Infinity 
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                />
                
                {/* Button content */}
                <span className="relative">{buttonText.trial}</span>
                <motion.div
                  className="relative"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}