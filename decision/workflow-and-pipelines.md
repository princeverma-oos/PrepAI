# 🔄 Workflows & Developer Pipelines

This document provides step-by-step walkthroughs of both **End-to-End Candidate Workflows** and **Developer Pipelines** to make the codebase intuitive to navigate and maintain.

---

## 1. Candidate User Journey Workflows

```mermaid
journey
    title Candidate Preparation Journey in PrepAI
    section 1. Onboarding
      Visit Platform: 5: Candidate
      One-Click Demo Login: 5: Candidate
    section 2. Diagnosis & Roadmap
      Upload Resume (PDF/TXT): 5: Candidate
      Paste Target Job Description: 5: Candidate
      Generate N-Day Calibrated Roadmap: 5: Candidate
      Sync to Supabase Cloud: 5: Candidate
    section 3. Practice & Mock Interview
      Launch Algorithmic Arena: 5: Candidate
      Write & Execute Code: 4: Candidate
      Simulate Live AI Mock Interview: 5: Candidate
      Receive AI Proctor Hints: 4: Candidate
    section 4. Assessment & Report
      Submit Solution & Pass Tests: 5: Candidate
      Permanent Save to Supabase: 5: Candidate
      View 5-Pillar Spider Radar Chart: 5: Candidate
      Inspect Verified Performance Report: 5: Candidate
```

---

### Workflow A: Resume Ingestion, Roadmap Calibration & Supabase Cloud Sync

```mermaid
sequenceDiagram
    participant User as Candidate
    participant Modal as RoadmapBuilderModal
    participant Parser as resumeParser.js
    participant Gen as roadmapGenerator.js
    participant DB as db.js (Unified Wrapper)
    participant SB as Supabase Cloud (PostgreSQL)
    participant Local as Dexie IndexedDB

    User->>Modal: Selects file (e.g. resume.pdf)
    Modal->>Parser: parseResumeFile(file)
    Parser-->>Modal: Returns { fileName, text }
    User->>Modal: Pastes target Job Description & selects 7 Days
    User->>Modal: Clicks "Generate My Roadmap"
    Modal->>Gen: generateAdaptiveRoadmap({ resumeText, jobDescription, daysAvailable: 7 })
    Gen->>Gen: Computes missing skills vector & spreads curriculum across days
    Gen-->>Modal: Returns customized roadmap object
    Modal->>DB: saveRoadmap(roadmap)
    par Permanent Cloud Save
        DB->>SB: supabase.from('roadmaps').insert(...)
    and Local Cache Save
        DB->>Local: db.roadmaps.add(...)
    end
    DB-->>Modal: Confirms successful multi-tier save
    Modal-->>User: Displays Day-by-Day interactive schedule with study guides & task checklists
```

---

### Workflow B: Live AI Mock Interview Session & Assessment Sync

```mermaid
sequenceDiagram
    participant User as Candidate
    participant Modal as MockInterviewModal
    participant Timer as Live Countdown Hook
    participant Proctor as AI Proctor Engine
    participant Runner as codeRunner.js
    participant DB as db.js
    participant SB as Supabase Cloud

    User->>Modal: Opens Mock Interview on "Two Sum" / "LRU Cache"
    Modal->>Timer: Starts countdown (e.g. 45:00)
    Modal->>Proctor: Renders greeting & problem briefing
    User->>Modal: Types message: "Can there be negative numbers in the array?"
    Modal->>Proctor: Analyzes query & returns contextual clarifying response
    User->>Modal: Writes solution in CodeEditor & clicks "Run Tests"
    Modal->>Runner: executeCode(code, 'javascript', question)
    Runner-->>Modal: Evaluates inputs vs expected outputs, returns results & execution ms
    Modal-->>User: Displays green test badges & complexity analysis
    User->>Modal: Clicks "Submit Final Solution"
    Modal->>Runner: generateScorecard(question, testResults, chatLog, code)
    Runner-->>Modal: Computes 5-dimension score (Correctness, Big-O, Readability, etc.)
    Modal->>DB: saveAssessmentResult(result)
    DB->>SB: supabase.from('assessments').insert(...)
    Modal-->>User: Displays full evaluation scorecard with strengths & growth tips
```

---

### Workflow C: Administrator User Management & Candidate Progress Oversight

```mermaid
sequenceDiagram
    participant Admin as System Administrator
    participant Modal as AdminModal.jsx
    participant Auth as authService.js
    participant DB as Dexie / localStorage
    participant View as Candidate Telemetry View

    Admin->>Modal: Opens Admin Portal from Navbar or UserMenu
    Modal->>Auth: getPlatformOverviewStats()
    Modal->>Auth: getAllUsersWithProgress()
    Auth->>DB: Reads users from db.users
    Auth-->>Modal: Returns user directory + roadmap % + radar telemetry
    Modal-->>Admin: Renders Platform KPI cards + Interactive User Table

    alt Manage User Account Lifecycle
        Admin->>Modal: Clicks "Toggle Status" (Active <-> Suspended)
        Modal->>Auth: toggleUserStatus(userId)
        Auth->>DB: Updates status in db.users & notifies subscribers
        Auth-->>Modal: Refreshes directory with updated state
    else Inspect Candidate Learning Progress
        Admin->>Modal: Clicks "Inspect Progress" on Candidate (e.g. Alex Chen)
        Modal->>View: Renders Candidate Progress Drawer / Tab
        View-->>Admin: Displays 5-Pillar Spider Radar, N-Day Roadmap completion, test evaluations & recommendations
    else Create New User or Reset Password
        Admin->>Modal: Submits "Create New User" form / "Reset Password"
        Modal->>Auth: createAdminUser(form) / adminResetPassword(userId, newPass)
        Auth->>DB: Writes new user record to database
        Auth-->>Modal: Displays success feedback alert
    end
```

---

## 2. Developer Pipelines & Extension Guide

### How to Run the Project Locally
```bash
# 1. Navigate to the project directory
cd "c:\Users\Preety\OneDrive\Desktop\task 2\prepai"

# 2. Configure your Supabase credentials in .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here

# 3. Start the Vite development server
npm run dev

# 4. Open in browser:
# http://localhost:5174/ (or http://localhost:5173/)
```

---

### Pipeline 1: Supabase Cloud Database Migrations

Whenever modifying table schemas, update `supabase-schema.sql` and run in the **Supabase Dashboard SQL Editor**:

```sql
-- Example: Adding a new column to assessments
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS feedback_notes TEXT;
```

---

### Pipeline 2: Adding a New Interview Problem to `questionsData.js`

To add a new problem to the coding arena and mock interview room, open `src/utils/questionsData.js` and append an entry to `MOCK_QUESTIONS`:

```javascript
{
  id: 'valid-parentheses',
  title: 'Valid Parentheses & Bracket Validation',
  difficulty: 'Easy',
  category: 'Stacks & Parsing',
  timeLimitMinutes: 20,
  starterCode: {
    javascript: `function isValid(s) {\n  // Implement O(N) stack solution\n  return true;\n}`,
    python: `def is_valid(s: str) -> bool:\n    # Implement solution\n    return True`,
  },
  testCases: [
    { input: { s: "()" }, expected: true },
    { input: { s: "()[]{}" }, expected: true },
    { input: { s: "(]" }, expected: false }
  ],
  optimalSolution: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else { stack.push(char); }\n  }\n  return stack.length === 0;\n}`,
  theory: [
    { title: 'Stack Invariants', content: 'LIFO structures guarantee innermost brackets match first.' }
  ],
  aiProctorResponses: [
    'Welcome! How would you handle an odd-length string right away?'
  ]
}
```

---

### Pipeline 3: Expanding the Resume Parser Skill Vector in `resumeParser.js`

To recognize additional technologies, open `src/utils/resumeParser.js` and add keywords to `SKILL_KEYWORDS`:

```javascript
const SKILL_KEYWORDS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java', 'C++',
  'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'Docker', 'Kubernetes', 'AWS',
  'GraphQL', 'gRPC', 'Microservices', 'System Design', 'Algorithms', 'SQL',
  'Next.js', 'Tailwind', 'CI/CD', 'Git', 'Distributed Systems',
  // Add new technologies below:
  'Rust', 'Solidity', 'PyTorch', 'TensorFlow', 'Terraform', 'WebSockets', 'Supabase'
];
```

---

### Pipeline 4: Leveraging Google Gemini 3.8 Flash for Dynamic AI Features

To utilize Gemini for AI features, add your API key in `.env`:
```env
VITE_GEMINI_API_KEY=your-gemini-key-here
```
Or set it directly in the candidate UI via the **Set Gemini API Key** button.

1. **Dynamic Roadmaps**: Called via `generateRoadmapWithGemini({ resumeText, jobDescription, daysAvailable })`.
2. **Dynamic Problem Synthesis**: Triggered in the Mock Interview modal via `+ Gemini Question` or `generateInterviewQuestionWithGemini({ topic, difficulty })`.
3. **Conversational Mock Interview Proctor**: Evaluated during live chats via `askGeminiProctor(...)` which receives the candidate's active code buffer and chat history.

---

### Pipeline 5: Admin User Management & Candidate Progress Telemetry Extension

To extend administrative controls or integrate external telemetry sources, utilize the helper functions in `src/utils/authService.js`:

```javascript
import {
  getAllUsersWithProgress,
  createAdminUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  toggleUserRole,
  adminResetPassword,
  getPlatformOverviewStats,
} from './utils/authService';

// 1. Fetch complete platform summary metrics
const stats = await getPlatformOverviewStats();
// => { totalUsers, candidateCount, adminCount, activeCount, suspendedCount, platformAvgScore, avgRoadmapCompletion, strongHireRate }

// 2. Fetch enriched candidate directory with roadmap & radar telemetry
const directory = await getAllUsersWithProgress();
// Each user contains user.progress: { roadmap: { progressPercent, completedTasks }, assessments: { avgScore, recentTests }, radarScores: { codeQuality, systemDesign, ... } }

// 3. Programmatically provision candidate or admin accounts
await createAdminUser({
  name: 'Marcus Vance',
  email: 'marcus@prepai.io',
  password: 'password123',
  role: 'candidate', // or 'admin'
  status: 'active',  // or 'suspended'
  targetRole: 'Senior Cloud Engineer',
  targetCompany: 'AWS',
});

// 4. Update status or reset credentials
await toggleUserStatus(userId); // Active <-> Suspended
await adminResetPassword(userId, 'temporaryPassword123');
```
