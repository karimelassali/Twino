"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Moon, Sun, Sparkles, Pause, Play } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import Typing from "@/components/ui/typing";

// Twino logo SVG
const TwinoLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
    <g>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        d="M80 20C85 25 88 35 85 45C82 55 75 60 75 65C75 70 80 75 75 80C70 85 65 80 65 75C65 70 70 65 70 55C70 45 65 40 65 30C65 20 75 15 80 20Z"
        stroke="#3DB7E4"
        strokeWidth="3"
        fill="none"
      />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        d="M65 45C60 50 55 50 50 45C45 40 45 35 50 30C55 25 60 25 65 30"
        stroke="#3DB7E4"
        strokeWidth="3"
        fill="none"
      />
    </g>
  </svg>
);

const botPersonalities = [
  { id: 1, pair: "Historian × Student" },
  { id: 2, pair: "Professor × Novice" },
  { id: 3, pair: "Expert × Curious Mind" },
  { id: 4, pair: "Mentor × Apprentice" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function TwinoChat({ params }) {
  const { uid } = React.use(params);
  const router = useRouter();
  const supabase = createClient();

  const colors = {
    darkBlue: "#001F3F",
    lightBlue: "#3DB7E4",
    midBlue: "#4A7AFF",
    purple: "#8A7CFF",
    lightPurple: "#BB86FC",
    darkMode: {
      bg: "#00152A",
      surface: "#002952",
      text: "#E1F5FE",
      bubbleBotBg: "#0A2A4D",
      responderBubbleBg: "#1B365D", // Different color for responder
      bubbleUserBg: "#1B365D",
      buttonBg: "#144E8C",
      buttonHoverBg: "#1F6EC0",
      border: "#144E8C",
      subText: "#A3C4F3",
      accent: "#3DB7E4",
    },
    lightMode: {
      bg: "#F7FAFC",
      surface: "#FFFFFF",
      text: "#1E293B",
      bubbleBotBg: "#E3E8F1",
      responderBubbleBg: "#D1D9F6", // Different color for responder
      bubbleUserBg: "#3DB7E4", // Changed color for user bubble in light mode
      buttonBg: "#3DB7E4",
      buttonHoverBg: "#5AB0F9",
      border: "#CBD5E1",
      subText: "#64748B",
      accent: "#4A7AFF",
    },
  };

  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0].pair);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const chatContainerRef = useRef(null);
  const [mockReading, setMockReading] = useState(false);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);

  useEffect(() => {
    supabase
      .from("conversations")
      .select("id, subject, personalities (personality_pair)")
      .eq("id", uid)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Supabase error:", error);
          return;
        }
        setData(data);
        setSelectedTopic(data.subject);
        setSelectedPersonality(data.personalities.personality_pair);
      });
  }, [uid]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, isTyping, mockReading]);

  const resetConversation = () => {
    setConversation([]);
    setIsConversationActive(true);
    setStop(false);
    startConversation();
  };

  const theme = darkMode ? colors.darkMode : colors.lightMode;

  const asker = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stop) return;
    setIsTyping(true);
    try {
      const response = await axios.post("/api/asker", {
        subject: data.subject,
        personalityPair: data.personalities.personality_pair.split(" × ")[0],
        previousMessages,
      });
      const message = response.data.message;
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          {
            sender: data.personalities.personality_pair.split(" × ")[0],
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
        setMockReading(true);
        // Random delay between 5-10 seconds
        const delay = Math.random() * 5000 + 5000;
        setTimeout(() => {
          setMockReading(false);
          setIsTyping(true); // Show thinking component
          setTimeout(() => {
            responder([...previousMessages, message]);
          }, 1000); // Additional delay for thinking
        }, delay);
      }, 1000); // Initial delay for message appearance
    } catch (error) {
      console.error("Asker error:", error);
      setIsTyping(false);
      setMockReading(false);
    }
  };

  const responder = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stop) return;
    try {
      const response = await axios.post("/api/responder", {
        subject: data.subject,
        personalityPair: data.personalities.personality_pair.split(" × ")[1],
        previousMessage: previousMessages[previousMessages.length - 1],
      });
      const message = response.data.message;
      setTimeout(() => {
        setConversation((prev) => [
          ...prev,
          {
            sender: data.personalities.personality_pair.split(" × ")[1],
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsTyping(false);
        // Continue conversation if active
        if (isConversationActive && !stop) {
          const delay = Math.random() * 5000 + 5000;
          setTimeout(() => {
            setMockReading(true);
            setTimeout(() => {
              setMockReading(false);
              setIsTyping(true);
              setTimeout(() => {
                asker([...previousMessages, message]);
              }, 1000);
            }, delay);
          }, 1000);
        }
      }, 1000); // Delay for message appearance
    } catch (error) {
      console.error("Responder error:", error);
      setIsTyping(false);
      setMockReading(false);
    }
  };

  const startConversation = () => {
    if (data?.subject && data?.personalities?.personality_pair && !stop) {
      asker([]);
    }
  };

  const handleContinue = () => {
    setStop(false);
    setIsConversationActive(true);
    startConversation();
  };

  const handleStop = () => {
    setStop(true);
    setIsConversationActive(false);
    setIsTyping(false);
    setMockReading(false);
  };

  useEffect(() => {
    if (data && !stop) {
      startConversation();
    }
  }, [data]);

  const mockReadingText = [
    "Hmm, reading this...",
    "That's interesting...",
    "Oh, I knew it!",
    "Let me think about this...",
    "I see what you mean...",
    "Interesting point...",
    "Wait, really?",
    "That makes sense...",
    "I've never thought about it that way...",
    "Let me process this...",
  ];

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: darkMode
            ? `linear-gradient(90deg, ${colors.darkMode.surface} 0%, ${colors.darkBlue} 100%)`
            : `linear-gradient(90deg, ${colors.lightMode.surface} 0%, #dbeafe 100%)`,
          borderBottom: `1px solid ${theme.border}`,
        }}
        className="p-4 shadow-sm"
      >
        <div className="container mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.05, backgroundColor: theme.buttonHoverBg }}
              whileTap={{ scale: 0.95 }}
              aria-label="Back"
              className="p-2 rounded-full transition-colors duration-300"
              style={{ backgroundColor: theme.buttonBg, color: "white" }}
              tabIndex={0}
              type="button"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div className="flex items-center gap-2 select-none">
              <TwinoLogo />
              <div className="flex flex-col sm:flex-row sm:items-start">
                <h1
                  className="text-2xl font-bold"
                  style={{
                    background: `linear-gradient(90deg, ${colors.lightBlue} 0%, ${colors.midBlue} 50%, ${colors.purple} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    userSelect: "none",
                  }}
                >
                  TWINO
                </h1>
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xs text-slate-500 font-medium tracking-wider uppercase opacity-80"
                >
                  Two minds, one topic.
                </motion.span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ backgroundColor: theme.buttonHoverBg }}
              whileTap={{ scale: 0.95 }}
              onClick={resetConversation}
              aria-label="Reset Conversation"
              className="px-3 py-1 rounded-md font-medium transition-colors duration-300"
              style={{
                backgroundColor: theme.buttonBg,
                color: "white",
                opacity: 0.75,
              }}
              type="button"
            >
              <RefreshCw size={18} />
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: theme.buttonHoverBg }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="px-3 py-1 rounded-md font-medium transition-colors duration-300"
              style={{
                backgroundColor: theme.buttonBg,
                color: "white",
                opacity: 0.75,
              }}
              type="button"
            >
              {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Topic and Personality Selection Bar */}
      <nav
        className="py-2 px-4 border-b"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowTopicSelect((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={showTopicSelect}
              aria-label="Choose topic"
              className="flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium transition-colors duration-300"
              style={{
                borderColor: theme.border,
                backgroundColor: darkMode ? "rgba(61, 183, 228, 0.15)" : "rgba(61, 183, 228, 0.1)",
                color: theme.text,
              }}
              type="button"
            >
              <Sparkles size={14} style={{ color: colors.lightBlue }} />
              Topic: {selectedTopic}
            </button>
            <AnimatePresence>
              {showTopicSelect && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-10 left-0 z-20 w-48 rounded-lg shadow-lg border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                  role="menu"
                >
                  <button
                    className="block w-full px-4 py-2 text-left text-sm transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setSelectedTopic("Sample Topic");
                      setShowTopicSelect(false);
                      resetConversation();
                    }}
                  >
                    Sample Topic
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-medium"
              style={{ color: theme.text }}
              aria-label="Selected bot personalities"
            >
              Personalities: {selectedPersonality}
            </span>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 pb-32 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-transparent"
        style={{ backgroundColor: theme.bg }}
      >
        {conversation.map((msg, index) => {
          const isAsker = msg.sender === selectedPersonality.split(" × ")[0];
          const isSequential = index > 0 && conversation[index - 1].sender === msg.sender;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex w-full mb-2 ${isAsker ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] md:max-w-[60%] border rounded-lg p-3 shadow-sm
                  ${isAsker 
                    ? "rounded-tr-none" 
                    : "rounded-tl-none"}`}
                style={{
                  backgroundColor: isAsker ? theme.bubbleUserBg : theme.responderBubbleBg,
                  borderColor: theme.border,
                  color: isAsker && !darkMode ? "white" : theme.text,
                }}
              >
                {!isSequential && (
                  <p className="text-xs font-medium mb-1 opacity-75">{msg.sender}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <span className="block text-right text-xs mt-1 opacity-50">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full mb-4 justify-start"
            >
              <div
                className="flex items-center space-x-2 max-w-[60%] border rounded-lg p-3 shadow-sm"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <span className="text-sm font-medium">
                  {mockReading ? selectedPersonality.split(" × ")[1] : selectedPersonality.split(" × ")[0]}
                </span>
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area with Reading Simulation */}
      <footer
        className="border-t absolute bottom-0 w-full py-3 px-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
        {/* Reading Simulation Area */}
        {mockReading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto flex mb-3"
          >
            <div
              className="w-full border border-gray-200 rounded-lg p-3 bg-gray-50"
              style={{ backgroundColor: `${theme.surface}90`, borderColor: theme.border }}
            >
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-600 italic">
                  {mockReadingText[Math.floor(Date.now() / 3000) % mockReadingText.length]}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Input Form */}
        <form
          className="max-w-3xl mx-auto flex gap-2"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Message input form (demo only)"
        >
          <input
            type="text"
            className="flex-1 rounded-md border px-4 py-2 text-base outline-none transition-colors duration-300"
            placeholder="Type your message... (demo only)"
            disabled
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
            aria-disabled="true"
          />
          <button
            type="submit"
            disabled
            className="rounded-md px-6 py-2 font-semibold transition-colors duration-300"
            style={{
              backgroundColor: theme.buttonBg,
              color: "white",
              opacity: 0.6,
              cursor: "not-allowed",
            }}
            aria-disabled="true"
          >
            Send
          </button>
          
          {/* Conditionally show either Stop or Continue button */}
          {!stop ? (
            <motion.button
              type="button"
              onClick={handleStop}
              whileHover={{ backgroundColor: theme.buttonHoverBg }}
              whileTap={{ scale: 0.95 }}
              className="rounded-md px-6 py-2 font-semibold transition-colors duration-300"
              style={{
                backgroundColor: theme.buttonBg,
                color: "white",
              }}
            >
              <Pause size={18} className="inline mr-1" /> Stop
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={handleContinue}
              whileHover={{ backgroundColor: theme.buttonHoverBg }}
              whileTap={{ scale: 0.95 }}
              className="rounded-md px-6 py-2 font-semibold transition-colors duration-300"
              style={{
                backgroundColor: theme.buttonBg,
                color: "white",
              }}
            >
              <Play size={18} className="inline mr-1" /> Continue
            </motion.button>
          )}
        </form>
      </footer>
    </div>
  );
}