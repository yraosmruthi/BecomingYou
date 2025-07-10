// feedbackService.js - API service for feedback operations with Firebase Authentication
import { getAuth } from "firebase/auth";

class FeedbackService {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
    this.apiUrl = `${baseURL}/api/feedback`;
    this.auth = getAuth();
  }

  // Helper method to get current authenticated user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Helper method to get Firebase ID token
  async getIdToken() {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return await user.getIdToken();
  }

  // Helper method to make authenticated API calls
  async makeRequest(url, options = {}) {
    try {
      // Get Firebase ID token for authentication
      const token = await this.getIdToken();

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific authentication errors
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        if (response.status === 403) {
          throw new Error(
            "Access denied. You don't have permission to perform this action."
          );
        }
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Validate user authentication before making requests
  validateAuthentication() {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("User must be authenticated to perform this action");
    }
    return user;
  }

  // Submit feedback for a chat session
  async submitFeedback(feedbackData) {
    const user = this.validateAuthentication();
    const { sessionId, rating, comment, moodAfterChat } = feedbackData;

    return this.makeRequest(`${this.apiUrl}/submit`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId: user.uid, // Use Firebase UID
        rating,
        comment,
        moodAfterChat,
      }),
    });
  }

  // Get feedback for a specific session
  async getFeedback(sessionId) {
    const user = this.validateAuthentication();
    const url = `${this.apiUrl}/session/${sessionId}?userId=${user.uid}`;
    return this.makeRequest(url);
  }

  // Get all feedback for the current user with pagination
  async getUserFeedback(page = 1, limit = 10) {
    const user = this.validateAuthentication();
    const url = `${this.apiUrl}/user/${user.uid}?page=${page}&limit=${limit}`;
    return this.makeRequest(url);
  }

  // Get feedback analytics for the current user
  async getFeedbackAnalytics(startDate, endDate) {
    const user = this.validateAuthentication();
    let url = `${this.apiUrl}/analytics/${user.uid}`;

    if (startDate && endDate) {
      url += `?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;
    }

    return this.makeRequest(url);
  }

  // Update feedback (within 24 hours)
  async updateFeedback(feedbackId, updateData) {
    const user = this.validateAuthentication();
    const url = `${this.apiUrl}/${feedbackId}`;

    return this.makeRequest(url, {
      method: "PUT",
      body: JSON.stringify({
        userId: user.uid,
        ...updateData,
      }),
    });
  }

  // Delete feedback (if allowed by backend)
  async deleteFeedback(feedbackId) {
    const user = this.validateAuthentication();
    const url = `${this.apiUrl}/${feedbackId}`;

    return this.makeRequest(url, {
      method: "DELETE",
      body: JSON.stringify({
        userId: user.uid,
      }),
    });
  }

  // Get feedback statistics (for admin/analytics)
  async getFeedbackStats() {
    return this.makeRequest(`${this.apiUrl}/stats`);
  }

  // Get user info for debugging/display purposes
  getUserInfo() {
    const user = this.getCurrentUser();
    if (!user) {
      return null;
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.getCurrentUser() !== null;
  }

  // Listen for authentication state changes
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }
}

// Export singleton instance
const feedbackService = new FeedbackService();
export default feedbackService;
