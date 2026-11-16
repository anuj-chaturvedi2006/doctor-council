
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      required: true,
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

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
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

    purpose: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },
    rescheduleHistory: [
  {
    oldAppointmentDate: {
      type: Date,
      required: true,
    },
    oldAppointmentTime: {
      type: String,
      required: true,
    },
    oldMeetingMode: {
      type: String,
      enum: ["online", "offline"],
    },
    oldMeetingLink: {
      type: String,
      default: "",
    },
    oldLocation: {
      type: String,
      default: "",
    },
    rescheduledAt: {
      type: Date,
      default: Date.now,
    },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
    },
  },
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
