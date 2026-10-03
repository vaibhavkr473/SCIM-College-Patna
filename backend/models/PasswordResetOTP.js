import mongoose from 'mongoose';

const PasswordResetOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp_code: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('PasswordResetOTP', PasswordResetOTPSchema);
