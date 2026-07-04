import mongoose from 'mongoose';

const StudyPlanSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  roadmap: {
    type: [String],
    default: []
  },
  completedDays: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('StudyPlan', StudyPlanSchema);
