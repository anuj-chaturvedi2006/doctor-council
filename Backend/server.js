require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpgenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const app = express();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const razorpay = require("./middleware/rozarpay");
const port = process.env.PORT;
const verifyToken = require("./middleware/auth");
const checkPermission = require("./middleware/permission");
const requireRoleFactory = require("./middleware/requireRole");
const Stream = require("./Stream");
const Degree = require("./Degree");
const Course = require("./Course");
const College =require("./College")
const University=require("./university")
const Specialization = require("./Specialization");
const EmailTemplate=require("./EmailTemplate")
const sanitizeHtml = require("sanitize-html");
const StudentProfile = require("./StudentProfile");
const Package=require("./Package")
const StudentPackage=require("./StudentPackage")
const Appointment = require("./models/Appointment");
const CounsellingSession = require("./models/CounsellingSession");
const SessionFeedback = require("./models/SessionFeedback");
const FollowUp = require("./models/FollowUp");

const  Resend  = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads", "profile");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ================= COLLEGE UPLOAD FOLDERS =================

const collegeLogoDir = path.join(
  __dirname,
  "uploads",
  "colleges",
  "logos"
);

const collegeBackgroundDir = path.join(
  __dirname,
  "uploads",
  "colleges",
  "backgrounds"
);

[collegeLogoDir, collegeBackgroundDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use("/uploads",
  express.static(path.join(__dirname, "uploads"))
);



// ================= MAILER =================

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= MONGODB =================
const api=process.env.MONGODB_URI
mongoose
  .connect(`${api}`)
  .then(() => console.log("database connected"))
  .catch((error) => console.log("database is not connect", error));


// ================= OLD USER SCHEMA =================



const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    enquiryType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


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
  universities: {
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
   emailTemplate : {
    create: { type: Boolean, default: false },
    view: { type: Boolean, default: true },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
};

const Otp = require("./Otp")
const Contact=mongoose.model("Contact",contactSchema)
const Role = require("./Role")

const CounsellingAssignment = require("./models/CounsellingAssignment");
const User1 = require("./User1")
const CounsellingRequest = require("./models/CounsellingRequest");
const requirePermission = checkPermission(User1);
const requireRole = requireRoleFactory(User1);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (/\.xlsx$/i.test(file.originalname)) {
      return cb(null, true);
    }

    cb(new Error("Only .xlsx Excel files are allowed"));
  },
});

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname).toLowerCase();

      cb(null, uniqueName);
    },
  }),

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  },
});


const collegeUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === "logo") {
        cb(null, collegeLogoDir);
      } else if (file.fieldname === "backgroundImage") {
        cb(null, collegeBackgroundDir);
      } else {
        cb(new Error("Invalid image field"));
      }
    },

    filename: (req, file, cb) => {
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname).toLowerCase();

      cb(null, uniqueName);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WEBP images are allowed"));
  },
});



const defaultMBBSPackages = [
  {
    name: "Basic MBBS Counselling",
    price: 999,
    durationDays: 30,
    description:
      "Basic NEET UG and MBBS admission counselling assistance.",
    features: [
      "NEET UG Counselling Guidance",
      "Basic Medical College Information",
      "MBBS Admission Guidance",
      "Counselling Process Support",
      "Document Checklist",
    ],
    status: "active",
  },
  {
    name: "Standard MBBS Counselling",
    price: 2999,
    durationDays: 60,
    description:
      "Personalized MBBS college selection and counselling assistance.",
    features: [
      "All Basic Package Benefits",
      "Personalized College Selection",
      "All India Quota Guidance",
      "State Quota Guidance",
      "Choice Filling Assistance",
      "Round-wise Counselling Guidance",
    ],
    status: "active",
  },
  {
    name: "Premium MBBS Counselling",
    price: 5999,
    durationDays: 90,
    description:
      "Complete personalized MBBS admission counselling support.",
    features: [
      "All Standard Package Benefits",
      "Dedicated Counsellor Assistance",
      "Personalized College Preference List",
      "Choice Filling and Locking Support",
      "Document Verification Guidance",
      "Admission Process Assistance",
      "Priority Counselling Support",
    ],
    status: "active",
  },
];

// Create three packages without duplicates
app.post("/seed-mbbs-packages", async (req, res) => {
  try {
    const createdPackages = [];

    for (const pkg of defaultMBBSPackages) {
      const packageData = await Package.findOneAndUpdate(
        { name: pkg.name },
        { $set: pkg },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      createdPackages.push(packageData);
    }

    return res.status(200).json({
      success: true,
      message: "MBBS counselling packages created successfully",
      count: createdPackages.length,
      data: createdPackages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


const isValidPackageId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

// CREATE PACKAGE
app.post("/create-package", async (req, res) => {
  try {
    const {
      name,
      price,
      durationDays,
      description,
      features,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0 ||
      !Number.isInteger(Number(durationDays)) ||
      Number(durationDays) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, price and duration are required",
      });
    }

    if (
      features !== undefined &&
      (!Array.isArray(features) ||
        !features.every((item) => typeof item === "string"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Features must be an array of strings",
      });
    }

    const newPackage = await Package.create({
      name: name.trim(),
      price: Number(price),
      durationDays: Number(durationDays),
      description: description || "",
      features: features || [],
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Package created successfully",
      data: newPackage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// GET ALL ACTIVE PACKAGES
app.get("/get-packages", async (req, res) => {
  try {
    const packages = await Package.find({
      status: "active",
    }).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// GET SINGLE PACKAGE
app.get("/get-package/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPackageId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
      });
    }

    const packageData = await Package.findById(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: packageData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// UPDATE PACKAGE
app.put("/update-package/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPackageId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
      });
    }

    const allowedFields = [
      "name",
      "price",
      "durationDays",
      "description",
      "features",
      "status",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (
      updateData.name !== undefined &&
      (typeof updateData.name !== "string" ||
        !updateData.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package name",
      });
    }

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    if (
      updateData.price !== undefined &&
      (!Number.isFinite(Number(updateData.price)) ||
        Number(updateData.price) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package price",
      });
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    if (
      updateData.durationDays !== undefined &&
      (!Number.isInteger(Number(updateData.durationDays)) ||
        Number(updateData.durationDays) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package duration",
      });
    }

    if (updateData.durationDays !== undefined) {
      updateData.durationDays = Number(updateData.durationDays);
    }

    if (
      updateData.features !== undefined &&
      (!Array.isArray(updateData.features) ||
        !updateData.features.every(
          (item) => typeof item === "string"
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Features must be an array of strings",
      });
    }

    if (
      updateData.status !== undefined &&
      !["active", "inactive"].includes(updateData.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive",
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Package updated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// DELETE / DEACTIVATE PACKAGE
app.delete("/delete-package/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidPackageId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid package ID",
      });
    }

    const packageData = await Package.findById(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const purchased = await StudentPackage.exists({
      package: packageData._id,
    });

    if (purchased) {
      packageData.status = "inactive";
      await packageData.save();

      return res.status(200).json({
        success: true,
        message: "Package deactivated because purchase history exists",
        data: packageData,
      });
    }

    await Package.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


app.post("/student/create-package-order",
  verifyToken,
  async (req, res) => {
    try {
      const { packageId } = req.body;

      if (!packageId || !mongoose.Types.ObjectId.isValid(packageId)) {
        return res.status(400).json({
          success: false,
          message: "Valid package ID is required",
        });
      }

      if (
        !process.env.RAZORPAY_KEY_ID ||
        !process.env.RAZORPAY_KEY_SECRET
      ) {
        return res.status(500).json({
          success: false,
          message: "Razorpay keys are not configured",
        });
      }

      const packageData = await Package.findOne({
        _id: packageId,
        status: "active",
      });

      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: "Package not found or inactive",
        });
      }

      const amountPaise = Math.round(
        Number(packageData.price) * 100
      );

      if (
        !Number.isSafeInteger(amountPaise) ||
        amountPaise <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid package price",
        });
      }

      // Create Razorpay Order
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `pkg_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`,
        notes: {
          packageId: packageData._id.toString(),
          studentId: req.userId.toString(),
        },
      });

      // Save Student Package
      const studentPackage = await StudentPackage.create({
        student: req.userId,
        package: packageData._id,
        packageName: packageData.name,
        amountPaise: order.amount,
        currency: order.currency,
        razorpayOrderId: order.id,
        paymentStatus: "pending",
        packageStatus: "inactive",
      });

      return res.status(201).json({
        success: true,
        message: "Package order created successfully",
        data: {
          studentPackageId: studentPackage._id,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          packageName: packageData.name,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error("Create package order error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



app.post("/verify-payment", verifyToken, async (req, res) => {
  try {
    console.log("VERIFY PAYMENT BODY:", req.body);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are required",
      });
    }

    if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature format",
      });
    }

    // Find order belonging to logged-in student
    const studentPackage = await StudentPackage.findOne({
      razorpayOrderId: razorpay_order_id,
      student: req.userId,
    }).populate("package");

    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Package order not found",
      });
    }

    // Already verified
    if (studentPackage.paymentStatus === "paid") {
      if (
        studentPackage.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: studentPackage,
        });
      }

      return res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
    }

    // Verify Razorpay signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "hex"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "hex"
    );

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch actual payment from Razorpay
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    if (payment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order ID does not match",
      });
    }

    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment is not captured. Current status: ${payment.status}`,
      });
    }

    // Check amount and currency
    if (
      payment.amount !== studentPackage.amountPaise ||
      payment.currency !== studentPackage.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount or currency does not match",
      });
    }

    const packageData = studentPackage.package;

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package details not found",
      });
    }

    const durationDays = Number(packageData.durationDays);

    if (
      !Number.isInteger(durationDays) ||
      durationDays <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid package duration",
      });
    }

    // Generate package validity
    const startDate = new Date();
    const expiryDate = new Date(startDate);

    expiryDate.setDate(
      expiryDate.getDate() + durationDays
    );

    // Atomic update prevents duplicate activation
    const updatedPackage = await StudentPackage.findOneAndUpdate(
      {
        _id: studentPackage._id,
        paymentStatus: { $ne: "paid" },
      },
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentStatus: "paid",
          packageStatus: "active",
          startDate,
          expiryDate,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPackage) {
      const existing = await StudentPackage.findById(
        studentPackage._id
      );

      if (
        existing?.paymentStatus === "paid" &&
        existing.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          data: existing,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Package payment status has changed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and package activated successfully",
      data: updatedPackage,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


app.get("/student/my-package",
  verifyToken,
  async (req, res) => {
    try {
      const studentId = req.userId;
      const currentDate = new Date();

      // Expire old packages
      await StudentPackage.updateMany(
        {
          student: studentId,
          packageStatus: "active",
          expiryDate: { $lte: currentDate },
        },
        {
          $set: {
            packageStatus: "expired",
          },
        }
      );

      // Fetch all purchased packages
      const packages = await StudentPackage.find({
        student: studentId,
      })
        .populate("package")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Student packages fetched successfully",
        count: packages.length,
        data: packages,
      });
    } catch (error) {
      console.error("My package error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



app.post("/student/retry-package-order",
  verifyToken,
  async (req, res) => {
    try {
      const { studentPackageId } = req.body;

      if (
        !studentPackageId ||
        !mongoose.Types.ObjectId.isValid(studentPackageId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid student package ID is required",
        });
      }

      const studentPackage = await StudentPackage.findOne({
        _id: studentPackageId,
        student: req.userId,
        paymentStatus: "pending",
        packageStatus: "inactive",
      }).populate("package");

      if (!studentPackage) {
        return res.status(404).json({
          success: false,
          message: "Pending package not found",
        });
      }

      const packageData = studentPackage.package;

      if (
        !packageData ||
        packageData.status !== "active"
      ) {
        return res.status(400).json({
          success: false,
          message: "Package is not available",
        });
      }

      const amount = Math.round(
        Number(packageData.price) * 100
      );

      if (
        !Number.isSafeInteger(amount) ||
        amount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid package amount",
        });
      }

      // Create new Razorpay order
      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `retry_${Date.now()}_${Math.floor(
          Math.random() * 10000
        )}`,
        notes: {
          studentId: req.userId.toString(),
          studentPackageId: studentPackage._id.toString(),
        },
      });

      // Update existing pending record
      studentPackage.razorpayOrderId = order.id;
      studentPackage.amountPaise = order.amount;
      studentPackage.currency = order.currency;

      await studentPackage.save();

      return res.status(200).json({
        success: true,
        message: "Retry payment order created successfully",
        data: {
          studentPackageId: studentPackage._id,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          packageName: studentPackage.packageName,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    } catch (error) {
      console.error("Retry payment error:", error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



//------------------------------//


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
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
   console.log("STEP 1: API started"); 
    // Search student in User1
    const verifyUser = await User1.findOne({
      email: normalizedEmail,
    });
    

    if (!verifyUser) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist",
      });
    }

    const token = otpgenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", token);
console.log("STEP 2: User found");
    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          otp: token,
          verified: false,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          resetTokenUsed: false,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    console.log("STEP 3: OTP saved");

 const { data, error } = await resend.emails.send({
  from: "Doctor Council <onboarding@resend.dev>",
  to: [normalizedEmail],
  subject: "OTP Verification",
  text: `Your verification OTP is ${token}. This OTP is valid for 5 minutes.`,
});

if (error) {
  console.log("Resend Email Error:", error);

  return res.status(500).json({ 
    success: false,
    message: "OTP email could not be sent",
  });
}

console.log("STEP 4: Email sent", data);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("FORGET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "OTP not sent",
    });
  }
});



app.post("/verifyemail-forget", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const otpData = await Otp.findOne({
      email: normalizedEmail,
    });

    if (!otpData || !otpData.otp) {
      return res.status(404).json({
        success: false,
        message: "OTP not found. Please request a new OTP",
      });
    }

    if (!otpData.expiresAt || otpData.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (String(otpData.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving in database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save hashed token and consume OTP
    otpData.verified = true;
    otpData.otp = null;
    otpData.expiresAt = null;

    otpData.resetTokenHash = resetTokenHash;
    otpData.resetTokenExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );
    otpData.resetTokenUsed = false;

    await otpData.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      resetToken,
    });

  } catch (error) {
    console.log("OTP Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
});


// app.post("/forget-password", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email) {
//       return res.send({
//         message: "email is required",
//         success: false,
//       });
//     }

//     if (!password) {
//       return res.send({
//         message: "please enter password",
//         success: false,
//       });
//     }

//     const otpData = await Otp.findOne({ email });

//     if (!otpData || !otpData.verified) {
//       return res.send({
//         message: "please verify OTP first",
//         success: false,
//       });
//     }

//     const hashpassword = await bcrypt.hash(password, 9);

//     await User.updateOne(
//       { email },
//       {
//         $set: {
//           password: hashpassword,
//         },
//       },
//     );

//     res.send({
//       message: "password is updated successfully",
//       success: true,
//     });
//   } catch (error) {
//     console.log(error);

//     res.send({
//       message: "password not updated",
//       success: false,
//     });
//   }
// });

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


// frontend create student 

app.get("/student-profile", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId)
      .select("-password")
      .populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const roleName = user.role?.roleName?.toLowerCase();

    if (roleName !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this profile",
      });
    }

    const profile = await StudentProfile.findOne({
      student: req.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Student profile fetched successfully",
      user,
      profile,
    });

  } catch (error) {
    console.error("Student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


app.put("/student-profile/personal", verifyToken, async (req, res) => {
  try {
    const {
      gender,
      dateOfBirth,
      profileImage,
      address,
    } = req.body;

    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (user.role?.roleName?.toLowerCase() !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can update their profile",
      });
    }

    const updateData = {};

    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    if (address !== undefined) {
      updateData.address = {
        addressLine: address.addressLine || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "India",
        pincode: address.pincode || "",
      };
    }

    const profile = await StudentProfile.findOneAndUpdate(
      { student: req.userId },
      { $set: updateData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Personal details saved successfully",
      profile,
    });

  } catch (error) {
    console.error("Personal profile update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save personal details",
    });
  }
});

app.put("/student-profile/upload-image",
  verifyToken,
  profileUpload.single("profileImage"),
  async (req, res) => {
    try {
      const user = await User1.findById(req.userId).populate("role");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      if (user.role?.roleName?.toLowerCase() !== "student") {
        return res.status(403).json({
          success: false,
          message: "Only students can upload profile images",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image",
        });
      }

      const imagePath = `/uploads/profile/${req.file.filename}`;

      const profile = await StudentProfile.findOneAndUpdate(
        { student: req.userId },
        {
          $set: {
            profileImage: imagePath,
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        profile,
      });
    } catch (error) {
      console.error("Image upload error:", error);

      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  }
);


app.put("/student-profile/academic", verifyToken, async (req, res) => {
  try {
    const {
      course,
      college,
      university,
      stream,
      admissionYear,
      semester,
      enrollmentNumber,
      qualification,
      board,
      passingYear,
      percentage,
    } = req.body;

    // Check student
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check student role
    if (user.role?.roleName?.toLowerCase() !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can update academic details",
      });
    }

    // Update academic details
    const academicDetails = {
      course: course || "",
      college: college || "",
      university: university || "",
      stream: stream || "",
      admissionYear: admissionYear || "",
      semester: semester || "",
      enrollmentNumber: enrollmentNumber || "",
      qualification: qualification || "",
      board: board || "",
      passingYear: passingYear || "",
      percentage: percentage || "",
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { student: req.userId },
      {
        $set: {
          academicDetails,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Academic details updated successfully",
      profile,
    });

  } catch (error) {
    console.error("Academic details update error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update academic details",
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

app.get("/admin-user/bulk-template",
  verifyToken,
  requirePermission("students", "create"),
  (req, res) => {
    try {
      const data = [
        {
          name: "Rahul Sharma",
          email: "rahul@example.com",
          phone: "9876543210",
          password: "TempPass@123",
        },
        {
          name: "Priya Verma",
          email: "priya@example.com",
          phone: "9876543211",
          password: "TempPass@456",
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Students"
      );

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="students-template.xlsx"'
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      return res.send(buffer);
    } catch (error) {
      console.error("Template error:", error);
      return res.status(500).json({
        status: false,
        message: "Template download failed",
      });
    }
  }
);

app.post("/admin-user/bulk-import",
  verifyToken,
  requirePermission("students", "create"),
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          status: false,
          message: error.message || "Excel upload failed",
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: false,
          message: "Please upload an Excel file",
        });
      }

      const workbook = XLSX.read(req.file.buffer, {
        type: "buffer",
      });

      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return res.status(400).json({
          status: false,
          message: "Excel sheet is empty",
        });
      }

      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) {
        return res.status(400).json({
          status: false,
          message: "Excel file has no student records",
        });
      }

      // Limit import size
      if (rows.length > 500) {
        return res.status(400).json({
          status: false,
          message: "Maximum 500 students per upload",
        });
      }

      // Find the existing active Student role
      const roles = await Role.find({
        status: "active",
      }).lean();

      const studentRole = roles.find(
        (item) =>
          item.roleName.replace(/\s+/g, "").toLowerCase() ===
          "student"
      );

      if (!studentRole) {
        return res.status(400).json({
          status: false,
          message: "Active Student role not found. Please create it first.",
        });
      }

      const results = [];
      const seenEmails = new Set();
      const seenPhones = new Set();

      let added = 0;
      let failed = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 2; // Header is row 1

        try {
          const name = String(row.name ?? "").trim();
          const email = String(row.email ?? "")
            .trim()
            .toLowerCase();
          const phone = String(row.phone ?? "").trim();
          const password = String(row.password ?? "");

          // Required field validation
          if (!name || !email || !phone || !password) {
            throw new Error(
              "Name, email, phone and password are required"
            );
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Invalid email format");
          }

          if (!/^\d{10}$/.test(phone)) {
            throw new Error(
              "Phone must contain exactly 10 digits"
            );
          }

          if (password.length < 8) {
            throw new Error(
              "Password must be at least 8 characters"
            );
          }

          // Detect duplicates inside the uploaded Excel
          if (seenEmails.has(email)) {
            throw new Error("Duplicate email in Excel file");
          }

          if (seenPhones.has(phone)) {
            throw new Error("Duplicate phone in Excel file");
          }

          seenEmails.add(email);
          seenPhones.add(phone);

          // Check existing database records
          const existingUser = await User1.findOne({
            $or: [{ email }, { phone }],
          }).select("_id email phone");

          if (existingUser) {
            if (existingUser.email === email) {
              throw new Error("Email already exists");
            }

            if (String(existingUser.phone) === phone) {
              throw new Error("Phone already exists");
            }

            throw new Error("Email or phone already exists");
          }

          // Hash password before saving
          const hashedPassword = await bcrypt.hash(password, 9);

          await User1.create({
            name,
            email,
            phone,
            password: hashedPassword,
            role: studentRole._id,
            isEmailVerified: true,
            isPhoneVerified: true,
            status: "active",
          });

          added++;

          results.push({
            row: rowNumber,
            name,
            email,
            status: "success",
            message: "Student added successfully",
          });
        } catch (error) {
          failed++;

          results.push({
            row: rowNumber,
            name: String(row.name ?? "").trim(),
            email: String(row.email ?? "").trim(),
            status: "failed",
            message:
              error.code === 11000
                ? "Email or phone already exists"
                : error.message || "Student could not be added",
          });
        }
      }

      return res.status(200).json({
        status: true,
        message: "Bulk import completed",
        summary: {
          total: rows.length,
          added,
          failed,
        },
        results,
      });
    } catch (error) {
      console.error("Bulk import error:", error);

      return res.status(500).json({
        status: false,
        message: "Bulk import failed",
      });
    }
  }
);

//get user

app.get("/get-user",
  verifyToken,
  requirePermission("students", "view"),
  async (req, res) => {
    try {
      const studentRole = await Role.findOne({
        roleName: { $regex: /^student$/i },
      });

      if (!studentRole) {
        return res.status(404).json({
          success: false,
          message: "Student role not found",
        });
      }

      const getData = await User1.find({
        role: studentRole._id,
      })
        .select("-password")
        .populate("role", "roleName status")
        .sort({ createdAt: -1 });

      const totalStudents = getData.length;

      const activeStudents = getData.filter(
        (user) => user.status === "active"
      ).length;

      const inactiveStudents = getData.filter(
        (user) => user.status === "inactive"
      ).length;

      return res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        user: getData,
        statistics: {
          totalStudents,
          activeStudents,
          inactiveStudents,
        },
      });
    } catch (error) {
      console.error("Get students error:", error);

      return res.status(500).json({
        success: false,
        message: "Students data not found",
      });
    }
  }
);

// EDIT STUDENT
app.post("/admin-edit",
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

app.get("/get-student", verifyToken, async (req, res) => {
  try {
    const getUser = await User1.findById(req.userId)
      .select("-password")
      .populate("role");

    if (!getUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student data fetched successfully",
      data: getUser,
    });

  } catch (error) {
    console.log("Get Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

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



app.post("/add-college",
  verifyToken,
  requirePermission("colleges", "create"),
  collegeUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        slug,
        description,
        collegeType,
        ownership,
        establishedYear,
        website,
        status,
      } = req.body;

      // Parse location and contact
      const locationData = JSON.parse(req.body.location || "{}");
      const contactData = JSON.parse(req.body.contact || "{}");

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

      const existingSlug = await College.findOne({
        slug: collegeSlug,
      });

      if (existingSlug) {
        return res.send({
          message: "College slug already exists",
          status: false,
        });
      }

      // Logo path
      const logo = req.files?.logo?.[0]
        ? `/uploads/colleges/logos/${req.files.logo[0].filename}`
        : "";

      // Background image path
      const collegeImage = req.files?.backgroundImage?.[0]
        ? `/uploads/colleges/backgrounds/${req.files.backgroundImage[0].filename}`
        : "";

      // Create college
      const college = await College.create({
        name: name.trim(),
        slug: collegeSlug,
        logo,
        collegeImage,
        description,
        collegeType,
        ownership,
        establishedYear,
        location: locationData,
        website,
        contact: contactData,
        status: status || "pending",
      });

      return res.send({
        message: "College added successfully",
        status: true,
        college,
      });
    } catch (error) {
      console.log(error);

      return res.send({
        message: "College not added",
        status: false,
        error: error.message,
      });
    }
  }
);



//get college route

app.get("/get-college",
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
app.get("/get-colleges", async (req, res) => {
  try {
    const colleges = await College.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      status: true,
      message: "Colleges fetched successfully",
      colleges,
    });
  } catch (error) {
     console.error("GET COLLEGES ERROR:", error);

  return res.status(500).json({
    status: false,
    message: "Failed to fetch colleges",
    error: error.message,
  });
  }
});
app.get("/get-college/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid college ID",
      });
    }

    // Find college by ID
    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        status: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "College fetched successfully",
      college,
    });
  } catch (error) {
    console.error("Get college by ID error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch college",
    });
  }
});
//edit college route


app.post("/edit-college",
  verifyToken,
  requirePermission("colleges", "update"),
  collegeUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        _id,
        name,
        slug,
        description,
        collegeType,
        ownership,
        establishedYear,
        website,
        status,
      } = req.body;

      const locationData = JSON.parse(req.body.location || "{}");
      const contactData = JSON.parse(req.body.contact || "{}");

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

      const existingCollege = await College.findById(_id);

      if (!existingCollege) {
        return res.send({
          message: "College not found",
          status: false,
        });
      }

      // Duplicate name check
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

      // Generate slug if not provided
      const collegeSlug =
        slug ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Duplicate slug check
      const duplicateSlug = await College.findOne({
        slug: collegeSlug,
        _id: { $ne: _id },
      });

      if (duplicateSlug) {
        return res.send({
          message: "College slug already exists",
          status: false,
        });
      }

      // Update text fields
      existingCollege.name = name.trim();
      existingCollege.slug = collegeSlug;
      existingCollege.description = description;
      existingCollege.collegeType = collegeType;
      existingCollege.ownership = ownership;
      existingCollege.establishedYear = establishedYear;
      existingCollege.location = locationData;
      existingCollege.website = website;
      existingCollege.contact = contactData;
      existingCollege.status = status;

      // Update logo only if new logo uploaded
      if (req.files?.logo?.[0]) {
        existingCollege.logo =
          `/uploads/colleges/logos/${req.files.logo[0].filename}`;
      }

      // Update background only if new background uploaded
      if (req.files?.backgroundImage?.[0]) {
        existingCollege.collegeImage =
          `/uploads/colleges/backgrounds/${req.files.backgroundImage[0].filename}`;
      }

      await existingCollege.save();

      return res.send({
        message: "College updated successfully",
        status: true,
        college: existingCollege,
      });
    } catch (error) {
      console.log(error);

      return res.send({
        message: "College not updated",
        status: false,
        error: error.message,
      });
    }
  }
);


// DELETE COLLEGE ROUTE
app.post("/delete-college",
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



// University add route
app.post("/add-university",
  verifyToken,
  requirePermission("universities", "create"),
  async (req, res) => {
    try {
      const {
        name,
        shortName,
        slug,
        logo,
        description,
        type,
        establishedYear,
        recognition,
        accreditation,
        location,
        contact,
        website,
        status,
        isVerified,
      } = req.body;

      if (!name) {
        return res.send({
          message: "University name is required",
          status: false,
        });
      }

      const existingUniversity = await University.findOne({
        name: name.trim(),
      });

      if (existingUniversity) {
        return res.send({
          message: "University already exists",
          status: false,
        });
      }

      const universitySlug =
        slug ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const existingSlug = await University.findOne({
        slug: universitySlug,
      });

      if (existingSlug) {
        return res.send({
          message: "University slug already exists",
          status: false,
        });
      }

      const university = await University.create({
        name: name.trim(),
        shortName,
        slug: universitySlug,
        logo,
        description,
        type,
        establishedYear,
        recognition,
        accreditation,
        location,
        contact,
        website,
        status: status || "pending",
        isVerified: isVerified || false,
      });

      res.send({
        message: "University added successfully",
        status: true,
        university,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "University not added",
        status: false,
      });
    }
  }
);

// get university route

app.get("/get-university",
  verifyToken,
  requirePermission("universities", "view"),
  async (req, res) => {
    try {
      const universities = await University.find().sort({
        createdAt: -1,
      });

      res.send({
        message: "University data fetched successfully",
        status: true,
        university: universities,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "University data not found",
        status: false,
      });
    }
  }
);


// Edit university Route 
app.post("/edit-university",
  verifyToken,
  requirePermission("universities", "update"),
  async (req, res) => {
    try {
      const {
        _id,
        name,
        shortName,
        slug,
        logo,
        description,
        type,
        establishedYear,
        recognition,
        accreditation,
        location,
        contact,
        website,
        status,
        isVerified,
      } = req.body;

      if (!_id) {
        return res.send({
          message: "University ID is required",
          status: false,
        });
      }

      if (!name) {
        return res.send({
          message: "University name is required",
          status: false,
        });
      }

      const duplicateUniversity = await University.findOne({
        name: name.trim(),
        _id: { $ne: _id },
      });

      if (duplicateUniversity) {
        return res.send({
          message: "University already exists",
          status: false,
        });
      }

      const universitySlug =
        slug ||
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const duplicateSlug = await University.findOne({
        slug: universitySlug,
        _id: { $ne: _id },
      });

      if (duplicateSlug) {
        return res.send({
          message: "University slug already exists",
          status: false,
        });
      }

      const updateUniversity = await University.updateOne(
        { _id },
        {
          $set: {
            name: name.trim(),
            shortName,
            slug: universitySlug,
            logo,
            description,
            type,
            establishedYear,
            recognition,
            accreditation,
            location,
            contact,
            website,
            status,
            isVerified,
          },
        }
      );

      if (updateUniversity.matchedCount === 0) {
        return res.send({
          message: "University not found",
          status: false,
        });
      }

      const updatedUniversity = await University.findById(_id);

      res.send({
        message: "University updated successfully",
        status: true,
        university: updatedUniversity,
      });
    } catch (error) {
      console.log(error);

      res.send({
        message: "University not updated",
        status: false,
      });
    }
  }
);


// delete University
app.post(
  "/delete-university",
  verifyToken,
  requirePermission("universities", "delete"),
  async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.send({
          message: "University ID is required",
          status: false,
        });
      }

      const deletedUniversity = await University.findByIdAndDelete(id);

      if (!deletedUniversity) {
        return res.send({
          message: "University not found",
          status: false,
        });
      }

      res.send({
        message: "University deleted successfully",
        status: true,
        university: deletedUniversity,
      });
    } catch (error) {
      console.error("DELETE UNIVERSITY ERROR:", error);

      res.status(500).send({
        message: "University not deleted",
        status: false,
      });
    }
  }
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

app.get("/student/get-streams", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId).populate("role");

    if (!user || user.role?.roleName?.toLowerCase() !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access streams",
      });
    }

    const streams = await Stream.find({ status: "active" })
      .select("_id name slug code parentStream")
      .populate("parentStream", "name slug code")
      .sort({ displayOrder: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: streams.length,
      streams,
    });
  } catch (error) {
    console.error("Student streams error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch streams",
    });
  }
});

// GET STREAM BY ID

app.get("/get-stream/:id",
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

app.post("/create-stream",
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

app.put("/update-stream/:id",
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

app.delete("/delete-stream/:id",
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

app.post("/create-degree",
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

app.get("/get-degrees",
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

app.get("/get-degree/:id",
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

app.put("/update-degree/:id",
  verifyToken,
  requirePermission("degrees","update"),
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


app.delete("/delete-degree/:id",
  verifyToken,
  requirePermission("degrees", "delete"),
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

app.get("/student/get-courses", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId).populate("role");

    if (!user || user.role?.roleName?.toLowerCase() !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access courses",
      });
    }

    const courses = await Course.find({ status: "active" })
      .select("_id name slug code description stream degree duration")
      .populate("stream", "name slug code")
      .populate("degree", "name shortName level")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Student courses error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
});


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

// GET ALL COURSES FOR STUDENT (WITHOUT ROLE PERMISSION)

app.get("/get-course", async (req, res) => {
  try {
    const courses = await Course.find({ status: "active" })
      .populate("stream", "name slug code")
      .populate("degree", "name shortName level")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get Student Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


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

// CREATE EMAIL TEMPLATE
app.post("/create-emailtemp",verifyToken,
  requirePermission("emailTemplates", "create"), async (req, res) => {
  try {
    const { email, title, message } = req.body;
  
     
    if (
      typeof email !== "string" ||
      typeof title !== "string" ||
      typeof message !== "string" ||
      !email.trim() ||
      !title.trim() ||
      !sanitizeHtml(message).trim()
    ) {
      return res.status(400).json({
        status: false,
        message: "Email, title and message are required",
      });
    }

    const template = await EmailTemplate.create({
      email: email.trim().toLowerCase(),
      title: title.trim(),
      message: sanitizeHtml(message, {
        allowedTags: [
          "p", "br", "h1", "h2", "h3",
          "strong", "b", "i", "em", "u",
          "ul", "ol", "li", "blockquote", "a",
        ],
        allowedAttributes: {
          a: ["href", "target", "rel"],
        },
        allowedSchemes: ["http", "https", "mailto"],
      }),
    });

    return res.status(201).json({
      status: true,
      message: "Email template created successfully",
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// GET ALL EMAIL TEMPLATES
app.get("/get-emailtemps",verifyToken,
  requirePermission("emailTemplates", "view"), async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      status: true,
      total: templates.length,
      data: templates,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// GET SINGLE EMAIL TEMPLATE
app.get("/get-emailtemp/:id",verifyToken,
  requirePermission("emailTemplates", "view"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid template ID",
      });
    }

    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        status: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// UPDATE EMAIL TEMPLATE
app.put("/update-emailtemp/:id",verifyToken,
  requirePermission("emailTemplates", "update"), async (req, res) => {
  try {
    const { email, title, message } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid template ID",
      });
    }

    if (
      typeof email !== "string" ||
      typeof title !== "string" ||
      typeof message !== "string" ||
      !email.trim() ||
      !title.trim() ||
      !sanitizeHtml(message).trim()
    ) {
      return res.status(400).json({
        status: false,
        message: "Email, title and message are required",
      });
    }

    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      {
        email: email.trim().toLowerCase(),
        title: title.trim(),
        message: sanitizeHtml(message, {
          allowedTags: [
            "p", "br", "h1", "h2", "h3",
            "strong", "b", "i", "em", "u",
            "ul", "ol", "li", "blockquote", "a",
          ],
          allowedAttributes: {
            a: ["href", "target", "rel"],
          },
          allowedSchemes: ["http", "https", "mailto"],
        }),
      },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        status: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Email template updated successfully",
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

// DELETE EMAIL TEMPLATE
app.delete("/delete-emailtemp/:id",verifyToken,
  requirePermission("emailTemplates", "delete"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        status: false,
        message: "Invalid template ID",
      });
    }

    const template = await EmailTemplate.findByIdAndDelete(
      req.params.id
    );

    if (!template) {
      return res.status(404).json({
        status: false,
        message: "Template not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Email template deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});


app.post("/contact",async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      subject,
      enquiryType,
      message,
    } = req.body;

    // Check duplicate email
    const verifyUser = await Contact.findOne({
      email: email.toLowerCase().trim(),
    });

    if (verifyUser) {
      return res.status(409).send({
        status: false,
        message: "User already registered with this email",
      });
    }

    // Save contact
    const saveUser = await Contact.create({
      name,
      email,
      contact,
      subject,
      enquiryType,
      message,
    });

    return res.status(201).send({
      status: true,
      message: "Inquiry submitted successfully",
      data: saveUser,
    });

  } catch (err) {
    console.log("Contact Error:", err);

    if (err.code === 11000) {
      return res.status(409).send({
        status: false,
        message: "Email already exists",
      });
    }

    return res.status(500).send({
      status: false,
      message: "Inquiry not submitted successfully",
    });
  }
});

app.get("/get-contact",async(req,res)=>{
 try{ const getData=await Contact.find()
  // console.log("data is : ",getData);
  return res.send({
    status:true,
    message:"contact data geted",
    data:getData
  })  
}
catch(err){
  return res.send({
    status:false,
    message:err.message
  })
}
})

app.delete("/delete-contact/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({
        status: false,
        message: "Invalid contact ID"
      });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).send({
        status: false,
        message: "Contact not found"
      });
    }

    return res.status(200).send({
      status: true,
      message: "Contact deleted successfully"
    });

  } catch (err) {
    return res.status(500).send({
      status: false,
      message: err.message
    });
  }
});
// Add role permissions 


const MODULES = [
  "students",
  "colleges",
  "roles",
  "courses",
  "degrees",
  "universities",
  "streams",
  "specializations",
  "emailTemplates",
  "contacts",
];

const ACTIONS = [
  "create",
  "view",
  "update",
  "delete",
];


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


app.post("/add-role",verifyToken,
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

app.post("/edit-role",
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
app.get("/get-role",
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
app.post("/delete-role",
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
app.post("/edit-role",
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

app.get("/get-roles-dropdown", async (req, res) => {
  try {
    const roles = await Role.find({ status: "active" })
      .select("_id roleName")
      .sort({ roleName: 1 });

    res.status(200).json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/create-user", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // Check duplicate email
    const existingUser = await User1.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Check role
    const roleData = await Role.findOne({
      _id: role,
      status: "active",
    });

    if (!roleData) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive role",
      });
    }

    // Password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User1.create({
      name,
      email: email.toLowerCase().trim(),
      phone,
      password: hashedPassword,
      role: roleData._id,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: roleData.roleName,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// ========================================
// COUNSELLOR MANAGEMENT ACCESS MIDDLEWARE
// Only Admin and SuperAdmin
// ========================================

const counsellorManagementAccess = async (req, res, next) => {
  try {
    const admin = await User1.findById(req.userId).populate("role");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = admin.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and SuperAdmin can manage counsellors",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ========================================
// 1. GET ALL COUNSELLORS
// ========================================

app.get(
  "/get-counsellors",
  verifyToken,
  counsellorManagementAccess,
  async (req, res) => {
    try {
      const counsellorRole = await Role.findOne({
        roleName: { $regex: /^counsellor$/i },
      });

      if (!counsellorRole) {
        return res.status(404).json({
          success: false,
          message: "Counsellor role not found",
        });
      }

      const counsellors = await User1.find({
        role: counsellorRole._id,
      })
        .select("-password")
        .populate("role", "roleName")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        message: "Counsellors fetched successfully",
        total: counsellors.length,
        data: counsellors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ========================================
// 2. CREATE COUNSELLOR
// ========================================

app.post(
  "/create-counsellor",
  verifyToken,
  counsellorManagementAccess,
  async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User1.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const counsellorRole = await Role.findOne({
        roleName: { $regex: /^counsellor$/i },
        status: "active",
      });

      if (!counsellorRole) {
        return res.status(404).json({
          success: false,
          message: "Active Counsellor role not found",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newCounsellor = await User1.create({
        name: name.trim(),
        email: normalizedEmail,
        phone,
        password: hashedPassword,
        role: counsellorRole._id,
        status: "active",
      });

      res.status(201).json({
        success: true,
        message: "Counsellor created successfully",
        data: {
          _id: newCounsellor._id,
          name: newCounsellor.name,
          email: newCounsellor.email,
          phone: newCounsellor.phone,
          role: counsellorRole.roleName,
          status: newCounsellor.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ========================================
// 3. UPDATE COUNSELLOR
// ========================================

app.put(
  "/update-counsellor/:id",
  verifyToken,
  counsellorManagementAccess,
  async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;

      const counsellorRole = await Role.findOne({
        roleName: { $regex: /^counsellor$/i },
      });

      if (!counsellorRole) {
        return res.status(404).json({
          success: false,
          message: "Counsellor role not found",
        });
      }

      const counsellor = await User1.findOne({
        _id: req.params.id,
        role: counsellorRole._id,
      });

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message: "Counsellor not found",
        });
      }

      if (email) {
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User1.findOne({
          email: normalizedEmail,
          _id: { $ne: counsellor._id },
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email already exists",
          });
        }

        counsellor.email = normalizedEmail;
      }

      if (name) counsellor.name = name.trim();
      if (phone !== undefined) counsellor.phone = phone;

      if (password) {
        counsellor.password = await bcrypt.hash(password, 10);
      }

      await counsellor.save();

      res.status(200).json({
        success: true,
        message: "Counsellor updated successfully",
        data: {
          _id: counsellor._id,
          name: counsellor.name,
          email: counsellor.email,
          phone: counsellor.phone,
          status: counsellor.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);


// ========================================
// 4. ACTIVATE / DEACTIVATE COUNSELLOR
// ========================================

app.put("/toggle-counsellor-status/:id",
  verifyToken,
  counsellorManagementAccess,
  async (req, res) => {
    try {
      const counsellorRole = await Role.findOne({
        roleName: { $regex: /^counsellor$/i },
      });

      if (!counsellorRole) {
        return res.status(404).json({
          success: false,
          message: "Counsellor role not found",
        });
      }

      const counsellor = await User1.findOne({
        _id: req.params.id,
        role: counsellorRole._id,
      });

      if (!counsellor) {
        return res.status(404).json({
          success: false,
          message: "Counsellor not found",
        });
      }

      counsellor.status =
        counsellor.status === "active" ? "inactive" : "active";

      await counsellor.save();

      res.status(200).json({
        success: true,
        message: `Counsellor ${counsellor.status} successfully`,
        data: {
          _id: counsellor._id,
          name: counsellor.name,
          status: counsellor.status,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);



app.get("/test-superadmin",
  verifyToken,
  requireRole("superAdmin"),
  (req, res) => {
    res.json({
      status: true,
      message: "SuperAdmin access granted",
    });
  },
);

//send student request 
app.post("/student/counselling-request", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId).populate("role");

    if (!user || user.role?.roleName?.toLowerCase() !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit counselling requests",
      });
    }

    const {
      academicYear,
      admissionLevel,
      preferredStreams,
      preferredCourses,
      preferredLocations,
      budget,
      entranceExams,
      counsellingMode,
      preferredTime,
      requestDescription
    } = req.body;

    if (!academicYear || !admissionLevel) {
      return res.status(400).json({
        success: false,
        message: "Academic year and admission level are required",
      });
    }

    const requestNumber = `CR-${Date.now()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const counsellingRequest = await CounsellingRequest.create({
      requestNumber,
      student: req.userId,
      academicYear,
      admissionLevel,
      preferredStreams: preferredStreams || [],
      preferredCourses: preferredCourses || [],
      preferredLocations: preferredLocations || [],
      budget: budget || {},
      entranceExams: entranceExams || [],
      counsellingMode: counsellingMode || "phone",
      preferredTime: preferredTime || {},
    });

    return res.status(201).json({
      success: true,
      message: "Counselling request submitted successfully",
      data: counsellingRequest,
    });
  } catch (error) {
    console.error("Counselling request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit counselling request",
    });
  }
});


app.get("/counsellingrequests", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user find karo
    const loggedInUser = await User1.findById(req.userId).populate("role");

    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check karo
    const roleName = loggedInUser.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    const allowedRoles = ["superadmin", "admin", "counsellor"];

    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view counselling requests",
      });
    }

    // 3. Query parameters
    const {
      status,
      priority,
      admissionLevel,
      page = 1,
      limit = 10,
    } = req.query;

    // 4. Filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (admissionLevel) {
      filter.admissionLevel = admissionLevel;
    }

    // 5. Pagination
    const currentPage = Math.max(1, parseInt(page) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (currentPage - 1) * perPage;

    // 6. Total count
    const totalRequests = await CounsellingRequest.countDocuments(filter);

    // 7. Fetch counselling requests
    const requests = await CounsellingRequest.find(filter)
      .populate("student", "name email phone")
      .populate("preferredStreams")
      .populate("preferredCourses")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage);

    // 8. Response
    return res.status(200).json({
      success: true,
      message: "Counselling requests fetched successfully",
      count: requests.length,
      totalRequests,
      currentPage,
      totalPages: Math.ceil(totalRequests / perPage),
      data: requests,
    });

  } catch (error) {
    console.error("Counselling Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling requests",
      error: error.message,
    });
  }
});

app.get("/get-counsellors", verifyToken, async (req, res) => {
  try {
    const counsellorRole = await Role.findOne({
      roleName: {
        $regex: /^counsellor$/i,
      },
      status: "active",
    });

    if (!counsellorRole) {
      return res.status(404).json({
        success: false,
        message: "Counsellor role not found",
      });
    }

    const counsellors = await User1.find({
      role: counsellorRole._id,
      status: "active",
    }).select("name email phone");

    return res.status(200).json({
      success: true,
      message: "Counsellors fetched successfully",
      data: counsellors,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

//assign-counsellor 
app.post("/assign-counsellor", verifyToken, async (req, res) => {
  try {
    const { counsellingRequestId, counsellorId } = req.body;

    // 1. Validate input
    if (!counsellingRequestId || !counsellorId) {
      return res.status(400).json({
        success: false,
        message: "Counselling request ID and counsellor ID are required",
      });
    }

    // 2. Check logged-in admin
    const admin = await User1.findById(req.userId).populate("role");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const roleName =
      typeof admin.role === "object"
        ? admin.role?.roleName
        : admin.role;

    const normalizedRole = roleName?.toLowerCase().replace(/[\s_-]/g, "");

    if (!["admin", "superadmin"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can assign counsellor",
      });
    }

    // 3. Check counselling request
    const counsellingRequest = await CounsellingRequest.findById(
      counsellingRequestId
    );

    if (!counsellingRequest) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

   // 4. Check counsellor
const counsellor = await User1.findById(counsellorId).populate("role");

if (!counsellor) {
  return res.status(404).json({
    success: false,
    message: "Counsellor not found",
  });
}

if (counsellor.status !== "active") {
  return res.status(400).json({
    success: false,
    message: "Counsellor is not active",
  });
}

const counsellorRole =
  typeof counsellor.role === "object"
    ? counsellor.role?.roleName
    : counsellor.role;

if (counsellorRole?.toLowerCase().trim() !== "counsellor") {
  return res.status(400).json({
    success: false,
    message: "Selected user is not a counsellor",
  });
}

    
    // 5. Check existing active assignment
    const existingAssignment = await CounsellingAssignment.findOne({
      counsellingRequest: counsellingRequestId,
      status: "active",
    });

    if (existingAssignment) {
      // Same counsellor dobara assign ho raha hai
      if (
        existingAssignment.counsellor.toString() ===
        counsellorId.toString()
      ) {
        return res.status(409).json({
          success: false,
          message: "This counsellor is already assigned",
        });
      }

      // Different counsellor hai to old assignment close karo
      existingAssignment.status = "reassigned";
      existingAssignment.reassignedTo = counsellorId;
      existingAssignment.reassignmentReason = "Reassigned by admin";
      existingAssignment.endedAt = new Date();

      await existingAssignment.save();
    }

    // 6. Create new assignment
    const assignment = await CounsellingAssignment.create({
      counsellingRequest: counsellingRequestId,
      counsellor: counsellorId,
      assignedBy: req.userId,
      assignmentType: "manual",
      status: "active",
    });

// 7. Update counselling request status
counsellingRequest.status = "assigned";
await counsellingRequest.save();

    // 8. Send response
    const populatedAssignment = await CounsellingAssignment.findById(
      assignment._id
    )
      .populate("counsellingRequest")
      .populate("counsellor", "name email")
      .populate("assignedBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Counsellor assigned successfully",
      data: populatedAssignment,
    });

  } catch (error) {
    console.error("Assign Counsellor Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});


// START COUNSELLING
app.put("/start-counselling/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Logged-in user find karo
    const loggedInUser = await User1.findById(req.userId)
      .populate("role");

    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check
    const roleName = loggedInUser.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin", "counsellor"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    // 3. Counselling request find karo
    const counsellingRequest = await CounsellingRequest.findById(id);

    if (!counsellingRequest) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    // 4. Counsellor ki active assignment check karo
    if (roleName === "counsellor") {
      const assignment = await CounsellingAssignment.findOne({
        counsellingRequest: id,
        counsellor: req.userId,
        status: "active",
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: "This request is not assigned to you",
        });
      }
    }

    // 5. Current status check
    if (counsellingRequest.status !== "assigned") {
      return res.status(400).json({
        success: false,
        message: `Cannot start counselling. Current status is ${counsellingRequest.status}`,
      });
    }

    // 6. Update status
    counsellingRequest.status = "in_progress";

    await counsellingRequest.save();

    return res.status(200).json({
      success: true,
      message: "Counselling started successfully",
      data: counsellingRequest,
    });

  } catch (error) {
    console.error("Start Counselling Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



app.get("/counsellor/my-assignments", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user find karo
    const loggedInUser = await User1.findById(req.userId)
      .populate("role");

    if (!loggedInUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check karo
    const roleName = loggedInUser.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    const allowedRoles = ["superadmin", "admin", "counsellor"];

    if (!allowedRoles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this data",
      });
    }

    // 3. Role ke according query
    let query = {
      status: "active",
    };

    if (roleName === "counsellor") {
      query.counsellor = req.userId;
    }

    // 4. Assignments fetch karo
    const assignments = await CounsellingAssignment.find(query)
      .populate({
        path: "counsellingRequest",
        populate: {
          path: "student",
          select: "name email phone",
        },
      })
      .populate("counsellor", "name email")
      .populate("assignedBy", "name email")
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Assignments fetched successfully",
      count: assignments.length,
      data: assignments,
    });

  } catch (error) {
    console.error("My Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



app.get("/get-counselling-assignments", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check
    const roleName =
      typeof user.role === "object"
        ? user.role?.roleName
        : user.role;

    const normalizedRole = roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin", "counsellor"].includes(normalizedRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view assignments",
      });
    }

    // 3. Counsellor can see only their own assignments
    const filter = { status: "active" };

    if (normalizedRole === "counsellor") {
      filter.counsellor = req.userId;
    }

    // 4. Fetch assignments
    const assignments = await CounsellingAssignment.find(filter)
      .populate({
        path: "counsellingRequest",
        populate: [
          { path: "student", select: "name email phone" },
          { path: "preferredCourses", select: "name" },
          { path: "preferredStreams", select: "name" },
        ],
      })
      .populate("counsellor", "name email phone")
      .populate("assignedBy", "name email")
      .sort({ assignedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Counselling assignments fetched successfully",
      data: assignments,
    });

  } catch (error) {
    console.error("Fetch Assignments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
});


app.put("/share-recommendations/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { colleges, courses, counsellorNote } = req.body;

    // 1. Logged-in user check
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (roleName !== "counsellor") {
      return res.status(403).json({
        success: false,
        message: "Only counsellors can share recommendations",
      });
    }

    // 2. Validate input
    if (
      !Array.isArray(colleges) ||
      !Array.isArray(courses) ||
      (colleges.length === 0 && courses.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one college or course",
      });
    }

    // 3. Find counselling request
    const counsellingRequest = await CounsellingRequest.findById(id);

    if (!counsellingRequest) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    // 4. Check active assignment
    const assignment = await CounsellingAssignment.findOne({
      counsellingRequest: id,
      counsellor: req.userId,
      status: "active",
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this counselling request",
      });
    }

    // 5. Check request status
    if (counsellingRequest.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Recommendations can only be shared for in-progress requests",
      });
    }

    // 6. Validate college IDs
    const validColleges = await College.find({
      _id: { $in: colleges },
    }).select("_id");

    if (validColleges.length !== new Set(colleges.map(String)).size) {
      return res.status(400).json({
        success: false,
        message: "One or more college IDs are invalid",
      });
    }

    // 7. Validate course IDs
    const validCourses = await Course.find({
      _id: { $in: courses },
    }).select("_id");

    if (validCourses.length !== new Set(courses.map(String)).size) {
      return res.status(400).json({
        success: false,
        message: "One or more course IDs are invalid",
      });
    }

    // 8. Save recommendations
    counsellingRequest.recommendations = {
      colleges,
      courses,
      counsellorNote: counsellorNote || "",
      sharedAt: new Date(),
      sharedBy: req.userId,
    };

    counsellingRequest.status = "recommendations_shared";

    await counsellingRequest.save();

    return res.status(200).json({
      success: true,
      message: "Recommendations shared successfully",
      data: counsellingRequest,
    });
  } catch (error) {
    console.error("Share Recommendations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
app.get("/get-courses-for-recommendations", verifyToken, async (req, res) => {
  try {
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["counsellor", "admin", "superadmin"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view courses",
      });
    }

    const courses = await Course.find({ status: "active" })
      .populate("stream", "name")
      .populate("degree", "name shortName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    console.error("Get Recommendation Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/student/my-recommendations", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user find karo
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check karo
    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (roleName !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can view their recommendations",
      });
    }

    // 3. Student ki shared recommendations find karo
    const recommendations = await CounsellingRequest.find({
      student: req.userId,
      status: "recommendations_shared",
    })
      .populate("recommendations.colleges", "name logo location")
      .populate("recommendations.courses", "name code duration")
      .populate("recommendations.sharedBy", "name");

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      message: "Student recommendations fetched successfully",
      data: recommendations,
    });

  } catch (error) {
    console.error("Student Recommendations Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/student/my-counselling-requests", verifyToken, async (req, res) => {
  try {
    // Logged-in student ki requests
    const requests = await CounsellingRequest.find({
      student: req.userId,
    })
      .populate("preferredStreams", "name")
      .populate("preferredCourses", "name code")
      .populate("recommendations.colleges", "name")
      .populate("recommendations.courses", "name code")
      .populate("recommendations.sharedBy", "name email")
      .sort({ createdAt: -1 });

    // Requests ke IDs
    const requestIds = requests.map((request) => request._id);

    // Active counsellor assignments
    const assignments = await CounsellingAssignment.find({
      counsellingRequest: { $in: requestIds },
      status: "active",
    }).populate("counsellor", "name firstName lastName email");

    // Assignment ko request ID se map karna
    const assignmentMap = {};

    assignments.forEach((assignment) => {
      assignmentMap[assignment.counsellingRequest.toString()] =
        assignment.counsellor;
    });

    // Final response
    const finalRequests = requests.map((request) => ({
      ...request.toObject(),
      assignedCounsellor:
        assignmentMap[request._id.toString()] || null,
    }));

    return res.status(200).json({
      success: true,
      message: "Student counselling requests fetched successfully",
      data: finalRequests,
    });
  } catch (error) {
    console.error("My Counselling Requests Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch counselling requests",
      error: error.message,
    });
  }
});




const getLoggedInUser = async (userId) => {
  return await User1.findById(userId).populate("role");
};

const getRoleName = (user) => {
  return user?.role?.roleName
    ?.toLowerCase()
    .replace(/[\s_-]/g, "");
};

const isAdminRole = (role) =>
  ["admin", "superadmin"].includes(role);

const sendServerError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message,
  });
};





app.post("/create-appointment", verifyToken, async (req, res) => {
  try {
    const {
      counsellingRequestId,
      appointmentDate,
      appointmentTime,
      meetingMode,
      meetingLink = "",
      location = "",
      purpose = "",
      notes = "",
    } = req.body;

    // 1. Required validation
    if (
      !counsellingRequestId ||
      !appointmentDate ||
      !appointmentTime ||
      !meetingMode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required appointment details",
      });
    }

    if (!mongoose.isValidObjectId(counsellingRequestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID",
      });
    }

    if (!["online", "offline"].includes(meetingMode)) {
      return res.status(400).json({
        success: false,
        message: "Meeting mode must be online or offline",
      });
    }

    if (
      meetingMode === "online" &&
      (typeof meetingLink !== "string" || !meetingLink.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online appointment",
      });
    }

    if (
      meetingMode === "offline" &&
      (typeof location !== "string" || !location.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline appointment",
      });
    }

    // 2. Logged-in user
    const user = await getLoggedInUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = getRoleName(user);

    if (!["student", "counsellor", "admin", "superadmin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create appointments",
      });
    }

    // 3. Find counselling request
    const request = await CounsellingRequest.findById(
      counsellingRequestId
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    // 4. Student can create only own appointment
    if (
      role === "student" &&
      String(request.student) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You can book appointment only for your own request",
      });
    }

    // 5. Find active assignment
    const assignment = await CounsellingAssignment.findOne({
      counsellingRequest: counsellingRequestId,
      status: "active",
    });

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: "No active counsellor assigned to this request",
      });
    }

    // 6. Counsellor can create only own assigned appointments
    if (
      role === "counsellor" &&
      String(assignment.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This counselling request is not assigned to you",
      });
    }

    // 7. Prevent duplicate active appointments
    const existingAppointment = await Appointment.findOne({
      counsellingRequest: counsellingRequestId,
      status: {
        $in: ["pending", "scheduled", "rescheduled", "in_progress"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "An active appointment already exists for this counselling request",
        appointmentId: existingAppointment._id,
        appointmentNumber: existingAppointment.appointmentNumber,
        appointmentStatus: existingAppointment.status,
      });
    }

    // 8. Validate appointment date
    const parsedDate = new Date(appointmentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Appointment date cannot be in the past",
      });
    }

    // 9. Appointment status based on role
    const appointmentStatus =
      role === "student" ? "pending" : "scheduled";

    // 10. Create appointment
    const appointment = await Appointment.create({
      appointmentNumber: `APT-${Date.now()}`,
      counsellingRequest: counsellingRequestId,
      assignment: assignment._id,
      student: request.student,
      counsellor: assignment.counsellor,
      appointmentDate: parsedDate,
      appointmentTime: appointmentTime.trim(),
      meetingMode,
      meetingLink:
        meetingMode === "online" ? meetingLink.trim() : "",
      location:
        meetingMode === "offline" ? location.trim() : "",
      purpose: typeof purpose === "string" ? purpose.trim() : "",
      notes: typeof notes === "string" ? notes.trim() : "",
      status: appointmentStatus,
      createdBy: req.userId,
      createdByRole: role,
    });

    return res.status(201).json({
      success: true,
      message:
        appointmentStatus === "pending"
          ? "Appointment request submitted. Waiting for counsellor approval."
          : "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to create appointment");
  }
});





app.put("/approve-appointment/:id", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["counsellor", "admin", "superadmin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only counsellor or admin can approve appointments",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      role === "counsellor" &&
      String(appointment.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This appointment is not assigned to you",
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be approved",
      });
    }

    appointment.status = "scheduled";
    appointment.approvedBy = req.userId;
    appointment.approvedAt = new Date();

    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment approved successfully",
      data: appointment,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to approve appointment");
  }
});






app.get("/student/my-appointments", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);

    if (getRoleName(user) !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this route",
      });
    }

    const appointments = await Appointment.find({
      student: req.userId,
    })
      .populate("counsellingRequest", "requestNumber status")
      .populate("counsellor", "name email")
      .populate("approvedBy", "name email")
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return res.json({
      success: true,
      message: "Student appointments fetched successfully",
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch appointments");
  }
});




app.put("/update-appointment-status/:id", verifyToken, async (req, res) => {
  try {
    const { status, cancellationReason = "" } = req.body;
    const { id } = req.params;

    // 1. Validate appointment ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    // 2. Validate status
    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be completed or cancelled",
      });
    }

    // 3. Get logged-in user
    const user = await getLoggedInUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const role = getRoleName(user);

    if (!["student", "counsellor", "admin", "superadmin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update appointments",
      });
    }

    // 4. Find appointment
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // 5. Ownership check
    const isStudentOwner =
      role === "student" &&
      String(appointment.student) === String(req.userId);

    const isCounsellorOwner =
      role === "counsellor" &&
      String(appointment.counsellor) === String(req.userId);

    const isAdmin = ["admin", "superadmin"].includes(role);

    if (!isStudentOwner && !isCounsellorOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this appointment",
      });
    }

    // 6. Only pending or scheduled appointments can be updated
    if (!["pending", "scheduled"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be updated because its status is ${appointment.status}`,
      });
    }

    // 7. Fetch all sessions
    const sessions = await CounsellingSession.find({
      appointment: appointment._id,
    });

    // =========================================
    // CANCEL APPOINTMENT
    // =========================================

    if (status === "cancelled") {
      // Prevent cancellation if any session is running
      const activeSession = sessions.find(
        (session) => session.status === "in_progress"
      );

      if (activeSession) {
        return res.status(400).json({
          success: false,
          message: "Appointment cannot be cancelled while a session is in progress",
        });
      }

      // Cancel appointment
      appointment.status = "cancelled";
      appointment.cancelledBy = req.userId;
      appointment.cancellationReason = cancellationReason.trim();

      await appointment.save();

      // Cancel all scheduled sessions
      const sessionUpdate = await CounsellingSession.updateMany(
        {
          appointment: appointment._id,
          status: "scheduled",
        },
        {
          $set: {
            status: "cancelled",
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Appointment and scheduled sessions cancelled successfully",
        data: {
          appointment,
          cancelledSessions: sessionUpdate.modifiedCount,
        },
      });
    }

    // =========================================
    // COMPLETE APPOINTMENT
    // =========================================

    if (status === "completed") {
      // Appointment must have at least one session
      if (sessions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Appointment cannot be completed without at least one counselling session",
        });
      }

      // Check incomplete sessions
      const incompleteSessions = sessions.filter(
        (session) =>
          !["completed", "cancelled"].includes(session.status)
      );

      if (incompleteSessions.length > 0) {
        return res.status(400).json({
          success: false,
          message: "All counselling sessions must be completed or cancelled before completing the appointment",
          incompleteSessions: incompleteSessions.map((session) => ({
            _id: session._id,
            sessionNumber: session.sessionNumber,
            status: session.status,
          })),
        });
      }

      appointment.status = "completed";

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: "Appointment completed successfully",
        data: appointment,
      });
    }
  } catch (error) {
    console.error("Update Appointment Status Error:", error);

    return sendServerError(
      res,
      error,
      "Failed to update appointment status"
    );
  }
});




app.get("/get-appointments", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view all appointments",
      });
    }

    const filter = {};

    if (role === "counsellor") {
      filter.counsellor = req.userId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const appointments = await Appointment.find(filter)
      .populate("student", "name email contact")
      .populate("counsellor", "name email")
      .populate("counsellingRequest", "requestNumber status")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ appointmentDate: 1, createdAt: -1 });

    return res.json({
      success: true,
      message: "Appointments fetched successfully",
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch appointments");
  }
});

app.get("/get-available-appointment-students", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);
    const roleName = getRoleName(user);

    if (!["superadmin", "admin", "counsellor"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these students",
      });
    }

    // Active assignments filter
    const assignmentFilter = {
      status: "active",
    };

    // Counsellor sirf apne assigned students dekhega
    if (roleName === "counsellor") {
      assignmentFilter.counsellor = req.userId;
    }

    const assignments = await CounsellingAssignment.find(assignmentFilter)
      .populate({
        path: "counsellingRequest",
        select: "requestNumber student status admissionLevel academicYear",
        populate: {
          path: "student",
          select: "name email contact",
        },
      })
      .populate("counsellor", "name email")
      .sort({ assignedAt: -1 });

    const data = assignments
      .filter((item) => item.counsellingRequest && item.counsellingRequest.student)
      .map((item) => ({
        assignmentId: item._id,
        counsellingRequestId: item.counsellingRequest._id,
        requestNumber: item.counsellingRequest.requestNumber,

        student: {
          _id: item.counsellingRequest.student._id,
          name: item.counsellingRequest.student.name,
          email: item.counsellingRequest.student.email,
          contact: item.counsellingRequest.student.contact || "",
        },

        counsellor: {
          _id: item.counsellor?._id,
          name: item.counsellor?.name || "",
          email: item.counsellor?.email || "",
        },

        admissionLevel: item.counsellingRequest.admissionLevel,
        academicYear: item.counsellingRequest.academicYear,
        requestStatus: item.counsellingRequest.status,
      }));

    return res.status(200).json({
      success: true,
      message: "Available appointment students fetched successfully",
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Get available appointment students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available appointment students",
      error: error.message,
    });
  }
});






app.post("/create-counselling-session", verifyToken, async (req, res) => {
  try {
    const {
      appointmentId,
      sessionDate,
      startTime = "",
      endTime = "",
      meetingMode,
      meetingLink = "",
      location = "",
      agenda = "",
    } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    if (!mongoose.isValidObjectId(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only counsellor or admin can create sessions",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      role === "counsellor" &&
      String(appointment.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This appointment is not assigned to you",
      });
    }

   if (!["scheduled", "rescheduled"].includes(appointment.status)) {
  return res.status(400).json({
    success: false,
    message: "Only scheduled or rescheduled appointments can have a session created",
  });
}

    const finalSessionDate = sessionDate
      ? new Date(sessionDate)
      : appointment.appointmentDate;

    if (Number.isNaN(finalSessionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid session date",
      });
    }

    const finalMeetingMode = meetingMode || appointment.meetingMode;
    const finalMeetingLink =
      finalMeetingMode === "online"
        ? meetingLink || appointment.meetingLink
        : "";
    const finalLocation =
      finalMeetingMode === "offline"
        ? location || appointment.location
        : "";

    if (!["online", "offline"].includes(finalMeetingMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting mode",
      });
    }

    if (finalMeetingMode === "online" && !finalMeetingLink.trim()) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online session",
      });
    }

    if (finalMeetingMode === "offline" && !finalLocation.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline session",
      });
    }

    const existingSession = await CounsellingSession.findOne({
  appointment: appointment._id,
});

if (existingSession) {
  return res.status(409).json({
    success: false,
    message: "A counselling session already exists for this appointment",
    sessionId: existingSession._id,
    sessionNumber: existingSession.sessionNumber,
  });
}

    const session = await CounsellingSession.create({
      sessionNumber: `CS-${Date.now()}`,
      appointment: appointment._id,
      counsellingRequest: appointment.counsellingRequest,
      student: appointment.student,
      counsellor: appointment.counsellor,
      sessionDate: finalSessionDate,
      startTime,
      endTime,
      meetingMode: finalMeetingMode,
      meetingLink: finalMeetingLink,
      location: finalLocation,
      agenda: agenda || appointment.purpose,
      status: "scheduled",
      createdBy: req.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Counselling session created successfully",
      data: session,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to create counselling session");
  }
});






app.put("/complete-counselling-session/:id", verifyToken, async (req, res) => {
  let createdFollowUp = null;

  try {
    const { id } = req.params;

    const {
      discussion = "",
      outcome = "",
      nextSteps = "",
      recommendations = [],
      nextFollowUpDate = null,
      endTime = "",
    } = req.body;

    // 1. Validate session ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    // 2. Role check
    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to complete this session",
      });
    }

    // 3. Find session
    const session = await CounsellingSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // 4. Counsellor ownership check
    if (
      role === "counsellor" &&
      String(session.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This session is not assigned to you",
      });
    }

    // 5. Session status check
    if (session.status !== "in_progress" || !session.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Only in-progress sessions can be completed",
      });
    }

    // 6. Required fields validation
    if (
      typeof discussion !== "string" ||
      typeof outcome !== "string" ||
      typeof nextSteps !== "string" ||
      !discussion.trim() ||
      !outcome.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid discussion and outcome are required",
      });
    }

    if (!Array.isArray(recommendations)) {
      return res.status(400).json({
        success: false,
        message: "Recommendations must be an array",
      });
    }

    // 7. Validate follow-up date
    const followUpDate = nextFollowUpDate
      ? new Date(nextFollowUpDate)
      : null;

    if (followUpDate && Number.isNaN(followUpDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid next follow-up date",
      });
    }

    if (followUpDate && followUpDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Next follow-up date cannot be in the past",
      });
    }

    // 8. Prepare session completion data
    const completedAt = new Date();

    session.discussion = discussion.trim();
    session.outcome = outcome.trim();
    session.nextSteps = nextSteps.trim();
    session.recommendations = recommendations;
    session.nextFollowUpDate = followUpDate;

    session.status = "completed";
    session.completedAt = completedAt;

    session.durationMinutes = Math.max(
      0,
      Math.round(
        (completedAt.getTime() - session.startedAt.getTime()) / 60000
      )
    );

    session.endTime =
      endTime ||
      completedAt.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    // 9. Automatically create FollowUp
    if (followUpDate) {
      createdFollowUp = await FollowUp.create({
        counsellingRequest: session.counsellingRequest,
        student: session.student,
        assignedTo: session.counsellor,
        createdBy: req.userId,

        title: "Post-session follow-up",

        description: [
          `Session Number: ${session.sessionNumber}`,
          `Outcome: ${outcome.trim()}`,
          `Next Steps: ${nextSteps.trim()}`,
        ].join("\n"),

        dueAt: followUpDate,
        type: "call",
      });
    }

    // 10. Save completed session
    await session.save();

    // 11. Populate FollowUp details
    let followUpData = null;

    if (createdFollowUp) {
      followUpData = await FollowUp.findById(createdFollowUp._id)
        .populate("student", "name email")
        .populate("assignedTo", "name email")
        .populate("counsellingRequest");
    }

    return res.json({
      success: true,
      message: followUpData
        ? "Counselling session completed and follow-up created successfully"
        : "Counselling session completed successfully",

      data: {
        session,
        followUp: followUpData,
      },
    });

  } catch (error) {
    // Rollback newly created FollowUp if session saving fails
    if (createdFollowUp) {
      try {
        await FollowUp.deleteOne({
          _id: createdFollowUp._id,
        });
      } catch (rollbackError) {
        console.error("FollowUp rollback failed:", rollbackError);
      }
    }

    return sendServerError(
      res,
      error,
      "Failed to complete counselling session"
    );
  }
});





app.put("/complete-counselling-session/:id", verifyToken, async (req, res) => {
  try {
    const {
      discussion = "",
      outcome = "",
      nextSteps = "",
      recommendations = [],
      nextFollowUpDate = null,
      endTime = "",
    } = req.body;

    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to complete this session",
      });
    }

    const session = await CounsellingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (
      role === "counsellor" &&
      String(session.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This session is not assigned to you",
      });
    }

    if (session.status !== "in_progress" || !session.startedAt) {
      return res.status(400).json({
        success: false,
        message: "Only in-progress sessions can be completed",
      });
    }

    const completedAt = new Date();

    session.discussion = discussion;
    session.outcome = outcome;
    session.nextSteps = nextSteps;
    session.recommendations = Array.isArray(recommendations)
      ? recommendations
      : [];
    session.nextFollowUpDate = nextFollowUpDate
      ? new Date(nextFollowUpDate)
      : null;

    if (
      session.nextFollowUpDate &&
      Number.isNaN(session.nextFollowUpDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid next follow-up date",
      });
    }

    session.status = "completed";
    session.completedAt = completedAt;
    session.durationMinutes = Math.max(
      0,
      Math.round(
        (completedAt.getTime() - session.startedAt.getTime()) / 60000
      )
    );

    session.endTime =
      endTime ||
      completedAt.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

    await session.save();

    // Appointment ko yahan completed nahi karna hai.
    // Future follow-up sessions isi appointment ke andar ban sakte hain.

    return res.json({
      success: true,
      message: "Counselling session completed successfully",
      data: session,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to complete counselling session");
  }
});



app.get("/get-counselling-sessions", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    const filter = {};

    if (role === "student") {
      filter.student = req.userId;
    } else if (role === "counsellor") {
      filter.counsellor = req.userId;
    } else if (!isAdminRole(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view sessions",
      });
    }

    if (req.query.appointmentId) {
      if (!mongoose.isValidObjectId(req.query.appointmentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment ID",
        });
      }
      filter.appointment = req.query.appointmentId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const sessions = await CounsellingSession.find(filter)
      .populate("appointment", "appointmentNumber appointmentDate appointmentTime status")
      .populate("counsellingRequest", "requestNumber status")
      .populate("student", "name email contact")
      .populate("counsellor", "name email")
      .populate("createdBy", "name email")
      .sort({ sessionDate: 1, startTime: 1, createdAt: -1 });

    return res.json({
      success: true,
      message: "Counselling sessions fetched successfully",
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch counselling sessions");
  }
});


app.put("/reschedule-counselling-session/:id", verifyToken, async (req, res) => {
  try {
    const { sessionDate, startTime = "", reason = "" } = req.body;

    if (!sessionDate) {
      return res.status(400).json({
        success: false,
        message: "New session date is required",
      });
    }

    const parsedDate = new Date(sessionDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid session date",
      });
    }

    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reschedule sessions",
      });
    }

    const session = await CounsellingSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (
      role === "counsellor" &&
      String(session.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This session is not assigned to you",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Only scheduled sessions can be rescheduled",
      });
    }

    session.rescheduleHistory.push({
      oldSessionDate: session.sessionDate,
      oldStartTime: session.startTime,
      rescheduledBy: req.userId,
      reason,
    });

    session.sessionDate = parsedDate;
    session.startTime = startTime;

    await session.save();

    return res.json({
      success: true,
      message: "Session rescheduled successfully",
      data: session,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to reschedule session");
  }
});




app.post("/student/session-feedback/:sessionId", verifyToken, async (req, res) => {
  try {
    const { rating, feedback, comment = "" } = req.body;

    const user = await getLoggedInUser(req.userId);

    if (getRoleName(user) !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can submit session feedback",
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const session = await CounsellingSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (String(session.student) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: "You can submit feedback only for your own session",
      });
    }

    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted for completed sessions",
      });
    }

    const existingFeedback = await SessionFeedback.findOne({
      session: session._id,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already submitted for this session",
      });
    }

    const newFeedback = await SessionFeedback.create({
      session: session._id,
      student: req.userId,
      counsellor: session.counsellor,
      rating,
      feedback: feedback || comment,
    });

    return res.status(201).json({
      success: true,
      message: "Session feedback submitted successfully",
      data: newFeedback,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to submit session feedback");
  }
});


app.get("/admin/all-session-feedbacks", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = getRoleName(user);

    if (!["admin", "superadmin"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin and SuperAdmin can access all feedbacks",
      });
    }

    const feedbacks = await SessionFeedback.find()
      .populate("session", "sessionNumber sessionDate status outcome")
      .populate("student", "name email")
      .populate("counsellor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All session feedbacks fetched successfully",
      total: feedbacks.length,
      data: feedbacks,
    });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to fetch all session feedbacks"
    );
  }
});



app.get("/counsellor/my-session-feedbacks", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (getRoleName(user) !== "counsellor") {
      return res.status(403).json({
        success: false,
        message: "Only counsellors can access their feedbacks",
      });
    }

    const feedbacks = await SessionFeedback.find({
      counsellor: req.userId,
    })
      .populate("session", "sessionNumber sessionDate status outcome")
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Counsellor feedbacks fetched successfully",
      total: feedbacks.length,
      data: feedbacks,
    });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to fetch counsellor feedbacks"
    );
  }
});


app.get("/counsellor/my-feedback-summary", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (getRoleName(user) !== "counsellor") {
      return res.status(403).json({
        success: false,
        message: "Only counsellors can view their feedback summary",
      });
    }

    // 1. Aggregate feedback data
    const summary = await SessionFeedback.aggregate([
      {
        $match: {
          counsellor: new mongoose.Types.ObjectId(
            req.userId.toString()
          ),
        },
      },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$rating" },

          fiveStars: {
            $sum: {
              $cond: [{ $eq: ["$rating", 5] }, 1, 0],
            },
          },

          fourStars: {
            $sum: {
              $cond: [{ $eq: ["$rating", 4] }, 1, 0],
            },
          },

          threeStars: {
            $sum: {
              $cond: [{ $eq: ["$rating", 3] }, 1, 0],
            },
          },

          twoStars: {
            $sum: {
              $cond: [{ $eq: ["$rating", 2] }, 1, 0],
            },
          },

          oneStar: {
            $sum: {
              $cond: [{ $eq: ["$rating", 1] }, 1, 0],
            },
          },
        },
      },
    ]);

    // 2. Default values when no feedback exists
    const result = summary.length > 0
      ? summary[0]
      : {
          totalFeedbacks: 0,
          averageRating: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        };

    // Remove MongoDB grouping ID
    delete result._id;

    // 3. Round average rating to 2 decimal places
    result.averageRating = Number(
      result.averageRating.toFixed(2)
    );

    return res.status(200).json({
      success: true,
      message: "Counsellor feedback summary fetched successfully",
      data: result,
    });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Failed to fetch counsellor feedback summary"
    );
  }
});





app.get("/student/my-session-feedbacks", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);

    if (getRoleName(user) !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access this route",
      });
    }

    const feedbacks = await SessionFeedback.find({
      student: req.userId,
    })
      .populate("session", "sessionNumber sessionDate status outcome")
      .populate("counsellor", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      message: "Student session feedbacks fetched successfully",
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch session feedbacks");
  }
});



app.put("/complete-appointment/:id", verifyToken, async (req, res) => {
  try {
    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only counsellor or admin can complete an appointment",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      role === "counsellor" &&
      String(appointment.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This appointment is not assigned to you",
      });
    }

    const sessions = await CounsellingSession.find({
      appointment: appointment._id,
    });

    if (sessions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Create at least one session before completing appointment",
      });
    }

    const unfinishedSession = sessions.some((session) =>
      ["scheduled", "in_progress"].includes(session.status)
    );

    if (unfinishedSession) {
      return res.status(400).json({
        success: false,
        message: "Complete or cancel all remaining sessions first",
      });
    }

    appointment.status = "completed";
    await appointment.save();

    return res.json({
      success: true,
      message: "Appointment completed successfully",
      data: appointment,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to complete appointment");
  }
});




app.post("/create-follow-up", verifyToken, async (req, res) => {
  try {
    const {
      counsellingRequest,
      title,
      description,
      dueAt,
      type,
    } = req.body;

    // Required fields validation
    if (!counsellingRequest || !title || !dueAt) {
      return res.status(400).json({
        success: false,
        message: "Counselling request, title and due date are required",
      });
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(counsellingRequest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid counselling request ID",
      });
    }

    // Validate due date
    const followUpDate = new Date(dueAt);

    if (isNaN(followUpDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up date",
      });
    }

    // Get logged-in user
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin", "counsellor"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create follow-ups",
      });
    }

    // Find counselling request
    const request = await CounsellingRequest.findById(
      counsellingRequest
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Counselling request not found",
      });
    }

    // Find active counsellor assignment
    const assignment = await CounsellingAssignment.findOne({
      counsellingRequest: request._id,
      status: "active",
    }).sort({ assignedAt: -1 });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "No active counsellor assigned to this request",
      });
    }

    // Counsellor can create follow-up only for own assignment
    if (
      roleName === "counsellor" &&
      assignment.counsellor.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can create follow-ups only for your assigned requests",
      });
    }

    // Validate follow-up type
    const allowedTypes = [
      "call",
      "email",
      "document",
      "appointment",
      "other",
    ];

    const followUpType = type || "call";

    if (!allowedTypes.includes(followUpType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up type",
      });
    }

    // Create follow-up
    const followUp = await FollowUp.create({
      counsellingRequest: request._id,
      student: request.student,
      assignedTo: assignment.counsellor,
      createdBy: req.userId,
      title: title.trim(),
      description: description || "",
      dueAt: followUpDate,
      type: followUpType,
    });

    const populatedFollowUp = await FollowUp.findById(
      followUp._id
    )
      .populate("counsellingRequest", "requestNumber status")
      .populate("student", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      data: populatedFollowUp,
    });

  } catch (error) {
    console.error("Create Follow-up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create follow-up",
      error: error.message,
    });
  }
});



app.put("/update-overdue-follow-ups", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user find karo
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Role check
    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    // Only Admin and SuperAdmin
    if (!["admin", "superadmin"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message:
          "Only Admin and SuperAdmin can update overdue follow-ups",
      });
    }

    // 3. Pending follow-ups whose due date has passed
    // Completed records ko overdue nahi karna
    const result = await FollowUp.updateMany(
      {
        status: "pending",
        dueAt: { $lt: new Date() },
        completedAt: { $exists: false },
      },
      {
        $set: {
          status: "overdue",
        },
      }
    );

    // 4. Response
    return res.status(200).json({
      success: true,
      message: "Overdue follow-ups updated successfully",
      totalUpdated: result.modifiedCount,
    });

  } catch (error) {
    console.error("Update overdue follow-ups error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating overdue follow-ups",
      error: error.message,
    });
  }
});



app.get("/get-follow-ups", verifyToken, async (req, res) => {
  try {
    // Get logged-in user
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    // Role-based filter
    let filter = {};

    if (roleName === "admin" || roleName === "superadmin") {
      // Admin and SuperAdmin can see all follow-ups
      filter = {};
    } else if (roleName === "counsellor") {
      // Counsellor can see only assigned follow-ups
      filter = {
        assignedTo: req.userId,
      };
    } else if (roleName === "student") {
      // Student can see only own follow-ups
      filter = {
        student: req.userId,
      };
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view follow-ups",
      });
    }

    // Fetch follow-ups
    const followUps = await FollowUp.find(filter)
      .populate("counsellingRequest", "requestNumber status")
      .populate("student", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ dueAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Follow-ups fetched successfully",
      total: followUps.length,
      data: followUps,
    });

  } catch (error) {
    console.error("Get Follow-ups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch follow-ups",
      error: error.message,
    });
  }
});



app.put("/update-follow-up/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueAt, type } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID",
      });
    }

    // Get logged-in user
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin", "counsellor"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update follow-ups",
      });
    }

    // Find follow-up
    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    // Counsellor can update only assigned follow-ups
    if (
      roleName === "counsellor" &&
      followUp.assignedTo.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your assigned follow-ups",
      });
    }

    // Only pending follow-ups can be updated
    if (followUp.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending follow-ups can be updated",
      });
    }

    // Update title
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }

      followUp.title = title.trim();
    }

    // Update description
    if (description !== undefined) {
      followUp.description = description;
    }

    // Update due date
    if (dueAt !== undefined) {
      const newDueAt = new Date(dueAt);

      if (isNaN(newDueAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date",
        });
      }

      followUp.dueAt = newDueAt;
    }

    // Update type
    if (type !== undefined) {
      const allowedTypes = [
        "call",
        "email",
        "document",
        "appointment",
        "other",
      ];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid follow-up type",
        });
      }

      followUp.type = type;
    }

    await followUp.save();

    const updatedFollowUp = await FollowUp.findById(id)
      .populate("counsellingRequest", "requestNumber status")
      .populate("student", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      data: updatedFollowUp,
    });

  } catch (error) {
    console.error("Update Follow-up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update follow-up",
      error: error.message,
    });
  }
});




app.put("/complete-follow-up/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome } = req.body;

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid follow-up ID",
      });
    }

    // 2. Find logged-in user
    const user = await User1.findById(req.userId).populate("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Role check
    const roleName = user.role?.roleName
      ?.toLowerCase()
      .replace(/[\s_-]/g, "");

    if (!["admin", "superadmin", "counsellor"].includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to complete follow-ups",
      });
    }

    // 4. Find follow-up
    const followUp = await FollowUp.findById(id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    // 5. Counsellor ownership check
    if (
      roleName === "counsellor" &&
      followUp.assignedTo.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can complete only your assigned follow-ups",
      });
    }

    // 6. Allow pending and overdue follow-ups
    if (!["pending", "overdue"].includes(followUp.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or overdue follow-ups can be completed",
      });
    }

    // 7. Complete follow-up
    followUp.status = "completed";
    followUp.completedAt = new Date();
    followUp.outcome = outcome || "";

    await followUp.save();

    // 8. Populate response
    const completedFollowUp = await FollowUp.findById(id)
      .populate("counsellingRequest", "requestNumber status")
      .populate("student", "name email")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Follow-up completed successfully",
      data: completedFollowUp,
    });

  } catch (error) {
    console.error("Complete Follow-up Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to complete follow-up",
      error: error.message,
    });
  }
});


app.put("/start-counselling-session/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const user = await getLoggedInUser(req.userId);
    const role = getRoleName(user);

    if (!["admin", "superadmin", "counsellor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to start this session",
      });
    }

    const session = await CounsellingSession.findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Counselling session not found",
      });
    }

    if (
      role === "counsellor" &&
      String(session.counsellor) !== String(req.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "This session is not assigned to you",
      });
    }

    if (session.status !== "scheduled") {
      return res.status(400).json({
        success: false,
        message: `Cannot start session. Current status is ${session.status}`,
      });
    }

    session.status = "in_progress";
    session.startedAt = new Date();

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Counselling session started successfully",
      data: session,
    });

  } catch (error) {
    return sendServerError(res, error, "Failed to start counselling session");
  }
});


app.post("/student/request-reschedule/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      requestedAppointmentDate,
      requestedAppointmentTime,
      requestedMeetingMode,
      requestedMeetingLink = "",
      requestedLocation = "",
      reason = "",
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    if (
      !requestedAppointmentDate ||
      !requestedAppointmentTime ||
      !requestedMeetingMode
    ) {
      return res.status(400).json({
        success: false,
        message: "Date, time and meeting mode are required",
      });
    }

    if (!["online", "offline"].includes(requestedMeetingMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting mode",
      });
    }

    if (
      requestedMeetingMode === "online" &&
      !requestedMeetingLink.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Meeting link is required for online meeting",
      });
    }

    if (
      requestedMeetingMode === "offline" &&
      !requestedLocation.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required for offline meeting",
      });
    }

    const user = await getLoggedInUser(req.userId);
    const roleName = getRoleName(user);

    if (roleName !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can request rescheduling",
      });
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      appointment.student.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot reschedule another student's appointment",
      });
    }

    if (!["pending", "scheduled", "rescheduled"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be rescheduled",
      });
    }

    const existingPendingRequest = appointment.rescheduleRequests.find(
      (request) => request.status === "pending"
    );

    if (existingPendingRequest) {
      return res.status(400).json({
        success: false,
        message: "A reschedule request is already pending",
      });
    }

    const newDate = new Date(requestedAppointmentDate);

    if (Number.isNaN(newDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

  
appointment.rescheduleRequests.push({
  // Original appointment details
  originalAppointment: {
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    meetingMode: appointment.meetingMode,
    meetingLink: appointment.meetingLink,
    location: appointment.location,
  },

  // Requested new appointment details
  requestedAppointmentDate: newDate,
  requestedAppointmentTime: requestedAppointmentTime.trim(),
  requestedMeetingMode,

  requestedMeetingLink:
    requestedMeetingMode === "online"
      ? requestedMeetingLink.trim()
      : "",

  requestedLocation:
    requestedMeetingMode === "offline"
      ? requestedLocation.trim()
      : "",

  reason: reason.trim(),
  requestedBy: req.userId,
  status: "pending",
});


    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate("student", "name email")
      .populate("counsellor", "name email");

    return res.status(201).json({
      success: true,
      message: "Reschedule request submitted successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error("Request reschedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


app.put("/counsellor/review-reschedule/:appointmentId/:requestId",
  verifyToken,
  async (req, res) => {
    try {
      const { appointmentId, requestId } = req.params;
      const { action, reviewNote = "" } = req.body;

      // 1. Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(appointmentId) ||
        !mongoose.Types.ObjectId.isValid(requestId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment or request ID",
        });
      }

      // 2. Validate action
      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Action must be approve or reject",
        });
      }

      // 3. Get logged-in user
      const user = await getLoggedInUser(req.userId);
      const roleName = getRoleName(user);

      if (!["counsellor", "admin", "superadmin"].includes(roleName)) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to review reschedule requests",
        });
      }

      // 4. Find appointment
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      // 5. Counsellor ownership check
      if (
        roleName === "counsellor" &&
        appointment.counsellor.toString() !== req.userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only review your own appointments",
        });
      }

      // 6. Find reschedule request
      const rescheduleRequest = appointment.rescheduleRequests.id(requestId);

      if (!rescheduleRequest) {
        return res.status(404).json({
          success: false,
          message: "Reschedule request not found",
        });
      }

      if (rescheduleRequest.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "This reschedule request has already been reviewed",
        });
      }

      if (!["pending", "scheduled", "rescheduled"].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: "This appointment cannot be rescheduled",
        });
      }

      // 7. Approve request
      if (action === "approve") {
        // Save old appointment details in history
        appointment.rescheduleHistory.push({
          oldAppointmentDate: appointment.appointmentDate,
          oldAppointmentTime: appointment.appointmentTime,
          oldMeetingMode: appointment.meetingMode,
          oldMeetingLink: appointment.meetingLink,
          oldLocation: appointment.location,
          rescheduledAt: new Date(),
          rescheduledBy: req.userId,
        });

        // Update appointment with requested details
        appointment.appointmentDate =
          rescheduleRequest.requestedAppointmentDate;

        appointment.appointmentTime =
          rescheduleRequest.requestedAppointmentTime;

        appointment.meetingMode =
          rescheduleRequest.requestedMeetingMode;

        appointment.meetingLink =
          rescheduleRequest.requestedMeetingLink;

        appointment.location =
          rescheduleRequest.requestedLocation;

        appointment.status = "rescheduled";

        rescheduleRequest.status = "approved";
      } else {
        // Reject request
        rescheduleRequest.status = "rejected";
      }

      // 8. Save review details
      rescheduleRequest.reviewedBy = req.userId;
      rescheduleRequest.reviewedAt = new Date();
      rescheduleRequest.reviewNote = reviewNote.trim();

      await appointment.save();

      const updatedAppointment = await Appointment.findById(appointmentId)
        .populate("student", "name email")
        .populate("counsellor", "name email");

      return res.status(200).json({
        success: true,
        message:
          action === "approve"
            ? "Reschedule request approved successfully"
            : "Reschedule request rejected successfully",
        data: updatedAppointment,
      });
    } catch (error) {
      console.error("Review reschedule error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);


app.get("/student/my-reschedule-requests", verifyToken, async (req, res) => {
  try {
    // 1. Logged-in user
    const user = await getLoggedInUser(req.userId);
    const roleName = getRoleName(user);

    // 2. Student-only access
    if (roleName !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access their reschedule requests",
      });
    }

    // 3. Find student's appointments having reschedule requests
    const appointments = await Appointment.find({
      student: req.userId,
      "rescheduleRequests.0": { $exists: true },
    })
      .populate("counsellor", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    // 4. Extract all reschedule requests
    const rescheduleRequests = [];

    appointments.forEach((appointment) => {
      appointment.rescheduleRequests.forEach((request) => {
        rescheduleRequests.push({
          requestId: request._id,
          appointmentId: appointment._id,
          appointmentNumber: appointment.appointmentNumber,

          counsellor: appointment.counsellor,

          oldAppointment: {
            appointmentDate:
              appointment.rescheduleHistory.find(
                (history) =>
                  history.rescheduledAt >= request.requestedAt &&
                  history.rescheduledBy?.toString() ===
                    request.reviewedBy?.toString()
              )?.oldAppointmentDate || null,
            appointmentTime:
              appointment.rescheduleHistory.find(
                (history) =>
                  history.rescheduledAt >= request.requestedAt &&
                  history.rescheduledBy?.toString() ===
                    request.reviewedBy?.toString()
              )?.oldAppointmentTime || null,
          },

          requestedAppointment: {
            date: request.requestedAppointmentDate,
            time: request.requestedAppointmentTime,
            meetingMode: request.requestedMeetingMode,
            meetingLink: request.requestedMeetingLink,
            location: request.requestedLocation,
          },

          reason: request.reason,
          status: request.status,
          requestedAt: request.requestedAt,
          reviewedBy: request.reviewedBy,
          reviewedAt: request.reviewedAt,
          reviewNote: request.reviewNote,
        });
      });
    });

    // 5. Latest requests first
    rescheduleRequests.sort(
      (a, b) =>
        new Date(b.requestedAt) - new Date(a.requestedAt)
    );

    return res.status(200).json({
      success: true,
      message: "Student reschedule requests fetched successfully",
      totalRequests: rescheduleRequests.length,
      data: rescheduleRequests,
    });
  } catch (error) {
    console.error("My reschedule requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});


app.get("/counsellor/pending-reschedule-requests",
  verifyToken,
  async (req, res) => {
    try {
      // 1. Logged-in user
      const user = await getLoggedInUser(req.userId);
      const roleName = getRoleName(user);

      // 2. Counsellor-only access
      if (roleName !== "counsellor") {
        return res.status(403).json({
          success: false,
          message: "Only counsellors can access pending reschedule requests",
        });
      }

      // 3. Find counsellor's appointments with pending requests
      const appointments = await Appointment.find({
        counsellor: req.userId,
        "rescheduleRequests.status": "pending",
      })
        .populate("student", "name email")
        .populate("counsellor", "name email")
        .sort({ updatedAt: -1 })
        .lean();

      // 4. Extract pending requests only
      const pendingRequests = [];

      appointments.forEach((appointment) => {
        appointment.rescheduleRequests.forEach((request) => {
          if (request.status === "pending") {
            pendingRequests.push({
              requestId: request._id,

              appointmentId: appointment._id,
              appointmentNumber: appointment.appointmentNumber,

              student: appointment.student,
              counsellor: appointment.counsellor,

              originalAppointment: request.originalAppointment,

              requestedAppointment: {
                date: request.requestedAppointmentDate,
                time: request.requestedAppointmentTime,
                meetingMode: request.requestedMeetingMode,
                meetingLink: request.requestedMeetingLink,
                location: request.requestedLocation,
              },

              reason: request.reason,
              status: request.status,
              requestedAt: request.requestedAt,
            });
          }
        });
      });

      // 5. Latest requests first
      pendingRequests.sort(
        (a, b) =>
          new Date(b.requestedAt) - new Date(a.requestedAt)
      );

      return res.status(200).json({
        success: true,
        message: "Pending reschedule requests fetched successfully",
        totalRequests: pendingRequests.length,
        data: pendingRequests,
      });
    } catch (error) {
      console.error("Pending reschedule requests error:", error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);






//server
app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
