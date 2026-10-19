const mongoose = require("mongoose");

const degreeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    shortName: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },

    level: {
      type: String,
      required: true,
      enum: [
        "certificate",
        "diploma",
        "undergraduate",
        "postgraduate",
        "doctoral",
        "postdoctoral",
        "other"
      ],
      index: true
    },

    degreeType: {
      type: String,
      enum: [
        "academic",
        "professional",
        "vocational",
        "research",
        "other"
      ],
      default: "academic"
    },

    defaultDuration: {
      value: {
        type: Number,
        min: 0
      },

      unit: {
        type: String,
        enum: ["months", "years"]
      }
    },

    description: {
      type: String,
      default: ""
    },

    streams: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stream",
  },
],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    displayOrder: {
      type: Number,
      default: 0
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

degreeSchema.index({
  level: 1,
  status: 1
});

module.exports = mongoose.model("Degree", degreeSchema);