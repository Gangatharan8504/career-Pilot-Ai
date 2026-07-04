import Progress from '../models/Progress.js';
import Resume from '../models/Resume.js';
import { generateLeetCodeProblems } from '../services/geminiService.js';

export async function getProgress(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
      await progress.save();
    }

    const resume = await Resume.findOne({ userId });
    const resumeScore = resume ? resume.atsScore : 0;

    return res.status(200).json({
      userId,
      totalProblemsSolved: progress.completedProblems.length,
      completedProblems: progress.completedProblems,
      resumeScore,
      interviewScore: progress.interviewScore,
      studyDays: progress.studyDays,
      streak: progress.streak,
      aptitudeScore: progress.aptitudeScore || 0
    });
  } catch (err) {
    console.error('Get progress error:', err);
    return res.status(500).json({ error: 'Server error retrieving progress stats.' });
  }
}

export async function recommendLeetCode(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  const { skills: reqSkills } = req.body || {};

  try {
    let skills = reqSkills || [];

    if (skills.length === 0) {
      const resume = await Resume.findOne({ userId });
      if (resume && resume.skills) {
        skills = [...resume.skills];
      }
    }

    if (skills.length === 0) {
      skills = ['Java', 'HashMap', 'Array', 'Sliding Window', 'Binary Search'];
    }

    // Call Gemini
    const rawResult = await generateLeetCodeProblems(skills);

    let problemsNode = [];
    try {
      problemsNode = JSON.parse(rawResult);
    } catch (e) {
      console.error('Failed to parse LeetCode problems JSON from Gemini: ', e);
      // Fallback problem set
      problemsNode = [
        { name: 'Two Sum', difficulty: 'Easy', category: 'Array', link: 'https://leetcode.com/problems/two-sum/', importance: 'Fundamental array hashing problem.' },
        { name: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', category: 'Sliding Window', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', importance: 'Standard sliding window algorithm check.' },
        { name: 'Top K Frequent Elements', difficulty: 'Medium', category: 'HashMap', link: 'https://leetcode.com/problems/top-k-frequent-elements/', importance: 'Excellent practice for HashMaps and sorting/Heaps.' },
        { name: 'Binary Search', difficulty: 'Easy', category: 'Binary Search', link: 'https://leetcode.com/problems/binary-search/', importance: 'Core binary search implementation practice.' },
        { name: 'Search in Rotated Sorted Array', difficulty: 'Hard', category: 'Binary Search', link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', importance: 'Advanced application of binary search.' }
      ];
    }

    return res.status(200).json(problemsNode);

  } catch (err) {
    console.error('Recommend LeetCode error:', err);
    return res.status(500).json({ error: 'Server error generating LeetCode recommendations.' });
  }
}

export async function toggleProblem(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;
  const { problemName } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (!problemName || !problemName.trim()) {
    return res.status(400).json({ error: 'Problem name is required.' });
  }

  try {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    const idx = progress.completedProblems.indexOf(problemName);
    if (idx > -1) {
      progress.completedProblems.splice(idx, 1);
    } else {
      progress.completedProblems.push(problemName);
    }

    progress.lastActiveDate = new Date();
    await progress.save();

    return res.status(200).json({
      message: 'Problem completion status updated.',
      completedProblems: progress.completedProblems,
      totalProblemsSolved: progress.completedProblems.length
    });

  } catch (err) {
    console.error('Toggle problem error:', err);
    return res.status(500).json({ error: 'Server error updating problem completion status.' });
  }
}
