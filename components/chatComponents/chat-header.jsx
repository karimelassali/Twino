'use client';

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import Navbar from "@/components/navbar"; // Assuming this is the enhanced navbar

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
        const isDark = storedTheme === 'dark';
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

export function ChatHeader({ theme = defaultTheme }) {
    const router = useRouter();

    const shareConversation = useCallback(() => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success("Link copied to clipboard!");
        });
    }, []);

    return (
        <header
            className="flex items-center justify-between p-3 border-b sticky top-16 z-10 flex-shrink-0"
            style={{
                backgroundColor: `${theme.surface}e6`,
                borderColor: theme.border,
                backdropFilter: 'blur(8px)'
            }}
        >
           
            <div className="flex items-center gap-2">
                <motion.button
                    onClick={shareConversation}
                    className="p-2 rounded-full"
                    style={{ color: theme.accent, backgroundColor: `${theme.accent}20` }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Share conversation"
                >
                    <Share2 size={18} />
                </motion.button>
            </div>
        </header>
    );
}
