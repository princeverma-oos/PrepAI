import Dexie from 'dexie';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const db = new Dexie('PrepAIDatabaseV3');

db.version(1).stores({
  users: '++id, email, name, targetRole, createdAt',
  profiles: '++id, targetRole, daysAvailable, createdAt',
  roadmaps: '++id, targetRole, targetCompany, createdAt',
  assessments: '++id, questionTitle, overallScore, createdAt',
  reports: '++id, overallReadiness, createdAt',
});

// Helper database functions with Supabase sync + Dexie local resilience

export async function saveProfileData(profile) {
  // 1. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('profiles').insert([
        {
          target_role: profile.targetRole,
          days_available: profile.daysAvailable,
          skills: profile.skills || [],
          seniority: profile.seniority || '',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase profile save error:', err);
    }
  }

  // 2. Local IndexedDB save
  try {
    const { id, ...data } = profile;
    await db.profiles.add({ ...data, createdAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Dexie save error, falling back to localStorage', err);
  }

  // 3. LocalStorage fallback
  const existing = JSON.parse(localStorage.getItem('prepai_profiles') || '[]');
  const newProfile = { ...profile, id: Date.now(), createdAt: new Date().toISOString() };
  localStorage.setItem('prepai_profiles', JSON.stringify([newProfile, ...existing]));
  return newProfile.id;
}

export async function saveRoadmap(roadmap) {
  // 1. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('roadmaps').insert([
        {
          target_role: roadmap.targetRole,
          target_company: roadmap.targetCompany,
          days_count: roadmap.daysCount,
          daily_plans: roadmap.dailyPlans,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase roadmap save error:', err);
    }
  }

  // 2. Local IndexedDB save
  try {
    const { id, ...data } = roadmap;
    await db.roadmaps.add({ ...data, createdAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Dexie save error, falling back to localStorage', err);
  }

  // 3. LocalStorage fallback
  localStorage.setItem('prepai_active_roadmap', JSON.stringify(roadmap));
  return Date.now();
}

export async function getActiveRoadmap() {
  // 1. Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        return {
          id: item.id,
          targetRole: item.target_role,
          targetCompany: item.target_company,
          daysCount: item.days_count,
          dailyPlans: item.daily_plans,
          createdAt: item.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase get roadmap error, checking local:', err);
    }
  }

  // 2. Try IndexedDB
  try {
    const latest = await db.roadmaps.orderBy('id').reverse().first();
    if (latest && latest.dailyPlans) return latest;
  } catch (err) {
    console.warn('Dexie load error', err);
  }

  // 3. LocalStorage fallback
  try {
    const fallback = localStorage.getItem('prepai_active_roadmap');
    return fallback ? JSON.parse(fallback) : null;
  } catch (err) {
    console.warn('LocalStorage load error', err);
    return null;
  }
}

export async function saveAssessmentResult(result) {
  // 1. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('assessments').insert([
        {
          question_title: result.questionTitle,
          overall_score: result.overallScore,
          scorecard: result.scorecard,
          test_results: result.testResults,
          candidate_code: result.code || '',
          execution_time_ms: result.executionTimeMs || 0,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase assessment save error:', err);
    }
  }

  // 2. Local IndexedDB save
  try {
    await db.assessments.add({
      ...result,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Dexie assessment save error', err);
  }

  // 3. LocalStorage fallback
  const existing = JSON.parse(localStorage.getItem('prepai_history') || '[]');
  localStorage.setItem('prepai_history', JSON.stringify([result, ...existing]));
}

export async function getAllAssessments() {
  // 1. Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          questionTitle: item.question_title,
          overallScore: item.overall_score,
          scorecard: item.scorecard,
          testResults: item.test_results,
          code: item.candidate_code,
          executionTimeMs: item.execution_time_ms,
          createdAt: item.created_at,
        }));
      }
    } catch (err) {
      console.warn('Supabase get assessments error, falling back to local:', err);
    }
  }

  // 2. Try IndexedDB
  try {
    const records = await db.assessments.orderBy('id').reverse().toArray();
    if (records && records.length > 0) return records;
  } catch (err) {
    console.warn('Dexie get assessments error', err);
  }

  // 3. LocalStorage fallback
  const fallback = localStorage.getItem('prepai_history');
  return fallback ? JSON.parse(fallback) : [];
}

export async function savePerformanceReport(report) {
  // 1. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('reports').insert([
        {
          overall_readiness: report.overallReadiness,
          radar_scores: report.radarScores,
          strengths: report.strengths || [],
          growth_areas: report.growthAreas || [],
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.warn('Supabase report save error:', err);
    }
  }

  // 2. Local IndexedDB save
  try {
    await db.reports.add({
      ...report,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Dexie report save error', err);
  }

  // 3. LocalStorage fallback
  localStorage.setItem('prepai_latest_report', JSON.stringify(report));
}

export async function getLatestReport() {
  // 1. Try Supabase first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const item = data[0];
        return {
          id: item.id,
          overallReadiness: item.overall_readiness,
          radarScores: item.radar_scores,
          strengths: item.strengths,
          growthAreas: item.growth_areas,
          createdAt: item.created_at,
        };
      }
    } catch (err) {
      console.warn('Supabase get report error, falling back to local:', err);
    }
  }

  // 2. Try IndexedDB
  try {
    const latest = await db.reports.orderBy('id').reverse().first();
    if (latest) return latest;
  } catch (err) {
    console.warn('Dexie get report error', err);
  }

  // 3. LocalStorage fallback
  const fallback = localStorage.getItem('prepai_latest_report');
  return fallback ? JSON.parse(fallback) : null;
}
