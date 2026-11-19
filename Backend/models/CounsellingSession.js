
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
      index: true,
    },

    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
      index: true,
    },

    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
      index: true,
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

    recommendations: [
      {
        type: String,
        trim: true,
      },
    ],

    nextFollowUpDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
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

    rescheduleHistory: [
      {
        oldSessionDate: Date,
        oldStartTime: String,
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
        rescheduledBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User1",
        },
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

counsellingSessionSchema.index({ appointment: 1, sessionDate: 1 });
counsellingSessionSchema.index({ student: 1, sessionDate: 1 });
counsellingSessionSchema.index({ counsellor: 1, sessionDate: 1 });

module.exports = mongoose.model(
  "CounsellingSession",
  counsellingSessionSchema
);
