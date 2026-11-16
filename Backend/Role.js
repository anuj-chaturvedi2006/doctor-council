const mongoose=require("mongoose")
const roleSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        students: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        roles: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        courses: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        degrees: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        universities: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        streams: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        specializations: {
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        emailTemplates:{
          create: false,
          view: true,
          update: false,
          delete: false,
        },
        contacts:{
          create: false,
          view: true,
          update: false,
          delete: false,
        }
      }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports=mongoose.model("Role",roleSchema)