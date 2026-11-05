import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Integration Service for PrepAI
 * Handles:
 * - Dynamic Day-by-Day Roadmap Generation using Candidate Resume + Target JD
 * - Bespoke Interview Question, Test Cases & Starter Code Generation
 * - Live Interactive Mock Interview Proctoring & Conversational Hints
 */

export const GEMINI_SUPPORTED_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

export function getGeminiApiKey() {
  const localKey =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('prepai_gemini_api_key')
      : null;
  const envKey =
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
    '';
  return (localKey || envKey || '').trim();
}

export function setGeminiApiKey(key) {
  if (typeof localStorage === 'undefined') return;
  if (key) {
    localStorage.setItem('prepai_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('prepai_gemini_api_key');
  }
}

export function isGeminiConfigured() {
  const key = getGeminiApiKey();
  return Boolean(key && key.length > 10 && !key.includes('your-gemini-key'));
}

/**
 * Helper to get GoogleGenerativeAI instance
 */
function getGenAI() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please provide your Gemini API key.');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Call Gemini with automatic fallback across supported model tiers
 * to protect against temporary 503 high demand spikes or model deprecations.
 */
async function generateContentWithFallback(prompt, options = {}) {
  const genAI = getGenAI();
  const modelsToTry = options.model
    ? [options.model, ...GEMINI_SUPPORTED_MODELS.filter((m) => m !== options.model)]
    : GEMINI_SUPPORTED_MODELS;

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: options.generationConfig,
      });
      const result = await model.generateContent(prompt);
      return { result, modelName };
    } catch (err) {
      console.warn(`Gemini model "${modelName}" failed: ${err.message}. Trying next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model fallbacks failed to respond.');
}

/**
 * Clean and parse JSON from Gemini's response (handles raw JSON, markdown code fences, and edge characters)
 */
function parseJsonFromResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response from Gemini');
  }
  const trimmed = rawText.trim();

  // Try direct JSON.parse first
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Continue with extraction
  }

  // Handle markdown code blocks ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
  let match;
  while ((match = codeBlockRegex.exec(trimmed)) !== null) {
    if (match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        // Continue searching
      }
    }
  }

  // Find outermost { ... }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Strip trailing commas before closing braces/brackets
      const sanitized = candidate.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(sanitized);
    }
  }

  throw new Error('Could not parse valid JSON from Gemini output: ' + trimmed.slice(0, 150));
}

/**
 * Generate a Tailored Preparation Roadmap using Gemini
 */
export async function generateRoadmapWithGemini({
  resumeText = '',
  jobDescription = '',
  daysAvailable = 7,
  targetCompany = 'Tech Giant (FAANG / Tier-1)',
  targetRole = 'Senior Software Engineer',
}) {
  const numDays = Math.max(2, Math.min(30, Number(daysAvailable) || 7));

  const prompt = `
You are an expert Principal Engineering Manager and Technical Recruiter at ${targetCompany}.
Generate an intensive, day-by-day interview preparation roadmap for a candidate targeting the role of "${targetRole}" with ${numDays} days available.

Candidate Resume Excerpt:
"""
${resumeText.slice(0, 3000) || 'Experienced software engineer skilled in fullstack development and system architecture.'}
"""

Target Job Description:
"""
${jobDescription.slice(0, 3000) || 'Looking for an engineer with strong algorithmic problem solving, distributed systems design, and behavioral leadership.'}
"""

Analyze the gap between the candidate's resume and the job description.
Return a STRICT JSON object (no surrounding conversational text, only valid JSON) matching this exact schema:
{
  "targetRole": "${targetRole}",
  "targetCompany": "${targetCompany}",
  "daysCount": ${numDays},
  "extractedSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "missingSkills": ["Gap 1", "Gap 2", "Gap 3"],
  "seniority": "Senior Software Engineer (L5)",
  "matchScore": 84,
  "summary": "Tailored ${numDays}-day intensive preparation schedule calibrated by Gemini AI.",
  "dailyPlans": [
    {
      "dayNumber": 1,
      "title": "Module Title",
      "category": "Data Structures & Algorithms | System Design | Behavioral | Core Architecture",
      "studyGuide": "In-depth bullet points explaining theory, invariant patterns, and trade-offs.",
      "estimatedHours": 3.5,
      "questionId": "two-sum",
      "tasks": [
        "Actionable checklist item 1",
        "Actionable checklist item 2",
        "Actionable checklist item 3"
      ]
    }
  ]
}

CRITICAL:
1. Provide exactly ${numDays} items in the "dailyPlans" array (one for each day from Day 1 to Day ${numDays}).
2. Focus on hard technical gaps found in the Job Description.
3. Keep the JSON strictly valid.
`;

  let responseText = '';
  let activeModelUsed = 'gemini-3.5-flash';

  try {
    const { result, modelName } = await generateContentWithFallback(prompt, {
      generationConfig: { responseMimeType: 'application/json' },
    });
    responseText = result.response.text();
    activeModelUsed = modelName;
  } catch (err) {
    // If responseMimeType is unsupported by a model, try standard fallback
    const { result, modelName } = await generateContentWithFallback(prompt);
    responseText = result.response.text();
    activeModelUsed = modelName;
  }

  const rawData = parseJsonFromResponse(responseText);

  // Normalize into standard PrepAI Roadmap schema and ensure all days exist
  const rawPlans = Array.isArray(rawData.dailyPlans) ? rawData.dailyPlans : [];
  const normalizedPlans = [];

  for (let d = 1; d <= numDays; d++) {
    const plan = rawPlans[d - 1] || rawPlans.find((p) => p.dayNumber === d) || {};
    const isMockDay = d % 3 === 0 || d === numDays;

    normalizedPlans.push({
      dayNumber: d,
      phase: `Day ${d} of ${numDays}`,
      title: plan.title || (d === numDays ? 'Final Comprehensive Mock & Readiness Calibration' : `Day ${d}: Core Competency Mastery`),
      category: plan.category || (isMockDay ? 'Live In-Platform Coding Simulation' : 'Technical Focus'),
      estimatedHours: Number(plan.estimatedHours) || 3.5,
      studyGuide: plan.studyGuide || 'Master core data structures, algorithmic invariants, and system design edge cases.',
      questionId: plan.questionId || (d % 2 === 0 ? 'lru-cache' : 'two-sum'),
      tasks: (Array.isArray(plan.tasks) && plan.tasks.length > 0 ? plan.tasks : [
        'Study core invariant patterns & theory notes',
        'Solve targeted algorithm challenge with optimal time/space bounds',
        'Review edge-case telemetry and boundary invariants',
      ]).map((taskTitle, taskIdx) => ({
        id: `day_${d}_task_${taskIdx}`,
        title: typeof taskTitle === 'string' ? taskTitle : taskTitle.title || 'Practice Task',
        completed: false,
      })),
      scheduledRound: {
        type: isMockDay ? 'Live In-Platform Coding Test' : 'Guided Practice Drill',
        targetQuestionId: plan.questionId || (d % 2 === 0 ? 'lru-cache' : 'two-sum'),
        timeLimitMinutes: d === numDays ? 35 : 25,
      },
    });
  }

  return {
    id: `roadmap_gemini_${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole,
    targetCompany,
    daysAvailable: numDays,
    candidateSeniority: rawData.seniority || 'Senior Software Engineer (L5)',
    skillsExtracted: rawData.extractedSkills || ['Algorithms', 'System Design', 'JavaScript'],
    matchedSkills: rawData.extractedSkills || ['Algorithms', 'JavaScript'],
    missingSkills: rawData.missingSkills || ['Distributed Caching', 'STAR Method'],
    matchPercentage: Math.min(99, Math.max(45, Number(rawData.matchScore) || 85)),
    dailyPlans: normalizedPlans,
    summary: rawData.summary || `Tailored ${numDays}-day adaptive schedule for ${targetRole} at ${targetCompany} generated by Gemini AI.`,
    isGeminiGenerated: true,
    modelUsed: activeModelUsed,
  };
}

/**
 * Generate Bespoke Interview Questions & Answers with Gemini
 */
export async function generateInterviewQuestionWithGemini({
  topic = 'Dynamic Programming & Caching',
  targetRole = 'Full Stack Engineer',
  difficulty = 'Medium',
}) {
  const prompt = `
You are a Staff Technical Interviewer at a top tier tech company.
Create a complete, rigorous technical interview coding problem on the topic "${topic}" calibrated for a "${targetRole}" at "${difficulty}" difficulty.

Return a STRICT JSON object (no surrounding conversational text, only valid JSON) with this exact schema:
{
  "id": "gemini-${Date.now()}",
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "category": "${topic}",
  "timeLimitMinutes": 35,
  "description": "Comprehensive problem statement with edge cases, input formats, constraints, and time/space complexity goals.",
  "starterCode": {
    "javascript": "function solveProblem(input) {\\n  // Write your solution here\\n  return null;\\n}",
    "python": "def solve_problem(input):\\n    # Write your solution here\\n    return None"
  },
  "testCases": [
    {
      "input": { "data": [1, 2, 3] },
      "expected": 6
    },
    {
      "input": { "data": [4, 5, 6] },
      "expected": 15
    }
  ],
  "optimalSolution": {
    "javascript": "// Optimal solution code with commentary",
    "python": "# Optimal python solution"
  },
  "theory": [
    {
      "title": "Algorithmic Pattern",
      "content": "Deep technical explanation of the underlying invariants, Big-O trade-offs, and edge cases."
    }
  ],
  "hints": [
    "First subtle hint to nudge the candidate without giving away the approach.",
    "Second structural hint regarding optimal data structures.",
    "Third near-solution hint."
  ],
  "aiProctorResponses": [
    "Welcome! Take a minute to read through the requirements and ask any clarifying questions about edge cases or bounds.",
    "That is a great direction. How would you handle duplicate entries or empty inputs?",
    "Consider the space-time trade-off if we need O(1) auxiliary memory."
  ]
}

Ensure the code is syntactically pristine and test cases are mathematically correct.
`;

  let responseText = '';
  try {
    const { result } = await generateContentWithFallback(prompt, {
      generationConfig: { responseMimeType: 'application/json' },
    });
    responseText = result.response.text();
  } catch (err) {
    const { result } = await generateContentWithFallback(prompt);
    responseText = result.response.text();
  }

  const q = parseJsonFromResponse(responseText);

  // Guarantee required fields
  return {
    id: q.id || `gemini-q-${Date.now()}`,
    title: q.title || `${topic} Challenge`,
    difficulty: q.difficulty || difficulty,
    category: q.category || topic,
    timeLimitMinutes: q.timeLimitMinutes || 30,
    description: q.description || `Implement an efficient algorithm for ${topic}.`,
    starterCode: {
      javascript: q.starterCode?.javascript || `function solution(input) {\n  return null;\n}`,
      python: q.starterCode?.python || `def solution(input):\n    return None`,
    },
    testCases: Array.isArray(q.testCases) && q.testCases.length > 0 ? q.testCases : [
      { input: { sample: 1 }, expected: 1 },
      { input: { sample: 2 }, expected: 2 },
    ],
    optimalSolution: q.optimalSolution || {
      javascript: '// Optimal solution',
      python: '# Optimal python solution',
    },
    theory: Array.isArray(q.theory) ? q.theory : [
      { title: 'Approach', content: 'Optimized algorithmic approach.' },
    ],
    hints: Array.isArray(q.hints) ? q.hints : [
      'Think about time vs space trade-offs.',
      'Can you solve it in linear time?',
    ],
    aiProctorResponses: Array.isArray(q.aiProctorResponses) ? q.aiProctorResponses : [
      'Welcome to this round. Let me know if you have clarifying questions!',
    ],
    isGeminiGenerated: true,
  };
}

/**
 * Live Interactive AI Interview Proctor / Tutor
 */
export async function askGeminiProctor({
  questionTitle,
  problemDescription = '',
  candidateCode = '',
  candidateMessage = '',
  chatHistory = [],
}) {
  const formattedHistory = chatHistory
    .slice(-6)
    .map((msg) => `${msg.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
    .join('\n');

  const prompt = `
You are an experienced, empathetic, but rigorous Staff Software Engineer conducting a live technical mock interview.

Interview Question:
"${questionTitle}"
Problem Context:
"${problemDescription.slice(0, 1000)}"

Candidate's Current Code Buffer:
\`\`\`
${candidateCode.slice(0, 2000)}
\`\`\`

Recent Interview Dialog:
${formattedHistory}

Candidate's Latest Message:
"${candidateMessage}"

Instructions:
1. Act like a real interviewer at Google/Meta/Amazon.
2. If they ask a clarifying question about inputs/bounds/edge-cases, answer authoritatively.
3. If they are stuck, provide a constructive, progressive Socratic hint without giving away the entire solution.
4. If they think they are finished, challenge them on edge cases (e.g. empty inputs, massive scale, concurrency, Big-O complexity).
5. Keep your answer concise (2-4 sentences max), conversational, and focused.
`;

  const { result } = await generateContentWithFallback(prompt);
  return result.response.text().trim();
}
