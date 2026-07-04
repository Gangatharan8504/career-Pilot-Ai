import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  completedProblems: {
    type: [String],
    default: []
  },
  interviewScore: {
    type: Number,
    default: 0
  },
  studyDays: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  aptitudeScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Progress', ProgressSchema);
