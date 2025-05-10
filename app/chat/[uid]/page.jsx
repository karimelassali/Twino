"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, RefreshCw, Moon, Sun, Sparkles, 
  Pause, Play, MessageSquare, Square, 
  Clock, Search, LogOut, ChevronRight
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";

// Enhanced Twino logo SVG with animated paths
const TwinoLogo = ({ darkMode }) => {
  const gradientVariants = {
    light: {
      primary: {
        start: "#4C4CFF",
        middle: "#7C7CFF",
        end: "#2A324B"
      },
      secondary: {
        start: "#D0C4FF",
        middle: "#A090FF",
        end: "#4C4CFF"
      }
    },
    dark: {
      primary: {
        start: "#D0C4FF",
        middle: "#7C7CFF",
        end: "#4C4CFF"
      },
      secondary: {
        start: "#FFFFFF",
        middle: "#D0C4FF",
        end: "#8080FF"
      }
    }
  };

  const currentGradient = darkMode ? gradientVariants.dark : gradientVariants.light;

  return (
    <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M75 25C82 30 88 38 85 50C82 62 75 67 75 72C75 77 80 82 75 87C70 92 65 87 65 82C65 77 70 72 70 62C70 52 65 47 65 37C65 27 68 20 75 25Z"
          stroke={`url(#primaryGradient-${darkMode ? 'dark' : 'light'})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          d="M65 45C60 50 55 50 50 45C45 40 45 35 50 30C55 25 60 25 65 30"
          stroke={`url(#secondaryGradient-${darkMode ? 'dark' : 'light'})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
          d="M35 45C30 50 25 45 25 40C25 35 30 30 35 30C40 30 45 35 40 40"
          stroke={`url(#secondaryGradient-${darkMode ? 'dark' : 'light'})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <defs>
          <linearGradient id={`primaryGradient-${darkMode ? 'dark' : 'light'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentGradient.primary.start} />
            <stop offset="50%" stopColor={currentGradient.primary.middle} />
            <stop offset="100%" stopColor={currentGradient.primary.end} />
          </linearGradient>
          <linearGradient id={`secondaryGradient-${darkMode ? 'dark' : 'light'}`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={currentGradient.secondary.start} />
            <stop offset="50%" stopColor={currentGradient.secondary.middle} />
            <stop offset="100%" stopColor={currentGradient.secondary.end} />
          </linearGradient>
        </defs>
      </g>
    </svg>
  );
};

// Enhanced glass effect component with reactive animations
const GlassEffect = ({ children, active = false, darkMode = false, blur = 8, opacity = 0.7, isAsker = false, isResponder = false }) => {
  let bgColor = darkMode 
    ? `rgba(42, 50, 75, ${active ? opacity + 0.1 : opacity})` 
    : `rgba(255, 255, 255, ${active ? opacity + 0.1 : opacity})`;
  
  let borderColor = darkMode
    ? `1px solid rgba(208, 196, 255, 0.15)`
    : `1px solid rgba(192, 192, 192, 0.5)`;
    
  let gradientBg = null;

  // Apply special styling for message bubbles
  if (isAsker) {
    bgColor = darkMode 
      ? `rgba(63, 73, 106, ${opacity})` // Darker shade of primary 
      : `rgba(245, 245, 245, ${opacity})`; // Light gray
    borderColor = darkMode
      ? `1px solid rgba(76, 76, 255, 0.2)` // Action color border
      : `1px solid rgba(76, 76, 255, 0.15)`;
    gradientBg = darkMode
      ? `linear-gradient(135deg, rgba(63, 73, 106, ${opacity}), rgba(76, 76, 255, 0.2))`
      : `linear-gradient(135deg, rgba(245, 245, 245, ${opacity}), rgba(208, 196, 255, 0.3))`;
  } else if (isResponder) {
    bgColor = darkMode 
      ? `rgba(76, 76, 255, ${opacity - 0.3})` // Action color with opacity
      : `rgba(208, 196, 255, ${opacity - 0.1})`; // Highlight color with opacity
    borderColor = darkMode
      ? `1px solid rgba(208, 196, 255, 0.3)` // Highlight color border
      : `1px solid rgba(76, 76, 255, 0.2)`;
    gradientBg = darkMode
      ? `linear-gradient(135deg, rgba(76, 76, 255, 0.4), rgba(50, 50, 155, 0.5))`
      : `linear-gradient(135deg, rgba(208, 196, 255, 0.6), rgba(76, 76, 255, 0.2))`;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl overflow-hidden"
      style={{
        backdropFilter: `blur(${blur}px)`,
        background: gradientBg || bgColor,
        boxShadow: darkMode
          ? `0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.07)`
          : `0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.7)`,
        border: borderColor
      }}
    >
      {children}
    </motion.div>
  );
};

// Reactive pulse effect for visualizing activity
const PulseEffect = ({ active, color, size = "small" }) => {
  const sizeMap = {
    small: "h-2 w-2",
    medium: "h-3 w-3",
    large: "h-4 w-4"
  };
  
  return (
    <div className="relative">
      <div className={`rounded-full ${sizeMap[size]}`} style={{ backgroundColor: color }}></div>
      {active && (
        <motion.div
          className={`absolute top-0 left-0 rounded-full ${sizeMap[size]}`}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
};

const botPersonalities = [
  { id: 1, pair: "Historian × Student" },
  { id: 2, pair: "Professor × Novice" },
  { id: 3, pair: "Expert × Curious Mind" },
  { id: 4, pair: "Mentor × Apprentice" },
  { id: 5, pair: "Researcher × Explorer" },
  { id: 6, pair: "Scholar × Beginner" },
];

function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Skeleton loader component for messages
const MessageSkeleton = ({ isAsker = true, darkMode = false }) => {
  return (
    <div className={`flex ${isAsker ? "justify-start" : "justify-end"} mb-6`}>
      <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isAsker ? "mr-auto" : "ml-auto"}`}>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-20 rounded"
              style={{ 
                backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
              }}
            />
            <div className="h-3 w-12 rounded"
              style={{ 
                backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.05)'
              }}
            />
          </div>
          
          <div className="rounded-xl overflow-hidden" 
            style={{
              backgroundColor: isAsker 
                ? (darkMode ? 'rgba(63, 73, 106, 0.5)' : 'rgba(245, 245, 245, 0.7)')
                : (darkMode ? 'rgba(76, 76, 255, 0.2)' : 'rgba(208, 196, 255, 0.3)'),
              border: '1px solid rgba(192, 192, 192, 0.2)'
            }}>
            <div className="p-3 space-y-2">
              <div className="h-3 w-full rounded animate-pulse"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
                }}
              />
              <div className="h-3 w-5/6 rounded animate-pulse"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
                }}
              />
              <div className="h-3 w-4/6 rounded animate-pulse"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for the conversation sidebar
const ConversationSkeleton = ({ darkMode = false }) => {
  return (
    <div className="p-3 rounded-lg animate-pulse"
      style={{ 
        backgroundColor: darkMode ? 'rgba(53, 59, 84, 0.3)' : 'rgba(245, 245, 245, 0.5)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 rounded"
            style={{ 
              backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
            }}
          />
          <div className="h-3 w-1/2 rounded"
            style={{ 
              backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.05)'
            }}
          />
        </div>
        <div className="h-4 w-4 rounded"
          style={{ 
            backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.05)'
          }}
        />
      </div>
    </div>
  );
};

export default function TwinoChat({ params }) {
  const { uid } = React.use(params);
  const router = useRouter();
  const supabase = createClient();

  // Enhanced color system with new color palette
  const colors = {
    primary: "#2A324B",      // Primary dark text color for headings, body text, navigation links
    highlight: "#D0C4FF",    // Soft violet for highlights, background accents, tags, callout sections
    action: "#4C4CFF",       // Action color for primary buttons, links, active elements
    background: "#FFFFFF",   // Base white for backgrounds, cards, light areas
    inputBg: "#F5F5F5",      // Light gray for input backgrounds, borders, muted sections
    secondary: "#C0C0C0",    // Medium gray for secondary text, borders, disabled buttons
    accent: {
      green: "#5AE675",
      red: "#FF5C5C",
      amber: "#FFB547",
      teal: "#20E3B2"
    },
    darkMode: {
      bg: "#2A324B",
      surface: "#343C5A",    // Slightly lighter shade of primary
      surfaceAlt: "#404969", // Even lighter shade of primary
      text: "#FFFFFF",
      bubbleBotBg: "rgba(53, 59, 84, 0.65)",  // Adjusted primary with opacity
      responderBubbleBg: "rgba(208, 196, 255, 0.25)", // Highlight with opacity
      bubbleUserBg: "rgba(76, 76, 255, 0.15)", // Action color with opacity
      buttonBg: "#4C4CFF",
      buttonHoverBg: "#3939CC", // Darker action color
      border: "#404969",     // Lighter primary
      subText: "#C0C0C0",
      accent: "#D0C4FF",
      successBg: "#059669",
      errorBg: "#dc2626",
      warningBg: "#d97706"
    },
    lightMode: {
      bg: "#FFFFFF",
      surface: "#FFFFFF",
      surfaceAlt: "#F5F5F5",
      text: "#2A324B",
      bubbleBotBg: "#F5F5F5",
      responderBubbleBg: "rgba(208, 196, 255, 0.3)", // Highlight with opacity
      bubbleUserBg: "rgba(76, 76, 255, 0.1)", // Action color with opacity
      buttonBg: "#4C4CFF",
      buttonHoverBg: "#3939CC", // Darker action color
      border: "#C0C0C0",
      subText: "#6B7280", // Slightly darker than medium gray for better contrast
      accent: "#4C4CFF",
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
  };

  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [thinkingPersona, setThinkingPersona] = useState(null);
  const [readingPersona, setReadingPersona] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0].pair);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showTopicSelect, setShowTopicSelect] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [isHistoryPanelMobile, setIsHistoryPanelMobile] = useState(false);
  const chatContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const stopRef = useRef(false);
  const hasStartedConversation = useRef(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [userData, setUserData] = useState(null);
  const [lastConversations, setLastConversations] = useState([]);
  const { isLoaded, isSignedIn, user } = useUser();
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isConversationOwner, setIsConversationOwner] = useState(false);
  
  // Add loading state variables
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  // Check window size for mobile view and enhance with animations
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsHistoryPanelMobile(isMobile);
      if (isMobile) {
        setShowHistoryPanel(false);
      }
    };
    
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    
    // Simulate page loading completed after some delay
    const loadingTimeout = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    
    return () => {
      window.removeEventListener("resize", checkMobileView);
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Apply theme from localStorage on initial load
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set theme based on localStorage or system preference
    if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Clear all timeouts on component unmount
  useEffect(() => {
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [timeoutIds]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    
    // Store the user ID in localStorage for ownership checks
    localStorage.setItem('userId', user.id);
    setUserData(user);
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!data) return;
    
    // Get the current user ID from localStorage
    const currentUserId = localStorage.getItem('userId');
    
    // Check if the current user is the creator of this conversation
    const isOwner = currentUserId === data.user_id;
    setIsConversationOwner(isOwner);
    
    // Log for debugging
    console.log('Conversation ownership check:', { 
      currentUserId, 
      conversationUserId: data.user_id, 
      isOwner 
    });
  }, [data]);

  // Add timeout ID to the list
  const addTimeout = (id) => {
    setTimeoutIds(prev => [...prev, id]);
    return id;
  };

  useEffect(() => {
    const fetchConversationData = async () => {
      setIsConversationLoading(true);
      try {
        // Fetch conversation details
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .select("id, user_id, subject, personalities (personality_pair)")
          .eq("id", uid)
          .single();
        
        if (conversationError) {
          console.error("Error fetching conversation:", conversationError);
          toast.error("Failed to load conversation", {
            icon: '⚠️',
            style: {
              borderRadius: '10px',
              background: darkMode ? '#1E293B' : '#FFF',
              color: darkMode ? '#FFF' : '#0F172A',
            },
          });
          setIsConversationLoading(false);
          return;
        }
        
        // Generate and save title for the conversation
        try {
          const { data: titleData } = await axios.post('/api/generate-title', {
            subject: conversationData.subject,
            personalityPair: conversationData.personalities.personality_pair
          });
  
          // Save the generated title to the conversation
          const { error: updateError } = await supabase
            .from('conversations')
            .update({ generated_title: titleData.title })
            .eq('id', uid);
          
          if (updateError) {
            console.error("Error saving title:", updateError);
          }
        } catch (titleError) {
          console.error("Error generating title:", titleError);
        }
                
        setData(conversationData);
        setSelectedTopic(conversationData.subject);
        setSelectedPersonality(conversationData.personalities.personality_pair);
        
        // Fetch messages for this conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", uid)
          .order("created_at", { ascending: true });
        
        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          toast.error("Failed to load messages", {
            icon: '⚠️',
            style: {
              borderRadius: '10px',
              background: darkMode ? '#1E293B' : '#FFF',
              color: darkMode ? '#FFF' : '#0F172A',
            },
          });
        } else {
          setConversation(messagesData.map(msg => ({
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.created_at,
          })));
        }
        
        setTimeout(() => {
          setIsConversationLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error in fetchConversationData:", error);
        setIsConversationLoading(false);
      }
    };
    
    fetchConversationData();
  }, [uid, darkMode]);

  useEffect(() => {
    const fetchUserConversations = async () => {
      setIsHistoryLoading(true);
      if (!isSignedIn || !user?.id) {
        setIsHistoryLoading(false);
        return;
      }
      
      try {
        const { data: conversationsData, error } = await supabase
          .from("conversations")
          .select("*, personalities(personality_pair)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          console.error("Error fetching conversations:", error);
          toast.error("Failed to load conversation history");
        } else {
          setLastConversations(conversationsData);
          setFilteredConversations(conversationsData);
          
          // Simulate loading state completion
          setTimeout(() => {
            setIsHistoryLoading(false);
          }, 800);
        }
      } catch (error) {
        console.error("Error in fetchUserConversations:", error);
        setIsHistoryLoading(false);
      }
    };

    fetchUserConversations();
  }, [isLoaded, isSignedIn, userData]);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredConversations(lastConversations);
      return;
    }
    
    const lowercaseQuery = searchText.toLowerCase();
    const filtered = lastConversations.filter(conv => 
      (conv.subject?.toLowerCase().includes(lowercaseQuery) || 
       conv.generated_title?.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredConversations(filtered);
  }, [searchText, lastConversations]);
    
  const handleCustomQuestionSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    if (!customQuestion.trim() || thinkingPersona || readingPersona) return;
    
    setIsSendingQuestion(true);
    
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
        message: customQuestion,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save your message");
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
    
    setIsSendingQuestion(false);
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
    // Ask for confirmation
    if (!window.confirm("Are you sure you want to reset this conversation? All messages will be deleted.")) {
      return;
    }
    
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
      
      toast.success("Conversation has been reset", {
        icon: '🔄',
        style: {
          borderRadius: '10px',
          background: darkMode ? '#1E293B' : '#FFF',
          color: darkMode ? '#FFF' : '#0F172A',
        },
      });
      
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
          toast.error("Failed to save message to database");
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
      toast.error("Failed to generate asker response");
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
          toast.error("Failed to save message to database");
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
      toast.error("Failed to generate responder message");
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
      const askerPersona = data?.personalities?.personality_pair.split(" × ")[0];
      const responderPersona = data?.personalities?.personality_pair.split(" × ")[1];
      
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
    
    toast.success("Conversation paused", {
      icon: '⏸️',
      style: {
        borderRadius: '10px',
        background: darkMode ? '#1E293B' : '#FFF',
        color: darkMode ? '#FFF' : '#0F172A',
      },
    });
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

  // Format date for conversation history
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within last 7 days
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      const options = { weekday: 'long' };
      return date.toLocaleDateString(undefined, options);
    }
    
    // Default format
    return date.toLocaleDateString();
  };

  // Toggle history panel
  const toggleHistoryPanel = () => {
    setShowHistoryPanel(!showHistoryPanel);
  };

  // Update the Typing component with a more vibrant appearance
  const Typing = ({ darkMode, color = null }) => {
    const dotColor = color || (darkMode ? '#D0C4FF' : '#4C4CFF');
    
    return (
      <div className="flex items-center space-x-1">
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0 }}
          style={{ 
            backgroundColor: dotColor,
            boxShadow: `0 0 5px ${dotColor}`
          }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
          style={{ 
            backgroundColor: dotColor,
            boxShadow: `0 0 5px ${dotColor}`
          }}
        />
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
          style={{ 
            backgroundColor: dotColor,
            boxShadow: `0 0 5px ${dotColor}`
          }}
        />
      </div>
    );
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const mobileDrawerVariants = {
    hidden: { x: '-100%' },
    visible: { x: 0 },
    exit: { x: '-100%' }
  };

  const floatingButtonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.1, boxShadow: '0 8px 16px rgba(76, 76, 255, 0.3)' }
  };

  return (
    <motion.div
      className="flex flex-col h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b transition-colors duration-300"
        style={{ borderColor: theme.border }}>
        <div className="flex items-center space-x-3">
          {isHistoryPanelMobile && (
            <button 
              onClick={toggleHistoryPanel}
              className="mr-3 p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
              style={{ 
                backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
                color: darkMode ? '#D0C4FF' : '#4C4CFF'
              }}
            >
              {showHistoryPanel ? (
                <ArrowLeft size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
              ) : (
                <MessageSquare size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
              )}
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <TwinoLogo darkMode={darkMode} />
            <h1 className="text-xl font-bold tracking-tight">Twino</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetConversation}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
              color: darkMode ? '#D0C4FF' : '#4C4CFF'
            }}
            title="Reset conversation"
          >
            <RefreshCw size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
              color: darkMode ? '#D0C4FF' : '#4C4CFF'
            }}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
            ) : (
              <Moon size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="hidden md:flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
              color: darkMode ? '#D0C4FF' : '#4C4CFF'
            }}
            title="Return to main page"
          >
            <ArrowLeft size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
          </motion.button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* History Panel (Collapsible) */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.div 
              className="w-64 lg:w-80 border-r flex flex-col overflow-hidden transition-colors duration-300 z-10"
              style={{ 
                borderColor: theme.border,
                position: isHistoryPanelMobile ? 'absolute' : 'relative',
                height: isHistoryPanelMobile ? '100%' : 'auto',
                top: 0,
                left: 0,
                bottom: 0,
                backgroundColor: theme.bg
              }}
              variants={isHistoryPanelMobile ? mobileDrawerVariants : {}}
              initial={isHistoryPanelMobile ? "hidden" : { x: 0, opacity: 1 }}
              animate="visible"
              exit={isHistoryPanelMobile ? "exit" : { x: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="p-4 border-b transition-colors duration-300"
                style={{ borderColor: theme.border }}>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                    style={{ color: isSearchFocused ? '#4C4CFF' : theme.subText }} />
                  <input 
                    type="text"
                    placeholder="Search conversations"
                    className="w-full py-2 pl-9 pr-3 rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: darkMode ? 'rgba(53, 59, 84, 0.6)' : '#F5F5F5',
                      borderColor: isSearchFocused ? '#4C4CFF' : (darkMode ? '#404969' : '#C0C0C0'),
                      color: theme.text,
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                      focusVisible: { ringColor: '#4C4CFF' }
                    }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {/* Recent Conversations List */}
                {isHistoryLoading ? (
                  // Show skeleton loaders while loading
                  <>
                    <ConversationSkeleton darkMode={darkMode} />
                    <ConversationSkeleton darkMode={darkMode} />
                    <ConversationSkeleton darkMode={darkMode} />
                  </>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.id}
                      whileHover={{ x: 3 }}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => router.push(`${conv.id}`)}
                      className={`cursor-pointer p-3 rounded-lg transition-colors duration-200 flex items-center justify-between relative ${
                        conv.id === uid ? 'pl-4' : 'pl-3'
                      }`}
                      style={{ 
                        backgroundColor: conv.id === uid 
                          ? (darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.05)') 
                          : 'transparent'
                      }}
                    >
                      {conv.id === uid && (
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ 
                          backgroundColor: darkMode ? '#D0C4FF' : '#4C4CFF',
                          borderRadius: '0.25rem 0 0 0.25rem'
                        }}></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: theme.text }}>
                          {conv.generated_title || conv.subject || "Untitled Conversation"}
                        </p>
                        <p className="text-xs truncate" style={{ color: theme.subText }}>
                          {formatDate(conv.created_at)}
                        </p>
                      </div>
                      <ChevronRight size={16} style={{ color: theme.subText }} />
                    </motion.div>
                  ))
                ) : searchText ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Search size={32} style={{ color: theme.subText }} className="mb-2 opacity-60" />
                    <p className="text-center" style={{ color: theme.subText }}>
                      No conversations matching "{searchText}"
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MessageSquare size={32} style={{ color: theme.subText }} className="mb-2 opacity-60" />
                    <p className="text-center" style={{ color: theme.subText }}>
                      No recent conversations
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t transition-colors duration-300"
                style={{ borderColor: theme.border }}>
                {isSignedIn && userData && (
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2">
                      {userData.imageUrl ? (
                        <img 
                          src={userData.imageUrl}
                          alt={userData.fullName || userData.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{ 
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            color: theme.text
                          }}
                        >
                          {getInitials(userData.fullName || userData.username || "User")}
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[120px]">
                        {userData.fullName || userData.username || "User"}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => router.push("/sign-out")}
                      className="p-2 rounded-full transition-colors duration-200 hover:bg-opacity-10"
                      style={{ 
                        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                      }}
                      title="Sign out"
                    >
                      <LogOut size={16} color={theme.text} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Floating button for mobile to open conversation history */}
          {isHistoryPanelMobile && !showHistoryPanel && (
            <motion.button
              className="absolute bottom-20 right-4 p-3 rounded-full z-20 shadow-lg"
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(135deg, #4C4CFF, #3939CC)' 
                  : 'linear-gradient(135deg, #5C5CFF, #4C4CFF)',
                boxShadow: '0 4px 10px rgba(76, 76, 255, 0.3)'
              }}
              onClick={toggleHistoryPanel}
              variants={floatingButtonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            >
              <MessageSquare size={24} color="#FFFFFF" />
            </motion.button>
          )}
          
          {/* Mobile overlay when drawer is open */}
          {isHistoryPanelMobile && showHistoryPanel && (
            <motion.div 
              className="fixed inset-0 bg-black z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleHistoryPanel}
            />
          )}
          
          {/* Chat Info Bar */}
          <div className="flex items-center justify-between p-4 border-b transition-colors duration-300 bg-opacity-80"
            style={{ 
              borderColor: theme.border,
              backgroundColor: darkMode ? 'rgba(16, 42, 67, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(8px)'
            }}>
            <div className="flex items-center">
              {!isHistoryPanelMobile && (
                <button 
                  onClick={toggleHistoryPanel}
                  className="mr-3 p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
                  style={{ 
                    backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
                    color: darkMode ? '#D0C4FF' : '#4C4CFF'
                  }}
                >
                  {showHistoryPanel ? (
                    <ArrowLeft size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                  ) : (
                    <MessageSquare size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                  )}
                </button>
              )}
              
              <div>
                <h2 className="font-bold text-lg truncate max-w-xs md:max-w-md">
                  {selectedTopic || "Untitled Conversation"}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm" style={{ color: theme.subText }}>
                    {selectedPersonality}
                  </span>
                  <Sparkles size={14} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isConversationOwner ? (
                isConversationActive ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: darkMode ? colors.darkMode.errorBg : colors.lightMode.errorBg,
                      color: '#FFFFFF'
                    }}
                    title="Pause"
                  >
                    <Pause size={16} />
                    <span className="text-sm font-medium">Pause</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinue}
                    className="flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg transition-colors duration-200"
                    style={{ 
                      backgroundColor: darkMode ? colors.darkMode.successBg : colors.lightMode.successBg,
                      color: '#FFFFFF'
                    }}
                    title="Continue"
                  >
                    <Play size={16} />
                    <span className="text-sm font-medium">Continue</span>
                  </motion.button>
                )
              ) : (
                <div className="px-3 py-1.5 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  style={{ 
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    color: theme.subText
                  }}
                >
                  <Square size={14} />
                  <span className="text-sm font-medium">View only</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto py-6 px-4 md:px-6 space-y-6 scroll-smooth"
          >
            {isConversationLoading ? (
              // Show skeletons while loading
              <>
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
                <MessageSkeleton isAsker={false} darkMode={darkMode} />
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
              </>
            ) : (
              // Show actual messages when loaded
              conversation.map((message, index) => {
                const isAsker = message.sender === data?.personalities?.personality_pair.split(" × ")[0];
                const isUser = !isAsker;
                
                return (
                  <motion.div
                    key={index}
                    className={`flex ${isAsker ? "justify-start" : "justify-end"}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: Math.min(index * 0.1, 0.5) }}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isAsker ? "mr-auto" : "ml-auto"}`}>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span className="text-xs" style={{ color: theme.subText }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        <GlassEffect darkMode={darkMode} active={true} isAsker={isAsker} isResponder={!isAsker}>
                          <div 
                            className="p-3 rounded-xl whitespace-pre-wrap"
                            style={{ 
                              color: darkMode 
                                ? (isAsker ? "#FFFFFF" : "#FFFFFF") 
                                : (isAsker ? "#2A324B" : "#2A324B")
                            }}
                          >
                            {message.message}
                          </div>
                        </GlassEffect>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            
            {/* Thinking Indicator */}
            {thinkingPersona && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-[85%] md:max-w-[70%] lg:max-w-[60%] mr-auto">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-sm">{thinkingPersona}</span>
                    
                    <GlassEffect darkMode={darkMode} isAsker={thinkingPersona === data?.personalities?.personality_pair.split(" × ")[0]}>
                      <div 
                        className="p-3 rounded-xl whitespace-pre-wrap"
                      >
                        <div className="flex items-center space-x-2">
                          <Typing darkMode={darkMode} color={darkMode ? '#D0C4FF' : '#4C4CFF'} />
                          <span style={{ color: theme.subText }}>Thinking...</span>
                        </div>
                      </div>
                    </GlassEffect>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Reading Indicator */}
            {readingPersona && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-[85%] md:max-w-[70%] lg:max-w-[60%] mr-auto">
                  <div className="flex flex-col space-y-1">
                    <span className="font-medium text-sm">{readingPersona}</span>
                    
                    <GlassEffect darkMode={darkMode} isAsker={readingPersona === data?.personalities?.personality_pair.split(" × ")[0]}>
                      <div 
                        className="p-3 rounded-xl whitespace-pre-wrap"
                      >
                        <div className="flex items-center space-x-2">
                          <PulseEffect 
                            active={true} 
                            color={darkMode ? '#D0C4FF' : '#4C4CFF'} 
                            size="small" 
                          />
                          <span style={{ color: theme.subText }}>
                            {getRandomReadingText(readingPersona === data?.personalities?.personality_pair.split(" × ")[0])}
                          </span>
                        </div>
                      </div>
                    </GlassEffect>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t transition-colors duration-300"
            style={{ borderColor: theme.border }}>
            {isConversationOwner ? (
              <form onSubmit={handleCustomQuestionSubmit} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 p-3 rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: darkMode ? 'rgba(53, 59, 84, 0.6)' : '#F5F5F5',
                    borderColor: theme.border,
                    color: theme.text,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                    focusVisible: { ringColor: '#4C4CFF' }
                  }}
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  disabled={isSendingQuestion}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-3 rounded-lg transition-all duration-200"
                  style={{ 
                    background: customQuestion.trim() 
                      ? (darkMode ? 'linear-gradient(135deg, #4C4CFF, #3939CC)' : 'linear-gradient(135deg, #5C5CFF, #4C4CFF)')
                      : (darkMode ? 'rgba(208, 196, 255, 0.3)' : 'rgba(192, 192, 192, 0.3)'),
                    color: customQuestion.trim() ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#2A324B'),
                    opacity: (thinkingPersona || readingPersona || isSendingQuestion) ? 0.6 : 1,
                    boxShadow: customQuestion.trim() 
                      ? '0 4px 10px rgba(76, 76, 255, 0.3)' 
                      : 'none'
                  }}
                  disabled={!customQuestion.trim() || thinkingPersona || readingPersona || isSendingQuestion}
                >
                  {isSendingQuestion ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                </motion.button>
              </form>
            ) : (
              <div className="p-4 rounded-lg bg-opacity-50"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(53, 59, 84, 0.3)' : 'rgba(245, 245, 245, 0.8)',
                  borderLeft: `4px solid ${darkMode ? '#D0C4FF' : '#4C4CFF'}`,
                  color: theme.text
                }}
              >
                <p className="text-sm flex items-center">
                  <Clock className="inline-block mr-2" size={16} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                  This conversation was created by another user. You can view it but cannot contribute.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
  
}