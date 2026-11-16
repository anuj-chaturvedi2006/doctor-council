
const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 1,
    },

    durationDays: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    features: [{
      type: String,
    }],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
