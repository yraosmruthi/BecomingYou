// services/goalService.js
import axios from "axios";
import { auth } from "../components/Auth/Firebase-config"; // Assuming you have firebase config file
import { onAuthStateChanged, signOut } from "firebase/auth";
const API_BASE_URL = "http://localhost:3000/api/goals";

class GoalService {
  // Get current auth token from Firebase
  async getAuthToken() {
    const { getAuth } = await import("firebase/auth"); // ✅ Directly import getAuth
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No authenticated user found");
    }

    return await user.getIdToken();
  }

  // Helper method to get common headers
  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Something went wrong");
    }
    return response.json();
  }

  // Get all goals for a user
  async getGoals(userId, filter = "all", sort = "createdAt") {
    try {
      const queryParams = new URLSearchParams();
      if (filter !== "all") {
        queryParams.append("filter", filter);
      }
      if (sort) {
        queryParams.append("sort", sort);
      }

      const response = await fetch(
        `${API_BASE_URL}/user/${userId}?${queryParams}`,
        {
          method: "GET",
          headers: await this.getHeaders(),
        }
      );

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error fetching goals:", error);
      throw error;
    }
  }

  // Get a specific goal
  async getGoal(goalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${goalId}`, {
        method: "GET",
        headers: await this.getHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error fetching goal:", error);
      throw error;
    }
  }

  // Create a new goal
  async createGoal(goalData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(goalData),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  // Update a goal
  async updateGoal(goalId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/${goalId}`, {
        method: "PUT",
        headers: await this.getHeaders(),
        body: JSON.stringify(updates),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  }

  // Update goal progress
  async updateProgress(goalId, progress) {
    try {
      const response = await fetch(`${API_BASE_URL}/${goalId}/progress`, {
        method: "PATCH",
        headers: await this.getHeaders(),
        body: JSON.stringify({ progress }),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  // Delete a goal
  async deleteGoal(goalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/${goalId}`, {
        method: "DELETE",
        headers: await this.getHeaders(),
      });

      await this.handleResponse(response);
      return true;
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  }

  // Get goal statistics
  async getGoalStats(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/stats`, {
        method: "GET",
        headers: await this.getHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error fetching goal stats:", error);
      throw error;
    }
  }

  // Get overdue goals
  async getOverdueGoals(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/overdue`, {
        method: "GET",
        headers: await this.getHeaders(),
      });

      const result = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error("Error fetching overdue goals:", error);
      throw error;
    }
  }
}

// Export a singleton instance
const goalService = new GoalService();
export default goalService;
