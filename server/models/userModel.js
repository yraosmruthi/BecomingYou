const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true, // Firebase UID
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default:
        "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-transparent-600nw-2534623321.jpg",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
    profile: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      bio: { type: String, maxlength: 500 },
      dateOfBirth: { type: Date },
      phoneNumber: { type: String, trim: true },
      location: { type: String, trim: true },
      occupation: { type: String, trim: true },
      interests: [{ type: String, trim: true }],
    },
    // Privacy Settings
    privacySettings: {
      profileVisible: { type: Boolean, default: true },
      showEmail: { type: Boolean, default: false },
      showStats: { type: Boolean, default: true },
      allowNotifications: { type: Boolean, default: true },
    },
    // User Statistics (calculated fields)
    stats: {
      totalMoodEntries: { type: Number, default: 0 },
      completedGoals: { type: Number, default: 0 },
      averageMood: { type: Number, default: 0, min: 0, max: 5 },
    },
    responseTagPreference: {
      type: Schema.Types.ObjectId,
      ref: "ResponseTagPreference",
    },
    support: {
      type: Schema.Types.ObjectId,
      ref: "Support",
    },
    streak: {
      type: Schema.Types.ObjectId,
      ref: "Streak",
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Helper to find user by Firebase UID
userSchema.statics.findByFirebaseUID = function (uid) {
  return this.findOne({ uid });
};

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.displayName;
});

// Method to update user stats
userSchema.methods.updateStats = async function (statsUpdate) {
  Object.assign(this.stats, statsUpdate);
  return this.save();
};

const User = mongoose.model("User", userSchema);
module.exports = User;
