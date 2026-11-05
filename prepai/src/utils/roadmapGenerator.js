import { extractCompetencies } from './resumeParser';
import { MOCK_QUESTIONS } from './questionsData';

/**
 * Generate an adaptive, day-by-day interview preparation roadmap
 * based on user's resume, target Job Description, and days available.
 */
export function generateAdaptiveRoadmap({
  resumeText,
  jobDescription,
  daysAvailable = 7,
  targetCompany = 'Tech Giant (FAANG / Tier-1)',
  targetRole = 'Senior Software Engineer',
}) {
  const resumeInfo = extractCompetencies(resumeText);
  const jdLower = (jobDescription || '').toLowerCase();

  // Determine key JD priorities
  const requiresSystemDesign =
    jdLower.includes('system design') ||
    jdLower.includes('distributed') ||
    jdLower.includes('architecture') ||
    jdLower.includes('scale') ||
    resumeInfo.seniority.includes('L5') ||
    resumeInfo.seniority.includes('L6');

  const requiresConcurrency =
    jdLower.includes('concurrency') || jdLower.includes('multithreading') || jdLower.includes('go') || jdLower.includes('kafka');

  const requiresFullstack =
    jdLower.includes('react') || jdLower.includes('frontend') || jdLower.includes('fullstack');

  // Match resume skills with JD requirements
  const matchedSkills = resumeInfo.skills.filter((s) => jdLower.includes(s.toLowerCase()));
  const missingSkills = ['System Design', 'Distributed Caching', 'Microservices', 'Dynamic Programming', 'STAR Behavioral'].filter(
    (s) => !resumeInfo.skills.map((k) => k.toLowerCase()).includes(s.toLowerCase())
  );

  const numDays = Math.max(2, Math.min(30, Number(daysAvailable) || 7));
  const dailyPlans = [];

  // Core curriculum modules to distribute across days
  const CURRICULUM = [
    {
      title: 'Algorithmic Mastery: Arrays, Hash Maps & Frequency Analysis',
      category: 'Data Structures & Algorithms',
      studyGuide: `• Review Hash Table collision resolution strategies (Chaining vs Open Addressing).
• Master Two Pointers & Sliding Window invariant techniques.
• Space-Time Goal: Achieve O(N) linear time with O(N) or O(1) auxiliary space.`,
      questionId: 'two-sum',
      tasks: [
        'Study Sliding Window and Inverted Index lookup patterns',
        'Solve Two Sum & Multi-Pointer array challenges',
        'Analyze boundary edge cases (duplicates, empty inputs)',
      ],
      estimatedHours: 3,
    },
    {
      title: 'Memory Caching, LRU Eviction & Doubly-Linked Lists',
      category: 'Data Structures & System Core',
      studyGuide: `• Doubly-Linked List + Hash Map provides O(1) node deletion and head insertion.
• Understand LFU vs LRU vs ARC eviction policies.
• Thread safety: Read/Write Mutexes & atomic pointer swap.`,
      questionId: 'lru-cache',
      tasks: [
        'Understand O(1) eviction mechanics with doubly-linked nodes',
        'Implement and benchmark LRU Cache class',
        'Review cache stampede prevention (mutex lock / probabilistic early expiration)',
      ],
      estimatedHours: 3.5,
    },
    {
      title: 'High-Throughput Distributed Rate Limiting & Token Buckets',
      category: 'System Design & Distributed Scalability',
      studyGuide: `• Token Bucket vs Leaky Bucket vs Sliding Window Counter comparison.
• Centralized Redis cluster vs localized edge in-memory rate limiting.
• Atomic evaluation with Lua scripts to prevent distributed race conditions.`,
      questionId: 'system-design-rate-limiter',
      tasks: [
        'Design 500,000 req/sec rate limiter blueprint',
        'Evaluate Redis sliding window Lua scripts',
        'Document network partition fallback & false-positive 429 prevention',
      ],
      estimatedHours: 4,
    },
    {
      title: 'STAR Method Behavioral & Technical Leadership Defense',
      category: 'Behavioral & Leadership',
      studyGuide: `• Structure every narrative: Situation (15%), Task (15%), Action (50%), Result (20%).
• Focus on measurable outcomes: Latency reduction, uptime impact, revenue unlocked.
• Demonstrate empathy, active listening, and constructive technical debate.`,
      questionId: 'behavioral-conflict',
      tasks: [
        'Draft 3 STAR stories from your resume projects',
        'Prepare responses for technical disagreement with architects',
        'Practice executive communication pacing and tone',
      ],
      estimatedHours: 2.5,
    },
    {
      title: 'Deep-Dive JD Specifics & Live Mock Interview Simulation',
      category: 'Full Mock Test Round',
      studyGuide: `• Simulate real exam conditions under strict 30-minute timer.
• Vocalize your thinking before writing code.
• Perform manual dry-runs against test cases before hitting submit.`,
      questionId: 'two-sum',
      tasks: [
        'Conduct full-length live AI Mock Interview',
        'Review AI Scorecard and rubric scores',
        'Refine weak areas flagged in telemetric assessment',
      ],
      estimatedHours: 4,
    },
  ];

  // Distribute over the user's specific timeline
  for (let d = 1; d <= numDays; d++) {
    const moduleIndex = (d - 1) % CURRICULUM.length;
    const baseModule = CURRICULUM[moduleIndex];

    const isFinalDay = d === numDays;
    const isMockDay = d % 3 === 0 || isFinalDay;

    dailyPlans.push({
      dayNumber: d,
      phase: `Day ${d} of ${numDays}`,
      title: isFinalDay ? 'Final Comprehensive Mock & Readiness Calibration' : baseModule.title,
      category: isFinalDay ? 'Full Mock Chamber Simulation' : baseModule.category,
      estimatedHours: baseModule.estimatedHours,
      studyGuide: baseModule.studyGuide,
      questionId: baseModule.questionId,
      tasks: baseModule.tasks.map((taskTitle, idx) => ({
        id: `day_${d}_task_${idx}`,
        title: taskTitle,
        completed: false,
      })),
      scheduledRound: {
        type: isMockDay ? 'Live In-Platform Coding Test' : 'Guided Practice Drill',
        targetQuestionId: baseModule.questionId,
        timeLimitMinutes: isFinalDay ? 35 : 25,
      },
    });
  }

  return {
    id: `roadmap_${Date.now()}`,
    createdAt: new Date().toISOString(),
    targetRole,
    targetCompany,
    daysAvailable: numDays,
    candidateSeniority: resumeInfo.seniority,
    skillsExtracted: resumeInfo.skills,
    matchedSkills,
    missingSkills,
    matchPercentage: Math.min(95, Math.max(68, Math.round((matchedSkills.length / (matchedSkills.length + missingSkills.length || 1)) * 100) + 15)),
    dailyPlans,
    summary: `Tailored ${numDays}-day adaptive schedule for ${targetRole} at ${targetCompany}. Focuses on core DSA efficiency, distributed systems architecture, and live voice/code simulations.`,
  };
}
