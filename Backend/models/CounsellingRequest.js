const mongoose = require("mongoose");

const counsellingRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      required: true,
      unique: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
    },

    admissionLevel: {
      type: String,
      enum: ["UG", "PG", "Diploma", "Doctorate", "Other"],
      required: true,
    },

    preferredStreams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stream",
      },
    ],

    preferredCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    preferredLocations: [
      {
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        country: { type: String, default: "India" },
      },
    ],

    budget: {
      min: { type: Number, min: 0, default: 0 },
      max: { type: Number, min: 0, default: 0 },
      currency: { type: String, default: "INR" },
    },

    // EntranceExam model abhi available nahi hai,
    // isliye filhaal examName manually save hoga.
    entranceExams: [
      {
        examName: { type: String, default: "" },
        score: { type: Number, default: null },
        percentile: { type: Number, default: null },
        rank: { type: Number, default: null },
        year: { type: Number, default: null },
      },
    ],

    counsellingMode: {
      type: String,
      enum: ["phone", "video", "in_person", "chat"],
      default: "phone",
    },

    preferredTime: {
      date: { type: Date, default: null },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },
    },

    status: {
      type: String,
      enum: [
        "new",
        "assigned",
        "contact_pending",
        "in_progress",
        "recommendations_shared",
        "converted",
        "closed",
        "cancelled",
      ],
      default: "new",
      index: true,
    },
        recommendations: {
      colleges: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "College",
        },
      ],

      courses: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
      ],

      counsellorNote: {
        type: String,
        default: "",
      },

      sharedAt: {
        type: Date,
        default: null,
      },

      sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User1",
        default: null,
      },
    },

    requestDescription: {
  type: String,
  default: "",
  trim: true,
},

    source: {
      type: String,
      enum: ["website", "organic", "referral", "campaign", "college", "other"],
      default: "website",
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    closedAt: Date,
    cancellationReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "CounsellingRequest",
  counsellingRequestSchema
);