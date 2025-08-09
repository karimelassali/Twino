"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Copy, CheckCircle } from "lucide-react";

export const GlassEffect = React.memo(({
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
});

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Message = ({
  message,
  index,
  isAsker,
  isPinned,
  darkMode,
  theme,
  messageActions,
  setMessageActions,
  copyMessageToClipboard,
  togglePinMessage,
  messageCopied,
}) => {
  return (
    <motion.div
      key={index}
      className={`flex ${isAsker ? "justify-start" : "justify-end"}`}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.05, 0.3),
      }}
      onMouseEnter={() => setMessageActions({ visible: true, index })}
      onMouseLeave={() => setMessageActions({ visible: false, index: null })}
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
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
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
            {message.message.startsWith("https://image.pollinations.ai") ? (
              <img
                loading="lazy"
                src={message.message}
                alt="Generated Image"
                className="rounded-lg"
              />
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
          {messageActions.visible && messageActions.index === index && (
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
                  onClick={() => copyMessageToClipboard(message.message)}
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
                  title={isPinned ? "Unpin message" : "Pin message"}
                  style={{
                    backgroundColor: "transparent",
                    color: darkMode ? "#D0C4FF" : "#4C4CFF",
                  }}
                >
                  <Bookmark
                    size={14}
                    style={{
                      fill: isPinned ? "currentColor" : "none",
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
};

export default React.memo(Message);
