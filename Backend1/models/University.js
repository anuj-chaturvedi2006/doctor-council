const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    shortName: {
      type: String,
      trim: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },

    logo: {
      type: String
    },

    description: {
      type: String
    },

    type: {
      type: String,
      enum: [
        "central",
        "state",
        "private",
        "deemed",
        "international",
        "other"
      ]
    },

    establishedYear: {
      type: Number
    },

    recognition: [
      {
        name: String,
        year: Number
      }
    ],

    accreditation: [
      {
        name: String,
        grade: String,
        score: String,
        year: Number
      }
    ],

    location: {
      address: String,

      city: {
        type: String,
        index: true
      },

      state: {
        type: String,
        index: true
      },

      country: {
        type: String,
        default: "India"
      },

      pincode: String,

      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },

    contact: {
      email: String,
      phone: String
    },

    website: String,

    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending"
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);