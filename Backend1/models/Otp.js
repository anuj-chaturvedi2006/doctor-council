const mongoose=require("mongoose")
const otpSchema = mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },

  otp: String,

  verified: {
    type: Boolean,
    default: false,
  },

  expiresAt: Date,
});

module.exports=mongoose.model("Otp",otpSchema)