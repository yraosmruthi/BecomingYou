const User = require("../models/userModel");
const admin = require("../Config/firebase-admin")

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { uid, email } = req.user; // From Firebase token
      const { displayName } = req.body;

      // Check if user already exists
      let user = await User.findOne({ uid });

      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create new user
      user = new User({
        uid,
        email,
        displayName,
        emailVerified: req.user.email_verified || false,
        provider: "email",
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { uid, email } = req.user; // From Firebase token

      // Find or create user
      let user = await User.findOne({ uid });

      if (!user) {
        // Create user if doesn't exist (shouldn't happen in normal flow)
        user = new User({
          uid,
          email,
          displayName: req.user.name || "User",
          emailVerified: req.user.email_verified || false,
          provider: "email",
        });
        await user.save();
      } else {
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
      }

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  },

  // Google sign-in
  googleAuth: async (req, res) => {
    try {
      const { uid, email, name, picture } = req.user; // From Firebase token
      const { isNewUser } = req.body;

      // Find or create user
      let user = await User.findOne({ uid });

      if (!user) {
        // Create new user
        user = new User({
          uid,
          email,
          displayName: name || "User",
          photoURL: picture || null,
          emailVerified: req.user.email_verified || true, // Google accounts are usually verified
          provider: "google",
        });
        await user.save();
      } else {
        // Update existing user
        user.displayName = name || user.displayName;
        user.photoURL = picture || user.photoURL;
        user.lastLoginAt = new Date();
        await user.save();
      }

      res.json({
        success: true,
        message: isNewUser
          ? "Account created successfully"
          : "Login successful",
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          profile: user.profile,
        },
        isNewUser,
      });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  },

  // Verify token and get user data
  verify: async (req, res) => {
    try {
      const { uid } = req.user; // From Firebase token

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ error: "Token verification failed" });
    }
  },

  // Get user profile
  getProfile: async (req, res) => {
    try {
      const { uid } = req.user;

      const user = await User.findOne({ uid });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const { uid } = req.user;
      const updates = req.body;

      const user = await User.findOneAndUpdate(
        { uid },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
};

module.exports = authController;
