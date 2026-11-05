import { db } from '../db/db';

const STORAGE_KEY_USER = 'prepai_current_user';
const STORAGE_KEY_USERS = 'prepai_users_db';

// Seed default demo accounts with roles and target tracks
export const DEFAULT_USERS = [
  {
    id: 'user_admin_0',
    username: 'admin',
    name: 'Master Administrator',
    email: 'admin@prepai.io',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    targetRole: 'Director of Technical Recruiting & Engineering',
    targetCompany: 'PrepAI Enterprise Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-01-15T08:00:00.000Z',
    lastActive: 'Just now',
  },
  {
    id: 'user_alex_1',
    name: 'Alex Chen',
    email: 'demo@prepai.io',
    password: 'password123',
    role: 'candidate',
    status: 'active',
    targetRole: 'Senior Full Stack Engineer',
    targetCompany: 'Google (L5)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01T10:30:00.000Z',
    lastActive: '10 mins ago',
  },
  {
    id: 'user_sarah_2',
    name: 'Sarah Lin',
    email: 'sarah@prepai.io',
    password: 'password123',
    role: 'candidate',
    status: 'active',
    targetRole: 'Staff Distributed Systems Architect',
    targetCompany: 'Meta / Netflix (L6)',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-03-12T14:20:00.000Z',
    lastActive: '1 hour ago',
  },
  {
    id: 'user_marcus_3',
    name: 'Marcus Vance',
    email: 'marcus@prepai.io',
    password: 'password123',
    role: 'candidate',
    status: 'active',
    targetRole: 'Principal Backend Infrastructure Engineer',
    targetCompany: 'Stripe / Uber',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-03-20T09:15:00.000Z',
    lastActive: '3 hours ago',
  },
  {
    id: 'user_priya_4',
    name: 'Priya Sharma',
    email: 'priya@prepai.io',
    password: 'password123',
    role: 'candidate',
    status: 'active',
    targetRole: 'Cloud Infrastructure & SRE Architect',
    targetCompany: 'Amazon Web Services',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-04-02T16:45:00.000Z',
    lastActive: 'Yesterday',
  },
  {
    id: 'user_jordan_5',
    name: 'Jordan Miller',
    email: 'jordan@prepai.io',
    password: 'password123',
    role: 'candidate',
    status: 'suspended',
    targetRole: 'Frontend Engineering Lead',
    targetCompany: 'Apple Inc.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    createdAt: '2026-02-18T11:10:00.000Z',
    lastActive: '3 days ago',
  },
];

// Initialize users storage
export async function initializeUsers() {
  try {
    const count = await db.users.count();
    if (count === 0) {
      for (const u of DEFAULT_USERS) {
        await db.users.add(u);
      }
    } else {
      // Ensure admin user exists in existing database
      const hasAdmin = await db.users.where('email').equalsIgnoreCase('admin@prepai.io').first();
      if (!hasAdmin) {
        await db.users.add(DEFAULT_USERS[0]);
      } else {
        // Sync admin credentials
        await db.users.update(hasAdmin.id, {
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          status: 'active',
        });
      }
    }
  } catch (err) {
    // LocalStorage fallback
    const local = localStorage.getItem(STORAGE_KEY_USERS);
    if (!local) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
    }
  }
}

// Get all users helper
export async function getAllUsers() {
  await initializeUsers();
  try {
    const users = await db.users.toArray();
    if (users && users.length > 0) return users;
  } catch (err) {
    // Fallback
  }
  const local = localStorage.getItem(STORAGE_KEY_USERS);
  return local ? JSON.parse(local) : DEFAULT_USERS;
}

// Event subscribers for reactive auth state changes
const authSubscribers = new Set();

export function subscribeAuth(callback) {
  authSubscribers.add(callback);
  return () => authSubscribers.delete(callback);
}

function notifyAuthSubscribers(user) {
  authSubscribers.forEach((cb) => cb(user));
}

/**
 * Get currently logged-in user from storage
 */
export function getCurrentUser() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Log in with email or username & password
 */
export async function login({ email, password, rememberMe = true }) {
  await initializeUsers();

  const cleanIdentifier = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanIdentifier) {
    throw new Error('Please enter your email or username.');
  }

  // If not 'admin' and doesn't contain '@', validate standard email or username
  const isUsername = cleanIdentifier === 'admin' || !cleanIdentifier.includes('@');
  if (!isUsername) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanIdentifier)) {
      throw new Error('Please provide a valid email format (e.g. name@domain.com).');
    }
  }

  if (!cleanPass) {
    throw new Error('Please enter your password.');
  }

  const users = await getAllUsers();
  const matchedUser = users.find((u) => {
    const emailMatches = u.email && u.email.toLowerCase() === cleanIdentifier;
    const usernameMatches = (u.username && u.username.toLowerCase() === cleanIdentifier) || (cleanIdentifier === 'admin' && u.role === 'admin');
    if (!emailMatches && !usernameMatches) return false;

    if (u.role === 'admin') {
      return cleanPass === 'admin123' || cleanPass === 'password123' || u.password === cleanPass;
    }
    return u.password === cleanPass;
  });

  if (!matchedUser) {
    // Check if user exists with different password
    const userExists = users.some((u) => {
      const emailMatches = u.email && u.email.toLowerCase() === cleanIdentifier;
      const usernameMatches = (u.username && u.username.toLowerCase() === cleanIdentifier) || (cleanIdentifier === 'admin' && u.role === 'admin');
      return emailMatches || usernameMatches;
    });

    if (userExists) {
      if (cleanIdentifier === 'admin' || cleanIdentifier === 'admin@prepai.io') {
        throw new Error('Incorrect password. Default Admin Password is "admin123".');
      }
      throw new Error('Incorrect password. Please try again or use password reset.');
    } else {
      throw new Error('No account found with this username/email. For admin access, use username "admin".');
    }
  }

  if (matchedUser.status === 'suspended') {
    throw new Error('This account has been suspended by an administrator. Please contact support.');
  }

  // Create session
  const sessionUser = {
    id: matchedUser.id,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role || 'candidate',
    status: matchedUser.status || 'active',
    targetRole: matchedUser.targetRole || 'Software Engineer',
    targetCompany: matchedUser.targetCompany || 'Tier-1 Tech',
    avatarUrl: matchedUser.avatarUrl || null,
    token: `jwt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    loginTime: new Date().toISOString(),
  };

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY_USER, JSON.stringify(sessionUser));
  if (!rememberMe) localStorage.removeItem(STORAGE_KEY_USER);

  notifyAuthSubscribers(sessionUser);
  return sessionUser;
}

/**
 * Register a new user
 */
export async function register({
  name,
  email,
  password,
  confirmPassword,
  targetRole = 'Software Engineer',
  targetCompany = 'Top Tech Companies',
  rememberMe = true,
}) {
  await initializeUsers();

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanName || cleanName.length < 2) {
    throw new Error('Please enter your full name (minimum 2 characters).');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw new Error('Please provide a valid email address.');
  }

  if (!cleanPass || cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  if (confirmPassword !== undefined && cleanPass !== confirmPassword.trim()) {
    throw new Error('Passwords do not match. Please re-enter your password.');
  }

  const users = await getAllUsers();
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    throw new Error('An account with this email already exists. Please log in.');
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    targetRole: (targetRole || 'Software Engineer').trim(),
    targetCompany: (targetCompany || 'Top Tech Companies').trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await db.users.add(newUser);
  } catch (err) {
    // fallback
    const local = [...users, newUser];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(local));
  }

  // Auto-login after registration
  return login({ email: cleanEmail, password: cleanPass, rememberMe });
}

/**
 * 1-Click Demo Login
 */
export async function loginAsGuest(presetIndex = 0) {
  const user = DEFAULT_USERS[presetIndex % DEFAULT_USERS.length];
  return login({ email: user.email, password: user.password, rememberMe: true });
}

/**
 * 1-Click Social Login (Google / GitHub simulation)
 */
export async function socialLogin(provider = 'google') {
  await initializeUsers();
  const isGoogle = provider === 'google';

  const socialUser = {
    id: `oauth_${provider}_${Date.now()}`,
    name: isGoogle ? 'Alex Chen (Google Verified)' : 'Alex Chen (GitHub Verified)',
    email: isGoogle ? 'alex.google@prepai.io' : 'alex.dev@prepai.io',
    targetRole: 'Senior Full Stack Engineer',
    targetCompany: 'Tier-1 Tech',
    avatarUrl: isGoogle
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    provider,
    token: `oauth_token_${Math.random().toString(36).substring(2, 10)}`,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(socialUser));
  notifyAuthSubscribers(socialUser);
  return socialUser;
}

/**
 * Request password reset (Generates simulation code)
 */
export async function requestPasswordReset(email) {
  await initializeUsers();
  const cleanEmail = (email || '').trim().toLowerCase();

  const users = await getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error('No account found with this email address.');
  }

  // Simulation verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    success: true,
    email: cleanEmail,
    simulationCode: code,
    message: `Verification code generated: ${code}`,
  };
}

/**
 * Reset password with new password
 */
export async function resetPassword(email, newPassword) {
  await initializeUsers();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (newPassword || '').trim();

  if (!cleanPass || cleanPass.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const users = await getAllUsers();
  const userIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

  if (userIndex === -1) {
    throw new Error('User not found.');
  }

  const updatedUser = { ...users[userIndex], password: cleanPass };

  try {
    const existing = await db.users.where('email').equalsIgnoreCase(cleanEmail).first();
    if (existing) {
      await db.users.update(existing.id, { password: cleanPass });
    }
  } catch (err) {
    // fallback
  }

  users[userIndex] = updatedUser;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  return { success: true, message: 'Password updated successfully. You can now log in.' };
}

/**
 * Log out currently logged-in user
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_USER);
  notifyAuthSubscribers(null);
}

/**
 * Log in directly as Admin demo account
 */
export async function loginAsAdmin() {
  return login({ email: 'admin', password: 'admin123', rememberMe: true });
}

/**
 * Verify Administrator credentials (Username: 'admin' or 'admin@prepai.io', Password: 'admin123')
 */
export async function verifyAdminCredentials(identifier, password) {
  const cleanId = (identifier || '').trim();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    throw new Error('Please enter the Admin username (admin) or email.');
  }
  if (!cleanPass) {
    throw new Error('Please enter the Admin password (admin123).');
  }

  const session = await login({ email: cleanId, password: cleanPass, rememberMe: true });
  if (session.role !== 'admin') {
    throw new Error('Access denied: Account "' + session.name + '" does not have Administrator privileges.');
  }
  return session;
}

/**
 * Candidate Progress Mock / Aggregated Dataset generator for candidate oversight
 */
const CANDIDATE_PROGRESS_PROFILES = {
  'user_alex_1': {
    roadmap: {
      daysAvailable: 7,
      currentDay: 5,
      totalTasks: 21,
      completedTasks: 16,
      progressPercent: 76,
      status: 'Active (On Track)',
      lastPhase: 'Day 5 of 7: Core Competency & Caching',
    },
    assessments: {
      testsTaken: 3,
      avgScore: 92,
      passRate: 100,
      latestRecommendation: 'Strong Hire',
      recentTests: [
        { title: 'Two Sum & Optimization', score: 96, date: '2 hours ago', recommendation: 'Strong Hire' },
        { title: 'Design LRU Cache', score: 88, date: 'Yesterday', recommendation: 'Hire' },
        { title: 'Best Time to Buy & Sell Stock', score: 92, date: '2 days ago', recommendation: 'Strong Hire' },
      ],
    },
    radarScores: {
      codeQuality: 94,
      systemDesign: 88,
      problemSolving: 92,
      communication: 90,
      complexityOptimization: 93,
    },
    activityLog: [
      { text: 'Completed test cases for Two Sum & Optimization', time: '2 hours ago' },
      { text: 'Marked Day 5 milestone tasks as complete', time: '4 hours ago' },
      { text: 'Generated Gemini AI Adaptive Roadmap', time: '1 day ago' },
    ],
  },
  'user_sarah_2': {
    roadmap: {
      daysAvailable: 14,
      currentDay: 12,
      totalTasks: 42,
      completedTasks: 37,
      progressPercent: 88,
      status: 'Advanced (Near Completion)',
      lastPhase: 'Day 12 of 14: Distributed Systems & Raft',
    },
    assessments: {
      testsTaken: 5,
      avgScore: 95,
      passRate: 100,
      latestRecommendation: 'Strong Hire',
      recentTests: [
        { title: 'Distributed Rate Limiter Design', score: 98, date: 'Yesterday', recommendation: 'Strong Hire' },
        { title: 'Design LRU Cache', score: 94, date: '3 days ago', recommendation: 'Strong Hire' },
        { title: '3Sum & Multi-Pointer Convergence', score: 92, date: '4 days ago', recommendation: 'Strong Hire' },
        { title: 'Coin Change Problem', score: 96, date: '5 days ago', recommendation: 'Strong Hire' },
      ],
    },
    radarScores: {
      codeQuality: 96,
      systemDesign: 98,
      problemSolving: 94,
      communication: 93,
      complexityOptimization: 95,
    },
    activityLog: [
      { text: 'Passed all distributed test cases on Rate Limiter', time: 'Yesterday' },
      { text: 'Reviewed L6 Architectural Rubric Scorecard', time: '2 days ago' },
    ],
  },
  'user_marcus_3': {
    roadmap: {
      daysAvailable: 7,
      currentDay: 3,
      totalTasks: 21,
      completedTasks: 9,
      progressPercent: 43,
      status: 'In Progress',
      lastPhase: 'Day 3 of 7: Database Locking & Idempotency',
    },
    assessments: {
      testsTaken: 2,
      avgScore: 81,
      passRate: 100,
      latestRecommendation: 'Hire',
      recentTests: [
        { title: 'Product of Array Except Self', score: 84, date: 'Yesterday', recommendation: 'Hire' },
        { title: 'Valid Parentheses & Bracket Matching', score: 78, date: '3 days ago', recommendation: 'Hire' },
      ],
    },
    radarScores: {
      codeQuality: 82,
      systemDesign: 85,
      problemSolving: 79,
      communication: 80,
      complexityOptimization: 81,
    },
    activityLog: [
      { text: 'Submitted solution for Product of Array Except Self', time: 'Yesterday' },
    ],
  },
  'user_priya_4': {
    roadmap: {
      daysAvailable: 10,
      currentDay: 6,
      totalTasks: 30,
      completedTasks: 19,
      progressPercent: 63,
      status: 'Active (On Track)',
      lastPhase: 'Day 6 of 10: Multi-Region Resilience',
    },
    assessments: {
      testsTaken: 4,
      avgScore: 88,
      passRate: 100,
      latestRecommendation: 'Hire',
      recentTests: [
        { title: 'Search in Rotated Sorted Array', score: 90, date: '2 days ago', recommendation: 'Strong Hire' },
        { title: 'Number of Islands & Grid Traversal', score: 86, date: '3 days ago', recommendation: 'Hire' },
      ],
    },
    radarScores: {
      codeQuality: 89,
      systemDesign: 91,
      problemSolving: 85,
      communication: 87,
      complexityOptimization: 88,
    },
    activityLog: [
      { text: 'Completed Graph BFS module for Number of Islands', time: '3 days ago' },
    ],
  },
  'user_jordan_5': {
    roadmap: {
      daysAvailable: 7,
      currentDay: 1,
      totalTasks: 21,
      completedTasks: 3,
      progressPercent: 14,
      status: 'Suspended by Admin',
      lastPhase: 'Day 1 of 7: Algorithmic Foundations',
    },
    assessments: {
      testsTaken: 1,
      avgScore: 68,
      passRate: 0,
      latestRecommendation: 'Needs Practice',
      recentTests: [
        { title: 'Two Sum & Optimization', score: 68, date: '3 days ago', recommendation: 'Needs Practice' },
      ],
    },
    radarScores: {
      codeQuality: 70,
      systemDesign: 65,
      problemSolving: 68,
      communication: 72,
      complexityOptimization: 66,
    },
    activityLog: [
      { text: 'Account status set to suspended by Administrator', time: '3 days ago' },
    ],
  },
};

/**
 * Fetch all users along with their enriched candidate progress metrics
 */
export async function getAllUsersWithProgress() {
  const users = await getAllUsers();

  return users.map((user) => {
    const profile = CANDIDATE_PROGRESS_PROFILES[user.id] || {
      roadmap: {
        daysAvailable: 7,
        currentDay: 1,
        totalTasks: 21,
        completedTasks: 4,
        progressPercent: 19,
        status: user.status === 'suspended' ? 'Suspended' : 'New Candidate',
        lastPhase: 'Day 1 of 7: Initial Assessment',
      },
      assessments: {
        testsTaken: 1,
        avgScore: 82,
        passRate: 100,
        latestRecommendation: 'Hire',
        recentTests: [
          { title: 'Two Sum & Optimization', score: 82, date: 'Recently', recommendation: 'Hire' },
        ],
      },
      radarScores: {
        codeQuality: 82,
        systemDesign: 80,
        problemSolving: 81,
        communication: 84,
        complexityOptimization: 82,
      },
      activityLog: [
        { text: 'Candidate profile registered on platform', time: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently' },
      ],
    };

    return {
      ...user,
      role: user.role || (user.email === 'admin@prepai.io' ? 'admin' : 'candidate'),
      status: user.status || 'active',
      progress: profile,
    };
  });
}

/**
 * Admin: Create a new user with customizable role
 */
export async function createAdminUser({
  name,
  email,
  password = 'password123',
  role = 'candidate',
  status = 'active',
  targetRole = 'Senior Software Engineer',
  targetCompany = 'Top Tier Tech',
}) {
  await initializeUsers();
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || 'password123').trim();

  if (!cleanName) throw new Error('User name is required.');
  if (!cleanEmail) throw new Error('User email is required.');

  const users = await getAllUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('A user with this email address already exists.');
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
    role: role || 'candidate',
    status: status || 'active',
    targetRole: targetRole || 'Software Engineer',
    targetCompany: targetCompany || 'Tier-1 Tech',
    createdAt: new Date().toISOString(),
    lastActive: 'Just created',
  };

  try {
    await db.users.add(newUser);
  } catch (err) {
    // fallback
  }

  const updatedList = [newUser, ...users];
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
  return newUser;
}

/**
 * Admin: Update user details
 */
export async function updateUser(userId, updates) {
  const users = await getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) throw new Error('User not found.');

  const updated = { ...users[index], ...updates };
  users[index] = updated;

  try {
    const dbRecord = await db.users.get(userId);
    if (dbRecord) {
      await db.users.update(userId, updates);
    }
  } catch (err) {
    // fallback
  }

  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

  // If updating current session user, update session
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updatedSession = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedSession));
    notifyAuthSubscribers(updatedSession);
  }

  return updated;
}

/**
 * Admin: Delete a user
 */
export async function deleteUser(userId) {
  const users = await getAllUsers();
  const filtered = users.filter((u) => u.id !== userId);

  try {
    await db.users.delete(userId);
  } catch (err) {
    // fallback
  }

  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    logout();
  }

  return true;
}

/**
 * Admin: Toggle user status (Active <-> Suspended)
 */
export async function toggleUserStatus(userId) {
  const users = await getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error('User not found.');

  const newStatus = target.status === 'suspended' ? 'active' : 'suspended';
  return updateUser(userId, { status: newStatus });
}

/**
 * Admin: Toggle user role (Candidate <-> Admin)
 */
export async function toggleUserRole(userId) {
  const users = await getAllUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) throw new Error('User not found.');

  const newRole = target.role === 'admin' ? 'candidate' : 'admin';
  return updateUser(userId, { role: newRole });
}

/**
 * Admin: Reset user password
 */
export async function adminResetPassword(userId, newPassword = 'password123') {
  return updateUser(userId, { password: newPassword });
}

/**
 * Admin: Platform Overview Statistics
 */
export async function getPlatformOverviewStats() {
  const users = await getAllUsersWithProgress();
  const candidates = users.filter((u) => u.role === 'candidate');
  const admins = users.filter((u) => u.role === 'admin');
  const active = users.filter((u) => u.status === 'active');
  const suspended = users.filter((u) => u.status === 'suspended');

  const totalTests = candidates.reduce((acc, c) => acc + (c.progress?.assessments?.testsTaken || 0), 0);
  const avgScoreTotal = candidates.reduce((acc, c) => acc + (c.progress?.assessments?.avgScore || 0), 0);
  const platformAvgScore = candidates.length > 0 ? Math.round(avgScoreTotal / candidates.length) : 88;

  const avgCompletionTotal = candidates.reduce((acc, c) => acc + (c.progress?.roadmap?.progressPercent || 0), 0);
  const avgRoadmapCompletion = candidates.length > 0 ? Math.round(avgCompletionTotal / candidates.length) : 62;

  const strongHires = candidates.filter((c) => c.progress?.assessments?.latestRecommendation === 'Strong Hire').length;
  const strongHireRate = candidates.length > 0 ? Math.round((strongHires / candidates.length) * 100) : 60;

  return {
    totalUsers: users.length,
    candidateCount: candidates.length,
    adminCount: admins.length,
    activeCount: active.length,
    suspendedCount: suspended.length,
    totalTestsTaken: totalTests,
    platformAvgScore,
    avgRoadmapCompletion,
    strongHireRate,
  };
}
