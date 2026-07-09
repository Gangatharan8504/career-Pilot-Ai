import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import { sendOtpEmail, sendWelcomeEmail, sendResetPasswordEmail } from '../services/mailService.js';

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ error: 'Email is already registered.' });
      } else {
        // Purge the unverified user to allow registration reuse
        await User.deleteOne({ _id: existingUser._id });
        console.log(`Unverified pending user record for ${email} deleted to allow email reuse.`);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Automatically make admin@careerpilot.ai an admin account and bypass OTP verify
    const role = email.toLowerCase() === 'admin@careerpilot.ai' ? 'admin' : 'student';
    const isVerified = role === 'admin';

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isVerified,
      otp: isVerified ? undefined : otp,
      otpExpires: isVerified ? undefined : otpExpires,
      role
    });

    await newUser.save();

    // Initialize progress directly for Admin (since they bypass OTP verification)
    if (role === 'admin') {
      const progress = new Progress({ userId: newUser._id.toString() });
      await progress.save();
    }

    // Send verification mail (skip for Admin)
    let emailSent = false;
    let emailError = null;
    if (!isVerified) {
      emailSent = true;
      try {
        await sendOtpEmail(email, name, otp);
      } catch (mailErr) {
        emailSent = false;
        emailError = mailErr.message;
        console.error('\n============================================================');
        console.error(`[SMTP ERROR] Failed to send email to ${email}:`, mailErr.message);
        console.error(`[OTP FALLBACK] Verification code for ${name} is: ${otp}`);
        console.error('============================================================\n');
      }
    }

    return res.status(200).json({
      message: isVerified
        ? 'Admin registered and activated successfully!'
        : (emailSent 
            ? 'Registration initiated. Verification OTP sent to email.'
            : 'Registration initiated, but email delivery failed. Verification code logged in backend console.'),
      email: newUser.email,
      userId: newUser._id,
      role: newUser.role,
      emailSent,
      emailError
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.', details: err.message });
  }
}

export async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and verification OTP are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified. Please sign in.' });
    }

    // Verify OTP code and expiry
    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification OTP.' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ error: 'Verification OTP has expired. Please register again.' });
    }

    // Activate account
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Initialize user placement progress stats
    const progress = new Progress({
      userId: user._id.toString()
    });
    await progress.save();

    // Send Welcome Email in background
    sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return res.status(200).json({
      message: 'Account verified successfully! You can now log in.',
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('OTP Verification error:', err);
    return res.status(500).json({ error: 'Server error during OTP verification.', details: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Enforce mail authentication verification
    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Account not verified. Please verify your email first.',
        requiresVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    return res.status(200).json({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || ''
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.', details: err.message });
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Email is not registered.' });
    }

    // Generate 6-digit OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    user.resetOtp = resetOtp;
    user.resetOtpExpires = resetOtpExpires;
    await user.save();

    // Send reset email
    let emailSent = true;
    let emailError = null;
    try {
      await sendResetPasswordEmail(user.email, user.name, resetOtp);
    } catch (mailErr) {
      emailSent = false;
      emailError = mailErr.message;
      console.error('\n============================================================');
      console.error(`[SMTP ERROR] Failed to send reset email to ${email}:`, mailErr.message);
      console.error(`[RESET FALLBACK] Reset code for ${user.name} is: ${resetOtp}`);
      console.error('============================================================\n');
    }

    return res.status(200).json({
      message: emailSent
        ? 'Password reset OTP sent to your email.'
        : 'Password reset code generated. Verification code logged in backend console.',
      email: user.email,
      emailSent,
      emailError
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error during forgot password processing.', details: err.message });
  }
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Email is not registered.' });
    }

    // Check reset OTP match and expiry
    if (user.resetOtp !== otp) {
      return res.status(400).json({ error: 'Invalid password reset OTP.' });
    }

    if (new Date() > user.resetOtpExpires) {
      return res.status(400).json({ error: 'Password reset OTP has expired.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: 'Password reset successful! You can now log in.'
    });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error during password reset.', details: err.message });
  }
}
