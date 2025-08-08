'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  Pause, Play, MessageSquare, Square,
  Send, Mic, 
   Bookmark, Copy
  , CheckCircle, Info, 
  ChevronDown
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from "@clerk/nextjs";

import { Progress } from "@/components/ui/progress";

import { colors, mockReadingTexts, Typing } from '@/lib/helpers.js';
import { ChatHeader } from '@/components/chatComponents/chat-header';
import HistorySidebar from  '@/components/history-sidebar';
// Enhanced glass effect component
const GlassEffect = ({ children, active = false, darkMode = false, blur = 8, opacity = 0.7, isAsker = false, isResponder = false }) => {
  let bgColor = darkMode
    ? `rgba(35, 42, 63, ${active ? opacity + 0.1 : opacity})`
    : `rgba(255, 255, 255, ${active ? opacity + 0.1 : opacity})`;

  let borderColor = darkMode
    ? `1px solid rgba(92, 92, 255, 0.15)`
    : `1px solid rgba(226, 232, 240, 0.8)`;

  let gradientBg = null;

  if (isAsker) {
    bgColor = darkMode
      ? `rgba(47, 58, 87, ${opacity})`
      : `rgba(241, 245, 249, ${opacity})`;
    borderColor = darkMode
      ? `1px solid rgba(92, 92, 255, 0.2)`
      : `1px solid rgba(92, 92, 255, 0.15)`;
    gradientBg = darkMode
      ? `linear-gradient(135deg, rgba(47, 58, 87, ${opacity}), rgba(92, 92, 255, 0.2))`
      : `linear-gradient(135deg, rgba(241, 245, 249, ${opacity}), rgba(208, 196, 255, 0.3))`;
  } else if (isResponder) {
    bgColor = darkMode
      ? `rgba(92, 92, 255, ${opacity - 0.3})`
      : `rgba(208, 196, 255, ${opacity - 0.1})`;
    borderColor = darkMode
      ? `1px solid rgba(138, 127, 255, 0.3)`
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

// Pulse effect for activity visualization
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

// Message skeleton loader
const MessageSkeleton = ({ isAsker = true, darkMode = false }) => {
  return (
    <div className={`flex ${isAsker ? "justify-start" : "justify-end"} mb-6`}>
      <div className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${isAsker ? "mr-auto" : "ml-auto"}`}>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-20 rounded animate-pulse"
              style={{
                backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.2)' : 'rgba(76, 76, 255, 0.1)'
              }}
            />
            <div className="h-3 w-12 rounded animate-pulse"
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

export default function TwinoChat({ params }) {
  const { uid } = React.use(params);
  const router = useRouter();
  const supabase = createClient();

  // Core state
  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [thinkingPersona, setThinkingPersona] = useState(null);
  const [readingPersona, setReadingPersona] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(botPersonalities[0].pair);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [isHistoryPanelMobile, setIsHistoryPanelMobile] = useState(false);
  const chatContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);

  // UI state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const stopRef = useRef(false);
  const hasStartedConversation = useRef(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [userData, setUserData] = useState(null);
  const [lastConversations, setLastConversations] = useState([]);
  const { isLoaded, isSignedIn, user } = useUser();
  const [searchText, setSearchText] = useState("");

  // Enhanced UI state
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [isConversationOwner, setIsConversationOwner] = useState(false);
  const [userCredits, setUserCredits] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageActions, setMessageActions] = useState({ visible: false, index: null });
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Additional UI state
  const [chatZoom, setChatZoom] = useState(1);
  const [messageCopied, setMessageCopied] = useState(null);
  const [notificationSound, setNotificationSound] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [toggleHistoryPanel, setToggleHistoryPanel] = useState(false);

  // Refs and controls
  const messageInputControls = useAnimation();
  const headerControls = useAnimation();
  const messageEndRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const lastScrollPosition = useRef(0);

  // Fetch user credits
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
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error('An error occurred while loading user credits');
      }
    }

    fetchUserCredits();
  }, [user?.id, supabase]);

  // Check mobile view and handle loading
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

    const loadingTimeout = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);

    return () => {
      window.removeEventListener("resize", checkMobileView);
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Theme handling
  useEffect(() => {
    const storedTheme = localStorage?.getItem('theme');
    const prefersDarkMode = window?.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDarkMode)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [timeoutIds]);

  // User authentication handling
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    localStorage.setItem('userId', user.id);
    setUserData(user);
  }, [isLoaded, isSignedIn, user]);

  // Conversation ownership check
  useEffect(() => {
    if (!data) return;

    const currentUserId = localStorage.getItem('userId');
    const isOwner = currentUserId === data.user_id;
    setIsConversationOwner(isOwner);
  }, [data]);

  // Timeout management helper
  const addTimeout = (id) => {
    setTimeoutIds(prev => [...prev, id]);
    return id;
  };

  // Fetch conversation data from database
  useEffect(() => {
    const fetchConversationData = async () => {
      setIsConversationLoading(true);
      try {
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .select("id, user_id, subject, personalities (personality_pair)")
          .eq("id", uid)
          .single();

        if (conversationError) {
          console.error("Error fetching conversation:", conversationError);
          toast.error("Failed to load conversation");
          setIsConversationLoading(false);
          return;
        }

        // Generate title for conversation if not exists
        try {
          const { data: titleData } = await axios.post('/api/generate-title', {
            subject: conversationData.subject,
            personalityPair: conversationData.personalities.personality_pair
          });

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
          .eq("conversation_id", uid);

        if (messagesError) {
          console.error("Error fetching messages:", messagesError);
          toast.error("Failed to load messages");
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
  }, [uid, supabase]);

  // Fetch user conversations for history
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
  }, [isLoaded, isSignedIn, userData, supabase, user?.id]);

  // Filter conversations based on search
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

  // Auto-scroll behavior for new messages
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (isAtBottom && !isScrolling) {
      scrollToBottom('auto');
    } else {
      setShowScrollToBottom(true);
      setUnreadMessages(prev => prev + 1);
    }

    if (isAtBottom) {
      setLastReadTimestamp(new Date().toISOString());
    }
  }, [conversation, thinkingPersona, readingPersona, isScrolling]);

  // Start conversation when data is loaded
  useEffect(() => {
    if (data && !stop && !hasStartedConversation.current && isConversationOwner) {
      hasStartedConversation.current = true;
      startConversation();
    }
  }, [data, stop, isConversationOwner]);

  // Update stop ref when stop state changes
  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  // Handle custom question submission
  const handleCustomQuestionSubmit = async (e) => {
    e.preventDefault();

    if (!isConversationOwner) {
      toast.error("Only the conversation owner can send messages");
      return;
    }

    if (!customQuestion.trim() || thinkingPersona || readingPersona) return;

    setIsSendingQuestion(true);

    const askerPersona = data.personalities.personality_pair.split(" × ")[0];

    const newMessage = {
      sender: askerPersona,
      message: customQuestion,
      timestamp: new Date().toISOString(),
    };

    setConversation(prev => [...prev, newMessage]);

    // Save message to database
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

    setCustomQuestion("");
    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);

    const allMessages = [...conversation, newMessage].map(msg => ({
      sender: msg.sender,
      message: msg.message
    }));

    responder(allMessages);
    setIsSendingQuestion(false);
  };

  const theme = darkMode ? colors.darkMode : colors.lightMode;

  // AI Asker function - generates questions
  const asker = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stopRef.current || !isConversationOwner) return;

    const askerPersona = data.personalities.personality_pair.split(" × ")[0];
    setThinkingPersona(askerPersona);

    try {
      const response = await axios.post("/api/asker", {
        subject: data.subject,
        personalityPair: askerPersona,
        previousMessages,
      });

      const message = response.data.message;

      if (!stopRef.current) {
        setConversation(prev => [
          ...prev,
          {
            sender: askerPersona,
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Save to database
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

        setThinkingPersona(null);

        if (!stopRef.current) {
          const responderPersona = data.personalities.personality_pair.split(" × ")[1];
          setReadingPersona(responderPersona);

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

  // AI Responder function - generates responses
  const responder = async (previousMessages) => {
    if (!data?.subject || !data?.personalities?.personality_pair || stopRef.current || !isConversationOwner) return;

    const responderPersona = data.personalities.personality_pair.split(" × ")[1];
    setThinkingPersona(responderPersona);

    try {
      const response = await axios.post("/api/responder", {
        subject: data.subject,
        personalityPair: responderPersona,
        previousMessage: previousMessages[previousMessages.length - 1],
      });

      const message = response.data.message;

      if (!stopRef.current) {
        setConversation(prev => [
          ...prev,
          {
            sender: responderPersona,
            message: message.message,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Save to database
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

        setThinkingPersona(null);

        if (!stopRef.current) {
          const askerPersona = data.personalities.personality_pair.split(" × ")[0];
          setReadingPersona(askerPersona);

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

  // Start the conversation
  const startConversation = () => {
    if (data?.subject && data?.personalities?.personality_pair && !stopRef.current && isConversationOwner) {
      asker([]);
    }
  };

  // Continue paused conversation
  const handleContinue = () => {
    if (!isConversationOwner) {
      toast.error("Only the conversation owner can continue this conversation");
      return;
    }

    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);

    const previousMessages = conversation.map(msg => ({
      sender: msg.sender,
      message: msg.message
    }));

    if (previousMessages.length > 0) {
      const lastSender = previousMessages[previousMessages.length - 1].sender;
      const askerPersona = data?.personalities?.personality_pair.split(" × ")[0];
      const responderPersona = data?.personalities?.personality_pair.split(" × ")[1];

      if (lastSender === askerPersona) {
        responder(previousMessages);
      } else {
        asker(previousMessages);
      }
    } else {
      startConversation();
    }
  };

  // Stop/pause conversation
  const handleStop = () => {
    if (!isConversationOwner) {
      toast.error("Only the conversation owner can pause this conversation");
      return;
    }

    setStop(true);
    stopRef.current = true;
    setIsConversationActive(false);
    setThinkingPersona(null);
    setReadingPersona(null);

    // Clear all timeouts
    timeoutIds.forEach(id => clearTimeout(id));
    setTimeoutIds([]);

    toast.success("Conversation paused");
  };

  // Utility functions
  const getRandomReadingText = (isAsker) => {
    const texts = isAsker ? mockReadingTexts.asker : mockReadingTexts.responder;
    return texts[Math.floor(Math.random() * texts.length)];
  };



  // Scroll management
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior });
      setShowScrollToBottom(false);
      setUnreadMessages(0);
      setLastReadTimestamp(new Date().toISOString());
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

    if (scrollTop > 100) {
      headerControls.start({ opacity: 0.7, height: "auto" });
    } else {
      headerControls.start({ opacity: 1, height: "auto" });
    }

    if (!isScrolling) {
      setIsScrolling(true);
      setTimeout(() => setIsScrolling(false), 1000);
    }

    lastScrollPosition.current = scrollTop;
  }, [unreadMessages, isScrolling, headerControls]);

  // Message interaction functions
  const copyMessageToClipboard = useCallback((message) => {
    navigator.clipboard.writeText(message).then(() => {
      setMessageCopied(message);
      setTimeout(() => setMessageCopied(null), 2000);
      toast.success("Copied to clipboard");
    }).catch(err => {
      console.error("Failed to copy message:", err);
      toast.error("Failed to copy message");
    });
  }, []);

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
  }, [pinnedMessages]);

  const handleReaction = useCallback((index, reaction) => {
    setMessageReactions(prev => {
      const currentReactions = prev[index] || [];

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
        toast.success("Listening...");
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
  }, []);

  // Animation variants
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
      className="flex mt-20 flex-col h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <HistorySidebar user={user} navLinks={lastConversations} />
      <Toaster position="bottom-right" />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Mobile history panel toggle button */}
          {isHistoryPanelMobile && !showHistoryPanel && (
            <motion.button
              className="absolute bottom-20 right-4 p-3 rounded-full z-20 shadow-lg"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, #4C4CFF, #3939CC)'
                  : 'linear-gradient(135deg, #5C5CFF, #4C4CFF)',
                boxShadow: '0 4px 10px rgba(76, 76, 255, 0.3)'
              }}
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              variants={floatingButtonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ duration: 0.3 }}
            >
              <MessageSquare size={24} color="#FFFFFF" />
            </motion.button>
          )}

          {/* Mobile overlay */}
          {isHistoryPanelMobile && showHistoryPanel && (
            <motion.div
              className="fixed inset-0 bg-black z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryPanel(false)}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b transition-colors duration-300 bg-opacity-80"
            style={{
              borderColor: theme.border,
              backgroundColor: darkMode ? 'rgba(16, 42, 67, 0.6)' : 'rgba(248, 250, 252, 0.8)',
              backdropFilter: 'blur(8px)'
            }}>
            <div className="flex items-center">
              {/* Mobile menu button */}
              {isHistoryPanelMobile && (
                <button
                  onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                  className="mr-3 p-2 rounded-full transition-colors duration-200 hover:bg-opacity-20"
                  style={{
                    backgroundColor: darkMode ? 'rgba(208, 196, 255, 0.1)' : 'rgba(76, 76, 255, 0.1)',
                    color: darkMode ? '#D0C4FF' : '#4C4CFF'
                  }}
                >
                  <MessageSquare size={18} style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                </button>
              )}

              {/* Conversation title */}
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

            {/* Header actions */}
            <div className="flex items-center space-x-3">
              {/* Conversation control buttons */}
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
                    title="Pause conversation"
                  >
                    <Pause size={16} />
                    <span className="text-sm font-medium hidden sm:inline">Pause</span>
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
                    title="Continue conversation"
                  >
                    <Play size={16} />
                    <span className="text-sm font-medium hidden sm:inline">Continue</span>
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
                  <span className="text-sm font-medium hidden sm:inline">View only</span>
                </div>
              )}

              {/* Chat header component */}
              <ChatHeader uid={uid} selectedTopic={selectedTopic} copyMessageToClipboard={copyMessageToClipboard} />
            </div>
          </div>

          {/* Chat messages container */}
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
                        <h3 className="font-medium flex items-center text-sm">
                          <Bookmark size={14} className="mr-2" style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }} />
                          Pinned Messages ({pinnedMessages.length})
                        </h3>
                        <button
                          onClick={() => setPinnedMessages([])}
                          className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: theme.subText }}
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </GlassEffect>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            {isConversationLoading ? (
              <>
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
                <MessageSkeleton isAsker={false} darkMode={darkMode} />
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
              </>
            ) : (
              conversation.map((message, index) => {
                const isAsker = message.sender === data?.personalities?.personality_pair.split(" × ")[0];
                const isPinned = pinnedMessages.some(pin => pin.index === index);

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
                        {/* Message header with sender and timestamp */}
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{message.sender}</span>
                          <span className="text-xs" style={{ color: theme.subText }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
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

                        {/* Message content */}
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
                              className="p-1.5 rounded-full backdrop-blur-sm"
                              style={{
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
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
                              className="p-1.5 rounded-full backdrop-blur-sm"
                              style={{
                                backgroundColor: darkMode ? 'rgba(42, 50, 75, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                              }}
                              onClick={() => togglePinMessage(index)}
                              title={isPinned ? "Unpin message" : "Pin message"}
                            >
                              <Bookmark size={14} style={{ 
                                color: darkMode ? '#D0C4FF' : '#4C4CFF',
                                fill: isPinned ? 'currentColor' : 'none'
                              }} />
                            </motion.button>

                           
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* Thinking/Reading indicators */}
            {(thinkingPersona || readingPersona) && (
              <motion.div
                className="flex justify-start mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="max-w-[85%] md:max-w-[70%] lg:max-w-[60%] mr-auto">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{thinkingPersona || readingPersona}</span>
                    <PulseEffect
                      active={true}
                      color={darkMode ? '#D0C4FF' : '#4C4CFF'}
                      size="small"
                    />
                  </div>
                  <GlassEffect
                    darkMode={darkMode}
                    active={true}
                    isAsker={thinkingPersona === data?.personalities?.personality_pair.split(" × ")[0]}
                    isResponder={thinkingPersona === data?.personalities?.personality_pair.split(" × ")[1]}
                  >
                    <div className="p-3 rounded-xl">
                      {thinkingPersona ? (
                        <Typing darkMode={darkMode} />
                      ) : (
                        <span className="text-sm italic" style={{ color: theme.subText }}>
                          {getRandomReadingText(readingPersona === data?.personalities?.personality_pair.split(" × ")[0])}
                        </span>
                      )}
                    </div>
                  </GlassEffect>
                </div>
              </motion.div>
            )}

            <div ref={messageEndRef} />
          </div>

          {/* Scroll to bottom button */}
          <AnimatePresence>
            {showScrollToBottom && (
              <motion.button
                className="fixed bottom-24 right-4 p-3 rounded-full shadow-lg z-20"
                style={{
                  background: darkMode
                    ? 'linear-gradient(135deg, #4C4CFF, #3939CC)'
                    : 'linear-gradient(135deg, #5C5CFF, #4C4CFF)',
                  boxShadow: '0 4px 10px rgba(76, 76, 255, 0.3)'
                }}
                onClick={() => scrollToBottom()}
                variants={floatingButtonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={24} color="#FFFFFF" />
                {unreadMessages > 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {unreadMessages}
                  </motion.div>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Message input form */}
          {isConversationOwner && (
            <motion.form
              onSubmit={handleCustomQuestionSubmit}
              className="p-4 border-t transition-colors duration-300 relative"
              style={{ borderColor: theme.border }}
              animate={messageInputControls}
              initial={{ opacity: 1 }}
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={isSendingQuestion ? "Sending..." : "Ask a question..."}
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  disabled={isSendingQuestion || thinkingPersona || readingPersona || !isConversationOwner}
                  className="w-full py-3 pl-12 pr-24 rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    backgroundColor: darkMode ? 'rgba(53, 59, 84, 0.6)' : '#F5F5F5',
                    borderColor: darkMode ? '#404969' : '#C0C0C0',
                    color: theme.text,
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={() => {
                    if (chatContainerRef.current) {
                      const isAtBottom = chatContainerRef.current.scrollHeight - chatContainerRef.current.scrollTop - chatContainerRef.current.clientHeight < 50;
                      if (!isAtBottom) {
                        scrollToBottom();
                      }
                    }
                  }}
                />

                {/* Input action buttons */}
               

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceInput}
                    className="p-1"
                    style={{ color: isRecording ? '#EF4444' : (darkMode ? '#D0C4FF' : '#4C4CFF') }}
                    title="Voice input"
                  >
                    <Mic size={18} />
                  </motion.button>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isSendingQuestion || !customQuestion.trim() || thinkingPersona || readingPersona}
                    className="p-1 disabled:opacity-50"
                    style={{ color: darkMode ? '#D0C4FF' : '#4C4CFF' }}
                    title="Send message"
                  >
                    <Send size={18} />
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}

          {/* View-only message for non-owners */}
          {!isConversationOwner && (
            <div className="p-4 border-t transition-colors duration-300 text-center"
              style={{ borderColor: theme.border, color: theme.subText }}
            >
              <p className="text-sm flex items-center justify-center space-x-2">
                <Info size={16} />
                <span>You are viewing this conversation in read-only mode. Only the owner can send messages.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom zoom styles */}
      <style jsx>{`
        .chat-container {
          zoom: ${chatZoom};
        }

        @media (max-width: 768px) {
          .chat-container {
            zoom: ${chatZoom * 0.9};
          }
        }
      `}</style>
    </motion.div>
  );
}