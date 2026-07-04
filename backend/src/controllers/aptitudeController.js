import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { generateAptitudeQuiz } from '../services/geminiService.js';
import { sendPerformanceReportEmail } from '../services/mailService.js';

export async function getQuiz(req, res) {
  const { category } = req.body;
  if (!category || !['aptitude', 'reasoning', 'verbal'].includes(category)) {
    return res.status(400).json({ error: "Category (one of 'aptitude', 'reasoning', 'verbal') is required." });
  }

  try {
    const rawResult = await generateAptitudeQuiz(category);
    let quiz = [];
    try {
      quiz = JSON.parse(rawResult);
    } catch (e) {
      console.error('Failed to parse Gemini generated aptitude quiz: ', e);
      
      // Resilient Fallbacks if JSON parsing fails
      if (category === 'aptitude') {
        quiz = [
          { id: 1, question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: { A: "120 metres", B: "180 metres", C: "324 metres", D: "150 metres" }, correctAnswer: "D", explanation: "Speed = 60 * (5/18) m/s = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 metres." },
          { id: 2, question: "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?", options: { A: "12 days", B: "15 days", C: "16 days", D: "18 days" }, correctAnswer: "B", explanation: "A's 2 days work = 2/20 = 1/10. Work on 3rd day = 1/20 + 1/30 + 1/60 = 6/60 = 1/10. 3 days work = 1/10 + 1/10 = 1/5. Total days for complete work = 3 * 5 = 15 days." }
        ];
      } else if (category === 'reasoning') {
        quiz = [
          { id: 1, question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: { A: "1/3", B: "1/8", C: "2/8", D: "1/16" }, correctAnswer: "B", explanation: "This is a simple division series; each number is one-half of the previous number. 1/4 divided by 2 is 1/8." },
          { id: 2, question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: { A: "His own", B: "His son's", C: "His father's", D: "His nephew's" }, correctAnswer: "B", explanation: "Since the man has no brothers or sisters, 'my father's son' is himself. So, the photograph is of 'his son'." }
        ];
      } else {
        quiz = [
          { id: 1, question: "Choose the word which is most nearly OPPOSITE in meaning to the word: OBSTINATE", options: { A: "Stubborn", B: "Flexible", C: "Rigid", D: "Hard" }, correctAnswer: "B", explanation: "Obstinate means stubborn or unyielding. The opposite is flexible or yielding." },
          { id: 2, question: "Fill in the blank: The police _____ investigating the theft case.", options: { A: "is", B: "are", C: "was", D: "has" }, correctAnswer: "B", explanation: "The word 'police' is a collective noun and is treated as plural. Hence, 'are' is the correct verb." }
        ];
      }
    }

    return res.status(200).json(quiz);

  } catch (err) {
    console.error('Get aptitude quiz error:', err);
    return res.status(500).json({ error: 'Server error generating aptitude round questions.' });
  }
}

export async function submitQuizScore(req, res) {
  const headerUserId = req.headers['x-user-id'];
  const paramUserId = req.query.userId || req.body.userId;
  const userId = headerUserId || paramUserId;
  const { score, category } = req.body; // Score as percentage (0-100), and test category

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  if (score === undefined || typeof score !== 'number') {
    return res.status(400).json({ error: 'Test score (percentage number) is required.' });
  }

  try {
    let progress = await Progress.findOne({ userId });
    if (!progress) {
      progress = new Progress({ userId });
    }

    // Update running average aptitude score
    if (progress.aptitudeScore === 0) {
      progress.aptitudeScore = score;
    } else {
      progress.aptitudeScore = Math.round((progress.aptitudeScore + score) / 2);
    }
    
    progress.lastActiveDate = new Date();
    await progress.save();

    // Fetch user details and send performance report email in background
    User.findById(userId).then(user => {
      if (user) {
        let testType = "Aptitude Round Practice";
        let weakAreas = "General arithmetic and analytical problem solving.";
        let recommendations = "Focus on daily coding roadmaps and keep taking practice quizzes.";

        if (category === 'aptitude') {
          testType = "Quantitative Aptitude Test";
          weakAreas = "Averages, ratios, speed & distance, time & work computations.";
          recommendations = "Review Day 5 and Day 7 of your 30-day preparation plan. Practice math formula applications. Recommended LeetCode: 'Search in Rotated Sorted Array'.";
        } else if (category === 'reasoning') {
          testType = "Logical Reasoning Quiz";
          weakAreas = "Logical deduction, arrangement logic, blood relations, letter-number sequences.";
          recommendations = "Solve arrangement puzzles. Focus on graph/tree representation structure of puzzle facts. Recommended LeetCode: 'Binary Search' and 'Two Sum'.";
        } else if (category === 'verbal') {
          testType = "Verbal Ability Quiz";
          weakAreas = "Sentence correction structures, grammar context, synonyms & antonyms.";
          recommendations = "Increase reading habits. Practice vocabulary flashcards daily on CareerPilot. Practice grammar correction rules.";
        }

        sendPerformanceReportEmail(user.email, user.name, {
          testType,
          score,
          weakAreas: score >= 80 ? "No significant weak areas identified! Outstanding score." : weakAreas,
          recommendations
        }).catch(mailErr => console.error("Aptitude report email fail:", mailErr));
      }
    });

    return res.status(200).json({
      message: 'Aptitude score updated successfully.',
      aptitudeScore: progress.aptitudeScore
    });

  } catch (err) {
    console.error('Submit quiz score error:', err);
    return res.status(500).json({ error: 'Server error updating aptitude score metrics.' });
  }
}
