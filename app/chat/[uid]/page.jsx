"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Moon, Sun, Sparkles } from "lucide-react";
import {createClient} from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import Typing from "@/components/ui/typing";
// Your original Twino logo SVG (simplified for example)
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

const botPersonalities = [
  { id: 1, pair: "Historian × Student" },
  { id: 2, pair: "Professor × Novice" },
  { id: 3, pair: "Expert × Curious Mind" },
  { id: 4, pair: "Mentor × Apprentice" },
];

const topicOptions = [
  { id: 1, name: "WW1 causes" },
  { id: 2, name: "Climate change" },
  { id: 3, name: "Space exploration" },
  { id: 4, name: "Quantum physics" },
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
      bubbleUserBg: "#1B365D",
      buttonBg: "#144E8C",
      buttonHoverBg: "#1F6EC0",
      border: "#144E8C",
      subText: "#A3C4F3",
    },
    lightMode: {
      bg: "#F7FAFC",
      surface: "#FFFFFF",
      text: "#1E293B",
      bubbleBotBg: "#E3E8F1",
      bubbleUserBg: "#D1D9F6",
      buttonBg: "#3DB7E4",
      buttonHoverBg: "#5AB0F9",
      border: "#CBD5E1",
      subText: "#64748B",
    },
  };

  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const chatContainerRef = useRef(null);
  const [mockReadingFinished, setMockReadingFinished] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [askerStatus, setAskerStatus] = useState(false);
  const [responderStatus, setResponderStatus] = useState(true);


  const [data,setData] = useState([]);

  useEffect(()=>{
    supabase.from('conversations').select(
      'id, subject, personalities (personality_pair)'
    ).eq('id', uid).single().then(({data})=>{
      setData(data);
      setSelectedTopic(data.subject);
      setSelectedPersonality(data.personalities.personality_pair);
    }).catch((err)=>{
      console.log(err);
    })
  },[uid])


  useEffect(() => {
    setIsTyping(true);
    setConversation([]);
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < initialConversation.length) {
        setConversation((prev) => [...prev, initialConversation[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 900);
    return () => clearInterval(timer);
  }, [selectedTopic, selectedPersonality]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, isTyping]);

  const resetConversation = () => {
    setConversation([]);
    setIsTyping(true);
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < initialConversation.length) {
        setConversation((prev) => [...prev, initialConversation[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 700);
  };

  const getBotPersonality = (sender) => {
    const personalities = selectedPersonality.pair.split(" × ");
    return sender === "Bot1" ? personalities[0] : personalities[1];
  };

  const theme = darkMode ? colors.darkMode : colors.lightMode;

  const asker = async () => {
   if(data.subject && data.personalities.personality_pair){
    const sendQuestion = await axios.post("/api/asker", {
      subject: data.subject,
      personalityPair: data.personalities.personality_pair.split(" × ")[0],
      previousMessages: conversation,
    });
    const response = sendQuestion.data;
    response && setAskerStatus(true);
    setQuestion(response.message);
    setResponderStatus(false);
   }
   
  }

  useEffect(() => {
    setTimeout(() => {
    asker();
    }, 1000);
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
    "Let me process this..."
  ];

  useEffect(() => {
    setTimeout(() => {
      setMockReadingFinished(true);
    }, 5000);
  }, [mockReadingFinished]);

  
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
              <div className="flex flex-col  sm:flex-row sm:items-start">
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
                  {topicOptions.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setSelectedTopic(topic);
                        setShowTopicSelect(false);
                        resetConversation();
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-200 focus:outline-none ${
                        selectedTopic.id === topic.id
                          ? darkMode
                            ? "bg-blue-900 text-white"
                            : "bg-blue-100 text-blue-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      role="menuitem"
                      type="button"
                    >
                      {topic.name}
                    </button>
                  ))}
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
              {data.personalities && (
                <span>
                  Personalities: {data.personalities.personality_pair}
                </span>
              )}
            </span>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      {data.length > 0 && data.map((message) => (
        <p key={message.id}>{message.sender}: {message.message}{message.message}</p>
      ))}
     
      <div className="w-full p-3 flex justify-end">
        {!askerStatus && (
          data.personalities && (
            <Typing typer={data.personalities.personality_pair.split(" × ")[0]} />

        )
        )}
        {question && (
          <div className="mt-4 max-w-[50%] border rounded-tl-md rounded-tr-md rounded-bl-md p-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <p className="text-sm">{question.message}</p>
          </div>
        )}
      </div>
      <div className="w-full p-3 flex justify-start">
        {!responderStatus && (
          <>
            {!mockReadingFinished && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-sm text-gray-600 italic mb-2"
              >
                {mockReadingText[Math.floor(Date.now() / 1000) % mockReadingText.length]}
              </motion.div>
            )}
           
            {mockReadingFinished && data.personalities && (
              <Typing typer={data.personalities.personality_pair.split(" × ")[1]} />
            )}
          </>
        )}
        
        {answer && (
          <div 
            className="mt-4 max-w-[50%] border rounded-tl-md rounded-tr-md rounded-bl-md p-3" 
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            
          >
            <p className="text-sm">{answer.message}</p>
          </div>
        )}
      </div>

      {/* Input Area (Demo, disabled) */}
      <footer
        className="border-t absolute bottom-0 w-full py-3 px-4"
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
      >
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
        </form>
      </footer>
    </div>
  );
}
