import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import PasswordResetOTP from '../models/PasswordResetOTP.js';
import { authRequired, attachProfile } from '../middleware/auth.js';

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    const profile = user.toJSON();
    res.json({ token, profile });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/session', authRequired, attachProfile, (req, res) => {
  res.json({ profile: req.profile.toJSON() });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() });
    if (!user) return res.json({ success: false, message: 'No account found with this email address' });

    const otp = String(Math.floor(1000000 + Math.random() * 9000000)).padStart(7, '0');
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordResetOTP.create({ email: user.email, otp_code: otp, expires_at: expires });
    await PasswordResetOTP.updateMany(
      { email: user.email, otp_code: { $ne: otp }, used: false },
      { $set: { used: true } }
    );

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || '').replace(/\s/g, '');
    if (!smtpEmail || !smtpPassword) {
      throw new Error('SMTP_EMAIL and SMTP_PASS (or SMTP_PASSWORD) must be configured');
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: smtpEmail, pass: smtpPassword },
    });

    await transporter.sendMail({
      from: `SCIM College Portal <${smtpEmail}>`,
      to: user.email,
      subject: 'Password Reset OTP — SCIM College Portal',
      html: `<p>Your password reset OTP is: <strong>${otp}</strong></p><p>This OTP expires in 5 minutes.</p>`,
    });

    res.json({ success: true, email: user.email });
  } catch (err) {
    console.error('Password reset request failed:', err);
    res.status(500).json({ success: false, message: 'Could not process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;
    const record = await PasswordResetOTP.findOne({
      email: (email || '').toLowerCase().trim(),
      otp_code,
      used: false,
      expires_at: { $gt: new Date() },
    }).sort({ created_at: -1 });

    if (!record) return res.json({ success: false, message: 'Invalid or expired OTP code' });

    record.used = true;
    await record.save();

    const hashed = await bcrypt.hash(new_password, 10);
    await User.updateOne({ email: record.email }, { $set: { password: hashed } });

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: 'Could not reset password' });
  }
});

export default router;
