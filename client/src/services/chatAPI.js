// services/chatAPI.js - Enhanced with better error handling and response parsing
import { getAuth } from "firebase/auth";

const API_BASE_URL = "http://localhost:3000/api";

class ChatAPIService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    // Add Firebase Auth token if available
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const idToken = await currentUser.getIdToken();
        defaultOptions.headers.Authorization = `Bearer ${idToken}`;
      } catch (error) {
        console.warn("Failed to get Firebase auth token:", error);
      }
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Get enhanced user context including chat summaries
  async getUserContext(userId) {
    try {
      const response = await this.request(`/chat/context/${userId}`);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching user context:", error);
      throw error;
    }
  }

  // Get all user data with enhanced context
  async getAllUserData(userId) {
    try {
      const response = await this.request(`/chat/context/${userId}`);
      const data = response.data || response;

      return {
        moodLogs: data.recentMood?.entries || [],
        goals: data.goals || [],
        chatHistory: data.previousSummary || null,
        chatSummaries: data.chatSummaries || [],
        recentMood: data.recentMood || null,
        feedbackHistory: data.feedbackHistory || [],
        userName: data.userName || null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  // Start a new chat session
  async startChatSession(userId) {
    try {
      const response = await this.request("/chat/session/start", {
        method: "POST",
        body: JSON.stringify({
          userId,
        }),
      });
      return response.data || response;
    } catch (error) {
      console.error("Error starting chat session:", error);
      throw error;
    }
  }

  // Send message to AI with full context
  async sendMessage(sessionId, userId, message, contextData = null) {
    try {
      const payload = {
        sessionId,
        userId,
        message,
      };

      // Only include contextData if it exists
      if (contextData) {
        payload.contextData = contextData;
      }

      const response = await this.request("/chat/message", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // End chat session
  async endChatSession(sessionId) {
    try {
      const response = await this.request(`/chat/session/${sessionId}/end`, {
        method: "PUT",
      });
      return response.data || response;
    } catch (error) {
      console.error("Error ending chat session:", error);
      throw error;
    }
  }

  // Submit feedback for chat session
  async submitFeedback(sessionId, userId, feedbackData) {
    try {
      const response = await this.request("/chat/feedback", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId,
          ...feedbackData,
        }),
      });
      return response.data || response;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  // Get user's chat summaries (optional method for direct access)
  async getUserChatSummaries(userId, limit = 10) {
    try {
      const response = await this.request(
        `/chat/summaries/${userId}?limit=${limit}`
      );
      return response.data || response;
    } catch (error) {
      console.error("Error fetching chat summaries:", error);
      throw error;
    }
  }

  // Health check method
  async healthCheck() {
    try {
      const response = await this.request("/health");
      return response;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  }
}

export const chatAPI = new ChatAPIService();

// Usage example for frontend components:
/*
// In your React component
const startChat = async () => {
  try {
    // Get enhanced context including chat summaries
    const contextData = await chatAPI.getUserContext(userId);
    
    // Start new session
    const session = await chatAPI.startChatSession(userId);
    
    // Send message with full context
    const response = await chatAPI.sendMessage(
      session.sessionId,
      userId,
      userMessage,
      contextData
    );
    
    // AI will now have access to:
    // - Recent mood data
    // - Active goals
    // - Previous conversation summary
    // - Chat history summaries (last 5 sessions)
    // - Feedback history
    
  } catch (error) {
    console.error('Chat error:', error);
  }
};
*/
