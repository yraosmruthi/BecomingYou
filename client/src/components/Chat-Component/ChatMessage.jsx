import { motion, AnimatePresence } from "framer-motion";

const ChatMessage = ({ message, isUser, isTyping = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
  >
    <div
      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
        isUser
          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
          : "bg-white dark:bg-gray-800 shadow-md text-gray-800 dark:text-gray-200"
      }`}
    >
      {isTyping ? (
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-75" />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150" />
        </div>
      ) : (
        message
      )}
    </div>
  </motion.div>
);

export default ChatMessage;
