"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

// Dynamically import react-confetti because it needs window
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function FirstUserModal({
  open,
  onOpenChange,
}) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md text-center">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Congrats, Early Bird!
          </AlertDialogTitle>
          <AlertDialogDescription>
            You're among the first users of Twino 🎉. We've added <span className="font-semibold">5000 free credits</span> to your account. Enjoy exploring!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Confetti overlay */}
              <Confetti
                width={dimensions.width}
                height={dimensions.height}
                numberOfPieces={200}
                recycle={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction className="mx-auto px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Thanks! Let's go
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
