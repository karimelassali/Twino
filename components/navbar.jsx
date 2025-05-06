'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`w-full z-50 fixed top-0 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-md py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Branding */}
          <motion.a 
            href="/" 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              whileHover={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/twino.png"
                alt="Twino Logo"
                width={48}
                height={48}
                className="rounded-full"
              />
            </motion.div>
            <motion.span 
              className="text-xl font-black text-gray-800 dark:text-white tracking-tight hidden sm:inline"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Tw<motion.span 
                className="font-extrabold relative"
                whileHover={{ color: "#3B82F6" }}
              >i</motion.span>no
            </motion.span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-3 items-center">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full border border-blue-500 text-blue-500 font-medium transition"
              aria-label="Login"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#EFF6FF" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full border border-blue-500 text-blue-500 font-medium transition"
              aria-label="Sign Up"
            >
              Sign Up
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#2563EB" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow transition flex items-center gap-2"
              aria-label="Start free trial"
            >
              <span>Start free trial</span>
              <Sparkles className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <motion.div
                animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-full bg-gray-800 dark:bg-white"
              />
              <motion.div
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="h-0.5 w-full bg-gray-800 dark:bg-white"
              />
              <motion.div
                animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-full bg-gray-800 dark:bg-white"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 shadow-lg"
          >
            <div className="flex flex-col gap-3 p-4">
              <motion.button
                whileHover={{ x: 5 }}
                className="px-4 py-3 rounded-lg border border-blue-500 text-blue-500 font-medium w-full text-left"
                aria-label="Login"
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="px-4 py-3 rounded-lg border border-blue-500 text-blue-500 font-medium w-full text-left"
                aria-label="Sign Up"
              >
                Sign Up
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold w-full text-left flex items-center gap-2"
                aria-label="Start free trial"
              >
                <span>Start free trial</span>
                <Sparkles className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}