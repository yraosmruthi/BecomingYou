// services/chatAPI.js
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
      const idToken = await currentUser.getIdToken();
      defaultOptions.headers.Authorization = `Bearer ${idToken}`;
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

  // Get user context for personalized chat
  async getUserContext(userId) {
    try {
      const response = await this.request(`/chat/context/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user context:", error);
      throw error;
    }
  }

  // Get all user data (replaces individual methods)
  async getAllUserData(userId) {
    try {
      const response = await this.request(`/chat/context/${userId}`);
      return {
        moodLogs: response.data.recentMood?.entries || [],
        goals: response.data.goals || [],
        chatHistory: response.data.previousSummary || null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  // Start a new chat session
  async startChatSession(userId, contextData) {
    try {
      const response = await this.request("/chat/session/start", {
        method: "POST",
        body: JSON.stringify({
          userId,
          contextData,
        }),
      });
      return response.data;
    } catch (error) {
      console.error("Error starting chat session:", error);
      throw error;
    }
  }

  // Send message to AI and get response
  async sendMessage(sessionId, userId, message, contextData) {
    try {
      const response = await this.request("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          userId,
          message,
          contextData,
        }),
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
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }
  
}

export const chatAPI = new ChatAPIService();
