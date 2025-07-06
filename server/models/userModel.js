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
      default: "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-transparent-600nw-2534623321.jpg",
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
      firstName: { type: String },
      lastName: { type: String },
      dateOfBirth: { type: Date },
      phoneNumber: { type: String },
      // Extend as needed
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

const User = mongoose.model("User", userSchema);
module.exports = User;
