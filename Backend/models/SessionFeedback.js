
const mongoose = require("mongoose");

const sessionFeedbackSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingSession",
      required: true,
      unique: true,
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
    },
    suggestions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SessionFeedback",
  sessionFeedbackSchema
);
