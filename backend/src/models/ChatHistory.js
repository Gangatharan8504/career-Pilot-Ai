import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['USER', 'AI'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['CHAT', 'INTERVIEW'],
    required: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('ChatHistory', ChatHistorySchema);
