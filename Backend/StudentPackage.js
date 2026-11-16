
const mongoose = require("mongoose");

const studentPackageSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
    },

    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    packageName: {
      type: String,
      required: true,
    },

    amountPaise: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpaySignature: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["created", "pending", "paid", "failed"],
      default: "created",
    },

    packageStatus: {
      type: String,
      enum: ["inactive", "active", "expired"],
      default: "inactive",
    },

    startDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentPackage",
  studentPackageSchema
);
