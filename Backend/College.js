const mongoose=require("mongoose")
const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    logo: String,

    description: String,

    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },

    collegeType: {
      type: String,
      enum: ["government", "private", "deemed", "autonomous", "public"],
    },

    ownership: String,

    establishedYear: Number,

    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,

      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    website: String,

    contact: {
      email: String,
      phone: String,
    },

    accreditation: [
      {
        name: String,
        grade: String,
        year: Number,
      },
    ],

    ranking: [
      {
        organization: String,
        rank: Number,
        year: Number,
      },
    ],

    rating: {
      average: {
        type: Number,
        default: 0,
      },

      count: {
        type: Number,
        default: 0,
      },
    },

    facilities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Facility",
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },

 logo: {
  type: String,
  default: "",
},

collegeImage: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true,
  },
);

module.exports=mongoose.model("College", collegeSchema);