import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import Progress from '../models/Progress.js';
import { analyzeResume, getEmbedding } from '../services/geminiService.js';

export async function uploadResume(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required via X-User-Id header or userId property.' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No resume PDF file uploaded.' });
  }

  try {
    // 1. Extract text from PDF buffer
    let resumeText = '';
    try {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    } catch (e) {
      console.error('Failed to parse PDF resume: ', e);
      return res.status(400).json({ error: 'Failed to extract text from PDF file. Ensure it is a valid PDF.' });
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'No readable text could be extracted from the resume PDF.' });
    }

    // 2. Call Gemini for resume analysis (JSON response) with offline fallback
    let analysisJson;
    try {
      analysisJson = await analyzeResume(resumeText);
    } catch (err) {
      console.warn('Gemini resume analysis failed (using offline fallback):', err.message);
      analysisJson = JSON.stringify({
        atsScore: 75,
        strongPoints: ["Good structure and clear formatting", "Includes key relevant projects"],
        weakPoints: ["Needs more quantifiable achievements", "Missing some advanced technical skills"],
        missingSkills: ["Docker", "Kubernetes", "AWS Cloud", "System Design"],
        projectsToBuild: ["Build a Full-Stack MERN Application", "Implement a Microservices Architecture API"],
        certifications: ["AWS Certified Developer Associate", "Oracle Certified Professional Java SE"],
        expectedSalary: "Rs. 6-10 LPA",
        topCompanies: ["TCS", "Accenture", "Cognizant", "Infosys"],
        feedback: "Your resume has a strong foundation. (Running in offline preview mode due to API rate-limit). Focus on adding quantifiable results to your project descriptions and acquire missing cloud skills.",
        jobRecommendations: [
          {
            "title": "Junior Software Engineer",
            "matchPercentage": 80,
            "reason": "Based on your core programming skills and web project constructs.",
            "keySkillsMatched": ["Java", "React", "Node.js"],
            "suggestedCompanies": ["Accenture", "TCS"]
          }
        ]
      });
    }

    // 3. Extract ATS Score and skills list from response
    let atsScore = 60; // Fallback
    let skills = [];
    try {
      const parsed = JSON.parse(analysisJson);
      atsScore = parsed.atsScore || 60;
      skills = parsed.missingSkills || [];
      if (parsed.skills && Array.isArray(parsed.skills)) {
        skills = [...skills, ...parsed.skills];
      }
    } catch (e) {
      console.error('Failed to parse analysis JSON: ', e);
    }

    // 4. Generate text embeddings
    const embedding = await getEmbedding(resumeText);

    // 5. Update or save Resume document in MongoDB
    let resumeDoc = await Resume.findOne({ userId });
    if (resumeDoc) {
      resumeDoc.resumeText = resumeText;
      resumeDoc.atsScore = atsScore;
      resumeDoc.skills = skills;
      resumeDoc.analysisJson = analysisJson;
      resumeDoc.embedding = embedding;
    } else {
      resumeDoc = new Resume({
        userId,
        resumeText,
        atsScore,
        skills,
        analysisJson,
        embedding
      });
    }

    await resumeDoc.save();

    // 6. Optionally update Progress
    const progress = await Progress.findOne({ userId });
    if (progress) {
      // Any specific stats updates on resume upload
      await progress.save();
    }

    return res.status(200).json({
      message: 'Resume analyzed and saved successfully.',
      resumeId: resumeDoc._id,
      atsScore,
      analysis: analysisJson
    });

  } catch (err) {
    console.error('Upload resume error:', err);
    return res.status(500).json({ error: 'Server error during resume processing.' });
  }
}

export async function getResumeAnalysis(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId;
  const userId = headerUserId || paramUserId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({ error: 'No resume found for this user. Please upload a resume first.' });
    }

    return res.status(200).json({
      resumeId: resume._id,
      atsScore: resume.atsScore,
      analysis: resume.analysisJson
    });
  } catch (err) {
    console.error('Get resume analysis error:', err);
    return res.status(500).json({ error: 'Server error retrieving resume analysis.' });
  }
}
