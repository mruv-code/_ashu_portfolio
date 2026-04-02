import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose, { Schema, model, Document } from "mongoose";
import { API_URL } from "./config.js";

dotenv.config();

// ─────────────────────────────────────────────
// MongoDB Connection
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ─────────────────────────────────────────────
// Cloudinary Configuration
// ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─────────────────────────────────────────────
// MongoDB Schemas & Models
// ─────────────────────────────────────────────

// Admin credentials (single document)
interface IAdmin extends Document {
  email: string;
  passwordHash: string;
}
const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
});
const Admin = model<IAdmin>("Admin", AdminSchema);

// OTP store with TTL auto-expiry (MongoDB deletes expired docs automatically)
interface IOtp extends Document {
  email: string;
  otp: string;
  type: "login" | "forgot" | "change";
  attempts: number;
  lastSentAt: Date;
  expiresAt: Date;
  // For pending admin changes
  newEmail?: string;
  newPasswordHash?: string;
}
const OtpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["login", "forgot", "change"], required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  newEmail: String,
  newPasswordHash: String,
});
// TTL index: MongoDB automatically removes documents after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const Otp = model<IOtp>("Otp", OtpSchema);

// Website data (single document)
interface IWebsiteData extends Document {
  videos: any[];
  categories: any[];
  blogs: any[];
  inquiries: any[];
  pageContent: any;
  contactInfo: any;
  siteSettings: any;
}
const WebsiteDataSchema = new Schema<IWebsiteData>({
  videos: { type: [Schema.Types.Mixed], default: [] } as any,
  categories: { type: [Schema.Types.Mixed], default: [] } as any,
  blogs: { type: [Schema.Types.Mixed], default: [] } as any,
  inquiries: { type: [Schema.Types.Mixed], default: [] } as any,

  pageContent: { type: Schema.Types.Mixed, default: {} },
  contactInfo: { type: Schema.Types.Mixed, default: {} },
  siteSettings: { type: Schema.Types.Mixed, default: {} },
});
const WebsiteData = model<IWebsiteData>("WebsiteData", WebsiteDataSchema);

// Calendar availability (single document)
interface ICalendar extends Document {
  availability: Record<string, "available" | "unavailable">;
}
const CalendarSchema = new Schema<ICalendar>({
  availability: { type: Schema.Types.Mixed, default: {} },
});
const Calendar = model<ICalendar>("Calendar", CalendarSchema);

// ─────────────────────────────────────────────
// Helper: Get or create singleton document
// ─────────────────────────────────────────────
async function getOrCreateWebsiteData(): Promise<IWebsiteData> {
  let doc = await WebsiteData.findOne();
  if (!doc) {
    doc = await WebsiteData.create({
      videos: [],
      categories: [],
      blogs: [],
      inquiries: [],
      pageContent: {},
      contactInfo: {},
      siteSettings: {},
    });
  }
  return doc;
}

async function getOrCreateCalendar(): Promise<ICalendar> {
  let doc = await Calendar.findOne();
  if (!doc) doc = await Calendar.create({ availability: {} });
  return doc;
}

async function getOrCreateAdmin(): Promise<IAdmin> {
  let doc = await Admin.findOne();
  if (!doc) {
    doc = await Admin.create({
      email: process.env.ADMIN_EMAIL as string,
      passwordHash: await bcrypt.hash(
        process.env.ADMIN_PASSWORD || "password123",
        10,
      ),
    });
  }
  return doc;
}

// ─────────────────────────────────────────────
// Cloudinary Multer Storage
// ─────────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: any, file: any) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "bandhan-films",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "mp4",
        "webm",
        "ogg",
        "mov",
      ],
      public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  },
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/mpeg",
      "video/quicktime",
    ];
    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

// ─────────────────────────────────────────────
// App Setup
// ─────────────────────────────────────────────
const app = express();
const PORT = Number(process.env.PORT) || 3001;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many failed login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "https://bandhanfilms-in.vercel.app",
        "https://ashu-portfolio-frontend.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://localhost:5173",
        "https://localhost:3000",
      ];
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "Expires",
      "If-Modified-Since",
    ],
    credentials: true,
    maxAge: 86400,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ─────────────────────────────────────────────
// Input validation helpers
// ─────────────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidOtp = (otp: string) => /^\d{6}$/.test(otp);
const isValidPassword = (password: string) =>
  !!password && password.length >= 8;

// ─────────────────────────────────────────────
// Nodemailer
// ─────────────────────────────────────────────
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: isNaN(smtpPort) ? 587 : smtpPort,
  secure: smtpPort === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const emailTemplate = (title: string, body: string, otp: string) => `
  <div style="font-family:serif;background:#000;color:#fff;padding:40px;text-align:center;border:1px solid #d4af37;">
    <h1 style="color:#d4af37;font-size:24px;margin-bottom:20px;">${title}</h1>
    <p style="font-size:16px;margin-bottom:30px;">${body}</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:10px;color:#fff;background:#111;padding:20px;border-radius:8px;display:inline-block;">${otp}</div>
    <p style="font-size:14px;margin-top:30px;color:#666;">This code will expire in 5 minutes.</p>
  </div>
`;

// ─────────────────────────────────────────────
// No-cache middleware
// ─────────────────────────────────────────────
const noCacheHeaders = (req: any, res: any, next: any) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
};
app.use(`${API_URL}/api/`, noCacheHeaders);

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// LOGIN — step 1: verify credentials, send OTP
app.post(`${API_URL}/api/auth/login`, loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !isValidEmail(email))
    return res.status(400).json({ message: "Invalid email or password" });

  const admin = await getOrCreateAdmin();
  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (email !== admin.email || !isPasswordValid)
    return res.status(401).json({ message: "Invalid email or password" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email, type: "login" },
    { otp, expiresAt, attempts: 0, lastSentAt: new Date() },
    { upsert: true, new: true },
  );

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Admin OTP Verification Code",
      html: emailTemplate(
        "BANDHAN FILMS",
        "Your 6-digit verification code is:",
        otp,
      ),
    });
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: "Failed to send OTP.",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// LOGIN — step 2: verify OTP
app.post(`${API_URL}/api/auth/verify-otp`, async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || !isValidEmail(email) || !isValidOtp(otp))
    return res
      .status(400)
      .json({ message: "Invalid email or verification code" });

  const stored = await Otp.findOne({ email, type: "login" });
  if (!stored)
    return res.status(400).json({ message: "No OTP found for this email" });
  if (new Date() > stored.expiresAt) {
    await stored.deleteOne();
    return res.status(400).json({ message: "OTP has expired" });
  }
  if (stored.attempts >= 5) {
    await stored.deleteOne();
    return res
      .status(400)
      .json({ message: "Too many failed attempts. Please login again." });
  }
  if (stored.otp !== otp) {
    stored.attempts += 1;
    await stored.save();
    return res.status(400).json({ message: "Invalid OTP" });
  }

  await stored.deleteOne();
  res.json({ message: "Login successful", token: "dummy-jwt-token" });
});

// RESEND OTP
app.post(`${API_URL}/api/auth/resend-otp`, async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email))
    return res.status(400).json({ message: "Invalid email address" });

  const stored = await Otp.findOne({ email, type: "login" });
  if (!stored) return res.status(400).json({ message: "Please login first" });

  const cooldown = 30 * 1000;
  if (Date.now() - stored.lastSentAt.getTime() < cooldown) {
    const remaining = Math.ceil(
      (cooldown - (Date.now() - stored.lastSentAt.getTime())) / 1000,
    );
    return res
      .status(400)
      .json({ message: `Please wait ${remaining} seconds before resending.` });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  stored.otp = otp;
  stored.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  stored.lastSentAt = new Date();
  stored.attempts = 0;
  await stored.save();

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your New Admin OTP Verification Code",
      html: emailTemplate(
        "BANDHAN FILMS",
        "Your new 6-digit verification code is:",
        otp,
      ),
    });
    res.json({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to resend OTP",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// FORGOT PASSWORD — step 1: send OTP
app.post(`${API_URL}/api/auth/forgot-password`, async (req, res) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email))
    return res.status(400).json({ message: "Invalid email address" });

  const admin = await getOrCreateAdmin();
  if (email !== admin.email)
    return res.json({
      message:
        "If this email is registered, a verification code has been sent.",
    });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Otp.findOneAndUpdate(
    { email, type: "forgot" },
    { otp, expiresAt, attempts: 0, lastSentAt: new Date() },
    { upsert: true, new: true },
  );

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Password Reset Verification Code",
      html: emailTemplate(
        "BANDHAN FILMS",
        "You requested a password reset. Your code is:",
        otp,
      ),
    });
    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send verification code",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// FORGOT PASSWORD — step 2: reset password
app.post(`${API_URL}/api/auth/reset-password`, async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (
    !email ||
    !otp ||
    !newPassword ||
    !isValidEmail(email) ||
    !isValidOtp(otp) ||
    !isValidPassword(newPassword)
  )
    return res.status(400).json({
      message: "Invalid input. Password must be at least 8 characters.",
    });

  const stored = await Otp.findOne({ email, type: "forgot" });
  if (!stored)
    return res.status(400).json({ message: "No reset request found" });
  if (new Date() > stored.expiresAt) {
    await stored.deleteOne();
    return res.status(400).json({ message: "Verification code expired" });
  }
  if (stored.otp !== otp) {
    stored.attempts += 1;
    if (stored.attempts >= 5) {
      await stored.deleteOne();
      return res.status(400).json({ message: "Too many failed attempts" });
    }
    await stored.save();
    return res.status(400).json({ message: "Invalid verification code" });
  }

  const admin = await getOrCreateAdmin();
  admin.passwordHash = await bcrypt.hash(newPassword, 10);
  await admin.save();
  await stored.deleteOne();

  res.json({ message: "Password reset successfully. You can now login." });
});

// ─────────────────────────────────────────────
// ADMIN SETTINGS CHANGE ROUTES
// ─────────────────────────────────────────────

app.post(`${API_URL}/api/admin/request-change`, async (req, res) => {
  const { oldEmail, oldPassword, newEmail, newPassword } = req.body;
  if (!oldEmail || !oldPassword || !isValidEmail(oldEmail))
    return res
      .status(400)
      .json({ message: "Invalid current email or password" });
  if (newEmail && !isValidEmail(newEmail))
    return res.status(400).json({ message: "Invalid new email address" });
  if (newPassword && !isValidPassword(newPassword))
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters" });

  const admin = await getOrCreateAdmin();
  const isPasswordValid = await bcrypt.compare(oldPassword, admin.passwordHash);
  if (oldEmail !== admin.email || !isPasswordValid)
    return res
      .status(401)
      .json({ message: "Invalid current email or password" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const newPasswordHash = newPassword
    ? await bcrypt.hash(newPassword, 10)
    : admin.passwordHash;

  await Otp.findOneAndUpdate(
    { email: oldEmail, type: "change" },
    {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date(),
      newEmail: newEmail || admin.email,
      newPasswordHash,
    },
    { upsert: true, new: true },
  );

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: admin.email,
      subject: "Security Verification: Admin Settings Change",
      html: emailTemplate(
        "BANDHAN FILMS",
        "A change to your admin settings was requested. Verify with this code:",
        otp,
      ),
    });
    res.json({ message: "Verification code sent to current admin email" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send verification code",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post(`${API_URL}/api/admin/verify-change`, async (req, res) => {
  const { currentEmail, otp } = req.body;
  if (!currentEmail || !otp || !isValidEmail(currentEmail) || !isValidOtp(otp))
    return res
      .status(400)
      .json({ message: "Invalid email or verification code" });

  const pending = await Otp.findOne({ email: currentEmail, type: "change" });
  if (!pending)
    return res.status(400).json({ message: "No pending changes found" });
  if (new Date() > pending.expiresAt) {
    await pending.deleteOne();
    return res.status(400).json({ message: "Verification code expired" });
  }
  if (pending.attempts >= 5) {
    await pending.deleteOne();
    return res.status(400).json({ message: "Too many failed attempts" });
  }
  if (pending.otp !== otp) {
    pending.attempts += 1;
    await pending.save();
    return res.status(400).json({ message: "Invalid verification code" });
  }

  const admin = await getOrCreateAdmin();
  admin.email = pending.newEmail as string;
  admin.passwordHash = pending.newPasswordHash as string;
  await admin.save();
  await pending.deleteOne();

  res.json({
    message: "Settings updated successfully",
    updatedAdmin: { email: admin.email },
  });
});

// ─────────────────────────────────────────────
// CALENDAR ROUTES
// ─────────────────────────────────────────────

app.get(`${API_URL}/api/calendar`, async (req, res) => {
  const cal = await getOrCreateCalendar();
  res.json(cal.availability);
});

app.post(`${API_URL}/api/calendar`, async (req, res) => {
  const { availability } = req.body;
  if (!availability || typeof availability !== "object")
    return res.status(400).json({ message: "Invalid availability data" });

  const cal = await getOrCreateCalendar();
  cal.availability = availability;
  await cal.save();
  res.json({
    message: "Calendar updated successfully",
    availability: cal.availability,
  });
});

// ─────────────────────────────────────────────
// WEBSITE DATA ROUTES
// ─────────────────────────────────────────────

app.get(`${API_URL}/api/website-data`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data);
});

app.post(`${API_URL}/api/website-data`, async (req, res) => {
  const {
    videos,
    categories,
    inquiries,
    pageContent,
    contactInfo,
    siteSettings,
    blogs,
  } = req.body;
  const data = await getOrCreateWebsiteData();

  if (videos !== undefined) data.videos = videos;
  if (categories !== undefined) data.categories = categories;
  if (inquiries !== undefined) data.inquiries = inquiries;
  if (pageContent !== undefined) data.pageContent = pageContent;
  if (contactInfo !== undefined) data.contactInfo = contactInfo;
  if (siteSettings !== undefined) data.siteSettings = siteSettings;
  if (blogs !== undefined) data.blogs = blogs;

  await data.save();
  res.json({ message: "Website data updated successfully", data });
});

// Individual endpoints
app.get(`${API_URL}/api/videos`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.videos);
});
app.post(`${API_URL}/api/videos`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.videos = req.body;
  await data.save();
  res.json({ message: "Videos updated", videos: data.videos });
});

app.get(`${API_URL}/api/categories`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.categories);
});
app.post(`${API_URL}/api/categories`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.categories = req.body;
  await data.save();
  res.json({ message: "Categories updated", categories: data.categories });
});

app.get(`${API_URL}/api/inquiries`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.inquiries);
});
app.post(`${API_URL}/api/inquiries`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.inquiries = req.body;
  await data.save();
  res.json({ message: "Inquiries updated", inquiries: data.inquiries });
});

app.get(`${API_URL}/api/blogs`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.blogs || []);
});
app.post(`${API_URL}/api/blogs`, async (req, res) => {
  if (!Array.isArray(req.body))
    return res
      .status(400)
      .json({ message: "Invalid blogs payload, expected array" });
  const data = await getOrCreateWebsiteData();
  data.blogs = req.body;
  await data.save();
  res.json({ message: "Blogs updated", blogs: data.blogs });
});

app.get(`${API_URL}/api/page-content`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.pageContent);
});
app.post(`${API_URL}/api/page-content`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.pageContent = req.body;
  await data.save();
  res.json({ message: "Page content updated", pageContent: data.pageContent });
});

app.get(`${API_URL}/api/contact-info`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.contactInfo);
});
app.post(`${API_URL}/api/contact-info`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.contactInfo = req.body;
  await data.save();
  res.json({ message: "Contact info updated", contactInfo: data.contactInfo });
});

app.get(`${API_URL}/api/site-settings`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  res.json(data.siteSettings);
});
app.post(`${API_URL}/api/site-settings`, async (req, res) => {
  const data = await getOrCreateWebsiteData();
  data.siteSettings = req.body;
  await data.save();
  res.json({
    message: "Site settings updated",
    siteSettings: data.siteSettings,
  });
});

// ─────────────────────────────────────────────
// FILE UPLOAD — Cloudinary
// ─────────────────────────────────────────────
app.post(`${API_URL}/api/upload`, upload.single("file"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // multer-storage-cloudinary attaches the Cloudinary URL to req.file.path
    const fileUrl = (req.file as any).path;

    res.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ─────────────────────────────────────────────
// Preflight & Error handlers
// ─────────────────────────────────────────────
app.options(`${API_URL}/api/*`, (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://bandhanfilms-in.vercel.app",
    "https://ashu-portfolio-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  if (origin && allowedOrigins.includes(origin))
    res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cache-Control, Pragma, Expires, If-Modified-Since",
  );
  res.set("Access-Control-Allow-Credentials", "true");
  res.status(200).end();
});

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    if (err) {
      console.error("Unhandled error:", err);
      if (err.type === "entity.too.large")
        return res.status(413).json({ message: "Payload too large." });
      if (err instanceof multer.MulterError)
        return res.status(400).json({ message: err.message });
      return res
        .status(500)
        .json({ message: err.message || "Internal Server Error" });
    }
    next();
  },
);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  transporter.verify((error) => {
    if (error) console.error("❌ SMTP verification failed:", error);
    else console.log("✅ SMTP transporter ready");
  });
});
