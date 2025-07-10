import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import Button from "../Utility-Component/Button";
import Modal from "../Utility-Component/Modal";
import Input from "../Utility-Component/Input";

const NewGoalModal = ({ isOpen, onClose, onSubmit }) => {
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    type: "short-term",
    targetDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!goalData.title || !goalData.description || !goalData.targetDate) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate target date is in the future
    const targetDate = new Date(goalData.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate <= today) {
      setError("Target date must be in the future");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(goalData);

      // Reset form and close modal
      setGoalData({
        title: "",
        description: "",
        type: "short-term",
        targetDate: "",
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setGoalData({
        title: "",
        description: "",
        type: "short-term",
        targetDate: "",
      });
      setError(null);
      onClose();
    }
  };

  const handleInputChange = (field, value) => {
    setGoalData({ ...goalData, [field]: value });
    // Clear error when user starts typing
    if (error) setError(null);
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Goal">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Goal Title"
          value={goalData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          placeholder="e.g., Exercise 3 times per week"
          required
          disabled={loading}
          maxLength={100}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={goalData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your goal in detail..."
            className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-xl resize-none h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            required
            disabled={loading}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {goalData.description.length}/500 characters
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Goal Type <span className="text-red-500">*</span>
          </label>
          <select
            value={goalData.type}
            onChange={(e) => handleInputChange("type", e.target.value)}
            className="w-full p-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <option value="short-term">Short-term (1-3 months)</option>
            <option value="long-term">Long-term (3+ months)</option>
          </select>
        </div>

        <Input
          label="Target Date"
          type="date"
          value={goalData.targetDate}
          onChange={(e) => handleInputChange("targetDate", e.target.value)}
          min={getMinDate()}
          required
          disabled={loading}
        />

        {/* Goal type recommendations */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Goal Type Guide
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>
              <strong>Short-term:</strong> Daily habits, skill building, fitness
              challenges
            </p>
            <p>
              <strong>Long-term:</strong> Career goals, major life changes, big
              projects
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Goal"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewGoalModal;
