"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import { 
  ArrowLeft, RefreshCw, Moon, Sun, Sparkles, 
  Pause, Play, MessageSquare, Square, 
  Clock, Search, LogOut, ChevronRight,
  Send, Mic, Paperclip, Smile, 
  Download, Share2, Bookmark, Copy, ThumbsUp,
  ThumbsDown, MoreHorizontal, Volume2, VolumeX,
  AlertCircle, CheckCircle, Info, Settings
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";
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
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress";
// Enhanced Twino logo SVG with animated paths

// Enhanced glass effect component with reactive animations
const GlassEffect = ({ children, active = false, darkMode = false, blur = 8, opacity = 0.7, isAsker = false, isResponder = false }) => {
  let bgColor = darkMode 
    ? `rgba(35, 42, 63, ${active ? opacity + 0.1 : opacity})` 
    : `rgba(255, 255, 255, ${active ? opacity + 0.1 : opacity})`;
  
  let borderColor = darkMode
    ? `1px solid rgba(92, 92, 255, 0.15)`
    : `1px solid rgba(226, 232, 240, 0.8)`;
    
  let gradientBg = null;

  // Apply special styling for message bubbles
  if (isAsker) {
    bgColor = darkMode 
      ? `rgba(47, 58, 87, ${opacity})` // Darker shade of primary 
      : `rgba(241, 245, 249, ${opacity})`; // Light gray
    borderColor = darkMode
      ? `1px solid rgba(92, 92, 255, 0.2)` // Action color border
      : `1px solid rgba(92, 92, 255, 0.15)`;
    gradientBg = darkMode
      ? `linear-gradient(135deg, rgba(47, 58, 87, ${opacity}), rgba(92, 92, 255, 0.2))`
      : `linear-gradient(135deg, rgba(241, 245, 249, ${opacity}), rgba(208, 196, 255, 0.3))`;
  } else if (isResponder) {
    bgColor = darkMode 
      ? `rgba(92, 92, 255, ${opacity - 0.3})` // Action color with opacity
      : `rgba(208, 196, 255, ${opacity - 0.1})`; // Highlight color with opacity
    borderColor = darkMode
      ? `1px solid rgba(138, 127, 255, 0.3)` // Highlight color border
      : `1px solid rgba(92, 92, 255, 0.2)`;
    gradientBg = darkMode
      ? `linear-gradient(135deg, rgba(92, 92, 255, 0.4), rgba(50, 50, 155, 0.5))`
      : `linear-gradient(135deg, rgba(208, 196, 255, 0.6), rgba(92, 92, 255, 0.2))`;
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
      bg: "#171E2E",         // Darker background for better contrast
      surface: "#232A3F",    // Slightly lighter shade of primary
      surfaceAlt: "#2F3A57", // Even lighter shade of primary
      text: "#FFFFFF",
      bubbleBotBg: "rgba(45, 51, 75, 0.75)",  // Adjusted primary with opacity
      responderBubbleBg: "rgba(92, 92, 255, 0.25)", // Action color with opacity
      bubbleUserBg: "rgba(208, 196, 255, 0.25)", // Highlight with opacity
      buttonBg: "#5C5CFF",   // Brighter action color
      buttonHoverBg: "#4949DD", // Darker action color
      border: "#2F3A57",     // Lighter primary
      subText: "#A0A0C0",    // Lighter text with purple tint
      accent: "#8A7FFF",     // Brighter highlight
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
    lightMode: {
      bg: "#F8FAFC",         // Slightly off-white for better eye comfort
      surface: "#FFFFFF",
      surfaceAlt: "#F1F5F9",
      text: "#1E293B",       // Slightly softer than pure black
      bubbleBotBg: "#F1F5F9",
      responderBubbleBg: "rgba(92, 92, 255, 0.15)", // Action color with opacity
      bubbleUserBg: "rgba(208, 196, 255, 0.2)", // Highlight with opacity
      buttonBg: "#5C5CFF",   // Brighter action color
      buttonHoverBg: "#4949DD", // Darker action color
      border: "#E2E8F0",
      subText: "#64748B",    // Slightly darker than medium gray for better contrast
      accent: "#5C5CFF",
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
  const [userCredits, setUserCredits] = useState([]);

  // Add loading state variables
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);

  // New enhanced UI/UX state variables
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageActions, setMessageActions] = useState({ visible: false, index: null });
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatZoom, setChatZoom] = useState(1);
  const [messageCopied, setMessageCopied] = useState(null);
  const [notificationSound, setNotificationSound] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  // Animation controls
  const scrollButtonControls = useAnimation();
  const messageInputControls = useAnimation();
  const headerControls = useAnimation();
  
  // Additional refs
  const messageEndRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const attachmentOptionsRef = useRef(null);



    // تحميل بيانات المستخدم من قاعدة البيانات
    // useEffect(() => {
    //   if (!isLoaded || !isSignedIn) return; 
      
    //   async function fetchUserData() {
    //     try {
    //       const { data, error } = await supabase
    //         .from('users')
    //         .select('*')
    //         .eq('id', user.id)
    //         .single();
          
    //       if (error) {
    //         console.error('Error fetching user data:', error);
    //         toast.error('Failed to load user data');
    //         return;
    //       }
          
    //       setUserDataDb(data);
    //       toast.success('User data loaded successfully');
    //     } catch (err) {
    //       console.error('Unexpected error:', err);
    //       toast.error('An error occurred while loading user data');
    //     }
    //   }
      
    //   fetchUserData();
    // }, [isLoaded, isSignedIn, user?.id, supabase]);

    useEffect(() => {
      if (!user?.id) return;

      async function fetchUserCredits() {
        try {
          const { data, error } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user credits:', error);
            toast.error('Failed to load user credits');
            return;
          }
          
          setUserCredits(data);
          console.log('User credits:', data);
          // toast.success('User credits loaded successfully');
        } catch (err) {
          console.error('Unexpected error:', err);
          toast.error('An error occurred while loading user credits');
        }
      }
      
      fetchUserCredits();
    }, [user?.id, supabase]);

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

  // New utility functions for enhanced features
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior });
    } else if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setShowScrollToBottom(!isAtBottom);
    
    if (isAtBottom && unreadMessages > 0) {
      setUnreadMessages(0);
      setLastReadTimestamp(new Date().toISOString());
    }
    
    // Show/hide header on scroll
    if (scrollTop > 100) {
      headerControls.start({ opacity: 0.7, height: "auto" });
    } else {
      headerControls.start({ opacity: 1, height: "auto" });
    }
    
    // Detect if user is actively scrolling
    if (!isScrolling) {
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 1000);
    }
  }, [unreadMessages, isScrolling, headerControls]);

  const playNotificationSound = useCallback(() => {
    if (!notificationSound || !audioRef.current) return;
    audioRef.current.play().catch(err => console.error("Failed to play notification sound:", err));
  }, [notificationSound]);

  const handleEmojiSelect = emoji => {
    setCustomQuestion(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const togglePinMessage = useCallback((index) => {
    setPinnedMessages(prev => {
      const messageIndex = prev.findIndex(pin => pin.index === index);
      if (messageIndex >= 0) {
        return prev.filter(pin => pin.index !== index);
      } else {
        return [...prev, { index, timestamp: new Date().toISOString() }];
      }
    });
    
    toast.success(
      pinnedMessages.some(pin => pin.index === index) 
        ? "Message unpinned" 
        : "Message pinned", 
      { icon: pinnedMessages.some(pin => pin.index === index) ? '📌' : '📍' }
    );
  }, [pinnedMessages, toast]);

  const handleReaction = useCallback((index, reaction) => {
    setMessageReactions(prev => {
      const currentReactions = prev[index] || [];
      
      // Toggle reaction if already exists
      if (currentReactions.includes(reaction)) {
        return {
          ...prev,
          [index]: currentReactions.filter(r => r !== reaction)
        };
      } else {
        return {
          ...prev,
          [index]: [...currentReactions, reaction]
        };
      }
    });
  }, []);

  const copyMessageToClipboard = useCallback((message) => {
    navigator.clipboard.writeText(message).then(() => {
      setMessageCopied(message);
      setTimeout(() => setMessageCopied(null), 2000);
      toast.success("Copied to clipboard", { position: "bottom-right" });
    }).catch(err => {
      console.error("Failed to copy message:", err);
      toast.error("Failed to copy message", { position: "bottom-right" });
    });
  }, [toast]);

  const toggleSpeech = useCallback((message) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    };
    
    // Get available voices and set a good one if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a good voice
      const preferredVoice = voices.find(voice => 
        voice.name.includes("Google") || 
        voice.name.includes("Premium") || 
        voice.name.includes("Enhanced")
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, toast]);

  const handleVoiceInput = useCallback(() => {
    if (!navigator.mediaDevices || !window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Voice input is not supported in your browser");
      return;
    }
    
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        setIsRecording(true);
        toast.success("Listening...", { icon: '🎤' });
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCustomQuestion(transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        toast.error(`Speech recognition error: ${event.error}`);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } catch (error) {
      console.error("Speech recognition error:", error);
      toast.error("Failed to start voice input");
      setIsRecording(false);
    }
  }, [toast]);

  const shareConversation = useCallback(() => {
    
    // Generate a shareable link
    const shareableLink = `${window.location.origin}/chat/${uid}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: selectedTopic || "Twino Chat",
        text: `Check out this interesting conversation about ${selectedTopic || "various topics"}`,
        url: shareableLink,
      }).catch(err => {
        console.error("Share failed:", err);
        copyMessageToClipboard(shareableLink);
      });
    } else {
      // Fallback to copying the link
      copyMessageToClipboard(shareableLink);
    }
  }, [uid, selectedTopic, copyMessageToClipboard]);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Failed to enter fullscreen mode:", err);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  }, []);

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
      
      {/* Hidden audio element for notifications */}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Header */}
      <motion.header 
        className="flex items-center justify-between p-4 border-b transition-colors duration-300 sticky top-0 z-10"
        style={{ 
          borderColor: theme.border,
          backgroundColor: darkMode ? 'rgba(23, 30, 46, 0.85)' : 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(10px)'
        }}
        animate={headerControls}
        initial={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-3">
          {isHistoryPanelMobile && (
            <button 
              onClick={toggleHistoryPanel}
              className="mr-3 p-2 rounded-full transition-all duration-200 hover:bg-opacity-20 hover:scale-105 active:scale-95"
              style={{ 
                backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
                color: darkMode ? '#8A7FFF' : '#5C5CFF'
              }}
            >
              {showHistoryPanel ? (
                <ArrowLeft size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
              ) : (
                <MessageSquare size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
              )}
            </button>
          )}
          
          <div className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <Image src="/twino.png" alt="Twino Logo" className="w-8 h-8 rounded-full" width={32} height={32} />
            </motion.div>
            <motion.h1 
              className="text-xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Twino
            </motion.h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Share button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button  
                  className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
                  style={{ 
                    backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
                    color: darkMode ? '#8A7FFF' : '#5C5CFF'
                  }} variant="outline"><Share2 size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} /></button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Share this conversation</AlertDialogTitle>
                <AlertDialogDescription>
                  Anyone with the link will be able to view this entire conversation about 
                  &quot;{selectedTopic}&quot;. The shared link will display all messages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  style={{ backgroundColor: darkMode ? '#8A7FFF' : '#5C5CFF' }} 
                  onClick={shareConversation}>
                  Generate Link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          {/* Toggle notification sound */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationSound(!notificationSound)}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
              color: darkMode ? '#8A7FFF' : '#5C5CFF'
            }}
            title={notificationSound ? "Mute notifications" : "Unmute notifications"}
          >
            {notificationSound ? (
              <Volume2 size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
            ) : (
              <VolumeX size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
            )}
          </motion.button>
          
          {/* Reset conversation button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetConversation}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
              color: darkMode ? '#8A7FFF' : '#5C5CFF'
            }}
            title="Reset conversation"
          >
            <RefreshCw size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
          </motion.button>
          
          {/* Toggle dark mode */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: darkMode ? -15 : 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
              color: darkMode ? '#8A7FFF' : '#5C5CFF'
            }}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <Sun size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
            ) : (
              <Moon size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
            )}
          </motion.button>
          
          {/* Toggle fullscreen */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullScreen}
            className="hidden md:flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
              color: darkMode ? '#8A7FFF' : '#5C5CFF'
            }}
            title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Square size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
          </motion.button>
          
          {/* Return to main page */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="hidden md:flex items-center justify-center p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
            style={{ 
              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.15)' : 'rgba(92, 92, 255, 0.1)',
              color: darkMode ? '#8A7FFF' : '#5C5CFF'
            }}
            title="Return to main page"
          >
            <ArrowLeft size={18} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
          </motion.button>
        </div>
      </motion.header>
      
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
              
               <div className="p-3 border-t  transition-colors duration-300"
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
                      className="text-xs opacity-70 hover:opacity-100"
                    >
                      Sign out
                    </button>
                    
                  </div>
                )}
              </div>
              <div className="flex w-full border-t rounded-md items-center p-3 justify-between transition-colors duration-300" style={{ borderColor: theme.border }}>
                <button
                  onClick={() => router.push("/credits")}
                  className="text-xs px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                >
                  Credits
                </button>
                <div className="flex-1 mx-3">
                  <Progress value={userCredits.credits || 90} className="h-2 w-full" />
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  
                    <span>{userCredits.credits || 90}</span>
                    <span>{userCredits.credits || 10000 }</span>
                  </div>
                </div>
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
              backgroundColor: darkMode ? 'rgba(16, 42, 67, 0.6)' : 'rgba(248, 250, 252, 0.8)',
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
            onScroll={handleScroll}
          >
            {/* Pinned messages section */}
            <AnimatePresence>
              {pinnedMessages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <GlassEffect darkMode={darkMode} blur={12}>
                    <div className="p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium flex items-center">
                          <Bookmark size={14} className="mr-2" style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                          Pinned Messages ({pinnedMessages.length})
                        </h3>
                        <button 
                          onClick={() => setPinnedMessages([])}
                          className="text-xs opacity-70 hover:opacity-100"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {pinnedMessages.map((pin) => {
                          const message = conversation[pin.index];
                          if (!message) return null;
                          
                          return (
                            <div key={`pin-${pin.index}`} className="flex items-start space-x-2 text-sm p-2 rounded-lg" 
                              style={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)',
                                    color: darkMode ? '#D0C4FF' : '#4C4CFF'
                                  }}
                                >
                                  {getInitials(message.sender)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{message.message}</p>
                              </div>
                              <button 
                                onClick={() => togglePinMessage(pin.index)}
                                className="flex-shrink-0 opacity-70 hover:opacity-100"
                              >
                                <Bookmark size={12} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF', fill: 'currentColor' }} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </GlassEffect>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Messages */}
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
                const isPinned = pinnedMessages.some(pin => pin.index === index);
                const reactions = messageReactions[index] || [];
                
                return (
                  <motion.div
                    key={index}
                    className={`flex ${isAsker ? "justify-start" : "justify-end"}`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: Math.min(index * 0.1, 0.5) }}
                    onMouseEnter={() => setMessageActions({ visible: true, index })}
                    onMouseLeave={() => setMessageActions({ visible: false, index: null })}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isAsker ? "mr-auto" : "ml-auto"} relative group`}>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span className="text-xs" style={{ color: theme.subText }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {/* Pin indicator */}
                          {isPinned && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 flex items-center justify-center"
                            >
                              <Bookmark size={12} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF', fill: 'currentColor' }} />
                            </motion.div>
                          )}
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
                            
                            {/* Message copied indicator */}
                            {messageCopied === message.message && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="text-xs mt-2 flex items-center justify-center"
                                style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }}
                              >
                                <CheckCircle size={12} className="mr-1" />
                                Copied to clipboard
                              </motion.div>
                            )}
                          </div>
                        </GlassEffect>
                        
                        {/* Message reactions */}
                        {reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {reactions.map((reaction, i) => (
                              <motion.div
                                key={`${index}-${reaction}-${i}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 py-1 rounded-full text-xs"
                                style={{ 
                                  backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.15)' : 'rgba(76, 76, 255, 0.1)',
                                  color: darkMode ? '#D0C4FF' : '#4C4CFF'
                                }}
                              >
                                {reaction}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Message actions */}
                      <AnimatePresence>
                        {messageActions.visible && messageActions.index === index && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -bottom-10 left-0 right-0 flex justify-center space-x-1"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => copyMessageToClipboard(message.message)}
                              title="Copy message"
                            >
                              <Copy size={14} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => togglePinMessage(index)}
                              title={isPinned ? "Unpin message" : "Pin message"}
                            >
                              <Bookmark size={14} style={{ 
                                color: darkMode ? '#D0C4FF' : '#4C4CFF',
                                fill: isPinned ? 'currentColor' : 'transparent'
                              }} />
                            </motion.button>
                            
                            {/* <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => toggleSpeech(message.message)}
                              title={isSpeaking ? "Stop speaking" : "Speak message"}
                            >
                              <Volume2 size={14} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                            </motion.button> */}
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => handleReaction(index, '👍')}
                              title="React with thumbs up"
                            >
                              <ThumbsUp size={14} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full"
                              style={{ 
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => handleReaction(index, '❤️')}
                              title="React with heart"
                            >
                              <span className="text-sm">❤️</span>
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
            
            {/* Invisible element for scrolling to bottom */}
            <div ref={messageEndRef} />
          </div>
          
          {/* Input Area */}
          <motion.div 
            className="p-4 border-t transition-colors duration-300 relative"
            style={{ 
              borderColor: theme.border,
              backgroundColor: darkMode ? 'rgba(23, 30, 46, 0.9)' : 'rgba(248, 250, 252, 0.9)',
              backdropFilter: 'blur(8px)'
            }}
            animate={messageInputControls}
            initial={{ y: 0 }}
          >
            {isConversationOwner ? (
              <form onSubmit={handleCustomQuestionSubmit} className="relative">
                <div className="flex space-x-2">
                  {/* Attachment button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-lg transition-colors duration-200 flex-shrink-0"
                    style={{ 
                      backgroundColor: darkMode ? 'rgba(47, 58, 87, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                      color: theme.subText,
                      border: `1px solid ${darkMode ? 'rgba(92, 92, 255, 0.1)' : 'rgba(226, 232, 240, 0.8)'}`
                    }}
                    onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                    disabled={isSendingQuestion}
                    title="Add attachments"
                  >
                    <Paperclip size={20} />
                  </motion.button>
                  
                  {/* Main input field */}
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ask a question..."
                      className="w-full p-3 pr-24 rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        backgroundColor: darkMode ? 'rgba(47, 58, 87, 0.7)' : 'rgba(241, 245, 249, 0.8)',
                        borderColor: darkMode ? 'rgba(92, 92, 255, 0.2)' : 'rgba(226, 232, 240, 0.8)',
                        color: theme.text,
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                        focusVisible: { ringColor: darkMode ? '#8A7FFF' : '#5C5CFF' }
                      }}
                      value={customQuestion}
                      onChange={(e) => {
                        setCustomQuestion(e.target.value);
                        
                        // Show typing indicator
                        setIsTyping(true);
                        
                        // Clear previous timeout
                        if (typingTimeout) {
                          clearTimeout(typingTimeout);
                        }
                        
                        // Set new timeout to hide typing indicator after 1 second
                        const newTimeout = setTimeout(() => {
                          setIsTyping(false);
                        }, 1000);
                        
                        setTypingTimeout(newTimeout);
                      }}
                      disabled={isSendingQuestion || thinkingPersona || readingPersona}
                    />
                    
                    {/* Input actions */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {/* Emoji picker button */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-full"
                        style={{ 
                          color: theme.subText,
                          opacity: showEmojiPicker ? 1 : 0.7
                        }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        disabled={isSendingQuestion}
                      >
                        <Smile size={18} />
                      </motion.button>
                      
                      {/* Voice input button */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1.5 rounded-full"
                        style={{ 
                          color: isRecording ? (darkMode ? '#8A7FFF' : '#5C5CFF') : theme.subText,
                          opacity: isRecording ? 1 : 0.7
                        }}
                        onClick={handleVoiceInput}
                        disabled={isSendingQuestion || isRecording}
                      >
                        <Mic size={18} />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Send button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-3 rounded-lg transition-all duration-200 flex-shrink-0"
                    style={{ 
                      background: customQuestion.trim() 
                        ? (darkMode ? 'linear-gradient(135deg, #5C5CFF, #4949DD)' : 'linear-gradient(135deg, #5C5CFF, #4949DD)')
                        : (darkMode ? 'rgba(92, 92, 255, 0.3)' : 'rgba(192, 192, 192, 0.3)'),
                      color: customQuestion.trim() ? '#FFFFFF' : (darkMode ? '#FFFFFF' : '#2A324B'),
                      opacity: (thinkingPersona || readingPersona || isSendingQuestion) ? 0.6 : 1,
                      boxShadow: customQuestion.trim() 
                        ? '0 4px 10px rgba(92, 92, 255, 0.3)' 
                        : 'none'
                    }}
                    disabled={!customQuestion.trim() || thinkingPersona || readingPersona || isSendingQuestion}
                  >
                    {isSendingQuestion ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send size={20} />
                    )}
                  </motion.button>
                </div>
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="absolute -top-6 left-4 text-xs" style={{ color: theme.subText }}>
                    Typing...
                  </div>
                )}
                
                {/* Emoji picker dropdown */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      ref={emojiPickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 right-0 z-10 rounded-lg shadow-lg overflow-hidden"
                      style={{ 
                        backgroundColor: darkMode ? 'rgba(35, 42, 63, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${darkMode ? 'rgba(92, 92, 255, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <div className="p-2 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                        {['😊', '👍', '❤️', '🎉', '🔥', '👏', '🤔', '😂', 
                          '🙌', '✨', '🚀', '👀', '🙏', '💯', '👋', '🤩',
                          '😍', '🥳', '🤗', '🧠', '💡', '⭐', '💪', '🌟'].map(emoji => (
                          <motion.button
                            key={emoji}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-opacity-10"
                            style={{ 
                              backgroundColor: darkMode ? 'rgba(92, 92, 255, 0.1)' : 'rgba(92, 92, 255, 0.1)'
                            }}
                            onClick={() => handleEmojiSelect({ native: emoji })}
                          >
                            <span className="text-lg">{emoji}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Attachment options dropdown */}
                <AnimatePresence>
                  {showAttachmentOptions && (
                    <motion.div
                      ref={attachmentOptionsRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full mb-2 left-0 z-10 rounded-lg shadow-lg overflow-hidden"
                      style={{ 
                        backgroundColor: darkMode ? 'rgba(35, 42, 63, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${darkMode ? 'rgba(92, 92, 255, 0.2)' : 'rgba(226, 232, 240, 0.8)'}`,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <div className="p-2 space-y-1 min-w-[150px]">
                        <motion.button
                          type="button"
                          whileHover={{ x: 3 }}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg text-left"
                          style={{ 
                            backgroundColor: 'transparent',
                            color: theme.text
                          }}
                          onClick={() => {
                            toast.info("Image upload coming soon!");
                            setShowAttachmentOptions(false);
                          }}
                        >
                          <Image size={16} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
                          <span>Image</span>
                        </motion.button>
                        
                        <motion.button
                          type="button"
                          whileHover={{ x: 3 }}
                          className="w-full flex items-center space-x-2 p-2 rounded-lg text-left"
                          style={{ 
                            backgroundColor: 'transparent',
                            color: theme.text
                          }}
                          onClick={() => {
                            toast.info("File upload coming soon!");
                            setShowAttachmentOptions(false);
                          }}
                        >
                          <Paperclip size={16} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
                          <span>File</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            ) : (
              <div className="p-4 rounded-lg bg-opacity-50"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(47, 58, 87, 0.5)' : 'rgba(241, 245, 249, 0.8)',
                  borderLeft: `4px solid ${darkMode ? '#8A7FFF' : '#5C5CFF'}`,
                  color: theme.text
                }}
              >
                <p className="text-sm flex items-center">
                  <Clock className="inline-block mr-2" size={16} style={{ color: darkMode ? '#8A7FFF' : '#5C5CFF' }} />
                  This conversation was created by another user. You can view it but cannot contribute.
                </p>
              </div>
            )}
          </motion.div>
          
          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                className="absolute bottom-24 right-4 p-2 rounded-full shadow-lg z-10"
                style={{ 
                  backgroundColor: darkMode ? 'rgba(76, 76, 255, 0.8)' : 'rgba(76, 76, 255, 0.8)',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={() => scrollToBottom()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="flex flex-col items-center">
                  <ChevronRight size={20} className="transform rotate-90" />
                  {unreadMessages > 0 && (
                    <span className="text-xs font-bold">{unreadMessages}</span>
                  )}
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}