import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

export async function updateProfile(req, res) {
  const userId = req.headers['x-user-id'];
  const { name } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.name = name;
    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });

  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Server error updating profile details.' });
  }
}

export async function uploadProfilePic(req, res) {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Ensure uploads directory structure exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'profile_pics');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique name
    const ext = path.extname(req.file.originalname) || '.png';
    const filename = `${userId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file buffer
    fs.writeFileSync(filePath, req.file.buffer);

    // Delete old profile picture if present
    if (user.profilePic) {
      // Remove leading slash to resolve file path correctly
      const relativePath = user.profilePic.startsWith('/') ? user.profilePic.substring(1) : user.profilePic;
      const oldPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Failed to delete old profile picture:', e);
        }
      }
    }

    // Save static URL in MongoDB
    const relativeUrl = `/uploads/profile_pics/${filename}`;
    user.profilePic = relativeUrl;
    await user.save();

    return res.status(200).json({
      message: 'Profile picture uploaded successfully.',
      profilePic: relativeUrl,
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });

  } catch (err) {
    console.error('Upload profile pic error:', err);
    return res.status(500).json({ error: 'Server error uploading profile picture.' });
  }
}
