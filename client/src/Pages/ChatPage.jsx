import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatMessage from "../components/Chat-Component/ChatMessage";
import FeedbackModal from "../components/Chat-Component/FeedbackModal";

import {
  Heart,
  MessageCircle,
  TrendingUp,
  Target,
  Calendar,
  User,
  Menu,
  X,
  Send,
  Star,
  CheckCircle,
  Plus,
  BarChart3,
  Home,
  LogOut,
  Eye,
  EyeOff,
  Smile,
  Meh,
  Frown,
  ArrowRight,
  Award,
  Clock,
  Moon,
  Sun,
  Trophy,
  Edit,
  Trash2,
} from "lucide-react";


import Button from "../components/Utility-Component/Button"
import Card from "../components/Utility-Component/Card"
import Modal from "../components/Utility-Component/Modal"
import Input from "../components/Utility-Component/Input"

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to listen and support you. How are you feeling today?",
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const aiResponses = [
    "I understand how you're feeling. It's completely normal to have ups and downs.",
    "Thank you for sharing that with me. Your feelings are valid and important.",
    "That sounds challenging. How do you usually cope with situations like this?",
    "I'm here for you. Sometimes just talking about things can help us process them better.",
    "It's okay to not be okay sometimes. What would help you feel a little better right now?",
    "I appreciate you being so open with me. That takes courage.",
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (feedbackData) => {
    console.log("Feedback:", feedbackData);
    // Here you would typically save the feedback to your database
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-white/50 dark:border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                AI Support Companion
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Always here to listen
              </p>
            </div>
          </div>
          <Button variant="secondary" onClick={endSession}>
            End Session
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
          {isTyping && <ChatMessage isTyping={true} />}
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-white/50 dark:border-gray-700/50 p-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="w-full p-3 pr-12 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="1"
            />
          </div>
          <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default ChatPage;
