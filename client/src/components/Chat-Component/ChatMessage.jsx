import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Bot, User } from "lucide-react";

const ChatMessage = ({
  message,
  isUser,
  isTyping = false,
  timestamp,
  isError = false,
}) => {
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </motion.div>

        {/* Message Content */}
        <div className={`relative ${isUser ? "mr-2" : "ml-2"}`}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`px-4 py-2 rounded-2xl relative ${
              isUser
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : isError
                ? "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
                : "bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700"
            }`}
          >
            {/* Typing indicator */}
            {isTyping ? (
              <div className="flex space-x-1 py-1">
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: 0.4,
                  }}
                />
              </div>
            ) : (
              <div className="flex items-start gap-2">
                {isError && (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message}
                </span>
              </div>
            )}

            {/* Message tail */}
            {!isTyping && (
              <div
                className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                  isUser
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 -right-1"
                    : isError
                    ? "bg-red-50 dark:bg-red-900/30 border-l border-b border-red-200 dark:border-red-800 -left-1"
                    : "bg-white dark:bg-gray-800 border-l border-b border-gray-100 dark:border-gray-700 -left-1"
                }`}
              />
            )}
          </motion.div>

          {/* Timestamp */}
          {timestamp && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                isUser ? "text-right" : "text-left"
              }`}
            >
              {formatTime(timestamp)}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
