const mongoose = require("mongoose");

const specializationSchema = new mongoose.Schema(
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

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
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
        enum: ["months", "years"]
      }
    },

    eligibility: {
      minimumPercentage: {
        type: Number,
        min: 0,
        max: 100
      },

      requiredSubjects: [String],

      requiredQualification: String
    },

    careerOptions: [
      {
        type: String,
        trim: true
      }
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true
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

specializationSchema.index({
  course: 1,
  status: 1
});

module.exports = mongoose.model(
  "Specialization",
  specializationSchema
);