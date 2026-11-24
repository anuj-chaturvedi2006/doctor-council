
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
      index: true,
    },

    // Assignment active counsellor ko identify karega
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingAssignment",
      default: null,
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

    // Student booking par pending; counsellor/admin booking par scheduled
    status: {
      type: String,
      enum: [
        "pending",
        "scheduled",
        "rescheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },

    createdByRole: {
      type: String,
      enum: ["student", "counsellor", "admin", "superadmin"],
      required: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
    },

rescheduleRequests: [
  {
    // Original appointment snapshot
    originalAppointment: {
      appointmentDate: {
        type: Date,
      },
      appointmentTime: {
        type: String,
      },
      meetingMode: {
        type: String,
        enum: ["online", "offline"],
      },
      meetingLink: {
        type: String,
        default: "",
      },
      location: {
        type: String,
        default: "",
      },
    },

    // Requested appointment details
    requestedAppointmentDate: {
      type: Date,
      required: true,
    },

    requestedAppointmentTime: {
      type: String,
      required: true,
    },

    requestedMeetingMode: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },

    requestedMeetingLink: {
      type: String,
      default: "",
    },

    requestedLocation: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      default: "",
    },
  },
],

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

appointmentSchema.index({ student: 1, appointmentDate: 1 });
appointmentSchema.index({ counsellor: 1, appointmentDate: 1 });
appointmentSchema.index({ counsellingRequest: 1, status: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
