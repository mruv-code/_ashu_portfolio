import express from 'express';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 failed attempts per IP
  message: { message: 'Too many failed login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

app.use(express.json());
app.use(cors({
  origin: 'https://ashu-portfolio-frontend.vercel.app', // In production, replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Input validation helper
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidOtp = (otp: string) => /^\d{6}$/.test(otp);
const isValidPassword = (password: string) => password && password.length >= 8;

// In-memory store for OTPs (In production, use Redis or a database)
interface OtpStore {
  [email: string]: {
    otp: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  };
}

const otpStore: OtpStore = {};

// Store for pending admin changes
interface PendingAdminChanges {
  [email: string]: {
    newEmail: string;
    newPasswordHash: string;
    otp: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  };
}

const pendingChangesStore: PendingAdminChanges = {};

// Store for forgot password requests
interface ForgotPasswordStore {
  [email: string]: {
    otp: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  };
}

const forgotPasswordStore: ForgotPasswordStore = {};

// Default admin credentials (In production, use a database)
let ADMIN_EMAIL = process.env.ADMIN_EMAIL;
let ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'password123', 10);

// Nodemailer transporter initialization
const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: isNaN(smtpPort) ? 587 : smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API Routes
app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (email !== ADMIN_EMAIL || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore[email] = {
    otp,
    expiresAt,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  // Send OTP via email
  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your Admin OTP Verification Code',
      html: `
        <div style="font-family: serif; background-color: #000; color: #fff; padding: 40px; text-align: center; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-size: 24px; margin-bottom: 20px;">BANDHAN FILMS</h1>
          <p style="font-size: 16px; margin-bottom: 30px;">Your 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #fff; background: #111; padding: 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 14px; margin-top: 30px; color: #666;">This code will expire in 5 minutes.</p>
        </div>
      `,
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP. Please check SMTP settings.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp || !isValidEmail(email) || !isValidOtp(otp)) {
    return res.status(400).json({ message: 'Invalid email or verification code' });
  }

  const storedData = otpStore[email];

  if (!storedData) {
    return res.status(400).json({ message: 'No OTP found for this email' });
  }

  if (Date.now() > storedData.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ message: 'OTP has expired' });
  }

  if (storedData.attempts >= 5) {
    delete otpStore[email];
    return res.status(400).json({ message: 'Too many failed attempts. Please login again.' });
  }

  if (storedData.otp !== otp) {
    storedData.attempts += 1;
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Success
  delete otpStore[email];
  res.json({ message: 'Login successful', token: 'dummy-jwt-token' });
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  const storedData = otpStore[email];

  if (!storedData) {
    return res.status(400).json({ message: 'Please login first' });
  }

  const cooldown = 30 * 1000; // 30 seconds
  if (Date.now() - storedData.lastSentAt < cooldown) {
    const remaining = Math.ceil((cooldown - (Date.now() - storedData.lastSentAt)) / 1000);
    return res.status(400).json({ message: `Please wait ${remaining} seconds before resending.` });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  storedData.otp = otp;
  storedData.expiresAt = Date.now() + 5 * 60 * 1000;
  storedData.lastSentAt = Date.now();
  storedData.attempts = 0;

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your New Admin OTP Verification Code',
      html: `
        <div style="font-family: serif; background-color: #000; color: #fff; padding: 40px; text-align: center; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-size: 24px; margin-bottom: 20px;">BANDHAN FILMS</h1>
          <p style="font-size: 16px; margin-bottom: 30px;">Your new 6-digit verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #fff; background: #111; padding: 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 14px; margin-top: 30px; color: #666;">This code will expire in 5 minutes.</p>
        </div>
      `,
    });
    res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      message: 'Failed to resend OTP',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  if (email !== ADMIN_EMAIL) {
    return res.json({ message: 'If this email is registered, a verification code has been sent.' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  forgotPasswordStore[email] = {
    otp,
    expiresAt,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
        <div style="font-family: serif; background-color: #000; color: #fff; padding: 40px; text-align: center; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-size: 24px; margin-bottom: 20px;">BANDHAN FILMS</h1>
          <p style="font-size: 16px; margin-bottom: 30px;">You requested a password reset. Use the code below to verify:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #fff; background: #111; padding: 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 14px; margin-top: 30px; color: #666;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.error('Forgot password email error:', error);
    res.status(500).json({ 
      message: 'Failed to send verification code',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword || !isValidEmail(email) || !isValidOtp(otp) || !isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Invalid input data. Password must be at least 8 characters.' });
  }

  const stored = forgotPasswordStore[email];

  if (!stored) {
    return res.status(400).json({ message: 'No reset request found' });
  }

  if (Date.now() > stored.expiresAt) {
    delete forgotPasswordStore[email];
    return res.status(400).json({ message: 'Verification code expired' });
  }

  if (stored.otp !== otp) {
    stored.attempts += 1;
    if (stored.attempts >= 5) {
      delete forgotPasswordStore[email];
      return res.status(400).json({ message: 'Too many failed attempts' });
    }
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Success - Update password
  ADMIN_PASSWORD_HASH = await bcrypt.hash(newPassword, 10);
  delete forgotPasswordStore[email];
  
  res.json({ message: 'Password reset successfully. You can now login.' });
});

// Settings Change OTP Endpoints
app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/admin/request-change', async (req, res) => {
  const { oldEmail, oldPassword, newEmail, newPassword } = req.body;

  // Basic input validation
  if (!oldEmail || !oldPassword || !isValidEmail(oldEmail)) {
    return res.status(400).json({ message: 'Invalid current email or password' });
  }

  if (newEmail && !isValidEmail(newEmail)) {
    return res.status(400).json({ message: 'Invalid new email address' });
  }

  if (newPassword && !isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  // Validate current credentials
  const isPasswordValid = await bcrypt.compare(oldPassword, ADMIN_PASSWORD_HASH);
  if (oldEmail !== ADMIN_EMAIL || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid current email or password' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const newPasswordHash = newPassword ? await bcrypt.hash(newPassword, 10) : ADMIN_PASSWORD_HASH;

  pendingChangesStore[oldEmail] = {
    newEmail: newEmail || ADMIN_EMAIL,
    newPasswordHash,
    otp,
    expiresAt,
    attempts: 0,
    lastSentAt: Date.now(),
  };

  try {
    await transporter.sendMail({
      from: `"BANDHAN FILMS" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: 'Security Verification: Admin Settings Change',
      html: `
        <div style="font-family: serif; background-color: #000; color: #fff; padding: 40px; text-align: center; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; font-size: 24px; margin-bottom: 20px;">BANDHAN FILMS</h1>
          <p style="font-size: 16px; margin-bottom: 30px;">A change to your admin settings was requested. Use the code below to verify:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #fff; background: #111; padding: 20px; border-radius: 8px; display: inline-block;">
            ${otp}
          </div>
          <p style="font-size: 14px; margin-top: 30px; color: #666;">If you did not request this change, please secure your account immediately.</p>
        </div>
      `,
    });
    res.json({ message: 'Verification code sent to current admin email' });
  } catch (error) {
    console.error('SMTP Error details:', error);
    res.status(500).json({ 
      message: 'Failed to send verification code', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/admin/verify-change', (req, res) => {
  const { currentEmail, otp } = req.body;

  if (!currentEmail || !otp || !isValidEmail(currentEmail) || !isValidOtp(otp)) {
    return res.status(400).json({ message: 'Invalid email or verification code' });
  }

  const pending = pendingChangesStore[currentEmail];

  if (!pending) {
    return res.status(400).json({ message: 'No pending changes found' });
  }

  if (Date.now() > pending.expiresAt) {
    delete pendingChangesStore[currentEmail];
    return res.status(400).json({ message: 'Verification code expired' });
  }

  if (pending.attempts >= 5) {
    delete pendingChangesStore[currentEmail];
    return res.status(400).json({ message: 'Too many failed attempts' });
  }

  if (pending.otp !== otp) {
    pending.attempts += 1;
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Apply changes in memory
  ADMIN_EMAIL = pending.newEmail;
  ADMIN_PASSWORD_HASH = pending.newPasswordHash;

  delete pendingChangesStore[currentEmail];
  res.json({ 
    message: 'Settings updated successfully',
    updatedAdmin: {
      email: ADMIN_EMAIL,
    }
  });
});

// Store for availability calendar
interface CalendarAvailability {
  [date: string]: 'available' | 'unavailable';
}

let calendarAvailability: CalendarAvailability = {};

// Calendar APIs
app.get('https://ashu-portfolio-backend-vgnp.onrender.com//api/calendar', (req, res) => {
  res.json(calendarAvailability);
});

app.post('https://ashu-portfolio-backend-vgnp.onrender.com//api/calendar', (req, res) => {
  const { availability } = req.body;
  if (!availability || typeof availability !== 'object') {
    return res.status(400).json({ message: 'Invalid availability data' });
  }
  calendarAvailability = availability;
  res.json({ message: 'Calendar updated successfully', availability: calendarAvailability });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  // When running from dist/server.js, __dirname is /backend/dist
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  
  // Verify transporter
  transporter.verify((error) => {
    if (error) {
      console.error('SMTP Transporter verification failed:', error);
    } else {
      console.log('SMTP Transporter is ready to send emails');
    }
  });
});
