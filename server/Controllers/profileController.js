const User = require("../models/userModel");
const Support = require("../models/supportModel");

const profileController = {
  // Get user profile data
  getProfile: async (req, res) => {
    try {
      const uid = req.user.uid; // From Firebase middleware

      const user = await User.findByFirebaseUID(uid)
        .populate("support")
        .select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          profile: user.profile,
          privacySettings: user.privacySettings,
          emailVerified: user.emailVerified,
          support: user.support || null,
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      });
    }
  },

  // Update basic profile info (display name)
  updateProfile: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { displayName, profile } = req.body;

      const updateData = {};
      if (displayName !== undefined) {
        if (!displayName.trim()) {
          return res.status(400).json({
            success: false,
            message: "Display name cannot be empty",
          });
        }
        updateData.displayName = displayName.trim();
      }

      if (profile !== undefined) {
        updateData.profile = { ...profile };
        // Trim string fields in profile
        Object.keys(updateData.profile).forEach((key) => {
          if (typeof updateData.profile[key] === "string") {
            updateData.profile[key] = updateData.profile[key].trim();
          }
        });
      }

      const user = await User.findOneAndUpdate({ uid }, updateData, {
        new: true,
        runValidators: true,
      }).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  },

  // Update email (Note: For Firebase, you might want to handle this on frontend)
  updateEmail: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { email } = req.body;

      if (!email || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      // Check if email is already in use
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        uid: { $ne: uid },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      const user = await User.findOneAndUpdate(
        { uid },
        {
          email: email.toLowerCase().trim(),
          emailVerified: false, // Reset verification status
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
        message:
          "Email updated successfully. Please verify your new email address.",
      });
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update email",
        error: error.message,
      });
    }
  },

  // Update photo URL
  updatePhoto: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { photoURL } = req.body;

      const user = await User.findOneAndUpdate(
        { uid },
        { photoURL: photoURL || null },
        {
          new: true,
          runValidators: true,
        }
      ).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
        message: "Profile photo updated successfully",
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update profile photo",
        error: error.message,
      });
    }
  },

  // Update privacy settings
  updatePrivacySettings: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { privacySettings } = req.body;

      const user = await User.findOneAndUpdate(
        { uid },
        { privacySettings },
        {
          new: true,
          runValidators: true,
        }
      ).select("-__v");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
        message: "Privacy settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update privacy settings",
        error: error.message,
      });
    }
  },

  // Get support settings
  getSupportSettings: async (req, res) => {
    try {
      const uid = req.user.uid;

      const user = await User.findByFirebaseUID(uid);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      let supportSettings = await Support.findOne({ userId: uid });

      // If no settings exist, create default ones
      if (!supportSettings) {
        supportSettings = new Support({
          userId: uid,
          preferredSupportType: "AI only",
          emergencyNumbers: [],
        });
        await supportSettings.save();

        // Link to user
        await User.findOneAndUpdate({ uid }, { support: supportSettings._id });
      }

      res.json({
        success: true,
        data: supportSettings,
      });
    } catch (error) {
      console.error("Error fetching support settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch support settings",
        error: error.message,
      });
    }
  },

  // Update support settings
  updateSupportSettings: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { emergencyContact, preferredSupportType, notes } = req.body;

      const updateData = {};

      if (emergencyContact !== undefined)
        updateData.emergencyContact = emergencyContact;
      if (preferredSupportType !== undefined)
        updateData.preferredSupportType = preferredSupportType;
      if (notes !== undefined) updateData.notes = notes;

      let supportSettings = await Support.findOneAndUpdate(
        { userId: uid },
        updateData,
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

      // Ensure user is linked to support settings
      await User.findOneAndUpdate({ uid }, { support: supportSettings._id });

      res.json({
        success: true,
        data: supportSettings,
        message: "Support settings updated successfully",
      });
    } catch (error) {
      console.error("Error updating support settings:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update support settings",
        error: error.message,
      });
    }
  },

  // Add emergency number
  addEmergencyNumber: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { type, number, description } = req.body;

      if (!type || !number) {
        return res.status(400).json({
          success: false,
          message: "Emergency contact type and number are required",
        });
      }

      let supportSettings = await Support.findOne({ userId: uid });

      if (!supportSettings) {
        supportSettings = new Support({
          userId: uid,
          preferredSupportType: "AI only",
          emergencyNumbers: [],
        });
      }

      // Add new emergency number
      supportSettings.emergencyNumbers.push({
        type: type.trim(),
        number: number.trim(),
        description: description ? description.trim() : "",
      });

      await supportSettings.save();

      // Link to user if not already linked
      await User.findOneAndUpdate({ uid }, { support: supportSettings._id });

      res.json({
        success: true,
        data: supportSettings,
        message: "Emergency number added successfully",
      });
    } catch (error) {
      console.error("Error adding emergency number:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add emergency number",
        error: error.message,
      });
    }
  },

  // Remove emergency number
  removeEmergencyNumber: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { numberId } = req.params;

      const supportSettings = await Support.findOne({ userId: uid });

      if (!supportSettings) {
        return res.status(404).json({
          success: false,
          message: "Support settings not found",
        });
      }

      if (
        !supportSettings.emergencyNumbers ||
        supportSettings.emergencyNumbers.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "No emergency numbers found",
        });
      }

      // Remove emergency number by ID
      supportSettings.emergencyNumbers =
        supportSettings.emergencyNumbers.filter(
          (num) => num._id.toString() !== numberId
        );

      await supportSettings.save();

      res.json({
        success: true,
        data: supportSettings,
        message: "Emergency number removed successfully",
      });
    } catch (error) {
      console.error("Error removing emergency number:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove emergency number",
        error: error.message,
      });
    }
  },
};

module.exports = profileController;
