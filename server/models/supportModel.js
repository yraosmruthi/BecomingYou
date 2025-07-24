const mongoose = require("mongoose");
const { Schema } = mongoose;

const supportSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    preferredSupportType: {
      type: String,
      enum: ["AI only", "AI + human", "human only", "crisis hotline"],
      default: "AI only",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    // Array of custom emergency numbers added by user
    emergencyNumbers: [
      {
        type: {
          type: String,
          required: true,
          trim: true,
          maxlength: 50,
        },
        number: {
          type: String,
          required: true,
          trim: true,
          maxlength: 20,
        },
        description: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Default emergency contacts visibility
    showDefaultContacts: {
      type: Boolean,
      default: true,
    },
    // Crisis intervention settings
    crisisSettings: {
      allowCrisisDetection: {
        type: Boolean,
        default: true,
      },
      autoContactEmergency: {
        type: Boolean,
        default: false,
      },
      crisisKeywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supportSchema.index({ userId: 1 });

// Method to add emergency number
supportSchema.methods.addEmergencyNumber = function (
  type,
  number,
  description
) {
  this.emergencyNumbers.push({
    type: type.trim(),
    number: number.trim(),
    description: description ? description.trim() : "",
  });
  return this.save();
};

// Method to remove emergency number
supportSchema.methods.removeEmergencyNumber = function (numberId) {
  this.emergencyNumbers = this.emergencyNumbers.filter(
    (num) => num._id.toString() !== numberId
  );
  return this.save();
};

// Static method to find by user ID
supportSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

const Support = mongoose.model("Support", supportSchema);
module.exports = Support;
