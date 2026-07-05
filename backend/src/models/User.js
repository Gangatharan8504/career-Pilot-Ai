import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  resetOtp: {
    type: String
  },
  resetOtpExpires: {
    type: Date
  },
  profilePic: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);
