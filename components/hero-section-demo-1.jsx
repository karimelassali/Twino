"use client";

import { motion } from "framer-motion";
import MainInputArea from "@/components/main-input-area";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import {
  MessageSquare,
  Brain,
  Sliders,
  Search,
  Sparkles,
} from "lucide-react";

import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import  NewfeaturePopover  from "@/components/new-feature";

const GridItem = ({ area, icon, title, description }) => {
  return (
    <motion.li 
      className={`min-h-[14rem] list-none ${area}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                {title}
              </h3>
              <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </motion.li>
  );
};

export default function HeroSectionOne() {
  return (
    <>
      <div className="relative  mt-10 mb-0 pb-0 mx-auto flex w-full h-full flex-col items-center justify-center">
        <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
          <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="px-4 py-10 md:py-20">
          <h1 className="relative space-y-2 z-10 mb-10 mx-auto max-w-4xl text-center text-2xl font-ubuntu font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
            {"Twino helps you chat with two AI minds at once"
              .split(" ")
              .map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.1,
                    ease: "easeInOut",
                  }}
                  className="mr-2 inline-block"
                >
                  {index === 0 ? (
                    <Highlight className={'p-0'} >{word}</Highlight>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
          </h1>

          <MainInputArea className="mt-4" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
          >
            See two AI personalities talk to each other about any topic you want. Just type what you're interested in and watch them share different viewpoints right away.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#topics"
              className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 font-medium text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-700 hover:to-purple-700"
            >
              Try It Free
            </a>
            {/* <button
              className="rounded-md border border-blue-400 bg-white px-6 py-2 font-medium text-gray-800 transition-all duration-300 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-200 dark:border-blue-600 dark:hover:bg-gray-800"
            >
              See Examples
            </button> */}
            <NewfeaturePopover className title="New Feature"/>
          </motion.div>
        </div>
      </div>
      <div className="w-full pb-30 h-full p-5">
        <motion.ul 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2"
        >
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2 rounded-lg"
              >
                <MessageSquare className="h-4 w-4 text-white" />
              </motion.div>
            }
            title="Interesting Conversations"
            description="Watch two AI characters talk with each other and share surprising ideas about any topic you can think of."
          />
          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={
              <motion.div 
                whileHover={{ rotate: -15, scale: 1.2 }}
                className="bg-gradient-to-tr from-purple-500 to-pink-600 p-2 rounded-lg"
              >
                <Brain className="h-4 w-4 text-white" />
              </motion.div>
            }
            title="Smart AI Helpers"
            description="Uses the newest AI technology to create real-sounding conversations with deep understanding of many topics."
          />
          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-lg"
              >
                <Sliders className="h-4 w-4 text-white" />
              </motion.div>
            }
            title="Different Characters"
            description="Pick from types like thinker, scientist, artist, or questioner to create talks that help you see things in new ways."
          />
          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={
              <motion.div 
                whileHover={{ rotate: -15, scale: 1.2 }}
                className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
            }
            title="New Ideas"
            description="Find fresh thoughts and viewpoints as the AIs work together and disagree, showing you connections and possibilities you might have missed."
          />
          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.2 }}
                className="bg-gradient-to-tr from-green-500 to-emerald-600 p-2 rounded-lg"
              >
                <Search className="h-4 w-4 text-white" />
              </motion.div>
            }
            title="Explore Anything"
            description="From science to history, current news to creative ideas—our AI friends can talk about any subject you're curious about."
          />
        </motion.ul>
      </div>
    </>
  );
}