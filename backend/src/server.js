import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

// Controllers
import { register, verifyOtp, login } from './controllers/authController.js';
import { uploadResume, getResumeAnalysis } from './controllers/resumeController.js';
import { chat, interview, getHistory } from './controllers/chatController.js';
import { createStudyPlan, getStudyPlan, completeDay } from './controllers/studyPlanController.js';
import { getProgress, recommendLeetCode, toggleProblem } from './controllers/progressController.js';
import { getAllStudents } from './controllers/adminController.js';
import { getQuiz, submitQuizScore } from './controllers/aptitudeController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// CORS configuration (solves origin constraints when credentials are sent)
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Multer setup (in-memory storage for handling files)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/careerpilot';
mongoose.connect(mongoUri)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('Failed to connect to MongoDB: ', err.message);
    process.exit(1);
  });

// Routes

// Auth
app.post('/register', register);
app.post('/verify-otp', verifyOtp);
app.post('/login', login);

// Resume Analyzer
app.post('/uploadResume', upload.single('file'), uploadResume);
app.get('/uploadResume', getResumeAnalysis);

// AI Placement Mentor Chat & History
app.post('/chat', chat);
app.post('/interview', interview);
app.get('/history', getHistory);

// Study Planner
app.post('/studyPlan', createStudyPlan);
app.get('/studyPlan', getStudyPlan);
app.post('/studyPlan/complete', completeDay);

// Dashboard Progress Metrics & LeetCode Recommendation
app.get('/progress', getProgress);
app.post('/progress/leetcode', recommendLeetCode);
app.post('/progress/leetcode/toggle', toggleProblem);

// Admin Management Console
app.get('/admin/users', getAllStudents);

// Aptitude Round Quiz Generator
app.post('/aptitude/generate', getQuiz);
app.post('/aptitude/submit', submitQuizScore);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error: ', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`CareerPilot AI Agent backend listening at http://localhost:${PORT}`);
  console.log(`============================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n============================================================`);
    console.error(`[ERROR] Port ${PORT} is already in use!`);
    console.error(`Another process is already running on this port.`);
    console.error(`Please stop the existing process or release port ${PORT} to start.`);
    console.error(`============================================================\n`);
    process.exit(1);
  } else {
    console.error('Server connection error:', err);
  }
});
