import dotenv from 'dotenv';
dotenv.config();

export async function generateText(prompt, jsonMode = false) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'models/gemini-2.5-flash';
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    if (jsonMode) {
      requestBody.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API Error: Status ${response.status} Details: ${errText}`);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return 'No response returned from Gemini.';
    }
    return text;
  } catch (error) {
    console.error('Error in generateText: ', error);
    throw error;
  }
}

export async function getEmbedding(text) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

    const requestBody = {
      model: 'models/text-embedding-004',
      content: {
        parts: [{ text }]
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini Embedding Error: ${errText}`);
      throw new Error(`Embedding calculation failed: ${response.status}`);
    }

    const data = await response.json();
    const values = data.embedding?.values;
    if (!values) {
      throw new Error('No embedding values returned');
    }
    return values;
  } catch (error) {
    console.error('Error in getEmbedding: ', error);
    return [];
  }
}

export async function analyzeResume(resumeText) {
  const prompt = `You are CareerPilot AI, an expert Placement Mentor. Analyze this resume.

Resume Text:
${resumeText}

Provide your response as a valid JSON object matching the following structure exactly. Do not include markdown code fence wrappers (like \`\`\`json), just output the raw JSON string.
{
  "atsScore": 85,
  "strongPoints": ["First point", "Second point"],
  "weakPoints": ["First weak point", "Second weak point"],
  "missingSkills": ["Skill A", "Skill B"],
  "projectsToBuild": ["Project 1 detailed", "Project 2 detailed"],
  "certifications": ["Cert A", "Cert B"],
  "expectedSalary": "$80,000 - $100,000 / Rs. 8-12 LPA",
  "topCompanies": ["Google", "Microsoft", "TCS"],
  "feedback": "Constructive feedback for the candidate regarding resume strength and layout.",
  "jobRecommendations": [
    {
      "title": "Software Engineer",
      "matchPercentage": 90,
      "reason": "Detailed rationale explaining why they match this role based on their skills.",
      "keySkillsMatched": ["Java", "Spring Boot"],
      "suggestedCompanies": ["TCS", "Accenture", "Infosys"]
    }
  ]
}`;
  return generateText(prompt, true);
}

export async function generateLeetCodeProblems(skills) {
  const skillsStr = skills.join(', ');
  const prompt = `You are CareerPilot AI, an expert Placement Mentor.
Recommend exactly five LeetCode problems (with descriptions and reasons why they are important) based on these skills: ${skillsStr}.
Output a valid JSON array of objects, each object containing:
  "name": "Problem name (e.g. Two Sum)",
  "difficulty": "Easy/Medium/Hard",
  "category": "Array/Sliding Window/etc.",
  "link": "Leetcode link or placeholder link",
  "importance": "Explanation of why this problem is important"
Format the output as raw JSON string without markdown fences.`;
  return generateText(prompt, true);
}

export async function generateStudyPlan(skills, weakAreas, dailyHours, days) {
  const skillsStr = skills.join(', ');
  const weakStr = weakAreas.join(', ');
  const prompt = `You are CareerPilot AI, an expert Placement Mentor. Create a ${days}-day placement preparation roadmap.
Student Skills: ${skillsStr}
Weak Areas: ${weakStr}
Study ${dailyHours} hours daily.

Provide the output as a valid JSON object containing an array "roadmap" with exactly ${days} items. Each item represents a day. Each day should be a string containing clear, actionable topics to study, tasks, and problems to solve for that day.
Output format:
{
  "roadmap": [
     "Day 1: Study Java Fundamentals, review HashMap internal working. Revise sliding window basics. Solve 1 sliding window problem.",
     "Day 2: ..."
  ]
}
Output raw JSON without markdown fences.`;
  return generateText(prompt, true);
}

export async function answerChat(chatContext, userMessage) {
  const systemInstruction = `You are CareerPilot AI. You are an expert Placement Mentor.
Your responsibilities are:
1. Analyze resumes.
2. Suggest improvements.
3. Recommend skills.
4. Suggest LeetCode questions.
5. Conduct mock interviews.
6. Generate company-specific interview questions.
7. Create daily study plans.
8. Answer only placement-related questions. If user asks non-placement questions, politely redirect them.
9. Encourage the student with constructive feedback.

`;

  const prompt = `${systemInstruction}${chatContext ? `Previous conversation context:\n${chatContext}\n\n` : ''}User: ${userMessage}\nCareerPilot AI:`;
  return generateText(prompt, false);
}

export async function conductMockInterview(interviewHistory, userMessage) {
  const systemInstruction = `You are CareerPilot AI, a Java Technical Interviewer.
Ask one question at a time. Wait for the user's answer. Evaluate the answer. Give a score. Ask the next question.
Be constructive and professional.

`;

  const prompt = `${systemInstruction}${interviewHistory ? `Interview history:\n${interviewHistory}\n\nUser response: ${userMessage}\nEvaluate response, give a score out of 10 for the answer, give brief feedback, and then ask the next question.` : 'Interview starting. Ask the first Java technical question.'}`;
  return generateText(prompt, false);
}

export async function generateAptitudeQuiz(category) {
  const categoryNames = {
    aptitude: "Quantitative Aptitude",
    reasoning: "Logical Reasoning",
    verbal: "Verbal Ability"
  };
  const categoryName = categoryNames[category] || "Quantitative Aptitude";

  const prompt = `You are CareerPilot AI, an expert placement mentor.
Generate exactly five multiple-choice questions for a student preparing for placements under the category: ${categoryName}.
Provide the output as a valid JSON array of objects. Do not include markdown wrappers (like \`\`\`json), just output the raw JSON string.

Each question object in the array must match this structure exactly:
{
  "id": 1,
  "question": "Question text...",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Detailed step-by-step explanation of the solution..."
}`;
  return generateText(prompt, true);
}

export default {
  generateText,
  getEmbedding,
  analyzeResume,
  generateLeetCodeProblems,
  generateStudyPlan,
  answerChat,
  conductMockInterview,
  generateAptitudeQuiz
};
