"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import {
  Sparkles,
  Pause,
  Play,
  MessageSquare,
  Square,
  Send,
  Mic,
  Bookmark,
  Copy,
  CheckCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import LagIndicator from "@/components/ui/lag-indicator";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

import { Progress } from "@/components/ui/progress";

import { colors, mockReadingTexts, Typing } from "@/lib/helpers.js";
import { ChatHeader } from "@/components/chatComponents/chat-header";
import HistorySidebar from "@/components/history-sidebar";
import Message, { GlassEffect } from "@/components/chatComponents/message";

// Pulse effect for activity visualization
const PulseEffect = ({ active, color, size = "small" }) => {
  const sizeMap = {
    small: "h-2 w-2",
    medium: "h-3 w-3",
    large: "h-4 w-4",
  };

  return (
    <div className="relative">
      <div
        className={`rounded-full ${sizeMap[size]}`}
        style={{ backgroundColor: color }}
      ></div>
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
  visible: { opacity: 1, y: 0 },
};

// Message skeleton loader
const MessageSkeleton = ({ isAsker = true, darkMode = false }) => {
  return (
    <div className={`flex ${isAsker ? "justify-start" : "justify-end"} mb-6`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] lg:max-w-[60%] ${
          isAsker ? "mr-auto" : "ml-auto"
        }`}
      >
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <div
              className="h-4 w-20 rounded animate-pulse"
              style={{
                backgroundColor: darkMode
                  ? "rgba(208, 196, 255, 0.2)"
                  : "rgba(76, 76, 255, 0.1)",
              }}
            />
            <div
              className="h-3 w-12 rounded animate-pulse"
              style={{
                backgroundColor: darkMode
                  ? "rgba(208, 196, 255, 0.1)"
                  : "rgba(76, 76, 255, 0.05)",
              }}
            />
          </div>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: isAsker
                ? darkMode
                  ? "rgba(63, 73, 106, 0.5)"
                  : "rgba(245, 245, 245, 0.7)"
                : darkMode
                ? "rgba(76, 76, 255, 0.2)"
                : "rgba(208, 196, 255, 0.3)",
              border: "1px solid rgba(192, 192, 192, 0.2)",
            }}
          >
            <div className="p-3 space-y-2">
              <div
                className="h-3 w-full rounded animate-pulse"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(208, 196, 255, 0.2)"
                    : "rgba(76, 76, 255, 0.1)",
                }}
              />
              <div
                className="h-3 w-5/6 rounded animate-pulse"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(208, 196, 255, 0.2)"
                    : "rgba(76, 76, 255, 0.1)",
                }}
              />
              <div
                className="h-3 w-4/6 rounded animate-pulse"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(208, 196, 255, 0.2)"
                    : "rgba(76, 76, 255, 0.1)",
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
  const supabase = createClient();

  // Core state
  // Detect theme before first render
  let initialDarkMode = false;
  if (typeof window !== "undefined") {
    const storedTheme = window.localStorage.getItem("theme");
    initialDarkMode = storedTheme === "dark";
    document.documentElement.classList.toggle("dark", initialDarkMode);
  }
  const [darkMode, setDarkMode] = useState(initialDarkMode);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const conversationHistory = useRef([]);
  const [thinkingPersona, setThinkingPersona] = useState(null);
  const [readingPersona, setReadingPersona] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(
    botPersonalities[0].pair
  );
  const [selectedTopic, setSelectedTopic] = useState("");
  const chatContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);

  // Pagination loading state
  const [isConversationLoadingOlder, setIsConversationLoadingOlder] = useState(false);

  // UI state

  const timeoutIds = useRef([]);
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
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageActions, setMessageActions] = useState({
    visible: false,
    index: null,
  });
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const [isScrolling, setIsScrolling] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isHistoryPanelMobile, setIsHistoryPanelMobile] = useState(false);

  // Additional UI state
  const [chatZoom, setChatZoom] = useState(1);
  const [messageCopied, setMessageCopied] = useState(null);
  const [notificationSound, setNotificationSound] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);
  // const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  
  // Refs and controls
  const messageInputControls = useAnimation();
  const headerControls = useAnimation();
  const messageEndRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const lastScrollPosition = useRef(0);

  // Initialize showHistoryPanel based on initial mobile view
  const [showHistoryPanel, setShowHistoryPanel] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768; // true for desktop, false for mobile
    }
    return true; // Default to true for SSR or if window is undefined
  });

  // Fetch user credits
  useEffect(() => {
    if (!user?.id) return;

    async function fetchUserCredits() {
      try {
        const { data, error } = await supabase
          .from("user_credits")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user credits:", error);
          toast.error("Failed to load user credits");
          return;
        }

        setUserCredits(data);
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An error occurred while loading user credits");
      }
    }

    fetchUserCredits();
  }, [user?.id, supabase]);

  // Check mobile view and handle loading
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 768;
      setIsHistoryPanelMobile(isMobile);
      // Do NOT set setShowHistoryPanel(false) here.
      // The initial state handles default visibility.
      // User interaction should control it after initial load.
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
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode]);

  // useEffect(()=>{
  //   if (!stop) {
  //     setTimeout(() => {
  //       setStop(true);
  //     }, 20000);
  //   }
  // },[stop])
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    }
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  // User authentication handling
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    localStorage.setItem("userId", user.id);
    setUserData(user);
  }, [isLoaded, isSignedIn, user]);

  // Conversation ownership check
  useEffect(() => {
    if (!data) return;

    const currentUserId = localStorage.getItem("userId");
    const isOwner = currentUserId === data.user_id;
    setIsConversationOwner(isOwner);
  }, [data]);

  // Timeout management helper
  const addTimeout = (id) => {
    timeoutIds.current.push(id);
    return id;
  };

  // Fetch conversation data from database
  useEffect(() => {
    const fetchConversationData = async () => {
      setIsConversationLoading(true);
      try {
        const { data: conversationData, error: conversationError } =
          await supabase
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
          const { data: titleData } = await axios.post("/api/generate-title", {
            subject: conversationData.subject,
            personalityPair: conversationData.personalities.personality_pair,
          });

          const { error: updateError } = await supabase
            .from("conversations")
            .update({ generated_title: titleData.title })
            .eq("id", uid);

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
          const allMessages = messagesData.map((msg) => ({
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.timestamp,
          }));
          conversationHistory.current = allMessages;
          setVisibleMessages(allMessages.slice(-10));
          if (allMessages.length > 0) {
            setStop(true);
            stopRef.current = true;
            setIsConversationActive(false);
          } else {
            setStop(false);
            stopRef.current = false;
            setIsConversationActive(true);
          }
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

  // Filter conversations based on search
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredConversations(lastConversations);
      return;
    }

    const lowercaseQuery = searchText.toLowerCase();
    const filtered = lastConversations.filter(
      (conv) =>
        conv.subject?.toLowerCase().includes(lowercaseQuery) ||
        conv.generated_title?.toLowerCase().includes(lowercaseQuery)
    );

    setFilteredConversations(filtered);
  }, [searchText, lastConversations]);

  // Auto-scroll behavior for new messages
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    if (isAtBottom && !isScrolling) {
      scrollToBottom("auto");
    } else {
      setShowScrollToBottom(true);
      setUnreadMessages((prev) => prev + 1);
    }

    if (isAtBottom) {
      setLastReadTimestamp(new Date().toISOString());
    }
  }, [visibleMessages, thinkingPersona, readingPersona, isScrolling]);

  // Start conversation when data is loaded
  useEffect(() => {
    if (
      data &&
      !stop &&
      !hasStartedConversation.current &&
      isConversationOwner
    ) {
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

    // Optimistic UI: show message instantly
    setVisibleMessages((prev) => [...prev, newMessage]);
    conversationHistory.current.push(newMessage);

    // Save message to database
    let saveError = null;
    try {
      await supabase.from("messages").insert({
        conversation_id: uid,
        sender: askerPersona,
        message: customQuestion,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      saveError = error;
      console.error("Error saving message:", error);
      toast.error("Failed to save your message. Tap to retry.", {
        duration: 4000,
        icon: "⚠️",
      });
      // Rollback optimistic UI
      setVisibleMessages((prev) => prev.slice(0, -1));
      conversationHistory.current.pop();
      setIsSendingQuestion(false);
      return;
    }

    setCustomQuestion("");
    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);

    const allMessages = conversationHistory.current.map((msg) => ({
      sender: msg.sender,
      message: msg.message,
    }));

    responder(allMessages);
    setIsSendingQuestion(false);
  };

  const theme = darkMode ? colors.darkMode : colors.lightMode;

  // AI Asker function - generates questions
  const asker = async (previousMessages) => {
    if (
      !data?.subject ||
      !data?.personalities?.personality_pair ||
      stopRef.current ||
      !isConversationOwner
    )
      return;

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
        const newMessage = {
          sender: askerPersona,
          message: message.message,
          timestamp: new Date().toISOString(),
        };
        setVisibleMessages((prev) => [...prev, newMessage]);
        conversationHistory.current.push(newMessage);

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
          const responderPersona =
            data.personalities.personality_pair.split(" × ")[1];
          setReadingPersona(responderPersona);

          const delay = Math.random() * 4000 + 4000;

          const timeoutId = addTimeout(
            setTimeout(() => {
              if (!stopRef.current) {
                setReadingPersona(null);
                responder(conversationHistory.current.map((msg) => ({
          sender: msg.sender,
          message: msg.message,
        })));
              }
            }, delay)
          );
        }
      }
    } catch (error) {
      console.error("Asker error:", error);
      setThinkingPersona(null);
      setReadingPersona(null);
      // toast.error("Failed to generate asker response");
      setStop(true);
    }
  };

  // AI Responder function - generates responses
  const responder = async (previousMessages) => {
    if (
      !data?.subject ||
      !data?.personalities?.personality_pair ||
      stopRef.current ||
      !isConversationOwner
    )
      return;

    const responderPersona =
      data.personalities.personality_pair.split(" × ")[1];
    setThinkingPersona(responderPersona);

    try {
      const response = await axios.post("/api/responder", {
        subject: data.subject,
        personalityPair: responderPersona,
        previousMessage: previousMessages[previousMessages.length - 1],
      });

      const message = response.data.message;

      if (!stopRef.current) {
        const newMessage = {
          sender: responderPersona,
          message: message.message,
          timestamp: new Date().toISOString(),
        };
        setVisibleMessages((prev) => [...prev, newMessage]);
        conversationHistory.current.push(newMessage);

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
          const askerPersona =
            data.personalities.personality_pair.split(" × ")[0];
          setReadingPersona(askerPersona);

          const delay = Math.random() * 4000 + 4000;

          const timeoutId = addTimeout(
            setTimeout(() => {
              if (!stopRef.current) {
                setReadingPersona(null);
                asker(conversationHistory.current.map((msg) => ({
          sender: msg.sender,
          message: msg.message,
        })));
              }
            }, delay)
          );
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
    if (
      data?.subject &&
      data?.personalities?.personality_pair &&
      !stopRef.current &&
      isConversationOwner
    ) {
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

    const previousMessages = conversation.map((msg) => ({
      sender: msg.sender,
      message: msg.message,
    }));

    if (previousMessages.length > 0) {
      const lastSender = previousMessages[previousMessages.length - 1].sender;
      const askerPersona =
        data?.personalities?.personality_pair.split(" × ")[0];
      const responderPersona =
        data?.personalities?.personality_pair.split(" × ")[1];

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
    console.log('stop')

    setStop(true);
    stopRef.current = true;
    setIsConversationActive(false);
    setThinkingPersona(null);
    setReadingPersona(null);

    // Clear all timeouts
    timeoutIds.current.forEach((id) => clearTimeout(id));
    timeoutIds.current = [];

    // toast.success("Conversation paused");
  };

  // Utility functions
  const getRandomReadingText = (isAsker) => {
    const texts = isAsker ? mockReadingTexts.asker : mockReadingTexts.responder;
    return texts[Math.floor(Math.random() * texts.length)];
  };

  // Scroll management
  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messageEndRef.current) {
      messageEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
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
    navigator.clipboard
      .writeText(message)
      .then(() => {
        setMessageCopied(message);
        setTimeout(() => setMessageCopied(null), 2000);
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy message:", err);
        toast.error("Failed to copy message");
      });
  }, []);

  const togglePinMessage = useCallback(
    (index) => {
      setPinnedMessages((prev) => {
        const messageIndex = prev.findIndex((pin) => pin.index === index);
        if (messageIndex >= 0) {
          return prev.filter((pin) => pin.index !== index);
        } else {
          return [...prev, { index, timestamp: new Date().toISOString() }];
        }
      });

      toast.success(
        pinnedMessages.some((pin) => pin.index === index)
          ? "Message unpinned"
          : "Message pinned",
        {
          icon: pinnedMessages.some((pin) => pin.index === index) ? "📌" : "📍",
        }
      );
    },
    [pinnedMessages]
  );

  const handleReaction = useCallback((index, reaction) => {
    setMessageReactions((prev) => {
      const currentReactions = prev[index] || [];

      if (currentReactions.includes(reaction)) {
        return {
          ...prev,
          [index]: currentReactions.filter((r) => r !== reaction),
        };
      } else {
        return {
          ...prev,
          [index]: [...currentReactions, reaction],
        };
      }
    });
  }, []);

  const handleVoiceInput = useCallback(() => {
    if (
      !navigator.mediaDevices ||
      (!window.SpeechRecognition && !window.webkitSpeechRecognition)
    ) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
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
    exit: { opacity: 0 },
  };

  const floatingButtonVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.1, boxShadow: "0 8px 16px rgba(76, 76, 255, 0.3)" },
  };

  

  return (
    <motion.div
      className="flex h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <LagIndicator />
     
      <Toaster position="bottom-right" />

      

      

      <div
        className={`${
          isHistoryPanelMobile
            ? showHistoryPanel
              ? "block" // Show the div when sidebar should be open on mobile
              : "hidden" // Hide the div when sidebar should be closed on mobile
            : "block md:w-80" // Always block on desktop, and set width
        }`}
        style={{
          // No positioning/sizing here, let HistorySidebar handle it
          background: darkMode ? colors.darkMode.surface : "#fff",
        }}
      >
        <HistorySidebar
          user={user}
          isOpen={showHistoryPanel}
          onToggle={setShowHistoryPanel}
          theme={theme}
          darkMode={darkMode}
          pageSize={10}
          overlay={isHistoryPanelMobile}
        />
      </div>

      {/* Main Chat Content */}
      <div
        className="flex-1 flex flex-col h-full overflow-hidden"
        style={{
          background: darkMode ? colors.darkMode.bg : colors.lightMode.bg,
        }}
      >
        {/* Enhanced Header */}
        <motion.div
          className="flex-shrink-0 flex items-center justify-between p-4 border-b z-10"
          style={{
            borderColor: theme.border,
            background: darkMode ? colors.darkMode.surface : colors.lightMode.surface,
            boxShadow: darkMode
              ? "0 2px 8px rgba(0,0,0,0.12)"
              : "0 2px 8px rgba(60,60,120,0.06)",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            {/* Burger menu button for small devices */}
            {isHistoryPanelMobile && (
              <button
                className="p-2 rounded-full"
                style={{
                  color: darkMode ? colors.darkMode.text : "#333",
                }}
                aria-label="Open history sidebar"
                onClick={() => setShowHistoryPanel(true)}
              >
                {/* Simple burger icon */}
                <span
                  style={{
                    display: "block",
                    width: "24px",
                    height: "2px",
                    background: "currentColor",
                    marginBottom: "5px",
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "24px",
                    height: "2px",
                    background: "currentColor",
                    marginBottom: "5px",
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "24px",
                    height: "2px",
                    background: "currentColor",
                    borderRadius: "2px",
                  }}
                />
              </button>
            )}
            {/* Conversation Info */}
            <div className="flexflex-col">
              <h1 className="font-bold  dark:text-slate-200  font-ubuntu first-letter:uppercase text-lg sm:text-xl truncate max-w-xs sm:max-w-md lg:max-w-lg">
                {selectedTopic || "Untitled Conversation"}
              </h1>
              <div className="flex items-center space-x-2">
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.subText }}
                >
                  {selectedPersonality}
                </span>
                <Sparkles
                  size={14}
                  style={{ color: darkMode ? "#D0C4FF" : "#4C4CFF" }}
                />
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Conversation Controls */}
            {isConversationOwner ? (
              <motion.div className="flex items-center space-x-2">
                {isConversationActive ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-sm"
                    style={{
                      backgroundColor: darkMode
                        ? colors.darkMode.errorBg
                        : colors.lightMode.errorBg,
                    }}
                    title="Pause conversation"
                  >
                    <Pause size={16} />
                    <span className="hidden sm:inline text-sm">Pause</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleContinue}
                    className="flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-sm"
                    style={{
                      backgroundColor: darkMode
                        ? colors.darkMode.successBg
                        : colors.lightMode.successBg,
                    }}
                    title="Continue conversation"
                  >
                    <Play size={16} />
                    <span className="hidden sm:inline text-sm">Continue</span>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: darkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.03)",
                  color: theme.subText,
                }}
              >
                <Square size={14} />
                <span className="hidden sm:inline text-sm font-medium">
                  View Only
                </span>
              </div>
            )}

            {/* <ChatHeader
              uid={uid}
              selectedTopic={selectedTopic}
              copyMessageToClipboard={copyMessageToClipboard}
            /> */}
          </div>
        </motion.div>

        {/* Messages Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Pinned Messages Section */}
          <AnimatePresence>
            {pinnedMessages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex-shrink-0 p-4 border-b"
                style={{ borderColor: theme.border }}
              >
                <GlassEffect darkMode={darkMode} blur={12}>
                  <div className="p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center text-sm">
                        <Bookmark
                          size={16}
                          className="mr-2"
                          style={{ color: darkMode ? "#D0C4FF" : "#4C4CFF" }}
                        />
                        Pinned Messages ({pinnedMessages.length})
                      </h3>
                      <button
                        onClick={() => setPinnedMessages([])}
                        className="text-xs opacity-70 hover:opacity-100 transition-opacity px-2 py-1 rounded"
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

          {/* Scrollable Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 pb-20 overflow-y-auto py-4 px-4 sm:px-6 lg:px-8 space-y-4 scroll-smooth"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: darkMode
                ? "#4B5563 transparent"
                : "#D1D5DB transparent",
            }}
            onScroll={handleScroll}
            tabIndex={0}
            onKeyDown={async (e) => {
              if (
                (e.key === "PageUp" || (e.key === "ArrowUp" && e.shiftKey)) &&
                conversationHistory.current.length > visibleMessages.length &&
                !isConversationLoadingOlder &&
                visibleMessages.length < conversationHistory.current.length
              ) {
                setIsConversationLoadingOlder(true);
                const currentLen = visibleMessages.length;
                const startIdx = Math.max(0, conversationHistory.current.length - currentLen - 20);
                const endIdx = conversationHistory.current.length - currentLen - 1;
                try {
                  const { data: olderMessages, error } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("conversation_id", uid)
                    .order("id", { ascending: true })
                    .range(startIdx, endIdx);

                  if (error) {
                    toast.error("Failed to load older messages");
                    setIsConversationLoadingOlder(false);
                    return;
                  }
                  const more = olderMessages.map((msg) => ({
                    sender: msg.sender,
                    message: msg.message,
                    timestamp: msg.id,
                  }));
                  setVisibleMessages([
                    ...more,
                    ...visibleMessages,
                  ]);
                } catch (err) {
                  toast.error("Error loading older messages");
                }
                setIsConversationLoadingOlder(false);
              }
            }}
          >
            {/* Loading Skeleton */}
            {isConversationLoading ? (
              <div className="space-y-4">
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
                <MessageSkeleton isAsker={false} darkMode={darkMode} />
                <MessageSkeleton isAsker={true} darkMode={darkMode} />
              </div>
            ) : (
              /* Messages */
              <div className="space-y-4">
                {conversationHistory.current.length > visibleMessages.length && visibleMessages.length < conversationHistory.current.length && (
                  <>
                    {isConversationLoadingOlder ? (
                      <div className="mb-4 px-4 py-2 rounded-lg font-medium text-center" style={{
                        backgroundColor: darkMode
                          ? colors.darkMode.buttonBg
                          : colors.lightMode.buttonBg,
                        color: "#fff",
                      }}>
                        Loading older messages...
                      </div>
                    ) : (
                      <button
                        className="mb-4 px-4 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: darkMode
                            ? colors.darkMode.buttonBg
                            : colors.lightMode.buttonBg,
                          color: "#fff",
                        }}
                        disabled={visibleMessages.length >= conversationHistory.current.length}
                        onClick={async () => {
                          setIsConversationLoadingOlder(true);
                          const currentLen = visibleMessages.length;
                          const startIdx = Math.max(0, conversationHistory.current.length - currentLen - 20);
                          const endIdx = conversationHistory.current.length - currentLen - 1;
                          try {
                            const { data: olderMessages, error } = await supabase
                              .from("messages")
                              .select("*")
                              .eq("conversation_id", uid)
                              .order("id", { ascending: true })
                              .range(startIdx, endIdx);

                            if (error) {
                              toast.error("Failed to load older messages");
                              setIsConversationLoadingOlder(false);
                              return;
                            }
                          const more = olderMessages.map((msg) => ({
                              sender: msg.sender,
                              message: msg.message,
                              timestamp: msg.timestamp,
                            }));
                          setVisibleMessages([
                              ...more,
                              ...visibleMessages,
                            ]);
                          } catch (err) {
                            toast.error("Error loading older messages");
                          }
                          setIsConversationLoadingOlder(false);
                        }}
                      >
                        {visibleMessages.length >= conversationHistory.current.length
                          ? "All messages loaded"
                          : "Load older messages"}
                      </button>
                    )}
                  </>
                )}
                {visibleMessages.map((message, index) => {
                  const isAsker =
                    message.sender ===
                    data?.personalities?.personality_pair.split(" × ")[0];
                  const isPinned = pinnedMessages.some(
                    (pin) => pin.index === index
                  );

                  return (
                    <Message
                      key={index}
                      message={message}
                      index={index}
                      isAsker={isAsker}
                      isPinned={isPinned}
                      darkMode={darkMode}
                      theme={theme}
                      messageActions={messageActions}
                      setMessageActions={setMessageActions}
                      copyMessageToClipboard={copyMessageToClipboard}
                      togglePinMessage={togglePinMessage}
                      messageCopied={messageCopied}
                    />
                  );
                })}
              </div>
            )}

            {/* Thinking/Reading Indicators */}
            <AnimatePresence>
              {(thinkingPersona || readingPersona) && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="max-w-[90%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] mr-auto">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-sm">
                        {thinkingPersona || readingPersona}
                      </span>
                      <PulseEffect
                        active={true}
                        color={darkMode ? "#D0C4FF" : "#4C4CFF"}
                        size="small"
                      />
                    </div>
                    <GlassEffect
                      darkMode={darkMode}
                      active={true}
                      isAsker={
                        thinkingPersona ===
                        data?.personalities?.personality_pair.split(" × ")[0]
                      }
                      isResponder={
                        thinkingPersona ===
                        data?.personalities?.personality_pair.split(" × ")[1]
                      }
                    >
                      <div className="p-4 rounded-xl">
                        {thinkingPersona ? (
                          <Typing darkMode={darkMode} />
                        ) : (
                          <span
                            className="text-sm italic"
                            style={{ color: theme.subText }}
                          >
                            {getRandomReadingText(
                              readingPersona ===
                                data?.personalities?.personality_pair.split(
                                  " × "
                                )[0]
                            )}
                          </span>
                        )}
                      </div>
                    </GlassEffect>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messageEndRef} />
            {/* Accessibility: ARIA live region for new messages */}
            <div
              aria-live="polite"
              style={{
                position: "absolute",
                left: "-9999px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              {visibleMessages.length > 0
                ? visibleMessages[visibleMessages.length - 1].message
                : ""}
            </div>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-20 z-50 right-4 flex flex-col space-y-2">
            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollToBottom && (
                <motion.button
                  className="relative p-3 rounded-full shadow-lg backdrop-blur-sm"
                  style={{
                    background: darkMode
                      ? "linear-gradient(135deg, #4C4CFF, #3939CC)"
                      : "linear-gradient(135deg, #5C5CFF, #4C4CFF)",
                    boxShadow: "0 4px 15px rgba(76, 76, 255, 0.3)",
                  }}
                  onClick={scrollToBottom}
                  variants={floatingButtonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={20} color="#FFFFFF" />
                  {unreadMessages > 0 && (
                    <motion.div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </motion.div>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Message Input Area */}
          {isConversationOwner ? (
            <motion.div
              className="flex-shrink-0 max-sm:fixed bottom-0 w-full p-4 z-10 border-t"
              style={{
                borderColor: theme.border,
                background: darkMode ? colors.darkMode.surfaceAlt : colors.lightMode.surfaceAlt,
                boxShadow: darkMode
                  ? "0 -2px 8px rgba(0,0,0,0.10)"
                  : "0 -2px 8px rgba(60,60,120,0.04)",
              }}
              animate={messageInputControls}
              initial={{ opacity: 1 }}
            >
              <form onSubmit={handleCustomQuestionSubmit} className="relative z-[9999]">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      aria-disabled={!stop}
                      type="text"
                      placeholder={
                        isSendingQuestion
                          ? "Sending..."
                          : "Type your message..."
                      }
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      disabled={
                        isSendingQuestion ||
                        thinkingPersona ||
                        readingPersona ||
                        !isConversationOwner
                      }
                      className="w-full z-50 py-3 px-4 pr-20 rounded-xl transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                      style={{
                        backgroundColor: darkMode
                          ? colors.darkMode.surface
                          : colors.lightMode.surface,
                        borderColor: darkMode ? colors.darkMode.border : colors.lightMode.border,
                        color: theme.text,
                        boxShadow: darkMode
                          ? "inset 0 1px 3px rgba(0,0,0,0.18)"
                          : "inset 0 1px 3px rgba(0,0,0,0.08)",
                      }}
                      onFocus={() => {
                        if (chatContainerRef.current) {
                          const isAtBottom =
                            chatContainerRef.current.scrollHeight -
                              chatContainerRef.current.scrollTop -
                              chatContainerRef.current.clientHeight <
                            100;
                          if (!isAtBottom) {
                            setTimeout(scrollToBottom, 100);
                          }
                        }
                      }}
                    />

                    {/* Input Actions */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleVoiceInput}
                        className="p-2 rounded-lg transition-colors duration-200"
                        style={{
                          color: isRecording
                            ? colors.darkMode.errorBg
                            : darkMode
                            ? colors.darkMode.accent
                            : colors.lightMode.accent,
                          backgroundColor: isRecording
                            ? colors.darkMode.errorBg + "22"
                            : "transparent",
                        }}
                        title="Voice input"
                      >
                        <Mic size={16} />
                      </motion.button>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={
                          isSendingQuestion ||
                          !customQuestion.trim() ||
                          thinkingPersona ||
                          readingPersona
                        }
                        className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          color: "#fff",
                          backgroundColor:
                            !isSendingQuestion && customQuestion.trim()
                              ? darkMode
                                ? colors.darkMode.buttonBg
                                : colors.lightMode.buttonBg
                              : darkMode
                                ? colors.darkMode.border
                                : colors.lightMode.border,
                        }}
                        title="Send message"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            /* View-Only Notice */
            <div
              className="flex-shrink-0 p-4 border-t text-center backdrop-blur-sm"
              style={{
                borderColor: theme.border,
                color: theme.subText,
                backgroundColor: darkMode
                  ? "rgba(16, 42, 67, 0.3)"
                  : "rgba(248, 250, 252, 0.3)",
              }}
            >
              <p className="text-sm flex items-center justify-center space-x-2">
                <Info size={16} />
                <span>You are viewing this conversation in read-only mode</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .chat-container {
          zoom: ${chatZoom};
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode
            ? "rgba(156, 163, 175, 0.3)"
            : "rgba(107, 114, 128, 0.3)"};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode
            ? "rgba(156, 163, 175, 0.5)"
            : "rgba(107, 114, 128, 0.5)"};
        }

        @media (max-width: 768px) {
          .chat-container {
            zoom: ${chatZoom * 0.95};
          }
        }

        @media (max-width: 640px) {
          .chat-container {
            zoom: ${chatZoom * 0.9};
          }
        }
      `}</style>
    </motion.div>
  );
}
