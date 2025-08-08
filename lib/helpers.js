import {motion} from "framer-motion";

// Color system
export const colors = {
    primary: "#2A324B",
    highlight: "#D0C4FF",
    action: "#4C4CFF",
    background: "#FFFFFF",
    inputBg: "#F5F5F5",
    secondary: "#C0C0C0",
    accent: {
      green: "#5AE675",
      red: "#FF5C5C",
      amber: "#FFB547",
      teal: "#20E3B2"
    },
    darkMode: {
      bg: "#171E2E",
      surface: "#232A3F",
      surfaceAlt: "#2F3A57",
      text: "#FFFFFF",
      bubbleBotBg: "rgba(45, 51, 75, 0.75)",
      responderBubbleBg: "rgba(92, 92, 255, 0.25)",
      bubbleUserBg: "rgba(208, 196, 255, 0.25)",
      buttonBg: "#5C5CFF",
      buttonHoverBg: "#4949DD",
      border: "#2F3A57",
      subText: "#A0A0C0",
      accent: "#8A7FFF",
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
    lightMode: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceAlt: "#F1F5F9",
      text: "#1E293B",
      bubbleBotBg: "#F1F5F9",
      responderBubbleBg: "rgba(92, 92, 255, 0.15)",
      bubbleUserBg: "rgba(208, 196, 255, 0.2)",
      buttonBg: "#5C5CFF",
      buttonHoverBg: "#4949DD",
      border: "#E2E8F0",
      subText: "#64748B",
      accent: "#5C5CFF",
      successBg: "#10B981",
      errorBg: "#EF4444",
      warningBg: "#F59E0B"
    },
  };

 export  const mockReadingTexts = {
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


  export const Typing = ({ darkMode, color = null }) => {
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