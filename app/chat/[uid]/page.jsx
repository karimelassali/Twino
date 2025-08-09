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
// Enhanced glass effect component
const GlassEffect = ({
  children,
  active = false,
  darkMode = false,
  blur = 8,
  opacity = 0.7,
  isAsker = false,
  isResponder = false,
}) => {
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
      ? `linear-gradient(135deg, rgba(47, 58, 87, ${opacity}), rgba(92, 92, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 100%)`
      : `linear-gradient(135deg, rgba(241, 245, 249, ${opacity}), rgba(208, 196, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 100%)`;
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
        border: borderColor,
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
  const [darkMode, setDarkMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [thinkingPersona, setThinkingPersona] = useState(null);
  const [readingPersona, setReadingPersona] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(
    botPersonalities[0].pair
  );
  const [selectedTopic, setSelectedTopic] = useState("");
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [isHistoryPanelMobile, setIsHistoryPanelMobile] = useState(false);
  const chatContainerRef = useRef(null);
  const [data, setData] = useState(null);
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [stop, setStop] = useState(false);

  // UI state

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

  // Additional UI state
  const [chatZoom, setChatZoom] = useState(1);
  const [messageCopied, setMessageCopied] = useState(null);
  const [notificationSound, setNotificationSound] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState(null);

  // Refs and controls
  const messageInputControls = useAnimation();
  const headerControls = useAnimation();
  const messageEndRef = useRef(null);
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const lastScrollPosition = useRef(0);

  const [isOpen, setIsOpen] = useState(false);

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
    const storedTheme = localStorage?.getItem("theme");
    const prefersDarkMode = window?.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDarkMode)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
    
  }, []);

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
      timeoutIds.forEach((id) => clearTimeout(id));
    };
  }, [timeoutIds]);

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
    setTimeoutIds((prev) => [...prev, id]);
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
          setConversation(
            messagesData.map((msg) => ({
              sender: msg.sender,
              message: msg.message,
              timestamp: msg.created_at,
            }))
          );
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
  }, [conversation, thinkingPersona, readingPersona, isScrolling]);

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

    setConversation((prev) => [...prev, newMessage]);

    // Save message to database
    try {
      await supabase.from("messages").insert({
        conversation_id: uid,
        sender: askerPersona,
        message: customQuestion,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
      toast.error("Failed to save your message");
    }

    setCustomQuestion("");
    setStop(false);
    stopRef.current = false;
    setIsConversationActive(true);

    const allMessages = [...conversation, newMessage].map((msg) => ({
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
        setConversation((prev) => [
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
          const responderPersona =
            data.personalities.personality_pair.split(" × ")[1];
          setReadingPersona(responderPersona);

          const delay = Math.random() * 4000 + 4000;

          const timeoutId = addTimeout(
            setTimeout(() => {
              if (!stopRef.current) {
                setReadingPersona(null);
                responder([...previousMessages, message]);
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
        setConversation((prev) => [
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
          const askerPersona =
            data.personalities.personality_pair.split(" × ")[0];
          setReadingPersona(askerPersona);

          const delay = Math.random() * 4000 + 4000;

          const timeoutId = addTimeout(
            setTimeout(() => {
              if (!stopRef.current) {
                setReadingPersona(null);
                asker([...previousMessages, message]);
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
    timeoutIds.forEach((id) => clearTimeout(id));
    setTimeoutIds([]);

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
      className="flex mt-15 h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
     
      <Toaster position="bottom-right" />

      

      

      {/* History Sidebar */}
      <div
        className={`${
          isHistoryPanelMobile ? "fixed top-0 left-0 h-full z-15" : "relative"
        } md:relative max-sm:hidden md:z-auto`}
      >
        <HistorySidebar
          user={user}
          isOpen={showHistoryPanel}
          onToggle={setShowHistoryPanel}
          theme={theme}
          darkMode={darkMode}
        />
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 flex dark:bg-slate-800  flex-col h-full overflow-hidden">
        {/* Enhanced Header */}
        <motion.div
          className="flex-shrink-0 flex items-center  dark:bg-slate-800  justify-between p-4 border-b backdrop-blur-lg z-10"
          style={{
            borderColor: theme.border,
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
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
                {conversation.map((message, index) => {
                  const isAsker =
                    message.sender ===
                    data?.personalities?.personality_pair.split(" × ")[0];
                  const isPinned = pinnedMessages.some(
                    (pin) => pin.index === index
                  );

                  return (
                    <motion.div
                      key={index}
                      className={`flex ${
                        isAsker ? "justify-start" : "justify-end"
                      }`}
                      variants={messageVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{
                        duration: 0.3,
                        delay: Math.min(index * 0.05, 0.3),
                      }}
                      onMouseEnter={() =>
                        setMessageActions({ visible: true, index })
                      }
                      onMouseLeave={() =>
                        setMessageActions({ visible: false, index: null })
                      }
                    >
                      <div
                        className={`
                        max-w-[90%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] 
                        ${isAsker ? "mr-auto" : "ml-auto"} 
                        relative group
                      `}
                      >
                        {/* Message Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold  dark:text-slate-200 text-sm">
                            {message.sender}
                          </span>
                          <span
                            className="text-xs opacity-70"
                            style={{ color: theme.subText }}
                          >
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {isPinned && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex items-center justify-center"
                            >
                              <Bookmark
                                size={12}
                                style={{
                                  color: darkMode ? "#D0C4FF" : "#4C4CFF",
                                  fill: "currentColor",
                                }}
                              />
                            </motion.div>
                          )}
                        </div>

                        {/* Message Content */}
                        <GlassEffect
                          darkMode={darkMode}
                          active={true}
                          isAsker={isAsker}
                          isResponder={!isAsker}
                        >
                          <div
                            className="p-4 rounded-xl whitespace-pre-wrap leading-relaxed  dark:text-slate-200 "
                            style={{
                              back: darkMode
                                ? isAsker
                                  ? "#FFFFFF"
                                  : "#FFFFFF"
                                : isAsker
                                ? "#2A324B"
                                : "#2A324B",
                            }}
                          >
                            
                            {message.message.startsWith('https://image.pollinations.ai') ? (
                              <img loading="lazy" src={message.message} alt="Generated Image" className="rounded-lg" />
                            ) : (
                              <span>{message.message}</span>
                            )}

                            {/* Copy Confirmation */}
                            <AnimatePresence>
                              {messageCopied === message.message && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  className="text-xs mt-3 flex items-center justify-center py-1 px-2 rounded-full"
                                  style={{
                                    color: darkMode ? "#D0C4FF" : "#4C4CFF",
                                    backgroundColor: darkMode
                                      ? "rgba(208, 196, 255, 0.1)"
                                      : "rgba(76, 76, 255, 0.1)",
                                  }}
                                >
                                  <CheckCircle size={12} className="mr-1" />
                                  Copied!
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </GlassEffect>

                        {/* Message Actions */}
                        <AnimatePresence>
                          {messageActions.visible &&
                            messageActions.index === index && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-1"
                              >
                                <div
                                  className="flex items-center space-x-1 p-1 rounded-lg backdrop-blur-md shadow-lg border"
                                  style={{
                                    backgroundColor: darkMode
                                      ? "rgba(42, 50, 75, 0.9)"
                                      : "rgba(255, 255, 255, 0.9)",
                                    borderColor: darkMode
                                      ? "rgba(255, 255, 255, 0.1)"
                                      : "rgba(0, 0, 0, 0.1)",
                                  }}
                                >
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-md transition-colors duration-200 hover:bg-opacity-10"
                                    onClick={() =>
                                      copyMessageToClipboard(message.message)
                                    }
                                    title="Copy message"
                                    style={{
                                      backgroundColor: "transparent",
                                      color: darkMode ? "#D0C4FF" : "#4C4CFF",
                                    }}
                                  >
                                    <Copy size={14} />
                                  </motion.button>

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-md transition-colors duration-200 hover:bg-opacity-10"
                                    onClick={() => togglePinMessage(index)}
                                    title={
                                      isPinned ? "Unpin message" : "Pin message"
                                    }
                                    style={{
                                      backgroundColor: "transparent",
                                      color: darkMode ? "#D0C4FF" : "#4C4CFF",
                                    }}
                                  >
                                    <Bookmark
                                      size={14}
                                      style={{
                                        fill: isPinned
                                          ? "currentColor"
                                          : "none",
                                      }}
                                    />
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
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
              className="flex-shrink-0 max-sm:fixed bottom-0 w-full  p-4 z-10 border-t backdrop-blur-sm"
              style={{ borderColor: theme.border }}
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
                      onChange={(e) => {!stop && handleStop();setCustomQuestion(e.target.value)}}
                      disabled={
                        isSendingQuestion ||
                        thinkingPersona ||
                        readingPersona ||
                        !isConversationOwner
                      }
                      className="w-full z-50 py-3 px-4 pr-20 rounded-xl transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                      style={{
                        backgroundColor: darkMode
                          ? "rgba(53, 59, 84, 0.8)"
                          : "rgba(248, 250, 252, 0.8)",
                        borderColor: darkMode ? "#404969" : "#E2E8F0",
                        color: theme.text,
                        boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
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
                            ? "#EF4444"
                            : darkMode
                            ? "#D0C4FF"
                            : "#4C4CFF",
                          backgroundColor: isRecording
                            ? "rgba(239, 68, 68, 0.1)"
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
                          color: "#FFFFFF",
                          backgroundColor:
                            !isSendingQuestion && customQuestion.trim()
                              ? darkMode
                                ? "#4C4CFF"
                                : "#5C5CFF"
                              : "rgba(156, 163, 175, 0.5)",
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
