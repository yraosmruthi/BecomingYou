import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "../components/Chat-Component/ChatMessage";
import FeedbackModal from "../components/Chat-Component/FeedbackModal";
import { Heart, Send, Loader2, AlertCircle } from "lucide-react";
import Button from "../components/Utility-Component/Button";
import { useAuth } from "../Context/Auth-context";
import { chatAPI } from "../services/chatAPI";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"


const ChatPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contextData, setContextData] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    if (user) {
      initializeChatSession();
    }
  }, [user]);

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user context data first
      const context = await chatAPI.getUserContext(user.uid);
      setContextData(context);

      // Start new chat session
      const sessionData = await chatAPI.startChatSession(user.uid);
      setCurrentSessionId(sessionData.sessionId);

      // Set initial AI greeting with personalized context
      const initialMessage = {
        id: 1,
        text: generatePersonalizedGreeting(context),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    } catch (err) {
      console.error("Error initializing chat session:", err);
      setError("Failed to start chat session. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedGreeting = (context) => {
    if (!context) {
      return "Hello! I'm here to listen and support you. How are you feeling today?";
    }

    const { recentMood, previousSummary, goals } = context;

    let greeting = "Hello! I'm here to listen and support you. ";

    if (recentMood?.dominantMood) {
      greeting += `I see you've been feeling ${recentMood.dominantMood} lately. `;
    }

    if (previousSummary?.keyTopics?.length > 0) {
      greeting += `Last time we talked about ${previousSummary.keyTopics.join(
        ", "
      )}. `;
    }

    if (goals && goals.length > 0) {
      greeting += `I remember you're working on ${goals[0].title}. `;
    }

    greeting += "How are you feeling today?";

    return greeting;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping || !currentSessionId) return;

    const messageText = inputMessage.trim();
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    setError(null);

    try {
      console.log("Sending message payload:", {
        sessionId: currentSessionId,
        userId: user.uid,
        message: messageText,
        contextData,
      });

      // Send message to backend
      const response = await chatAPI.sendMessage(
        currentSessionId,
        user.uid,
        messageText,
        contextData
      );

      // Handle the response structure
      const aiResponseText =
        response.data?.aiResponse || response.aiResponse || response.message;

      if (!aiResponseText) {
        throw new Error("No AI response received");
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEndSession = async () => {
    try {
      if (currentSessionId) {
        await chatAPI.endChatSession(currentSessionId);
      }
      setShowFeedback(true);
    } catch (err) {
      console.error("Error ending session:", err);
      setShowFeedback(true); // Still show feedback modal
    }
  };
  

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      if (currentSessionId) {
        await chatAPI.submitFeedback(currentSessionId, user.uid, feedbackData);
      }
      toast.success("Feedback submitted successfully:", feedbackData);

      navigate("/profile"); // ✅ Redirect here after submitting feedback
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };
  

  const retryConnection = () => {
    initializeChatSession();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Starting your session...
          </p>
        </div>
      </div>
    );
  }

  // Error state (only for initialization errors)
  if (error && messages.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Connection Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={retryConnection}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header - Fixed height */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-white/40 dark:border-gray-700/40 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                AI Support Companion
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {contextData?.recentMood?.dominantMood
                  ? `Personalized for your ${contextData.recentMood.dominantMood} mood`
                  : "Always here to listen"}
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={handleEndSession}>
            End Session
          </Button>
        </div>
      </header>

      {/* Error Banner - Fixed height when shown */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex-shrink-0"
          >
            <div className="max-w-4xl mx-auto flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 dark:text-red-400 text-sm">
                {error}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                ×
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages - Takes remaining space and scrolls internally */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="max-w-4xl mx-auto space-y-2">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.text}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
                isError={msg.isError}
              />
            ))}
          </AnimatePresence>
          {isTyping && <ChatMessage isTyping />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Fixed height */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-t border-white/40 dark:border-gray-700/40 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-xl resize-none border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none max-h-24"
            rows={1}
            disabled={isTyping}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping || !currentSessionId}
            className="relative"
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        sessionId={currentSessionId}
        userId={user?.uid}
      />
    </div>
  );
};

export default ChatPage;
