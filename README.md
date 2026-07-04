# 🎯 CareerPilot AI Agent
### AI-Powered Placement & Career Preparation Assistant

CareerPilot AI Agent is a comprehensive placement mentoring platform that understands a student's profile and provides personalized preparation resources, mock interviews, roadmap suggestions, and resume analysis.

---

## 1. Problem Statement
Many college students struggle to prepare for placements because they don't know:
* Which skills to learn.
* Which companies they are eligible for.
* How to improve their resume.
* How to answer interview questions.
* Which LeetCode problems to solve.
* What to study daily.
* How to track their preparation.

Students usually search across multiple websites, making preparation slow and confusing. CareerPilot AI Agent unifies all these flows into a single visual dashboard.

---

## 2. Objectives
The system is built to:
* ✅ **Analyze Resume**: Parse PDFs, score ATS strength, and offer placement advice.
* ✅ **Suggest Skill Improvements**: Pick out missing industry-demand skills.
* ✅ **Generate Company-wise Interview Questions**: Simulate custom technical panels.
* ✅ **Recommend LeetCode Problems**: Offer 5 custom LeetCode problems to practice.
* ✅ **Create Daily Study Plans**: Generate a custom 30-day preparation calendar.
* ✅ **Conduct Mock Interviews**: Hold turn-based technical interactive Q&As.
* ✅ **Track Progress**: Dashboard statistics tracking streak, score metrics, and completion.

---

## 3. Architecture Diagram
```
              +-----------------------------------+
              |          React Frontend           |
              |       (Vite | Glassmorphism)      |
              +-----------------+-----------------+
                                |
                   HTTP API     | (Port 8080)
                                v
              +-----------------------------------+
              |         Node.js Backend           |
              |         (Express Server)          |
              +--------+-----------------+--------+
                       |                 |
         Local/Network |                 | Google REST API
                       v                 v
        +--------------+-----+     +-----+---------------+
        |    MongoDB Local   |     |    Gemini API       |
        | (Auth, StudyPlans, |     | (gemini-2.5-flash   |
        |  Progress, Chats)  |     |  text-embedding-004)|
        +--------------------+     +---------------------+
                       |
                       +-----> [Vector Similarity Engine]
                               (In-Memory Cosine Matcher)
```

---

## 4. Technology Stack
* **Frontend**: React (Vite), HTML5, Vanilla CSS (Premium Obsidian Dark Theme, Glassmorphism, Responsive Grid), Lucide React (vector icons).
* **Backend**: Node.js, Express, Mongoose, Multer (multipart handler), Nodemailer (email service).
* **Database**: MongoDB (Local v8.0.12 or MongoDB Atlas).
* **Vector Database**: Self-contained in-memory cosine similarity engine loaded directly in Node.js.
* **LLM Integration**: Google Gemini API (`models/gemini-2.5-flash` for generation & `models/text-embedding-004` for vector embeddings).

---

## 5. Features
1. **Student Authentication & Email Verification (Mail Auth)**: Registration sends a 6-digit OTP code to the user's email. Accounts are verified using `/verify-otp` before users can login.
2. **Resume Analyzer**: Drag & drop PDF resume upload, instant parsing (using `pdf-parse`), and detailed ATS breakdown report.
3. **AI Chat Assistant**: General placement Q&A (e.g. "Explain HashMap") with persistent session storage.
4. **Mock Interview Simulator**: Turn-based Java mock technical interview. AI asks questions, scores answers, gives feedback, and logs performance.
5. **Study Planner**: 30-day placement preparation roadmap. Toggles checklist days and updates daily active streak.
6. **Student Dashboard**: Live summary of ATS scores, solved count, interview scores, and streaks.

---

## 6. API Endpoints

| Method | Endpoint | Description | Headers / Params |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new student account (sends verification OTP) | Request body (JSON) |
| **POST** | `/verify-otp` | Verify registration OTP code to activate account | Request body (JSON) |
| **POST** | `/login` | Verify credentials and login user (enforces verified status) | Request body (JSON) |
| **POST** | `/uploadResume` | Upload resume PDF, parse, and get ATS analysis | Multipart File, `X-User-Id` |
| **GET** | `/uploadResume` | Fetch the current parsed resume analysis | `X-User-Id` |
| **POST** | `/chat` | Talk with the Career AI placement mentor | Request body, `X-User-Id` |
| **POST** | `/interview` | Start or reply to the Mock Interview Simulator | Request body, `X-User-Id` |
| **GET** | `/history` | Fetch chat or mock interview message history | `X-User-Id`, `sessionType` |
| **POST** | `/studyPlan` | Create or fetch the 30-day preparation roadmap | Request body, `X-User-Id` |
| **POST** | `/studyPlan/complete` | Mark a day of the study plan as completed/incomplete | Request body, `X-User-Id` |
| **GET** | `/progress` | Retrieve student stats for the dashboard | `X-User-Id` |
| **POST** | `/progress/leetcode` | Recommend 5 LeetCode challenges | Request body, `X-User-Id` |
| **POST** | `/progress/leetcode/toggle` | Mark a LeetCode problem as solved/unsolved | Request body, `X-User-Id` |

---

## 7. Database Design (MongoDB Mongoose Schemas)

### Users Schema
* `name`: `String` (required)
* `email`: `String` (required, unique, trim, lowercase)
* `password`: `String` (required, BCrypt hashed)
* `isVerified`: `Boolean` (default: false)
* `otp`: `String` (verification code)
* `otpExpires`: `Date` (expiration timestamp)

### Resume Schema
* `userId`: `String` (required, indexed)
* `resumeText`: `String` (required)
* `atsScore`: `Number` (required)
* `skills`: `[String]`
* `analysisJson`: `String` (JSON string)
* `embedding`: `[Number]` (Vector embeddings)

### Progress Schema
* `userId`: `String` (required, unique, indexed)
* `completedProblems`: `[String]`
* `interviewScore`: `Number` (average rating %)
* `studyDays`: `Number` (completed roadmap checkpoints)
* `streak`: `Number` (daily streak count)
* `lastActiveDate`: `Date`

### StudyPlan Schema
* `userId`: `String` (required, unique, indexed)
* `roadmap`: `[String]` (30 checklist tasks)
* `completedDays`: `[Number]` (completed index list)

### ChatHistory Schema
* `userId`: `String` (required, indexed)
* `sessionType`: `String` (enum: 'CHAT', 'INTERVIEW')
* `messages`: `[Message]` (Nested subdocument: `sender`, `text`, `timestamp`)

---

## 8. Prompt Engineering
The system utilizes optimized prompting techniques targeting `gemini-2.5-flash`:
* **Resume Analyzer**: Requests structured output formatting directly from the model using schema attributes.
* **Interview Panelist**: Instructs the LLM to behave as a technical interviewer: asking one question at a time, evaluating responses, assigning a score, and continuing the process.
* **Study Planner**: Generates roadmaps using total hours and daily limits.
* **LeetCode Recommender**: Maps missing skills to LeetCode targets.

---

## 9. Deployment & Execution

### Run Locally (No Docker)
To execute the application locally:

#### Step 1: Start MongoDB
Ensure a local MongoDB server instance is active (`mongodb://localhost:27017`).

#### Step 2: Configure Environment
Add your API credentials inside `backend/.env`:
```env
PORT=8080
MONGO_URI=mongodb://localhost:27017/careerpilot
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=models/gemini-2.5-flash

# SMTP Configuration (Optional)
# Leaving SMTP blank activates the Nodemailer Ethereal sandbox automatically.
# Check terminal output logs to find the link to read sent verification emails!
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@careerpilot.ai
```

#### Step 3: Run Node.js Backend
Navigate to `backend` and start the server:
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:8080`.

#### Step 4: Run React Frontend
Navigate to `frontend` and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 10. Future Enhancements
* Voice-based mock interviews using Web Speech API (speech recognition).
* Company-specific specialized preparation (e.g. TCS, Infosys, Amazon, Accenture).
* AI-generated coding challenges with interactive sandboxed code execution.
* Automatic email reminders for daily study planner roadmaps.
* Real-time interview metrics dashboards and dashboard analytics.

---

## 11. Contributors
* **CareerPilot AI Team**
* **Antigravity AI Agent Pair**

---

## 12. License
This project is licensed under the MIT License.
