const mongoose = require("mongoose");

const counsellingSessionSchema = new mongoose.Schema(
  {
    sessionNumber: {
      type: String,
      unique: true,
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },

    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },

    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },

    sessionDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      default: "",
    },

    endTime: {
      type: String,
      default: "",
    },

    meetingMode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    agenda: {
      type: String,
      default: "",
    },

    discussion: {
      type: String,
      default: "",
    },

    outcome: {
      type: String,
      default: "",
    },

    nextSteps: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CounsellingSession",
  counsellingSessionSchema
);