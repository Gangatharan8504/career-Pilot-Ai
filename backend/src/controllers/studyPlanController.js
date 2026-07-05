import StudyPlan from '../models/StudyPlan.js';
import Resume from '../models/Resume.js';
import Progress from '../models/Progress.js';
import { generateStudyPlan } from '../services/geminiService.js';

export async function createStudyPlan(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const { force, skills: reqSkills, weakAreas: reqWeak } = req.body || {};
  const forceGenerate = force === true || force === 'true';

  try {
    const existing = await StudyPlan.findOne({ userId });
    if (existing && !forceGenerate) {
      return res.status(200).json(existing);
    }

    let skills = reqSkills || [];
    let weakAreas = reqWeak || [];

    // Fallback to resume data if empty
    if (skills.length === 0 || weakAreas.length === 0) {
      const resume = await Resume.findOne({ userId });
      if (resume) {
        if (skills.length === 0 && resume.skills) {
          skills = [...resume.skills];
        }
        if (weakAreas.length === 0 && resume.analysisJson) {
          try {
            const parsed = JSON.parse(resume.analysisJson);
            weakAreas = parsed.missingSkills || [];
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    // Default fallbacks
    if (skills.length === 0) {
      skills = ['Java', 'Spring Boot', 'React'];
    }
    if (weakAreas.length === 0) {
      weakAreas = ['SQL', 'OS', 'Networking'];
    }

    // Generate via Gemini
    const dailyHours = 3;
    const days = 30;
    let roadmap = [];
    try {
      const rawPlan = await generateStudyPlan(skills, weakAreas, dailyHours, days);
      const parsed = JSON.parse(rawPlan);
      roadmap = parsed.roadmap || [];
    } catch (e) {
      console.error('Failed to get or parse Gemini generated study plan (using local fallback): ', e.message);
      // Fallback day list
      for (let i = 1; i <= days; i++) {
        roadmap.push(`Day ${i}: Study core concepts of ${skills[i % skills.length]} and practice ${weakAreas[i % weakAreas.length]}`);
      }
    }

    let studyPlan = await StudyPlan.findOne({ userId });
    if (studyPlan) {
      studyPlan.roadmap = roadmap;
      studyPlan.completedDays = []; // Reset progress on refresh
    } else {
      studyPlan = new StudyPlan({
        userId,
        roadmap,
        completedDays: []
      });
    }

    await studyPlan.save();
    return res.status(200).json(studyPlan);

  } catch (err) {
    console.error('Create study plan error:', err);
    return res.status(500).json({ error: 'Server error generating study plan.' });
  }
}

export async function getStudyPlan(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const plan = await StudyPlan.findOne({ userId });
    if (!plan) {
      return res.status(404).json({ error: 'No study plan found. Please generate one first.' });
    }
    return res.status(200).json(plan);
  } catch (err) {
    console.error('Get study plan error:', err);
    return res.status(500).json({ error: 'Server error retrieving study plan.' });
  }
}

export async function completeDay(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;
  const { day } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (day === undefined || typeof day !== 'number') {
    return res.status(400).json({ error: 'Day (number index 0 to 29) is required.' });
  }

  try {
    const plan = await StudyPlan.findOne({ userId });
    if (!plan) {
      return res.status(404).json({ error: 'No study plan found.' });
    }

    const idx = plan.completedDays.indexOf(day);
    if (idx > -1) {
      plan.completedDays.splice(idx, 1); // toggle off
    } else {
      plan.completedDays.push(day); // toggle on
    }

    await plan.save();

    // Update Progress
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    progress.studyDays = plan.completedDays.length;

    // Streak logic
    const now = new Date();
    const lastActive = progress.lastActiveDate;
    if (lastActive) {
      const diffMs = now.getTime() - lastActive.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) {
        if (idx === -1) { // If toggling ON
          progress.streak += 1;
        }
      } else {
        progress.streak = 1;
      }
    } else {
      progress.streak = 1;
    }
    progress.lastActiveDate = now;

    await progress.save();

    return res.status(200).json({
      message: 'Day completion status updated.',
      completedDays: plan.completedDays,
      streak: progress.streak,
      studyDays: progress.studyDays
    });

  } catch (err) {
    console.error('Complete day error:', err);
    return res.status(500).json({ error: 'Server error updating day completion status.' });
  }
}
