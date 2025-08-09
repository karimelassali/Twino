"use client";
import React from "react";
import { Compare } from "@/components/ui/compare";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import TextStretching from "./ui/text_stretching";

export function CompareDemo() {
  return (
    <div className="w-full border-t mt-20 py-16 flex flex-col items-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto px-4"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <TextStretching
            text="See   The   Differences!"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="violet"
            strokeColor="#ff0000"
            minFontSize={36}
          />
          <Sparkles className="h-6 w-6 text-blue-500" />
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Compare Twino's natural conversational flow with traditional AI
          assistants
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative p-6 w-full min-h-[400px] flex flex-col items-center rounded-3xl dark:bg-neutral-900/70 bg-white border border-neutral-200 dark:border-neutral-800"
      >
        <Compare
          firstImage="/twinoapp.png"
          secondImage="/gpt.png"
          firstImageClassName="w-full h-full object-cover rounded-lg"
          secondImageClassname="w-full h-full object-cover rounded-lg"
          className="w-full aspect-video max-w-full rounded-xl overflow-hidden shadow-2xl"
          slideMode="hover"
          showHandlebar={true}
          autoplay={true}
        />

        <div className="w-full flex justify-center gap-6 text-sm font-medium mt-4 z-10">
          <div className="bg-blue-500/90 text-white px-4 py-1 rounded-full shadow-md">
            Twino
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-1 rounded-full shadow-md">
            Traditional AI
          </div>
        </div>
      </motion.div>
    </div>
  );
}
