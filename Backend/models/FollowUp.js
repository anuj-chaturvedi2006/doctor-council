const mongoose =require("mongoose")
const FollowUpSchema = new mongoose.Schema(
  {
    counsellingRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounsellingRequest",
      required: true,
      index: true
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: String,

    dueAt: {
      type: Date,
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["call", "email", "document", "appointment", "other"],
      default: "call"
    },

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled", "overdue"],
      default: "pending",
      index: true
    },

    completedAt: Date,
    outcome: String
  },
  { timestamps: true }
);

module.exports=mongoose.model("FollowUp",FollowUpSchema)