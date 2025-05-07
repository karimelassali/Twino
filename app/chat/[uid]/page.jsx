"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RefreshCw, Moon, Sun, Sparkles, Pause, Play   , Square } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import Typing from "@/components/ui/typing";
import toast, { Toaster } from 'react-hot-toast';
import { GlowingEffect } from "@/components/ui/glowing-effect";


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
      responderBubbleBg: "#1B365D", 
      bubbleUserBg: "#1B365D",
      buttonBg: "#144E8C",
      buttonHoverBg: "#1F6EC0",
      border: "#144E8C",
      subText: "#A3C4F3",
      accent: "#3DB7E4",
    },
    lightMode: {
      bg: "#F0F8FF", // Slightly blue tint for better contrast
      surface: "#FFFFFF",
      text: "#1E293B",
      bubbleBotBg: "#E3E8F1",
      responderBubbleBg: "#D1D9F6", 
      bubbleUserBg: "#3DB7E4",
      buttonBg: "#3DB7E4",
      buttonHoverBg: "#5AB0F9",
      border: "#CBD5E1",
      subText: "#64748B",
      accent: "#4A7AFF",
    },
  };

  const [darkMode, setDarkMode] = useState(false); // Default to dark mode
  const [conversation, setConversation] = useState([]);
  const [thinkingPersona, setThinkingPersona] = useState(null); // Track which persona is "thinking"
  const [readingPersona, setReadingPersona] = useState(null); // Track which persona is "reading"
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0].pair);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const chatContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const stopRef = useRef(false);
  const hasStartedConversation = useRef(false);
  const [customQuestion, setCustomQuestion] = useState("");


  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const isDark = storedTheme === 'dark';
    document.documentElement.classList.toggle("dark", isDark);
  
    
    // Update theme state if needed
    if (theme !== storedTheme && storedTheme) {
      setDarkMode(isDark);
    }
  }, []);
  // Clear all timeouts on component unmount
  useEffect(() => {
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  // Add timeout ID to the list
  const addTimeout = (id) => {
    setTimeoutIds(prev => [...prev, id]);
    return id;
  };

  useEffect(() => {
    const fetchConversationData = async () => {
      try {
        // Fetch conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .select("id, subject, personalities (personality_pair)")
          .eq("id", uid)
          .single();
        
        if (conversationError) {
          console.error("Error fetching conversation:", conversationError);
          toast.error("Failed to load conversation");
          return;
        }
        // Generate and save title for the conversation
        const { data: titleData, error: titleError } = await axios.post('/api/generate-title', {
          subject: conversationData.subject,
          personalityPair: conversationData.personalities.personality_pair
        });

        if (titleError) {
          console.error("Error generating title:", titleError);
        } else {
          // Save the generated title to the conversation
          const { error: updateError } = await supabase
            .from('conversations')
            .update({ generated_title: titleData.title })
            .eq('id', uid);
          
          if (updateError) {
            console.error("Error saving title:", updateError);
          }
        }
                
        setData(conversationData);
        setSelectedTopic(conversationData.subject);
        setSelectedPersonality(conversationData.personalities.personality_pair);
        
        // Fetch messages for this conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select()
          .eq('conversation_id', uid)
          
        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          toast.error("Failed to load messages");
          return;
        }
        
        setMessages(messagesData);
        
        // If there are existing messages, load them and set stop to true
        if (messagesData?.length > 0) {
          setConversation(messagesData.map(msg => ({
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.created_at
          })));
          
          // Automatically stop the conversation if messages exist
          setStop(true);
          setIsConversationActive(false);
        } else {
          // No messages, prepare to start conversation
          setIsConversationActive(true);
          setStop(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast.error("Something went wrong");
      }
    };
    
    fetchConversationData();
  }, [uid]);

  const handleCustomQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!customQuestion.trim()) return;
    
    const askerPersona = data.personalities.personality_pair.split(" × ")[0];
    
    // Add the custom question to the conversation as coming from the asker
    const newMessage = {
      sender: askerPersona,
      message: customQuestion,
      timestamp: new Date().toISOString(),
    };
    
    setConversation(prev => [...prev, newMessage]);
    
    // Save to Supabase if needed
    try {
      await supabase.from('messages').insert({
        conversation_id: uid,
        sender: askerPersona,
        content: customQuestion,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
    
    // Clear the input
    setCustomQuestion("");
    
    // Continue the conversation with the responder
    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);
    
    // Get all messages including the new custom question
    const allMessages = [...conversation, newMessage].map(msg => ({
      sender: msg.sender,
      message: msg.message
    }));
    
    // Call responder with the updated messages
    responder(allMessages);
  };

  // Update the stopRef when stop state changes
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, thinkingPersona, readingPersona]);

  // Start conversation after data is loaded (if no existing messages)
  useEffect(() => {
    if (data && !stop && !hasStartedConversation.current) {
      hasStartedConversation.current = true;
      startConversation();
    }
  }, [data, stop]);

  const resetConversation = async () => {
    // Clear existing timeouts
    timeoutIds.forEach(id => clearTimeout(id));
    setTimeoutIds([]);
    
    // Reset states
    setConversation([]);
    setThinkingPersona(null);
    setReadingPersona(null);
    setIsConversationActive(true);
    setStop(false);
    stopRef.current = false;
    
    // Clear messages from database
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', uid);
      
      toast.success("Conversation reset");
      
      // Start new conversation after a short delay
      setTimeout(() => {
        startConversation();
      }, 500);
    } catch (error) {
      console.error("Error resetting conversation:", error);
      toast.error("Failed to reset conversation");
    }
  };

  const theme = darkMode ? colors.darkMode : colors.lightMode;

  const asker = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stopRef.current) return;
    
    const askerPersona = data.personalities.personality_pair.split(" × ")[0];
    setThinkingPersona(askerPersona);
    
    try {
      const response = await axios.post("/api/asker", {
        subject: data.subject,
        personalityPair: askerPersona,
        previousMessages,
      });
      
      const message = response.data.message;
      
      // Only proceed if we're not stopped
      if (!stopRef.current) {
        // Add message to conversation
        setConversation(prev => [
          ...prev,
          {
            sender: askerPersona,
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);
        
        // Save message to database
        try {
          await supabase.from("messages").insert({
            conversation_id: uid,
            sender: askerPersona,
            message: message.message,
          });
        } catch (dbError) {
          console.error("Failed to save message:", dbError);
          toast.error("Failed to save message");
        }
        
        // Clear thinking indicator
        setThinkingPersona(null);
        
        // Start reading phase for responder if not stopped
        if (!stopRef.current) {
          const responderPersona = data.personalities.personality_pair.split(" × ")[1];
          setReadingPersona(responderPersona);
          
          // Random delay between 4-8 seconds for "reading"
          const delay = Math.random() * 4000 + 4000;
          
          const timeoutId = addTimeout(setTimeout(() => {
            if (!stopRef.current) {
              setReadingPersona(null);
              responder([...previousMessages, message]);
            }
          }, delay));
        }
      }
    } catch (error) {
      console.error("Asker error:", error);
      setThinkingPersona(null);
      setReadingPersona(null);
      toast.error("Failed to generate response");
    }
  };

  const responder = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stopRef.current) return;
    
    const responderPersona = data.personalities.personality_pair.split(" × ")[1];
    setThinkingPersona(responderPersona);
    
    try {
      const response = await axios.post("/api/responder", {
        subject: data.subject,
        personalityPair: responderPersona,
        previousMessage: previousMessages[previousMessages.length - 1],
      });
      
      const message = response.data.message;
      
      // Only proceed if we're not stopped
      if (!stopRef.current) {
        // Add message to conversation
        setConversation(prev => [
          ...prev,
          {
            sender: responderPersona,
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);
        
        // Save message to database
        try {
          await supabase.from("messages").insert({
            conversation_id: uid,
            sender: responderPersona,
            message: message.message,
          });
        } catch (dbError) {
          console.error("Failed to save message:", dbError);
          toast.error("Failed to save message");
        }
        
        // Clear thinking indicator
        setThinkingPersona(null);
        
        // Continue conversation if active
        if (!stopRef.current) {
          const askerPersona = data.personalities.personality_pair.split(" × ")[0];
          setReadingPersona(askerPersona);
          
          // Random delay between 4-8 seconds for "reading"
          const delay = Math.random() * 4000 + 4000;
          
          const timeoutId = addTimeout(setTimeout(() => {
            if (!stopRef.current) {
              setReadingPersona(null);
              asker([...previousMessages, message]);
            }
          }, delay));
        }
      }
    } catch (error) {
      console.error("Responder error:", error);
      setThinkingPersona(null);
      setReadingPersona(null);
      toast.error("Failed to generate response");
    }
  };

  const startConversation = () => {
    if (data?.subject && data?.personalities?.personality_pair && !stopRef.current) {
      asker([]);
    }
  };

  const handleContinue = () => {
    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);
    
    // Get all previous messages to continue the conversation
    const previousMessages = conversation.map(msg => ({
      sender: msg.sender, 
      message: msg.message
    }));
    
    // Determine whose turn it is based on the last message
    if (previousMessages.length > 0) {
      const lastSender = previousMessages[previousMessages.length - 1].sender;
      const askerPersona = data.personalities.personality_pair.split(" × ")[0];
      const responderPersona = data.personalities.personality_pair.split(" × ")[1];
      
      if (lastSender === askerPersona) {
        // If asker was last, continue with responder
        responder(previousMessages);
      } else {
        // If responder was last, continue with asker
        asker(previousMessages);
      }
    } else {
      // If no messages, start fresh
      startConversation();
    }
  };

  const handleStop = () => {
    setStop(true);
    stopRef.current = true;
    setIsConversationActive(false);
    setThinkingPersona(null);
    setReadingPersona(null);
    
    // Clear all pending timeouts
    timeoutIds.forEach(id => clearTimeout(id));
    setTimeoutIds([]);
    
    toast.success("Conversation paused");
  };

  const mockReadingTexts = {
    asker: [
      "Hmm, interesting point...",
      "Let me consider this...",
      "That's a good perspective...",
      "I see what you mean...",
      "I'm thinking about that...",
    ],
    responder: [
      "That's a good question...",
      "Let me think about this...",
      "I need to consider that...",
      "Interesting perspective...",
      "I'm forming my thoughts...",
    ]
  };

  // Get a random reading text based on persona type
  const getRandomReadingText = (isAsker) => {
    const texts = isAsker ? mockReadingTexts.asker : mockReadingTexts.responder;
    return texts[Math.floor(Math.random() * texts.length)];
  };

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
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
              className="px-3 py-1 rounded-md font-medium transition-colors duration-300 flex items-center gap-1"
              style={{
                backgroundColor: theme.buttonBg,
                color: "white",
              }}
              type="button"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Reset</span>
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
              }}
              type="button"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
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
              <span className="max-w-xs truncate">Topic: {selectedTopic}</span>
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
              {selectedPersonality}
            </span>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 pb-28 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-transparent"
        style={{ backgroundColor: theme.bg }}
      >
        <div className="max-w-4xl mx-auto">
          {conversation.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-lg"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              >
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.accent }}>
                  Welcome to Twino!
                </h3>
                <p className="text-sm" style={{ color: theme.subText }}>
                  Watch as two AI personalities have a conversation about {selectedTopic}.
                </p>
              </motion.div>
            </div>
          )}
          
          {conversation.map((msg, index) => {
            const isAsker = msg.sender === selectedPersonality.split(" × ")[0];
            const isSequential = index > 0 && conversation[index - 1].sender === msg.sender;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex w-full mb-4 ${isAsker ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] border rounded-lg p-3 shadow-sm
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

          {/* Thinking Indicator - Appears inline with the conversation */}
          {thinkingPersona && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex w-full mb-4 ${thinkingPersona === selectedPersonality.split(" × ")[0] ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-center space-x-2 max-w-[60%] border rounded-lg p-3 shadow-sm
                  ${thinkingPersona === selectedPersonality.split(" × ")[0] ? "rounded-tr-none" : "rounded-tl-none"}`}
                style={{ 
                  backgroundColor: thinkingPersona === selectedPersonality.split(" × ")[0] 
                    ? theme.bubbleUserBg 
                    : theme.responderBubbleBg,
                  borderColor: theme.border,
                  color: thinkingPersona === selectedPersonality.split(" × ")[0] && !darkMode ? "white" : theme.text,
                }}
              >
                <span className="text-sm">{thinkingPersona}</span>
                <div className="flex space-x-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: thinkingPersona === selectedPersonality.split(" × ")[0] && !darkMode 
                      ? "white" 
                      : theme.accent }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: thinkingPersona === selectedPersonality.split(" × ")[0] && !darkMode 
                      ? "white" 
                      : theme.accent }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: thinkingPersona === selectedPersonality.split(" × ")[0] && !darkMode 
                      ? "white" 
                      : theme.accent }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Reading Indicator - Appears inline with the conversation */}
          {readingPersona && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`flex w-full mb-4 ${readingPersona === selectedPersonality.split(" × ")[0] ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-center space-x-2 max-w-[70%] border rounded-lg p-3 shadow-sm
                  ${readingPersona === selectedPersonality.split(" × ")[0] ? "rounded-tr-none" : "rounded-tl-none"}`}
                style={{ 
                  backgroundColor: readingPersona === selectedPersonality.split(" × ")[0] 
                    ? theme.bubbleUserBg 
                    : theme.responderBubbleBg,
                  borderColor: theme.border,
                  color: readingPersona === selectedPersonality.split(" × ")[0] && !darkMode ? "white" : theme.text,
                  opacity: 0.8
                }}
              >
                <span className="text-sm font-medium">{readingPersona}</span>
                <span className="text-sm italic">
                  {getRandomReadingText(readingPersona === selectedPersonality.split(" × ")[0])}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <footer
        className="border-t fixed bottom-0 w-full py-4 px-4 shadow-lg"
        style={{ 
          backgroundColor: theme.surface, 
          borderColor: theme.border,
          boxShadow: `0 -4px 6px -1px ${darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
        }}
      >
        <div className="max-w-4xl mx-auto">
          {isConversationActive ? (
            <div className="flex gap-3 items-center">
              {/* Input Field (Disabled during active conversation) */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  className="w-full rounded-lg border px-4 py-2.5 text-base outline-none transition-colors duration-300"
                  placeholder="Twino is having an autonomous conversation..."
                  disabled
                  style={{
                    backgroundColor: `${theme.bg}90`,
                    borderColor: theme.border,
                    color: theme.subText,
                  }}
                  aria-disabled="true"
                />
                <GlowingEffect
                  glow={true}
                  disabled={false}
                  proximity={64}
                  spread={20}
                  blur={8}
                  inactiveZone={0.2}
                  className="opacity-30"
                />
              </div>
              
              {/* Stop Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="px-4 py-2.5 font-ubuntu rounded-lg font-medium flex items-center gap-2 transition-colors duration-300 shadow-md"
                style={{
                  backgroundColor: theme.errorBg,
                  color: "black",
                }}
                type="button"
                aria-label="Stop conversation"
              >
                <span>Stop</span>
                <Square size={16} />
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleCustomQuestionSubmit} className="w-full">
              <div className="flex items-center gap-2">
                <motion.div 
                  initial={{ opacity: 0.8, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 relative"
                >
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={`Ask as ${data?.personalities?.personality_pair.split(" × ")[0]}...`}
                    className="w-full rounded-lg px-4 py-3 outline-none transition-all duration-300 focus:ring-2 text-base"
                    style={{
                      backgroundColor: darkMode ? theme.bubbleBotBg : theme.surface,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  />
                  <GlowingEffect
                    glow={!!customQuestion}
                    disabled={false}
                    proximity={64}
                    spread={20}
                    blur={8}
                    inactiveZone={0.2}
                  />
                </motion.div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!customQuestion.trim()}
                    className="rounded-lg px-5 py-3 font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
                    style={{
                      backgroundColor: customQuestion.trim() ? theme.buttonBg : `${theme.buttonBg}80`,
                      color: darkMode ? "white" : theme.text,
                      opacity: customQuestion.trim() ? 1 : 0.7,
                    }}
                    aria-label="Send message"
                  >
                    <span>Send</span>
                    <Sparkles size={16} className="animate-pulse" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinue}
                    className="rounded-lg px-5 py-3 font-medium transition-all duration-300 flex items-center gap-2 shadow-md"
                    style={{
                      backgroundColor: theme.successBg,
                      color: darkMode ? "white" : "black",
                      border: darkMode ? "none" : "1px solid rgba(0,0,0,0.1)",
                      textShadow: darkMode ? "none" : "0px 1px 2px rgba(0,0,0,0.2)"
                    }}
                    type="button"
                    aria-label="Continue conversation"
                  >
                    <span>Continue</span>
                    <Play size={16} />
                  </motion.button>
                </div>
              </div>
            </form>
          )}
        </div>
      </footer>

     </div>
  );
}