"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Moon, Sun, Sparkles, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Logo SVG component
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

// Mock conversation data
const initialConversation = [
  {
    id: 1,
    sender: "Bot1",
    message:
      "The causes of World War I were complex and multifaceted. One of the primary factors was the system of alliances that had developed across Europe by 1914.",
    timestamp: "2:30 PM",
  },
  {
    id: 2,
    sender: "Bot2",
    message:
      "I've heard about these alliances before. Could you explain how they actually contributed to starting the war?",
    timestamp: "2:31 PM",
  },
  {
    id: 3,
    sender: "Bot1",
    message:
      "Certainly! The alliance system created a sort of 'domino effect.' When Austria-Hungary declared war on Serbia after the assassination of Archduke Franz Ferdinand, Russia mobilized to defend Serbia.",
    timestamp: "2:33 PM",
  },
  {
    id: 4,
    sender: "Bot2",
    message:
      "And that triggered other countries to get involved based on their alliances?",
    timestamp: "2:34 PM",
  },
  {
    id: 5,
    sender: "Bot1",
    message:
      "Exactly! Germany, allied with Austria-Hungary, declared war on Russia and then on France (Russia's ally). When German forces invaded Belgium to attack France, Britain entered the war to defend Belgian neutrality.",
    timestamp: "2:36 PM",
  },
  {
    id: 6,
    sender: "Bot2",
    message:
      "Wow, that really shows how interconnected everything was. Were there other important factors besides alliances?",
    timestamp: "2:37 PM",
  },
];

// Bot personalities options
const botPersonalities = [
  { id: 1, pair: "Historian × Student" },
  { id: 2, pair: "Professor × Novice" },
  { id: 3, pair: "Expert × Curious Mind" },
  { id: 4, pair: "Mentor × Apprentice" },
];

// Topics options
const topicOptions = [
  { id: 1, name: "WW1 causes" },
  { id: 2, name: "Climate change" },
  { id: 3, name: "Space exploration" },
  { id: 4, name: "Quantum physics" },
];

// Helper: get initials
function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function TwinoChat() {
  const router = useRouter();
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
    },
  };

  const [darkMode, setDarkMode] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0]);
  const [selectedTopic, setSelectedTopic] = useState(topicOptions[0]);
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const chatContainerRef = useRef(null);
  const [inputValue, setInputValue] = useState("");

  // Simulate loading conversation messages with delay
  useEffect(() => {
    setIsTyping(true);
    setConversation([]);
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < initialConversation.length) {
        setConversation((prev) => {
          const newMessage = initialConversation[currentIndex];
          if (newMessage) return [...prev, newMessage];
          return prev;
        });
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedTopic, selectedPersonality]);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  // Function to reset the conversation
  const resetConversation = () => {
    setConversation([]);
    setIsTyping(true);
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < initialConversation.length) {
        setConversation((prev) => {
          const newMessage = initialConversation[currentIndex];
          if (newMessage) return [...prev, newMessage];
          return prev;
        });
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 900);
  };

  // Get bot personality for styling
  const getBotPersonality = (sender) => {
    const personalities = selectedPersonality.pair.split(" × ");
    return sender === "Bot1" ? personalities[0] : personalities[1];
  };

  // For chat bubble color
  const getBubbleStyles = (sender) => {
    if (sender === "Bot1") {
      return darkMode
        ? "bg-gradient-to-tr from-blue-900 to-blue-600 text-white"
        : "bg-gradient-to-tr from-blue-200 to-blue-400 text-blue-900";
    } else {
      return darkMode
        ? "bg-gradient-to-tr from-purple-900 to-purple-600 text-white"
        : "bg-gradient-to-tr from-purple-200 to-purple-400 text-purple-900";
    }
  };

  // For avatar color
  const getAvatarStyles = (sender) => {
    if (sender === "Bot1") {
      return darkMode
        ? "bg-blue-800 text-blue-200"
        : "bg-blue-200 text-blue-800";
    } else {
      return darkMode
        ? "bg-purple-800 text-purple-200"
        : "bg-purple-200 text-purple-800";
    }
  };

  // Theme background
  const gradientStyle = darkMode
    ? {
        background:
          "linear-gradient(130deg, #00152A 0%, #002952 100%)",
      }
    : {
        background: "linear-gradient(130deg, #F8FCFF 0%, #E1F5FE 100%)",
      };

  // Keyboard navigation for topic select
  const handleTopicKeyDown = (e) => {
    if (e.key === "Escape") setShowTopicSelect(false);
  };

  return (
    <div
      className="flex flex-col h-screen font-sans"
      style={gradientStyle}
      aria-label="Twino Chat Application"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: darkMode
            ? `linear-gradient(90deg, ${colors.darkMode.surface} 0%, ${colors.darkBlue} 100%)`
            : `linear-gradient(90deg, #E1F5FE 0%, #BBDEFB 100%)`,
        }}
        className="p-4 shadow-lg relative"
      >
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.22'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "30px 30px",
            }}
          ></div>
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-4 container mx-auto">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05, backgroundColor: colors.midBlue }}
              whileTap={{ scale: 0.95 }}
              aria-label="Back"
              className="p-2 rounded-full bg-opacity-80 text-white transition-all duration-300"
              style={{ backgroundColor: colors.lightBlue }}
              tabIndex={0}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <div className="flex items-center gap-2">
              <TwinoLogo />
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold"
                style={{
                  background: `linear-gradient(90deg, ${colors.lightBlue} 0%, ${colors.midBlue} 50%, ${colors.purple} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: darkMode ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                }}
              >
                TWINO
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ color: darkMode ? "#B0BEC5" : "#546E7A" }}
                className="text-xs font-medium hidden sm:block"
              >
                Two Minds. One Talk.
              </motion.p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: colors.midBlue }}
              whileTap={{ scale: 0.95 }}
              onClick={resetConversation}
              aria-label="Reset Conversation"
              className="p-2 rounded-full text-white transition-all duration-300"
              style={{ backgroundColor: colors.lightBlue }}
              tabIndex={0}
            >
              <RefreshCw size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: colors.purple }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-full text-white transition-all duration-300"
              style={{ backgroundColor: colors.midBlue }}
              tabIndex={0}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Topic and Personality Selection Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          background: darkMode
            ? "linear-gradient(90deg, rgba(0,31,63,0.7) 0%, rgba(13,71,161,0.5) 100%)"
            : "linear-gradient(90deg, rgba(225,245,254,0.7) 0%, rgba(187,222,251,0.5) 100%)",
          backdropFilter: "blur(8px)",
        }}
        className="py-2 px-2 shadow-md z-10"
      >
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Topic Selection */}
            <div className="relative">
              <div
                onClick={() => setShowTopicSelect((v) => !v)}
                onKeyDown={handleTopicKeyDown}
                tabIndex={0}
                aria-haspopup="menu"
                aria-expanded={showTopicSelect}
                aria-label="Choose topic"
                className="flex items-center cursor-pointer rounded-full px-4 py-1 transition-all duration-300 focus:ring-2 focus:ring-blue-300"
                style={{
                  background: darkMode
                    ? "rgba(61, 183, 228, 0.15)"
                    : "rgba(61, 183, 228, 0.1)",
                  border: `1px solid ${
                    darkMode
                      ? "rgba(61, 183, 228, 0.3)"
                      : "rgba(61, 183, 228, 0.2)"
                  }`,
                  color: darkMode ? "#E1F5FE" : "#0D47A1",
                }}
              >
                <Sparkles size={14} className="mr-2" style={{ color: colors.lightBlue }} />
                <span className="text-sm">Topic: {selectedTopic.name}</span>
              </div>
              <AnimatePresence>
                {showTopicSelect && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    style={{
                      background: darkMode
                        ? "rgba(0, 41, 82, 0.98)"
                        : "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(8px)",
                      border: darkMode
                        ? "1px solid rgba(61, 183, 228, 0.2)"
                        : "1px solid rgba(187, 222, 251, 0.5)",
                      boxShadow: darkMode
                        ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                        : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    }}
                    className="absolute top-10 left-0 z-20 w-48 p-2 rounded-lg"
                    role="menu"
                  >
                    {topicOptions.map((topic) => (
                      <div
                        key={topic.id}
                        tabIndex={0}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setShowTopicSelect(false);
                          resetConversation();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setSelectedTopic(topic);
                            setShowTopicSelect(false);
                            resetConversation();
                          }
                        }}
                        style={{
                          backgroundColor:
                            selectedTopic.id === topic.id
                              ? darkMode
                                ? "rgba(61, 183, 228, 0.15)"
                                : "rgba(61, 183, 228, 0.1)"
                              : "transparent",
                          color: darkMode ? "#E1F5FE" : "#0D47A1",
                        }}
                        className="p-2 text-sm cursor-pointer rounded hover:bg-opacity-20 transition-all duration-200 outline-none focus:bg-blue-100"
                        role="menuitem"
                        aria-selected={selectedTopic.id === topic.id}
                      >
                        {topic.name}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Personality Display */}
            <div
              className="flex items-center rounded-full px-4 py-1"
              style={{
                background: darkMode
                  ? "rgba(138, 124, 255, 0.15)"
                  : "rgba(138, 124, 255, 0.1)",
                border: `1px solid ${
                  darkMode
                    ? "rgba(138, 124, 255, 0.3)"
                    : "rgba(138, 124, 255, 0.2)"
                }`,
                color: darkMode ? "#E1F5FE" : "#0D47A1",
              }}
            >
              <Sparkles size={14} className="mr-2" style={{ color: colors.purple }} />
              <span className="text-sm">Personalities: {selectedPersonality.pair}</span>
            </div>
          </div>
          {/* Personality Switcher (optional) */}
          <div className="flex gap-2 items-center">
            <label htmlFor="personality-switch" className="text-xs mr-1 opacity-70">
              Change
            </label>
            <select
              id="personality-switch"
              value={selectedPersonality.id}
              onChange={(e) => {
                const newPersonality = botPersonalities.find(
                  (p) => p.id === Number(e.target.value)
                );
                setSelectedPersonality(newPersonality);
                resetConversation();
              }}
              className="rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-300"
              style={{
                background: darkMode
                  ? "rgba(138, 124, 255, 0.15)"
                  : "rgba(138, 124, 255, 0.07)",
                color: darkMode ? "#E1F5FE" : "#0D47A1",
              }}
            >
              {botPersonalities.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.pair}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Chat Area */}
      <main
        className="flex-1 overflow-y-auto px-1 sm:px-4 py-4 container mx-auto w-full"
        ref={chatContainerRef}
        style={{
          background: darkMode ? colors.darkMode.bg : "#F8FCFF",
          color: darkMode ? colors.darkMode.text : "#0D47A1",
        }}
        aria-label="Conversation"
      >
        <AnimatePresence>
          {conversation.map((msg, index) =>
            msg ? (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className={`flex ${
                  msg.sender === "Bot1" ? "justify-start" : "justify-end"
                } mb-4`}
              >
                <div
                  className={`flex items-end gap-2 max-w-[90%] sm:max-w-[70%]`}
                >
                  {msg.sender === "Bot1" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow ${getAvatarStyles(
                        msg.sender
                      )}`}
                      aria-label={getBotPersonality(msg.sender)}
                    >
                      {getInitials(getBotPersonality(msg.sender))}
                    </div>
                  )}
                  <div
                    className={`p-4 rounded-2xl shadow-md transition-all duration-200 ${getBubbleStyles(
                      msg.sender
                    )} ${
                      msg.sender === "Bot1"
                        ? "rounded-bl-none"
                        : "rounded-br-none"
                    }`}
                    tabIndex={0}
                    aria-label={`${getBotPersonality(msg.sender)} message`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium opacity-90">
                        {getBotPersonality(msg.sender)}
                      </p>
                    </div>
                    <p className="text-base leading-relaxed">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-2 text-right">
                      {msg.timestamp}
                    </p>
                  </div>
                  {msg.sender === "Bot2" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base shadow ${getAvatarStyles(
                        msg.sender
                      )}`}
                      aria-label={getBotPersonality(msg.sender)}
                    >
                      {getInitials(getBotPersonality(msg.sender))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-4"
          >
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: colors.lightBlue,
                }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: colors.lightBlue,
                }}
              />
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }}
                className="w-2 h-2 rounded-full"
                style={{
                  background: colors.lightBlue,
                }}
              />
            </div>
          </motion.div>
        )}
      </main>

      {/* Input Area (Demo, non-functional) */}
      <footer
        className="py-3 px-2 sm:px-6 bg-opacity-90"
        style={{
          background: darkMode
            ? "linear-gradient(90deg, #001F3F 0%, #002952 100%)"
            : "linear-gradient(90deg, #E1F5FE 0%, #BBDEFB 100%)",
          borderTop: darkMode
            ? "1px solid #0a2236"
            : "1px solid #e3f2fd",
        }}
      >
        <form
          className="flex gap-2 items-center max-w-2xl mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            className="flex-1 rounded-full px-4 py-2 text-base outline-none border border-blue-200 focus:ring-2 focus:ring-blue-400 transition"
            style={{
              background: darkMode ? "#002952" : "#fff",
              color: darkMode ? "#E1F5FE" : "#0D47A1",
            }}
            placeholder="Type your message... (demo only)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled
            aria-label="Message input (demo only)"
          />
          <button
            type="submit"
            className="rounded-full px-5 py-2 font-semibold bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow hover:from-blue-500 hover:to-purple-600 transition"
            disabled
            aria-label="Send message (demo only)"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
