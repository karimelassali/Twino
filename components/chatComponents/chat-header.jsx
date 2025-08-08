'use client';

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/navbar"; // Assuming this is the enhanced navbar
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Assuming shadcn/ui components path

// --- Color Palette ---
const colors = {
    primary: "#2A324B",
    highlight: "#D0C4FF",
    action: "#4C4CFF",
    background: "#FFFFFF",
    inputBg: "#F5F5F5",
    secondary: "#C0C0C0",
    accent: {
      green: "#5AE675",
      red: "#FF5C5C",
      amber: "#FFB547",
      teal: "#20E3B2"
    },
    darkMode: {
      bg: "#171E2E",
      surface: "#232A3F",
      surfaceAlt: "#2F3A57",
      text: "#FFFFFF",
      bubbleBotBg: "rgba(45, 51, 75, 0.75)",
      responderBubbleBg: "rgba(92, 92, 255, 0.25)",
      bubbleUserBg: "rgba(208, 196, 255, 0.25)",
      buttonBg: "#5C5CFF",
      buttonHoverBg: "#4949DD",
      border: "#2F3A57",
      subText: "#A0A0C0",
      accent: "#8A7FFF",
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
    lightMode: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceAlt: "#F1F5F9",
      text: "#1E293B",
      bubbleBotBg: "#F1F5F9",
      responderBubbleBg: "rgba(92, 92, 255, 0.15)",
      bubbleUserBg: "rgba(208, 196, 255, 0.2)",
      buttonBg: "#5C5CFF",
      buttonHoverBg: "#4949DD",
      border: "#E2E8F0",
      subText: "#64748B",
      accent: "#5C5CFF",
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
};

// --- Default Theme Object ---
const defaultTheme = colors.lightMode;

// --- Main Chat Page Component ---
export default function ChatPage() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);

        const storedTheme = localStorage.getItem('theme');
        const isDark = storedTheme === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const theme = useMemo(() => (darkMode ? colors.darkMode : colors.lightMode), [darkMode]);

    if (!hasMounted) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <p>Loading Chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden" style={{ backgroundColor: theme.bg }}>
            <Navbar />
            <main className="relative z-10 flex h-full pt-16">
                <div className="flex-1 flex flex-col min-w-0">
                    <ChatHeader
                        theme={theme}
                    />
                    <div className="flex-1 p-4 overflow-y-auto">
                        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Chat Content Area</h1>
                        <p style={{ color: theme.subText }}>Your messages will appear here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- UPDATED: Chat Header Component using shadcn/ui ---
export function ChatHeader({ theme = defaultTheme }) {
    const [url, setUrl] = useState('');

    // Set the URL on the client side once the component has mounted
    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    const handleConfirmShare = useCallback(() => {
        if (!url) return;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        });
    }, [url]);

    return (
        <header
            className="flex items-center justify-between p-3 sticky top-16 z-10 flex-shrink-0"
            style={{
                backdropFilter: 'blur(8px)'
            }}
        >
            <div className="flex items-center gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <motion.button
                            className="p-2 rounded-full"
                            style={{ color: theme.accent, backgroundColor: `${theme.accent}20` }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Share conversation"
                        >
                            <Share2 size={18} />
                        </motion.button>
                    </AlertDialogTrigger>
                    {/* The AlertDialogContent from shadcn/ui automatically handles the overlay with blur */}
                    <AlertDialogContent style={{ backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }} className="p-4 sm:p-6 rounded-xl shadow-2xl w-[95vw] max-w-md m-4 border">
                        <AlertDialogHeader className="flex flex-col items-center text-center space-y-0">
                             <div className="p-3 rounded-full mb-4" style={{backgroundColor: `${colors.accent.amber}20`}}>
                                 <AlertTriangle size={28} style={{color: colors.accent.amber}} />
                             </div>
                             <AlertDialogTitle className="text-xl sm:text-2xl font-bold">Share Public Link</AlertDialogTitle>
                             <AlertDialogDescription className="mt-2 text-sm sm:text-base" style={{ color: theme.subText }}>
                                 Anyone with this link can view this conversation.
                                 They will not be able to edit or continue it.
                             </AlertDialogDescription>
                        </AlertDialogHeader>
                        {/* <div className="mt-5 w-full">
                            <label className="text-xs sm:text-sm font-medium" style={{color: theme.subText}}>Public URL</label>
                            <div className="mt-1 flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}`}}>
                                <LinkIcon size={16} style={{color: theme.subText}}/>
                                <p className="truncate text-sm flex-1 text-left" style={{ color: theme.text }}>
                                    {url}
                                </p>
                            </div>
                        </div> */}
                        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                            <AlertDialogCancel
                                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold"
                                style={{ backgroundColor: theme.surfaceAlt, color: theme.text, border: 'none' }}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmShare}
                                className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                                style={{ backgroundColor: theme.buttonBg }}
                            >
                                 Copy Link & Share
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </header>
    );
}
