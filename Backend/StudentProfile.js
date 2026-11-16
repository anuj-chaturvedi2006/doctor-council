
const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    // User1 collection ki ID ka reference
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User1",
      required: true,
      unique: true,
    },

    // Personal Details
    gender: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      addressLine: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "India" },
      pincode: { type: String, default: "" },
    },

    // Academic Details
    academicDetails: {
      course: { type: String, default: "" },
      college: { type: String, default: "" },
      university: { type: String, default: "" },
      stream: { type: String, default: "" },
      admissionYear: { type: String, default: "" },
      semester: { type: String, default: "" },
      enrollmentNumber: { type: String, default: "" },
      qualification: { type: String, default: "" },
      board: { type: String, default: "" },
      passingYear: { type: String, default: "" },
      percentage: { type: String, default: "" },
    },

    // Entrance Exam Details
    entranceExams: [
      {
        examName: { type: String, default: "" },
        examType: { type: String, default: "" },
        conductingBody: { type: String, default: "" },
        examYear: { type: String, default: "" },
        applicationNumber: { type: String, default: "" },
        rollNumber: { type: String, default: "" },
        registrationNumber: { type: String, default: "" },
        examDate: { type: Date, default: null },
        examMode: { type: String, default: "" },
        totalMarks: { type: String, default: "" },
        obtainedMarks: { type: String, default: "" },
        percentage: { type: String, default: "" },
        percentile: { type: String, default: "" },
        allIndiaRank: { type: String, default: "" },
        categoryRank: { type: String, default: "" },
        resultStatus: { type: String, default: "" },
        counselingStatus: { type: String, default: "" },
        preferredCourse: { type: String, default: "" },
        preferredCollege: { type: String, default: "" },
        scoreCardNumber: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);
