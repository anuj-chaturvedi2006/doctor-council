const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name: {
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

    description: {
      type: String,
      default: ""
    },

    stream: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
      index: true
    },

    degree: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Degree",
      required: true,
      index: true
    },

    duration: {
      value: {
        type: Number,
        min: 0
      },

      unit: {
        type: String,
        enum: ["months", "years"],
        required: true
      }
    },

    eligibility: {
      minimumPercentage: {
        type: Number,
        min: 0,
        max: 100
      },

      requiredSubjects: [
        {
          type: String,
          trim: true
        }
      ],

      requiredQualification: {
        type: String,
        default: ""
      }
    },

    entranceExams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EntranceExam"
      }
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
    },

    seo: {
      title: String,
      description: String,
      keywords: [String]
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({
  stream: 1,
  degree: 1,
  status: 1
});

module.exports = mongoose.model("Course", courseSchema);