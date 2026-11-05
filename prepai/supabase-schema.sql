-- ==============================================================================
-- PrepAI — Supabase Cloud Database Schema
-- Copy and paste this script into your Supabase Dashboard:
-- SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Profiles Table (Candidate skill matrix & target roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_role TEXT,
  days_available INT,
  skills TEXT[] DEFAULT '{}',
  seniority TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Roadmaps Table (N-Day study plans & curriculum)
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_role TEXT,
  target_company TEXT,
  days_count INT,
  daily_plans JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Assessments Table (Coding submissions & test results)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_title TEXT,
  overall_score NUMERIC,
  scorecard JSONB DEFAULT '{}'::jsonb,
  test_results JSONB DEFAULT '[]'::jsonb,
  candidate_code TEXT,
  execution_time_ms INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reports Table (Performance scorecards & 5-pillar radar charts)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  overall_readiness NUMERIC,
  radar_scores JSONB DEFAULT '{}'::jsonb,
  strengths TEXT[] DEFAULT '{}',
  growth_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) with public access policies for anonymous demo client
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access using Anon Key
CREATE POLICY "Allow public read/insert on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on roadmaps" ON public.roadmaps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on assessments" ON public.assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
