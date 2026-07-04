import ChatHistory from '../models/ChatHistory.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { answerChat, conductMockInterview } from '../services/geminiService.js';
import { sendPerformanceReportEmail } from '../services/mailService.js';

export async function chat(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  try {
    let session = await ChatHistory.findOne({ userId, sessionType: 'CHAT' });
    if (!session) {
      session = new ChatHistory({ userId, sessionType: 'CHAT', messages: [] });
    }

    // Build chat context from last 10 messages
    const lastMessages = session.messages.slice(-10);
    const context = lastMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

    // Call Gemini
    const aiResponse = await answerChat(context, message);

    // Save to DB
    session.messages.push({ sender: 'USER', text: message });
    session.messages.push({ sender: 'AI', text: aiResponse });
    await session.save();

    return res.status(200).json({
      response: aiResponse,
      history: session.messages
    });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: 'Server error during chat.' });
  }
}

export async function interview(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  let { message, reset } = req.body;
  const isReset = reset === true || reset === 'true';

  try {
    let session = await ChatHistory.findOne({ userId, sessionType: 'INTERVIEW' });

    if (!session || isReset) {
      if (session) {
        await ChatHistory.deleteOne({ _id: session._id });
      }
      session = new ChatHistory({ userId, sessionType: 'INTERVIEW', messages: [] });
      message = 'start'; // Kickoff interview
    }

    // Build context
    const context = session.messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

    // Call Gemini Interviewer
    const aiResponse = await conductMockInterview(context, message);

    // Try to extract a score out of 10 from the response
    const ratingPattern = /(?:score|evaluation|points|rating|mark)[\s:]*(\d+)(?:\s*\/\s*10)?/i;
    const match = aiResponse.match(ratingPattern);
    let scoreExtracted = null;

    if (match) {
      try {
        const parsed = parseInt(match[1], 10);
        if (parsed >= 0 && parsed <= 10) {
          scoreExtracted = parsed;
          const scorePercent = parsed * 10;
          await updateInterviewProgress(userId, scorePercent);

          // Fetch user details and send performance report email in background
          User.findById(userId).then(user => {
            if (user) {
              sendPerformanceReportEmail(user.email, user.name, {
                testType: "Java Mock Technical Interview",
                score: scorePercent,
                weakAreas: "Theoretical concepts (OOP, thread states, collections mappings) or code optimization patterns.",
                recommendations: "Study core collections mappings (HashMap vs ConcurrentHashMap), multithreading synchronize locks, and practice arrays and heap sorting on CareerPilot. Recommended LeetCode: 'Top K Frequent Elements' and 'Two Sum'."
              }).catch(mailErr => console.error("Interview report email fail:", mailErr));
            }
          });
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Save logs
    if (message.toLowerCase() !== 'start') {
      session.messages.push({ sender: 'USER', text: message });
    }
    session.messages.push({ sender: 'AI', text: aiResponse });
    await session.save();

    return res.status(200).json({
      response: aiResponse,
      scoreExtracted: scoreExtracted !== null ? scoreExtracted : 'Not evaluated yet',
      history: session.messages
    });

  } catch (err) {
    console.error('Interview error:', err);
    return res.status(500).json({ error: 'Server error during interview.' });
  }
}

export async function getHistory(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId;
  const userId = headerUserId || paramUserId;
  const sessionType = (req.query.sessionType || 'CHAT').toUpperCase();

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const session = await ChatHistory.findOne({ userId, sessionType });
    if (!session) {
      return res.status(200).json({ sessionType, history: [] });
    }

    return res.status(200).json({
      sessionType,
      history: session.messages
    });
  } catch (err) {
    console.error('Get history error:', err);
    return res.status(500).json({ error: 'Server error retrieving history.' });
  }
}

async function updateInterviewProgress(userId, scorePercent) {
  try {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    if (progress.interviewScore === 0) {
      progress.interviewScore = scorePercent;
    } else {
      progress.interviewScore = Math.round((progress.interviewScore + scorePercent) / 2);
    }
    await progress.save();
  } catch (e) {
    console.error('Error updating interview progress score:', e);
  }
}
