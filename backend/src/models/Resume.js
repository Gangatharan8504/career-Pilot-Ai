import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  resumeText: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  analysisJson: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Resume', ResumeSchema);
