import React, { useState } from "react";
import ChatMessage from "../components/Chat-Component/ChatMessage";
import FeedbackModal from "../components/Chat-Component/FeedbackModal";
import { Heart, Send } from "lucide-react";
import Button from "../components/Utility-Component/Button";

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

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);
    setTimeout(() => {
      const aiMsg = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-white/40 dark:border-gray-700/40 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
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
          <Button variant="secondary" onClick={() => setShowFeedback(true)}>
            End Session
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg.text} isUser={msg.isUser} />
          ))}
          {isTyping && <ChatMessage isTyping />}
        </div>
      </div>

      {/* Input */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-t border-white/40 dark:border-gray-700/40 p-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 p-3 rounded-xl resize-none border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            rows={1}
          />
          <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={(data) => console.log("Feedback:", data)}
      />
    </div>
  );
};

export default ChatPage;
