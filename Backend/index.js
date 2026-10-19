require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpgenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const app = express();
const port = 2002;
const verifyToken = require("./middleware/auth");
const checkPermission = require("./middleware/permission");
const requireRoleFactory = require("./middleware/requireRole");
const Stream = require("./Stream");
const Degree = require("./Degree");
const Course = require("./Course");
const Specialization = require("./Specialization");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= MAILER =================

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= MONGODB =================

mongoose
  .connect("mongodb://localhost:27017/hotolData")
  .then(() => console.log("database connected"))
  .catch((error) => console.log("database is not connect", error));

// ================= OTP SCHEMA =================

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

// ================= OLD USER SCHEMA =================

const userSchema = mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
  },

  password: String,

  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },

  address: String,
});

// ================= ROLE SCHEMA =================


const modulePermissions = {
  students: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  roles: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  courses: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  degrees: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  streams: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  specializations: {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
};

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
      }),
    },
  },
  {
    timestamps: true,
  }
);


// ================= ADMIN USER SCHEMA =================

const userSchema1 = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

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
  },
  {
    timestamps: true,
  },
);

const College = mongoose.model("College", collegeSchema);

// ================= MODELS =================

const User = mongoose.model("User", userSchema);

const Otp = mongoose.model("Otp", otpSchema);

const Role = mongoose.model("Role", roleSchema);

const User1 = mongoose.model("User1", userSchema1);
const requirePermission = checkPermission(User1);
const requireRole = requireRoleFactory(User1);

app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from .env");

      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    const user = await User1.findOne({
      email: email.trim().toLowerCase(),
    }).populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive or blocked",
      });
    }

    if (!user.role || user.role.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your assigned role is inactive or unavailable",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    // console.log("Login email:", user.email);
    // console.log("Login user ID:", user._id.toString());
    // console.log("Login role:", user.role.roleName);
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role._id,
          roleName: user.role.roleName,
          permissions: user.role.permissions,
        },
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/admin-profile", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId)
      .select("-password")
      .populate("role");

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    if (!user.role || user.role.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Role is inactive",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/forget-pass", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.send({
        status: false,
        message: "email is required",
      });
    }

    const verifyUser = await User.findOne({ email });

    if (!verifyUser) {
      return res.send({
        status: false,
        message: "email does not exist",
      });
    }

    const token = otpgenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", token);

    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp: token,
        verified: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      {
        upsert: true,
        new: true,
      },
    );

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your verification OTP is ${token}. This OTP is valid for 5 minutes.`,
    });

    res.send({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.send({
      message: "OTP not sent",
      success: false,
    });
  }
});

app.post("/verifyemail-forget", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email) {
      return res.send({
        success: false,
        message: "email is required",
      });
    }

    if (!otp) {
      return res.send({
        success: false,
        message: "OTP is required",
      });
    }

    const verifyEmail = await Otp.findOne({ email });

    if (!verifyEmail) {
      return res.send({
        message: "email does not exist",
        success: false,
      });
    }

    if (verifyEmail.expiresAt && verifyEmail.expiresAt < new Date()) {
      return res.send({
        message: "OTP expired",
        success: false,
      });
    }

    if (Number(verifyEmail.otp) !== Number(otp)) {
      return res.send({
        message: "OTP is wrong",
        success: false,
      });
    }

    await Otp.updateOne(
      { email },
      {
        $set: {
          verified: true,
        },
      },
    );

    res.send({
      message: "email is verified",
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.send({
      message: "OTP verification failed",
      success: false,
    });
  }
});

app.post("/forget-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.send({
        message: "email is required",
        success: false,
      });
    }

    if (!password) {
      return res.send({
        message: "please enter password",
        success: false,
      });
    }

    const otpData = await Otp.findOne({ email });

    if (!otpData || !otpData.verified) {
      return res.send({
        message: "please verify OTP first",
        success: false,
      });
    }

    const hashpassword = await bcrypt.hash(password, 9);

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashpassword,
        },
      },
    );

    res.send({
      message: "password is updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.send({
      message: "password not updated",
      success: false,
    });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { password, newPassword, email } = req.body;

    if (!email || !password || !newPassword) {
      return res.send({
        message: "all fields are required",
        success: false,
      });
    }

    const verifyPassword = await User.findOne({ email });

    if (!verifyPassword) {
      return res.send({
        message: "user not found",
        success: false,
      });
    }

    const oldPasswordMatch = await bcrypt.compare(
      password,
      verifyPassword.password,
    );

    if (!oldPasswordMatch) {
      return res.send({
        message: "old password wrong!",
        success: false,
      });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 9);

    await User.updateOne(
      { email },
      {
        $set: {
          password: hashNewPassword,
        },
      },
    );

    res.send({
      message: "password is updated",
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.send({
      message: "error",
      success: false,
    });
  }
});


// Public Student Registration
app.post("/student-register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    // Required fields validation
    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!/^[0-9]{10}$/.test(String(phone).trim())) {
      return res.status(400).json({
        status: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing email
    const existingUser = await User1.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    // Automatically assign the active Student role
    // Never accept a role ID from public registration input
    const studentRole = await Role.findOne({
      roleName: { $regex: /^student$/i },
      status: "active",
    });

    if (!studentRole) {
      return res.status(500).json({
        status: false,
        message: "Active Student role is not configured",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 9);

    // Create student account
    const newStudent = await User1.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: hashedPassword,
      role: studentRole._id,
      isEmailVerified: false,
      isPhoneVerified: false,
      status: "active",
    });

    // Never return the password
    const studentData = await User1.findById(newStudent._id)
      .select("-password")
      .populate("role");

    return res.status(201).json({
      status: true,
      message: "Student registered successfully",
      user: studentData,
    });
  } catch (error) {
    console.error("Student registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    return res.status(500).json({
      status: false,
      message: "Student registration failed",
    });
  }
});


app.post("/admin-user",
  verifyToken,
 requirePermission("students", "create"),
  async (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body || {};

      // Required fields validation
      if (!name?.trim() || !email?.trim() || !phone || !password || !role) {
        return res.status(400).json({
          message: "All fields are required",
          status: false,
        });
      }

      // Check duplicate email
      const normalizedEmail = email.trim().toLowerCase();

      const verifyUser = await User1.findOne({
        email: normalizedEmail,
      });

      if (verifyUser) {
        return res.status(409).json({
          message: "Email already exists",
          status: false,
        });
      }

      // Validate role ID
      if (!mongoose.isValidObjectId(role)) {
        return res.status(400).json({
          message: "Invalid role ID",
          status: false,
        });
      }

      // Find selected active role
      const verifyRole = await Role.findOne({
        _id: role,
        status: "active",
      });

      if (!verifyRole) {
        return res.status(400).json({
          message: "Selected role does not exist or is inactive",
          status: false,
        });
      }

      // Normalize role names
      const normalizeRole = (roleName = "") =>
        roleName.replace(/\s+/g, "").toLowerCase();

      const selectedRoleName = normalizeRole(verifyRole.roleName);
      const currentRoleName = normalizeRole(req.role?.roleName);

      // SuperAdmin can only be created by SuperAdmin
      if (selectedRoleName === "superadmin") {
        if (currentRoleName !== "superadmin") {
          return res.status(403).json({
            message: "Only SuperAdmin can create a SuperAdmin account",
            status: false,
          });
        }

        // Prevent creating another SuperAdmin account
        const existingSuperAdmin = await User1.findOne({
          role: verifyRole._id,
        });

        if (existingSuperAdmin) {
          return res.status(409).json({
            message: "SuperAdmin account already exists",
            status: false,
          });
        }
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 9);

      // Create user
      const createUser = await User1.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: String(phone).trim(),
        password: hashPassword,
        role: verifyRole._id,
        isEmailVerified: true,
        isPhoneVerified: true,
        status: "active",
      });

      // Return user without password
      const userData = await User1.findById(createUser._id)
        .select("-password")
        .populate("role");

      return res.status(201).json({
        message: "User created successfully",
        status: true,
        user: userData,
      });
    } catch (error) {
      console.error("Admin user error:", error);

      return res.status(500).json({
        message:
          error.code === 11000 ? "Email already exists" : "User not registered",
        status: false,
      });
    }
  },
);

//get user

app.get(
  "/get-user",
  verifyToken,
  requirePermission("students", "view"),
  async (req, res) => {
    try {
      const getData = await User1.find()
        .select("-password")
        .populate("role", "roleName status")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        user: getData,
      });
    } catch (error) {
      console.error("Get user error:", error);

      return res.status(500).json({
        success: false,
        message: "Data not found",
      });
    }
  },
);

// EDIT STUDENT
app.post(
  "/admin-edit",
  verifyToken,
  requirePermission("students", "update"),
  async (req, res) => {
    try {
      const { _id, name, email, phone, status } = req.body || {};

      // Student ID validation
      if (!_id || !mongoose.isValidObjectId(_id)) {
        return res.status(400).json({
          status: false,
          message: "Valid student ID is required",
        });
      }

      // Find target user
      const existingUser = await User1.findById(_id).populate("role");

      if (!existingUser) {
        return res.status(404).json({
          status: false,
          message: "Student not found",
        });
      }

      const normalizeRole = (roleName = "") =>
        roleName.replace(/\s+/g, "").toLowerCase();

      const targetRoleName = normalizeRole(existingUser.role?.roleName);

      // Only Student accounts can be edited through this route
      if (targetRoleName !== "student") {
        return res.status(403).json({
          status: false,
          message: "Only Student accounts can be edited here",
        });
      }

      // Only active Student accounts can be newly assigned.
      // This route does not allow changing a student's role.
      const updateData = {};

      // Validate name
      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            status: false,
            message: "Name cannot be empty",
          });
        }

        updateData.name = name.trim();
      }

      // Validate email
      if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
          return res.status(400).json({
            status: false,
            message: "Email cannot be empty",
          });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const duplicateEmail = await User1.findOne({
          email: normalizedEmail,
          _id: { $ne: _id },
        });

        if (duplicateEmail) {
          return res.status(409).json({
            status: false,
            message: "Email already exists",
          });
        }

        updateData.email = normalizedEmail;
      }

      // Validate phone
      if (phone !== undefined) {
        if (!/^\d{10}$/.test(String(phone))) {
          return res.status(400).json({
            status: false,
            message: "Enter a valid 10-digit phone number",
          });
        }

        updateData.phone = String(phone);
      }

      // Validate status
      if (status !== undefined) {
        const allowedStatuses = ["active", "inactive", "blocked"];

        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({
            status: false,
            message: "Invalid student status",
          });
        }

        updateData.status = status;
      }

      // Require at least one field
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          status: false,
          message: "Provide at least one field to update",
        });
      }

      await User1.updateOne(
        { _id },
        { $set: updateData },
        { runValidators: true },
      );

      const updatedUser = await User1.findById(_id)
        .select("-password")
        .populate("role", "roleName status");

      return res.status(200).json({
        status: true,
        message: "Student updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Admin edit error:", error);

      return res.status(500).json({
        status: false,
        message:
          error.code === 11000 ? "Email already exists" : "Student not updated",
      });
    }
  },
);

// DELETE STUDENT
app.post("/admin-delete",
  verifyToken,
  requirePermission("students", "delete"),
  async (req, res) => {
    try {
      const { id } = req.body || {};

      // Validate ID
      if (!id || !mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          status: false,
          message: "Valid student ID is required",
        });
      }

      // Find target user
      const targetUser = await User1.findById(id).populate("role");

      if (!targetUser) {
        return res.status(404).json({
          status: false,
          message: "Student not found",
        });
      }

      const normalizeRole = (roleName = "") =>
        roleName.replace(/\s+/g, "").toLowerCase();

      const targetRoleName = normalizeRole(targetUser.role?.roleName);

      // Only Student accounts can be deleted through this route
      if (targetRoleName !== "student") {
        return res.status(403).json({
          status: false,
          message: "Only Student accounts can be deleted here",
        });
      }

      // Prevent deleting the logged-in account
      if (targetUser._id.toString() === String(req.userId)) {
        return res.status(400).json({
          status: false,
          message: "You cannot delete your own account",
        });
      }

      await User1.findByIdAndDelete(id);

      return res.status(200).json({
        status: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      console.error("Admin delete error:", error);

      return res.status(500).json({
        status: false,
        message: "Student not deleted",
      });
    }
  },
);

// add college route

app.post(
  "/add-college",
  verifyToken,
 requirePermission("colleges", "create"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        logo,
        description,
        collegeType,
        ownership,
        establishedYear,
        location,
        website,
        contact,
        status,
      } = req.body;

      // Validation
      if (!name) {
        return res.send({
          message: "College name is required",
          status: false,
        });
      }

      if (!collegeType) {
        return res.send({
          message: "College type is required",
          status: false,
        });
      }

      // Duplicate name check
      const existingCollege = await College.findOne({
        name: name.trim(),
      });

      if (existingCollege) {
        return res.send({
          message: "College already exists",
          status: false,
        });
      }

      // Generate slug
      const collegeSlug =
        slug ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Duplicate slug check
      const existingSlug = await College.findOne({
        slug: collegeSlug,
      });

      if (existingSlug) {
        return res.send({
          message: "College slug already exists",
          status: false,
        });
      }

      // Create college
      const college = await College.create({
        name: name.trim(),
        slug: collegeSlug,
        logo,
        description,
        collegeType,
        ownership,
        establishedYear,
        location,
        website,
        contact,
        status: status || "pending",
      });

      res.send({
        message: "College added successfully",
        status: true,
        college,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "College not added",
        status: false,
      });
    }
  },
);

//get college route

app.get(
  "/get-college",
  verifyToken,
 requirePermission("colleges", "view"),
  async (req, res) => {
    try {
      const colleges = await College.find().sort({ createdAt: -1 });

      res.send({
        message: "College data fetched successfully",
        status: true,
        college: colleges,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "College data not found",
        status: false,
      });
    }
  },
);

//edit college route
app.post(
  "/edit-college",
  verifyToken,
  requirePermission("colleges", "update"),
  async (req, res) => {
    try {
      const {
        _id,
        name,
        slug,
        logo,
        description,
        collegeType,
        ownership,
        establishedYear,
        location,
        website,
        contact,
        status,
      } = req.body;

      if (!_id) {
        return res.send({
          message: "College ID is required",
          status: false,
        });
      }

      if (!name) {
        return res.send({
          message: "College name is required",
          status: false,
        });
      }

      if (!collegeType) {
        return res.send({
          message: "College type is required",
          status: false,
        });
      }

      // Check duplicate college name
      const duplicateCollege = await College.findOne({
        name: name.trim(),
        _id: { $ne: _id },
      });

      if (duplicateCollege) {
        return res.send({
          message: "College already exists",
          status: false,
        });
      }

      // Check duplicate slug
      if (slug) {
        const duplicateSlug = await College.findOne({
          slug: slug,
          _id: { $ne: _id },
        });

        if (duplicateSlug) {
          return res.send({
            message: "College slug already exists",
            status: false,
          });
        }
      }

      const updateCollege = await College.updateOne(
        { _id: _id },
        {
          $set: {
            name: name.trim(),
            slug,
            logo,
            description,
            collegeType,
            ownership,
            establishedYear,
            location,
            website,
            contact,
            status,
          },
        },
      );

      if (updateCollege.matchedCount === 0) {
        return res.send({
          message: "College not found",
          status: false,
        });
      }

      const updatedCollege = await College.findById(_id);

      res.send({
        message: "College updated successfully",
        status: true,
        college: updatedCollege,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "College not updated",
        status: false,
      });
    }
  },
);

// DELETE COLLEGE ROUTE
app.post(
  "/delete-college",
  verifyToken,
  requirePermission("colleges", "delete"),
  async (req, res) => {
    try {
      const { id } = req.body;

      // Validate college ID
      if (!id) {
        return res.send({
          message: "College ID is required",
          status: false,
        });
      }

      // Find and delete college
      const deletedCollege = await College.findByIdAndDelete(id);

      // Check whether college exists
      if (!deletedCollege) {
        return res.send({
          message: "College not found",
          status: false,
        });
      }

      // Success response
      return res.send({
        message: "College deleted successfully",
        status: true,
        college: deletedCollege,
      });
    } catch (error) {
      console.error("DELETE COLLEGE ERROR:", error);

      return res.status(500).send({
        message: "College not deleted",
        status: false,
      });
    }
  },
);

// STREAM HELPERS

const STREAM_STATUSES = ["active", "inactive"];

const makeStreamSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeStreamRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const handleStreamError = (res, error) => {
  console.error("Stream API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Stream slug or code already exists",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// VALIDATE PARENT STREAM

const validateParentStream = async (parentStream, currentId = null) => {
  if (parentStream === null || parentStream === "") {
    return { valid: true, parentStream: null };
  }

  if (!mongoose.isValidObjectId(parentStream)) {
    return {
      valid: false,
      status: 400,
      message: "Invalid parent stream ID",
    };
  }

  if (currentId && parentStream.toString() === currentId.toString()) {
    return {
      valid: false,
      status: 400,
      message: "A stream cannot be its own parent",
    };
  }

  const parent = await Stream.findById(parentStream).select("_id parentStream");

  if (!parent) {
    return {
      valid: false,
      status: 404,
      message: "Parent stream not found",
    };
  }

  // Prevent circular parent-child relationships.
  let nextParentId = parent.parentStream;
  const visited = new Set([currentId?.toString()].filter(Boolean));

  while (nextParentId) {
    const nextId = nextParentId.toString();

    if (visited.has(nextId)) {
      return {
        valid: false,
        status: 400,
        message: "Circular parent stream relationship is not allowed",
      };
    }

    visited.add(nextId);

    const nextParent = await Stream.findById(nextId)
      .select("_id parentStream")
      .lean();

    if (!nextParent) break;

    nextParentId = nextParent.parentStream;
  }

  return { valid: true, parentStream };
};

// GET ALL STREAMS + SEARCH + FILTER

app.get("/get-streams",
  verifyToken,
  requirePermission("streams","view"),
  async (req, res) => {
    try {
      const { search, status, parentStream } = req.query;
      const filter = {};

      if (status !== undefined) {
        if (!STREAM_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status must be active or inactive",
          });
        }

        filter.status = status;
      }

      // Default: show only active streams.
      if (status === undefined) {
        filter.status = "active";
      }

      if (parentStream !== undefined) {
        if (parentStream === "null") {
          filter.parentStream = null;
        } else {
          if (!mongoose.isValidObjectId(parentStream)) {
            return res.status(400).json({
              success: false,
              message: "Invalid parent stream ID",
            });
          }

          filter.parentStream = parentStream;
        }
      }

      if (search && search.trim()) {
        const safeSearch = escapeStreamRegex(search.trim().slice(0, 100));

        filter.$or = [
          { name: { $regex: safeSearch, $options: "i" } },
          { slug: { $regex: safeSearch, $options: "i" } },
          { code: { $regex: safeSearch, $options: "i" } },
        ];
      }

      const streams = await Stream.find(filter)
        .select(
          "_id name slug code description parentStream status displayOrder",
        )
        .populate("parentStream", "name slug code")
        .sort({ displayOrder: 1, name: 1 });

      return res.status(200).json({
        success: true,
        count: streams.length,
        streams,
      });
    } catch (error) {
      return handleStreamError(res, error);
    }
  },
);

// GET STREAM BY ID

app.get(
  "/get-stream/:id",
  verifyToken,
    requirePermission("streams","view"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid stream ID",
        });
      }

      const stream = await Stream.findById(id)
        .select(
          "_id name slug code description parentStream status displayOrder",
        )
        .populate("parentStream", "name slug code");

      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      return res.json({
        success: true,
        stream,
      });
    } catch (error) {
      return handleStreamError(res, error);
    }
  },
);

// CREATE STREAM

app.post(
  "/create-stream",
  verifyToken,
    requirePermission("streams","add"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        code,
        description,
        parentStream,
        status,
        displayOrder,
      } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Stream name is required",
        });
      }

      const streamSlug = makeStreamSlug(slug || name);

      if (!streamSlug) {
        return res.status(400).json({
          success: false,
          message: "A valid stream name or slug is required",
        });
      }

      if (status !== undefined && !STREAM_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      if (
        displayOrder !== undefined &&
        (!Number.isFinite(Number(displayOrder)) || Number(displayOrder) < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "displayOrder must be a non-negative number",
        });
      }

      const parentValidation = await validateParentStream(parentStream);

      if (!parentValidation.valid) {
        return res.status(parentValidation.status).json({
          success: false,
          message: parentValidation.message,
        });
      }

      const streamData = {
        name: name.trim(),
        slug: streamSlug,
        description: description || "",
        status: status || "active",
      };

      if (code !== undefined && typeof code !== "string") {
        return res.status(400).json({
          success: false,
          message: "Code must be a string",
        });
      }

      if (code?.trim()) {
        streamData.code = code.trim().toUpperCase();
      }

      if (parentValidation.parentStream) {
        streamData.parentStream = parentValidation.parentStream;
      }

      if (displayOrder !== undefined) {
        streamData.displayOrder = Number(displayOrder);
      }

      const stream = await Stream.create(streamData);

      return res.status(201).json({
        success: true,
        message: "Stream created successfully",
        stream,
      });
    } catch (error) {
      return handleStreamError(res, error);
    }
  },
);

// UPDATE STREAM

app.put(
  "/update-stream/:id",
  verifyToken,
   requirePermission("streams","update"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid stream ID",
        });
      }

      const existingStream = await Stream.findById(id);

      if (!existingStream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      const {
        name,
        slug,
        code,
        description,
        parentStream,
        status,
        displayOrder,
      } = req.body;

      const updateData = {};

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Stream name cannot be empty",
          });
        }

        updateData.name = name.trim();
      }

      if (slug !== undefined || name !== undefined) {
        const slugSource = slug !== undefined ? slug : name;

        if (typeof slugSource !== "string" || !slugSource.trim()) {
          return res.status(400).json({
            success: false,
            message: "Slug cannot be empty",
          });
        }

        updateData.slug = makeStreamSlug(slugSource);

        if (!updateData.slug) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid slug",
          });
        }
      }

      if (code !== undefined) {
        if (typeof code !== "string") {
          return res.status(400).json({
            success: false,
            message: "Code must be a string",
          });
        }

        updateData.code = code.trim() ? code.trim().toUpperCase() : undefined;
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (status !== undefined) {
        if (!STREAM_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status must be active or inactive",
          });
        }

        updateData.status = status;
      }

      if (displayOrder !== undefined) {
        if (
          !Number.isFinite(Number(displayOrder)) ||
          Number(displayOrder) < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "displayOrder must be a non-negative number",
          });
        }

        updateData.displayOrder = Number(displayOrder);
      }

      if (parentStream !== undefined) {
        const parentValidation = await validateParentStream(parentStream, id);

        if (!parentValidation.valid) {
          return res.status(parentValidation.status).json({
            success: false,
            message: parentValidation.message,
          });
        }

        updateData.parentStream = parentValidation.parentStream;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      const updateOperation = {
        $set: { ...updateData },
      };

      if (updateData.code === undefined && code !== undefined) {
        delete updateOperation.$set.code;
        updateOperation.$unset = { code: 1 };
      }

      const stream = await Stream.findByIdAndUpdate(id, updateOperation, {
        new: true,
        runValidators: true,
      }).populate("parentStream", "name slug code");

      return res.json({
        success: true,
        message: "Stream updated successfully",
        stream,
      });
    } catch (error) {
      return handleStreamError(res, error);
    }
  },
);

// DELETE STREAM

app.delete(
  "/delete-stream/:id",
  verifyToken,
    requirePermission("streams","delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid stream ID",
        });
      }

      const stream = await Stream.findById(id);

      if (!stream) {
        return res.status(404).json({
          success: false,
          message: "Stream not found",
        });
      }

      // Prevent deleting a stream referenced by a child stream.
      const hasChildStreams = await Stream.exists({
        parentStream: id,
      });

      if (hasChildStreams) {
        return res.status(409).json({
          success: false,
          message: "Cannot delete this stream because child streams exist",
        });
      }

      // Prevent deleting a stream used by degrees or courses.
      const [degreeUsingStream, courseUsingStream] = await Promise.all([
        Degree.exists({ streams: id }),
        Course.exists({ stream: id }),
      ]);

      if (degreeUsingStream || courseUsingStream) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot delete this stream because degrees or courses are linked to it",
        });
      }

      await Stream.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Stream deleted successfully",
      });
    } catch (error) {
      return handleStreamError(res, error);
    }
  },
);

// ==================== DEGREE HELPERS ====================

const DEGREE_LEVELS = [
  "certificate",
  "diploma",
  "undergraduate",
  "postgraduate",
  "doctoral",
  "postdoctoral",
  "other",
];

const DEGREE_TYPES = [
  "academic",
  "professional",
  "vocational",
  "research",
  "other",
];

const DEGREE_STATUSES = ["active", "inactive"];

const makeSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateStreams = async (streams) => {
  if (!Array.isArray(streams)) {
    return {
      valid: false,
      message: "Streams must be an array",
    };
  }

  if (streams.length === 0) {
    return {
      valid: false,
      message: "Please select at least one stream",
    };
  }

  const ids = streams.map((item) => String(item?._id || item).trim());

  if (ids.some((id) => !mongoose.isValidObjectId(id))) {
    return {
      valid: false,
      message: "Invalid stream ID",
    };
  }

  const uniqueIds = [...new Set(ids)];

  const count = await Stream.countDocuments({
    _id: { $in: uniqueIds },
  });

  if (count !== uniqueIds.length) {
    return {
      valid: false,
      message: "One or more selected streams do not exist",
    };
  }

  return {
    valid: true,
    streams: uniqueIds,
  };
};

const handleDegreeError = (res, error) => {
  console.error("Degree API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Degree slug or code already exists",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// create degree

app.post(
  "/create-degree",
  verifyToken,
  requirePermission("degrees", "create"),
  async (req, res) => {
    try {
      const {
        name,
        shortName,
        slug,
        code,
        level,
        degreeType,
        defaultDuration,
        description,
        streams,
        status,
        displayOrder,
      } = req.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof shortName !== "string" ||
        !shortName.trim() ||
        !level
      ) {
        return res.status(400).json({
          success: false,
          message: "name, shortName and level are required",
        });
      }

      if (!DEGREE_LEVELS.includes(level)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree level",
        });
      }

      if (degreeType !== undefined && !DEGREE_TYPES.includes(degreeType)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree type",
        });
      }

      if (status !== undefined && !DEGREE_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree status",
        });
      }

      if (
        displayOrder !== undefined &&
        (!Number.isFinite(Number(displayOrder)) || Number(displayOrder) < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "displayOrder must be a non-negative number",
        });
      }

      console.log("Received streams:", streams);

      const streamResult = await validateStreams(streams);

      if (!streamResult.valid) {
        return res.status(400).json({
          success: false,
          message: streamResult.message,
        });
      }

      const degreeSlug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const degreeData = {
        name: name.trim(),
        shortName: shortName.trim(),
        slug: degreeSlug,
        level,
        streams: streamResult.streams,
      };
      if (code?.trim()) {
        degreeData.code = code.trim().toUpperCase();
      }

      if (degreeType !== undefined) {
        degreeData.degreeType = degreeType;
      }

      if (defaultDuration !== undefined) {
        degreeData.defaultDuration = defaultDuration;
      }

      if (description !== undefined) {
        degreeData.description = description;
      }

      if (status !== undefined) {
        degreeData.status = status;
      }

      if (displayOrder !== undefined) {
        degreeData.displayOrder = Number(displayOrder);
      }

      const degree = await Degree.create(degreeData);

      const populatedDegree = await Degree.findById(degree._id).populate(
        "streams",
        "name slug code",
      );

      return res.status(201).json({
        success: true,
        message: "Degree created successfully",
        degree: populatedDegree,
      });
    } catch (error) {
      console.error("CREATE DEGREE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
);

// ==================== GET ALL DEGREES + FILTER ====================

app.get(
  "/get-degrees",
  verifyToken,
  requirePermission("degrees","view"),
  async (req, res) => {
    try {
      const { search, level, status, stream } = req.query;
      const filter = {};

      if (level) {
        if (!DEGREE_LEVELS.includes(level)) {
          return res.status(400).json({
            success: false,
            message: "Invalid degree level",
          });
        }

        filter.level = level;
      }

      if (status) {
        if (!DEGREE_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid degree status",
          });
        }

        filter.status = status;
      }

      if (stream) {
        if (!mongoose.isValidObjectId(stream)) {
          return res.status(400).json({
            success: false,
            message: "Invalid stream ID",
          });
        }

        filter.streams = stream;
      }

      if (search?.trim()) {
        const searchRegex = new RegExp(
          escapeRegex(search.trim().slice(0, 100)),
          "i",
        );

        filter.$or = [
          { name: searchRegex },
          { shortName: searchRegex },
          { slug: searchRegex },
          { code: searchRegex },
        ];
      }

      const degrees = await Degree.find(filter)
        .populate("streams", "name slug code")
        .sort({ displayOrder: 1, name: 1 });

      return res.status(200).json({
        success: true,
        count: degrees.length,
        degrees,
      });
    } catch (error) {
      return handleDegreeError(res, error);
    }
  },
);

// ==================== GET DEGREE BY ID ====================

app.get(
  "/get-degree/:id",
  verifyToken,
  requirePermission("degrees","view"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree ID",
        });
      }

      const degree = await Degree.findById(id).populate(
        "streams",
        "name slug code",
      );

      if (!degree) {
        return res.status(404).json({
          success: false,
          message: "Degree not found",
        });
      }

      return res.json({
        success: true,
        degree,
      });
    } catch (error) {
      return handleDegreeError(res, error);
    }
  },
);

// ==================== UPDATE DEGREE ====================

app.put(
  "/update-degree/:id",
  verifyToken,
  requirePermission("degree","update"),
  async (req, res) => {
    try
     {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree ID",
        });
      }

      const existingDegree = await Degree.findById(id);

      if (!existingDegree) {
        return res.status(404).json({
          success: false,
          message: "Degree not found",
        });
      }

      const body = req.body;
      const data = {};

      // Update only explicitly allowed fields.
      if (body.name !== undefined) {
        if (typeof body.name !== "string" || !body.name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Degree name cannot be empty",
          });
        }

        data.name = body.name.trim();
      }

      if (body.shortName !== undefined) {
        if (typeof body.shortName !== "string" || !body.shortName.trim()) {
          return res.status(400).json({
            success: false,
            message: "Short name cannot be empty",
          });
        }

        data.shortName = body.shortName.trim();
      }

      if (body.slug !== undefined || body.name !== undefined) {
        const slugSource = body.slug !== undefined ? body.slug : body.name;

        const finalSlug = makeSlug(
          slugSource === undefined ? existingDegree.slug : slugSource,
        );

        if (!finalSlug) {
          return res.status(400).json({
            success: false,
            message: "A valid degree slug is required",
          });
        }

        data.slug = finalSlug;
      }

      if (body.code !== undefined) {
        if (typeof body.code !== "string") {
          return res.status(400).json({
            success: false,
            message: "Code must be a string",
          });
        }

        const normalizedCode = body.code.trim().toUpperCase();

        if (normalizedCode) {
          data.code = normalizedCode;
        } else {
          data.$unset = { code: 1 };
        }
      }

      if (body.level !== undefined) {
        if (!DEGREE_LEVELS.includes(body.level)) {
          return res.status(400).json({
            success: false,
            message: "Invalid degree level",
          });
        }

        data.level = body.level;
      }

      if (body.degreeType !== undefined) {
        if (!DEGREE_TYPES.includes(body.degreeType)) {
          return res.status(400).json({
            success: false,
            message: "Invalid degree type",
          });
        }

        data.degreeType = body.degreeType;
      }

      if (body.status !== undefined) {
        if (!DEGREE_STATUSES.includes(body.status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid degree status",
          });
        }

        data.status = body.status;
      }

      if (body.streams !== undefined) {
        const streamResult = await validateStreams(body.streams);

        if (!streamResult.valid) {
          return res.status(400).json({
            success: false,
            message: streamResult.message,
          });
        }

        data.streams = streamResult.streams;
      }

      if (body.defaultDuration !== undefined) {
        data.defaultDuration = body.defaultDuration;
      }

      if (body.description !== undefined) {
        data.description = body.description;
      }

      if (body.displayOrder !== undefined) {
        if (
          !Number.isFinite(Number(body.displayOrder)) ||
          Number(body.displayOrder) < 0
        ) {
          return res.status(400).json({
            success: false,
            message: "displayOrder must be a non-negative number",
          });
        }

        data.displayOrder = Number(body.displayOrder);
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Provide at least one valid field to update",
        });
      }

      const updateOperation = { $set: { ...data } };

      if (data.$unset) {
        updateOperation.$unset = data.$unset;
        delete updateOperation.$set.$unset;
      }

      const degree = await Degree.findByIdAndUpdate(id, updateOperation, {
        new: true,
        runValidators: true,
      }).populate("streams", "name slug code");

      return res.json({
        success: true,
        message: "Degree updated successfully",
        degree,
      });
    } catch (error) {
      return handleDegreeError(res, error);
    }
  },
);

// ==================== DELETE DEGREE ====================

app.delete(
  "/delete-degree/:id",
  verifyToken,
  requirePermission("degrees","delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid degree ID",
        });
      }

      const degree = await Degree.findById(id);

      if (!degree) {
        return res.status(404).json({
          success: false,
          message: "Degree not found",
        });
      }

      const linkedCourse = await Course.findOne({
        degree: id,
      }).select("_id name");

      if (linkedCourse) {
        return res.status(409).json({
          success: false,
          message: "Cannot delete degree because courses are linked to it",
        });
      }

      await Degree.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Degree deleted successfully",
      });
    } catch (error) {
      return handleDegreeError(res, error);
    }
  },
);

// ==================== COURSE HELPERS ====================

const COURSE_STATUSES = ["active", "inactive"];

const makeCourseSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeCourseRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Validate Stream + Degree relationship

const validateCourseRelation = async (streamId, degreeId) => {
  if (
    !mongoose.isValidObjectId(streamId) ||
    !mongoose.isValidObjectId(degreeId)
  ) {
    return {
      valid: false,
      status: 400,
      message: "Invalid stream or degree ID",
    };
  }

  const [streamDoc, degreeDoc] = await Promise.all([
    Stream.findById(streamId).select("_id"),
    Degree.findById(degreeId).select("_id streams"),
  ]);

  if (!streamDoc) {
    return {
      valid: false,
      status: 404,
      message: "Stream not found",
    };
  }

  if (!degreeDoc) {
    return {
      valid: false,
      status: 404,
      message: "Degree not found",
    };
  }

  const degreeAllowsStream = (degreeDoc.streams || []).some(
    (id) => id.toString() === streamId.toString(),
  );

  if (!degreeAllowsStream) {
    return {
      valid: false,
      status: 400,
      message: "Selected degree does not belong to the selected stream",
    };
  }

  return { valid: true };
};

// Validate entrance exam IDs
const validateEntranceExams = async (ids) => {
  if (!Array.isArray(ids)) {
    return {
      valid: false,
      message: "entranceExams must be an array",
    };
  }

  const normalizedIds = ids.map((id) => String(id));

  if (normalizedIds.some((id) => !mongoose.isValidObjectId(id))) {
    return {
      valid: false,
      message: "Invalid entrance exam ID",
    };
  }

  const uniqueIds = [...new Set(normalizedIds)];

  if (uniqueIds.length > 0) {
    const count = await EntranceExam.countDocuments({
      _id: { $in: uniqueIds },
    });

    if (count !== uniqueIds.length) {
      return {
        valid: false,
        message: "One or more entrance exams do not exist",
      };
    }
  }

  return {
    valid: true,
    ids: uniqueIds,
  };
};

const handleCourseError = (res, error) => {
  console.error("Course API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Course slug or code already exists",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// ==================== CREATE COURSE ====================

app.post(
  "/create-course",
  verifyToken,
  requirePermission("degrees","create"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        code,
        description,
        stream,
        degree,
        duration,
        eligibility,
        entranceExams,
        status,
        seo,
      } = req.body;

      // Required field validation
      if (
        typeof name !== "string" ||
        !name.trim() ||
        !stream ||
        !degree ||
        !duration?.unit
      ) {
        return res.status(400).json({
          success: false,
          message: "name, stream, degree and duration.unit are required",
        });
      }

      // Status validation
      if (status !== undefined && !COURSE_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course status",
        });
      }

      // Stream and Degree relationship validation
      if (
        !mongoose.isValidObjectId(stream) ||
        !mongoose.isValidObjectId(degree)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid stream or degree ID",
        });
      }

      const [streamDoc, degreeDoc] = await Promise.all([
        Stream.findById(stream),
        Degree.findById(degree),
      ]);

      if (!streamDoc) {
        return res.status(404).json({
          success: false,
          message: "Selected stream not found",
        });
      }

      if (!degreeDoc) {
        return res.status(404).json({
          success: false,
          message: "Selected degree not found",
        });
      }

      const isStreamLinked = (degreeDoc.streams || []).some(
        (id) => id.toString() === streamDoc._id.toString(),
      );
      console.log("Selected Stream ID:", streamDoc._id.toString());
      console.log("Selected Degree ID:", degreeDoc._id.toString());

      console.log(
        "Degree linked streams:",
        (degreeDoc.streams || []).map((id) => id.toString()),
      );
      if (!isStreamLinked) {
        return res.status(400).json({
          success: false,
          message: "Selected degree does not belong to the selected stream",
        });
      }

      // Entrance exam validation

      // Slug validation
      const courseSlug = makeCourseSlug(slug || name);

      if (!courseSlug) {
        return res.status(400).json({
          success: false,
          message: "A valid course slug is required",
        });
      }

      // Prepare course data
      const courseData = {
        name: name.trim(),
        slug: courseSlug,
        stream: streamDoc._id,
        degree: degreeDoc._id,
        duration,
      };

      // Optional fields validation
      if (code !== undefined && typeof code !== "string") {
        return res.status(400).json({
          success: false,
          message: "Code must be a string",
        });
      }

      if (code?.trim()) {
        courseData.code = code.trim().toUpperCase();
      }

      if (description !== undefined) {
        courseData.description = description;
      }

      if (eligibility !== undefined) {
        courseData.eligibility = eligibility;
      }

      if (status !== undefined) {
        courseData.status = status;
      }

      if (seo !== undefined) {
        courseData.seo = seo;
      }

      // Save course
      const createdCourse = await Course.create(courseData);

      // Populate related data
      const course = await Course.findById(createdCourse._id)
        .populate("stream", "name slug code")
        .populate("degree", "name shortName level");

      return res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      return handleCourseError(res, error);
    }
  },
);

// ==================== GET ALL COURSES + FILTER ====================

app.get("/get-courses",
  verifyToken,
  requirePermission("courses","view"),
  async (req, res) => {
    try {
      const { search, stream, degree, status } = req.query;
      const filter = {};

      if (status) {
        if (!COURSE_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid course status",
          });
        }

        filter.status = status;
      }

      for (const [field, value] of [
        ["stream", stream],
        ["degree", degree],
      ]) {
        if (value) {
          if (!mongoose.isValidObjectId(value)) {
            return res.status(400).json({
              success: false,
              message: `Invalid ${field} ID`,
            });
          }

          filter[field] = value;
        }
      }

      if (search?.trim()) {
        const searchRegex = new RegExp(
          escapeCourseRegex(search.trim().slice(0, 100)),
          "i",
        );

        filter.$or = [
          { name: searchRegex },
          { slug: searchRegex },
          { code: searchRegex },
        ];
      }

      const courses = await Course.find(filter)
        .populate("stream", "name slug code")
        .populate("degree", "name shortName level")

        .sort({ name: 1 });

      return res.json({
        success: true,
        count: courses.length,
        courses,
      });
    } catch (error) {
      return handleCourseError(res, error);
    }
  },
);

// ==================== GET COURSE BY ID ====================

app.get(
  "/get-course/:id",
  verifyToken,
  requirePermission("courses","view"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id)
        .populate("stream", "name slug code")
        .populate("degree", "name shortName level");

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.json({
        success: true,
        course,
      });
    } catch (error) {
      return handleCourseError(res, error);
    }
  },
);

// ==================== UPDATE COURSE ====================

app.put("/update-course/:id",
  verifyToken,
  requirePermission("courses","update"),
  async (req, res) => {
    console.log(req.body);
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const existingCourse = await Course.findById(id);

      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const body = req.body;
      const data = {};

      // Name
      if (body.name !== undefined) {
        if (typeof body.name !== "string" || !body.name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Course name cannot be empty",
          });
        }

        data.name = body.name.trim();
      }

      // Slug: regenerate when name changes unless slug is explicitly sent
      if (body.slug !== undefined || body.name !== undefined) {
        const slugSource = body.slug !== undefined ? body.slug : body.name;

        const normalizedSlug = makeCourseSlug(
          slugSource === undefined ? existingCourse.slug : slugSource,
        );

        if (!normalizedSlug) {
          return res.status(400).json({
            success: false,
            message: "A valid course slug is required",
          });
        }

        data.slug = normalizedSlug;
      }

      // Code
      if (body.code !== undefined) {
        if (typeof body.code !== "string") {
          return res.status(400).json({
            success: false,
            message: "Code must be a string",
          });
        }

        const normalizedCode = body.code.trim().toUpperCase();

        if (normalizedCode) {
          data.code = normalizedCode;
        } else {
          data.$unset = { code: 1 };
        }
      }

      // Determine the final Stream and Degree IDs.
      const finalStream = body.stream ?? existingCourse.stream;
      const finalDegree = body.degree ?? existingCourse.degree;

      if (body.stream !== undefined || body.degree !== undefined) {
        const relation = await validateCourseRelation(finalStream, finalDegree);

        if (!relation.valid) {
          return res.status(relation.status).json({
            success: false,
            message: relation.message,
          });
        }

        if (body.stream !== undefined) {
          data.stream = body.stream;
        }

        if (body.degree !== undefined) {
          data.degree = body.degree;
        }
      }

      // Duration
      if (body.duration !== undefined) {
        data.duration = body.duration;
      }

      // Eligibility
      if (body.eligibility !== undefined) {
        data.eligibility = body.eligibility;
      }

      // Description
      if (body.description !== undefined) {
        data.description = body.description;
      }

      // SEO
      if (body.seo !== undefined) {
        data.seo = body.seo;
      }

      // Status
      if (body.status !== undefined) {
        if (!COURSE_STATUSES.includes(body.status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid course status",
          });
        }

        data.status = body.status;
      }

      // Entrance exams
      if (body.entranceExams !== undefined) {
        const examResult = await validateEntranceExams(body.entranceExams);

        if (!examResult.valid) {
          return res.status(400).json({
            success: false,
            message: examResult.message,
          });
        }

        data.entranceExams = examResult.ids;
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Provide at least one field to update",
        });
      }

      const updateOperation = { $set: { ...data } };

      if (data.$unset) {
        updateOperation.$unset = data.$unset;
        delete updateOperation.$set.$unset;
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        updateOperation,
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
        .populate("stream", "name slug code")
        .populate("degree", "name shortName level");

      if (!updatedCourse) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error) {
      return handleCourseError(res, error);
    }
  },
);

// ==================== DELETE COURSE ====================

app.delete("/delete-course/:id",
  verifyToken,
  requirePermission("courses","delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const linkedSpecialization = await Specialization.findOne({
        course: id,
      }).select("_id name");

      if (linkedSpecialization) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot delete course because specializations are linked to it",
        });
      }

      await Course.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      return handleCourseError(res, error);
    }
  },
);

// SPECIALIZATION HELPERS

const SPECIALIZATION_STATUSES = ["active", "inactive"];

const makeSpecializationSlug = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const escapeSpecializationRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateSpecializationCourse = async (courseId) => {
  if (!mongoose.isValidObjectId(courseId)) {
    return {
      valid: false,
      status: 400,
      message: "Invalid course ID",
    };
  }

  const courseExists = await Course.findById(courseId).select("_id");

  if (!courseExists) {
    return {
      valid: false,
      status: 404,
      message: "Course not found",
    };
  }

  return { valid: true };
};

const populateSpecializationCourse = (query) =>
  query.populate({
    path: "course",
    select: "name slug code stream degree",
    populate: [
      { path: "stream", select: "name slug code" },
      { path: "degree", select: "name shortName level" },
    ],
  });

const handleSpecializationError = (res, error) => {
  console.error("Specialization API error:", error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Specialization slug or code already exists",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// CREATE SPECIALIZATION

app.post(
  "/create-specialization",
  verifyToken,
  requirePermission("specializations","create"),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        code,
        description,
        course,
        duration,
        eligibility,
        careerOptions,
        status,
      } = req.body;

      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Specialization name is required",
        });
      }

      if (!course) {
        return res.status(400).json({
          success: false,
          message: "Course is required",
        });
      }

      const courseValidation = await validateSpecializationCourse(course);

      if (!courseValidation.valid) {
        return res.status(courseValidation.status).json({
          success: false,
          message: courseValidation.message,
        });
      }

      if (status !== undefined && !SPECIALIZATION_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be active or inactive",
        });
      }

      if (careerOptions !== undefined && !Array.isArray(careerOptions)) {
        return res.status(400).json({
          success: false,
          message: "careerOptions must be an array",
        });
      }

      const specializationData = {
        name: name.trim(),
        slug: makeSpecializationSlug(slug || name),
        description,
        course,
        duration,
        eligibility,
        careerOptions: careerOptions || [],
      };

      if (status !== undefined) {
        specializationData.status = status;
      }

      if (typeof code === "string" && code.trim()) {
        specializationData.code = code.trim().toUpperCase();
      }

      const specialization = await Specialization.create(specializationData);

      return res.status(201).json({
        success: true,
        message: "Specialization created successfully",
        specialization,
      });
    } catch (error) {
      return handleSpecializationError(res, error);
    }
  },
);

// GET ALL SPECIALIZATIONS + FILTER + SEARCH

app.get(
  "/get-specializations",
  verifyToken,
  requirePermission("specializations","view"),
  async (req, res) => {
    try {
      const { search, course, status } = req.query;
      const filter = {};

      if (status !== undefined) {
        if (!SPECIALIZATION_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status must be active or inactive",
          });
        }

        filter.status = status;
      }

      if (course) {
        const courseValidation = await validateSpecializationCourse(course);

        if (!courseValidation.valid) {
          return res.status(courseValidation.status).json({
            success: false,
            message: courseValidation.message,
          });
        }

        filter.course = course;
      }

      if (search && search.trim()) {
        const safeSearch = escapeSpecializationRegex(
          search.trim().slice(0, 100),
        );

        filter.$or = [
          { name: { $regex: safeSearch, $options: "i" } },
          { slug: { $regex: safeSearch, $options: "i" } },
          { code: { $regex: safeSearch, $options: "i" } },
        ];
      }

      const specializations = await populateSpecializationCourse(
        Specialization.find(filter),
      ).sort({ name: 1 });

      return res.json({
        success: true,
        count: specializations.length,
        specializations,
      });
    } catch (error) {
      return handleSpecializationError(res, error);
    }
  },
);

// GET SPECIALIZATION BY ID

app.get(
  "/get-specialization/:id",
  verifyToken,
  requirePermission("specializations","view"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid specialization ID",
        });
      }

      const specialization = await populateSpecializationCourse(
        Specialization.findById(id),
      );

      if (!specialization) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
        });
      }

      return res.json({
        success: true,
        specialization,
      });
    } catch (error) {
      return handleSpecializationError(res, error);
    }
  },
);

// UPDATE SPECIALIZATION

app.put(
  "/update-specialization/:id",
  verifyToken,
  requirePermission("specializations","update"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid specialization ID",
        });
      }

      const existingSpecialization = await Specialization.findById(id);

      if (!existingSpecialization) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
        });
      }

      const {
        name,
        slug,
        code,
        description,
        course,
        duration,
        eligibility,
        careerOptions,
        status,
      } = req.body;

      const updateData = {};

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Specialization name cannot be empty",
          });
        }

        updateData.name = name.trim();
      }

      if (slug !== undefined || name !== undefined) {
        const slugSource = slug !== undefined ? slug : name;

        if (typeof slugSource !== "string" || !slugSource.trim()) {
          return res.status(400).json({
            success: false,
            message: "Slug cannot be empty",
          });
        }

        updateData.slug = makeSpecializationSlug(slugSource);

        if (!updateData.slug) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid slug",
          });
        }
      }

      if (code !== undefined) {
        if (typeof code !== "string") {
          return res.status(400).json({
            success: false,
            message: "Code must be a string",
          });
        }

        if (code.trim()) {
          updateData.code = code.trim().toUpperCase();
        } else {
          // Empty code removes the optional code field.
          updateData.code = undefined;
        }
      }

      if (description !== undefined) {
        updateData.description = description;
      }

      if (course !== undefined) {
        const courseValidation = await validateSpecializationCourse(course);

        if (!courseValidation.valid) {
          return res.status(courseValidation.status).json({
            success: false,
            message: courseValidation.message,
          });
        }

        updateData.course = course;
      }

      if (duration !== undefined) {
        updateData.duration = duration;
      }

      if (eligibility !== undefined) {
        updateData.eligibility = eligibility;
      }

      if (careerOptions !== undefined) {
        if (!Array.isArray(careerOptions)) {
          return res.status(400).json({
            success: false,
            message: "careerOptions must be an array",
          });
        }

        updateData.careerOptions = careerOptions;
      }

      if (status !== undefined) {
        if (!SPECIALIZATION_STATUSES.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Status must be active or inactive",
          });
        }

        updateData.status = status;
      }

      // Avoid sending an empty update to MongoDB.
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      // Use $unset for an optional code that was cleared.
      const updateOperation = { $set: { ...updateData } };

      if (updateData.code === undefined && code !== undefined) {
        delete updateOperation.$set.code;
        updateOperation.$unset = { code: 1 };
      }

      const specialization = await Specialization.findByIdAndUpdate(
        id,
        updateOperation,
        {
          new: true,
          runValidators: true,
        },
      );

      await specialization.populate({
        path: "course",
        select: "name slug code stream degree",
        populate: [
          { path: "stream", select: "name slug code" },
          { path: "degree", select: "name shortName level" },
        ],
      });

      return res.json({
        success: true,
        message: "Specialization updated successfully",
        specialization,
      });
    } catch (error) {
      return handleSpecializationError(res, error);
    }
  },
);

// DELETE SPECIALIZATION

app.delete("/delete-specialization/:id",
  verifyToken,
  requirePermission("specializations","delete"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid specialization ID",
        });
      }

      const specialization = await Specialization.findByIdAndDelete(id);

      if (!specialization) {
        return res.status(404).json({
          success: false,
          message: "Specialization not found",
        });
      }

      return res.json({
        success: true,
        message: "Specialization deleted successfully",
      });
    } catch (error) {
      return handleSpecializationError(res, error);
    }
  },
);



// Add role permissions 

const MODULES = [
  "students",
  "colleges",
  "roles",
  "courses",
  "degrees",
  "streams",
  "specializations",
];

const ACTIONS = ["create", "view", "update", "delete"];

const createDefaultPermissions = () => {
  const permissions = {};

  MODULES.forEach((moduleName) => {
    permissions[moduleName] = {
      create: false,
      view: false,
      update: false,
      delete: false,
    };
  });

  // Role creation is reserved for SuperAdmin.
  permissions.roles.create = false;

  return permissions;
};

const isValidPermissions = (permissions) => {
  if (
    !permissions ||
    typeof permissions !== "object" ||
    Array.isArray(permissions)
  ) {
    return false;
  }

  // Reject unknown module names.
  if (
    Object.keys(permissions).some(
      (moduleName) => !MODULES.includes(moduleName)
    )
  ) {
    return false;
  }

  for (const [moduleName, moduleActions] of Object.entries(
    permissions
  )) {
    if (
      !moduleActions ||
      typeof moduleActions !== "object" ||
      Array.isArray(moduleActions)
    ) {
      return false;
    }

    // Reject unknown action names.
    if (
      Object.keys(moduleActions).some(
        (action) => !ACTIONS.includes(action)
      )
    ) {
      return false;
    }

    // Every supplied permission must be a Boolean.
    for (const value of Object.values(moduleActions)) {
      if (typeof value !== "boolean") {
        return false;
      }
    }
  }

  // Never allow a custom role to create roles.
  if (permissions.roles?.create === true) {
    return false;
  }

  return true;
};

const normalizePermissions = (permissions = {}) => {
  const normalized = createDefaultPermissions();

  MODULES.forEach((moduleName) => {
    ACTIONS.forEach((action) => {
      if (moduleName === "roles" && action === "create") {
        normalized.roles.create = false;
        return;
      }

      if (typeof permissions[moduleName]?.[action] === "boolean") {
        normalized[moduleName][action] =
          permissions[moduleName][action];
      }
    });
  });

  return normalized;
};

// ADD ROLE


app.post(
  "/add-role",
  verifyToken,
  requireRole("superAdmin"),
  async (req, res) => {
    try {
      const roleName = req.body.roleName?.trim();
      const status = req.body.status || "active";
      const permissions = req.body.permissions;

      if (!roleName) {
        return res.status(400).json({
          success: false,
          message: "Role name is required",
        });
      }

      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role status",
        });
      }

      if (
        permissions !== undefined &&
        !isValidPermissions(permissions)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid module permissions",
        });
      }

      const escapedRoleName = roleName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const existingRole = await Role.findOne({
        roleName: {
          $regex: `^${escapedRoleName}$`,
          $options: "i",
        },
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: "Role already exists",
        });
      }

      const createRole = await Role.create({
        roleName,
        status,
        permissions: normalizePermissions(permissions),
      });

      return res.status(201).json({
        success: true,
        status: true,
        message: "Role created successfully",
        role: createRole,
      });
    } catch (error) {
      console.error("Add role error:", error);

      return res.status(
        error.code === 11000 ? 409 : 500
      ).json({
        success: false,
        status: false,
        message:
          error.code === 11000
            ? "Role already exists"
            : "Role not created",
      });
    }
  }
);

//edit role

app.post(
  "/edit-role",
  verifyToken,
  requireRole("superAdmin"),
  async (req, res) => {
    try {
      const { _id, status, permissions } = req.body;
      const roleName = req.body.roleName?.trim();

      if (!mongoose.isValidObjectId(_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role ID",
        });
      }

      if (
        !roleName ||
        !["active", "inactive"].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid role name and status are required",
        });
      }

      if (
        permissions !== undefined &&
        !isValidPermissions(permissions)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid module permissions",
        });
      }

      const escapedRoleName = roleName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const duplicateRole = await Role.findOne({
        roleName: {
          $regex: `^${escapedRoleName}$`,
          $options: "i",
        },
        _id: { $ne: _id },
      });

      if (duplicateRole) {
        return res.status(409).json({
          success: false,
          message: "Role already exists",
        });
      }

      const updateData = {
        roleName,
        status,
      };

      if (permissions !== undefined) {
        updateData.permissions =
          normalizePermissions(permissions);
      }

      const updatedRole = await Role.findByIdAndUpdate(
        _id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedRole) {
        return res.status(404).json({
          success: false,
          message: "Role not found",
        });
      }

      return res.json({
        success: true,
        status: true,
        message: "Role updated successfully",
        role: updatedRole,
      });
    } catch (error) {
      console.error("Edit role error:", error);

      return res.status(
        error.code === 11000 ? 409 : 500
      ).json({
        success: false,
        message:
          error.code === 11000
            ? "Role already exists"
            : "Role not updated",
      });
    }
  }
);


// GET ALL ROLES
app.get(
  "/get-role",
  verifyToken,
  requireRole("superAdmin"),
  async (req, res) => {
    try {
      const roles = await Role.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        status: true,
        message: "Roles fetched successfully",
        role: roles,
      });
    } catch (error) {
      console.error("Get roles error:", error);

      return res.status(500).json({
        success: false,
        status: false,
        message: "Roles fetch nahi ho paaye",
      });
    }
  }
);

// DELETE ROLE
app.post(
  "/delete-role",
  verifyToken,
  requireRole("superAdmin"),
  async (req, res) => {
    try {
      const { id } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).send({
          message: "Valid role ID is required",
          status: false,
        });
      }

      const userUsingRole = await User1.findOne({ role: id });

      if (userUsingRole) {
        return res.status(409).send({
          message: "This role is assigned to a user. Cannot delete it.",
          status: false,
        });
      }

      const deletedRole = await Role.findByIdAndDelete(id);

      if (!deletedRole) {
        return res.status(404).send({
          message: "Role not found",
          status: false,
        });
      }

      return res.send({
        message: "Role deleted successfully",
        status: true,
      });
    } catch (error) {
      console.log("Delete role error:", error);

      return res.status(500).send({
        message: "Role not deleted",
        status: false,
      });
    }
  },
);

// EDIT ROLE
app.post(
  "/edit-role",
  verifyToken,
  requireRole("superAdmin"),
  async (req, res) => {
    try {
      const { _id, status, permissions } = req.body;
      const roleName = req.body.roleName?.trim();

      if (!mongoose.isValidObjectId(_id)) {
        return res.status(400).send({
          message: "Invalid role ID",
          status: false,
        });
      }

      if (!roleName || !["active", "inactive"].includes(status)) {
        return res.status(400).send({
          message: "Valid role name and status are required",
          status: false,
        });
      }

      if (permissions !== undefined && !isValidPermissions(permissions)) {
        return res.status(400).send({
          message: "Invalid permissions",
          status: false,
        });
      }

      const escapedRoleName = roleName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const duplicateRole = await Role.findOne({
        roleName: {
          $regex: `^${escapedRoleName}$`,
          $options: "i",
        },
        _id: { $ne: _id },
      });

      if (duplicateRole) {
        return res.status(409).send({
          message: "Role already exists",
          status: false,
        });
      }

      const updateData = {
        roleName,
        status,
      };

      if (permissions !== undefined) {
        updateData.permissions = {
          ...defaultPermissions,
          ...permissions,
        };
      }

      const updatedRole = await Role.findByIdAndUpdate(
        _id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedRole) {
        return res.status(404).send({
          message: "Role not found",
          status: false,
        });
      }

      return res.send({
        message: "Role updated successfully",
        status: true,
        role: updatedRole,
      });
    } catch (error) {
      console.log("Edit role error:", error);

      return res.status(500).send({
        message:
          error.code === 11000 ? "Role already exists" : "Role not updated",
        status: false,
      });
    }
  },
);

app.get(
  "/test-superadmin",
  verifyToken,
  requireRole("superAdmin"),
  (req, res) => {
    res.json({
      status: true,
      message: "SuperAdmin access granted",
    });
  },
);

//server
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
