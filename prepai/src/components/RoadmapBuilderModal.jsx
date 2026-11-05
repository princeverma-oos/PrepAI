import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  BookOpen,
  Target,
  BarChart3,
  Award,
  Layers,
  Clock,
  Database,
  Check,
} from 'lucide-react';
import { parseResumeFile } from '../utils/resumeParser';
import { generateAdaptiveRoadmap } from '../utils/roadmapGenerator';
import { SAMPLE_RESUMES } from '../utils/questionsData';
import { saveProfileData, saveRoadmap, getActiveRoadmap, savePerformanceReport } from '../db/db';
import {
  generateRoadmapWithGemini,
  isGeminiConfigured,
  getGeminiApiKey,
  setGeminiApiKey,
} from '../utils/geminiService';

export default function RoadmapBuilderModal({ isOpen, onClose, onLaunchMock, defaultStep = 1 }) {
  const [step, setStep] = useState(defaultStep); // 1: Input (Resume + JD + Days) | 2: Generated Roadmap View | 3: Performance Report View
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'report'

  // Form State
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [jobDescription, setJobDescription] = useState(
    `We are seeking a Senior Fullstack Engineer to architect scalable distributed systems, optimize microservices APIs, and lead frontend performance for our high-throughput platform. Requires strong algorithms, system design, and communication.`
  );
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('Google / Tier-1 Tech');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatusText, setGenStatusText] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Gemini State
  const [geminiKeyInput, setGeminiKeyInput] = useState(getGeminiApiKey());
  const [isGeminiActive, setIsGeminiActive] = useState(isGeminiConfigured());
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Active Roadmap & Selected Day View
  const [activeRoadmap, setActiveRoadmapState] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Load existing roadmap on open, or synthesize a rich default so it's never empty
  useEffect(() => {
    async function loadSaved() {
      const saved = await getActiveRoadmap();
      if (saved && saved.dailyPlans && saved.dailyPlans.length > 0) {
        setActiveRoadmapState(saved);
        setStep(defaultStep || (saved ? 2 : 1));
      } else {
        const defaultRoadmap = generateAdaptiveRoadmap({
          resumeText,
          jobDescription,
          daysAvailable: 7,
          targetCompany: 'Google / Tier-1 Tech',
          targetRole: 'Senior Full Stack Engineer',
        });
        setActiveRoadmapState(defaultRoadmap);
        await saveRoadmap(defaultRoadmap);
        setStep(defaultStep || 1);
      }
    }
    if (isOpen) {
      loadSaved();
      setIsGeminiActive(isGeminiConfigured());
      setGeminiKeyInput(getGeminiApiKey());
    }
  }, [isOpen, defaultStep]);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadedFileName(file.name);
      const parsed = await parseResumeFile(file);
      setResumeText(parsed.text);
    } catch (err) {
      console.error('File parsing error', err);
    }
  };

  // Save Gemini Key
  const handleSaveGeminiKey = (key) => {
    setGeminiApiKey(key);
    setGeminiKeyInput(key);
    setIsGeminiActive(Boolean(key && key.length > 10));
    setShowKeyConfig(false);
  };

  // Generate Roadmap
  const handleGenerate = async () => {
    setIsGenerating(true);
    let roadmap = null;

    if (isGeminiActive && isGeminiConfigured()) {
      try {
        setGenStatusText('Gemini AI analyzing competencies, gaps & timeline...');
        roadmap = await generateRoadmapWithGemini({
          resumeText,
          jobDescription,
          daysAvailable,
          targetCompany,
          targetRole,
        });
        setFeedback({
          type: 'success',
          text: `Personalized roadmap generated with Google Gemini AI (${roadmap.modelUsed || 'Flash'})!`,
        });
      } catch (err) {
        console.warn('Gemini roadmap generation failed, using algorithmic engine:', err);
        setFeedback({
          type: 'warning',
          text: `Gemini API: ${err.message}. High-speed algorithmic fallback generated your roadmap.`,
        });
        roadmap = generateAdaptiveRoadmap({
          resumeText,
          jobDescription,
          daysAvailable,
          targetCompany,
          targetRole,
        });
      }
    } else {
      setGenStatusText('Calibrating algorithmic syllabus...');
      roadmap = generateAdaptiveRoadmap({
        resumeText,
        jobDescription,
        daysAvailable,
        targetCompany,
        targetRole,
      });
      setFeedback({
        type: 'info',
        text: 'Custom algorithmic roadmap calibrated from your requirements.',
      });
    }

    // Save to database (Supabase + IndexedDB)
    await saveProfileData({
      resumeText,
      jobDescription,
      targetRole,
      targetCompany,
      daysAvailable,
    });

    await saveRoadmap(roadmap);

    setActiveRoadmapState(roadmap);
    setSelectedDayIndex(0);
    setIsGenerating(false);
    setGenStatusText('');
    setStep(2);
  };

  // Toggle Task Completion
  const handleToggleTask = async (dayIdx, taskId) => {
    if (!activeRoadmap) return;

    const updatedRoadmap = { ...activeRoadmap };
    const day = updatedRoadmap.dailyPlans[dayIdx];
    const task = day.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setActiveRoadmapState(updatedRoadmap);
      await saveRoadmap(updatedRoadmap);
    }
  };

  // Calculate Overall Progress
  const totalTasks =
    activeRoadmap?.dailyPlans?.reduce((acc, d) => acc + d.tasks.length, 0) || 1;
  const completedTasks =
    activeRoadmap?.dailyPlans?.reduce(
      (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
      0
    ) || 0;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-6xl h-[92vh] bg-[#101010] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive AI Preparation Roadmap
              </span>

              {/* View Switcher Tabs */}
              <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5">
                <button
                  onClick={() => setStep(2)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    step === 2
                      ? 'bg-primary text-black font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Daily Schedule
                </button>
                <button
                  onClick={() => setStep(1)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    step === 1
                      ? 'bg-primary text-black font-semibold shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Custom Builder & Ingestion
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close roadmap builder"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Step 1: Input Setup Form */}
          {step === 1 ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
                  Design Your Personalized Interview Master Plan
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Provide your resume in any format and target Job Description. PrepAI will calibrate an adaptive day-by-day roadmap with scheduled DSA rounds, coding tests, and study notes stored in your platform database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Resume Ingestion */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      1. Resume Ingestion (Any Format)
                    </label>
                    <div className="flex gap-1.5">
                      {SAMPLE_RESUMES.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setResumeText(s.text);
                            setUploadedFileName(null);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 cursor-pointer"
                        >
                          Preset {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Dropzone */}
                  <label className="border border-dashed border-white/20 hover:border-primary/50 bg-[#1A1A1A] rounded-xl p-4 text-center cursor-pointer transition-colors block">
                    <input
                      type="file"
                      accept=".pdf,.txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-primary mx-auto mb-1.5" />
                    <span className="text-xs text-gray-300 font-medium block">
                      {uploadedFileName ? `✓ ${uploadedFileName}` : 'Upload PDF, DOCX, TXT, or MD'}
                    </span>
                    <span className="text-[10px] text-gray-500">Auto-extracts technical experience</span>
                  </label>

                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Or paste resume markdown text here..."
                    className="flex-1 w-full p-3 bg-[#101010] border border-white/10 rounded-xl text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-primary min-h-[160px]"
                  />
                </div>

                {/* Right: Job Description & Timeline */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col">
                  <label className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    2. Target Job Description & Role
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Target Role</span>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Backend Engineer"
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Target Company</span>
                      <input
                        type="text"
                        value={targetCompany}
                        onChange={(e) => setTargetCompany(e.target.value)}
                        placeholder="e.g. Google / Meta / Startup"
                        className="w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <span className="text-[11px] text-gray-400 block mb-1">Job Description Requirements</span>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste Job Description..."
                      className="flex-1 w-full p-3 bg-[#101010] border border-white/10 rounded-xl text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-primary min-h-[100px]"
                    />
                  </div>

                  {/* Timeline Selection */}
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1.5 flex items-center justify-between">
                      <span>Timeline Duration: <strong>{daysAvailable} Days</strong></span>
                      <span className="text-[10px] text-primary">Dynamic Schedule Split</span>
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 7, 14, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDaysAvailable(d)}
                          className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            daysAvailable === d
                              ? 'bg-primary text-black'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {d} Days {d === 3 ? '⚡' : d === 7 ? '🔥' : d === 14 ? '🎯' : '🏆'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gemini AI Engine Configuration Card */}
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Google Gemini AI Engine</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isGeminiActive && isGeminiConfigured()
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        {isGeminiActive && isGeminiConfigured()
                          ? '● Gemini AI Connected'
                          : 'Algorithmic Mode'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {isGeminiActive && isGeminiConfigured()
                        ? 'Using Gemini generative AI for deep resume-to-JD gap analysis & questions'
                        : 'Add your Gemini API Key to unlock deep generative LLM analysis'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {showKeyConfig ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="password"
                        placeholder="Paste Gemini API Key..."
                        value={geminiKeyInput}
                        onChange={(e) => setGeminiKeyInput(e.target.value)}
                        className="p-1.5 px-3 bg-[#101010] border border-white/20 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveGeminiKey(geminiKeyInput)}
                        className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowKeyConfig(false)}
                        className="px-2 py-1.5 bg-white/10 text-gray-300 text-xs rounded-lg cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(true)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {isGeminiConfigured() ? '⚙️ Edit Gemini Key' : '+ Set Gemini API Key'}
                    </button>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col items-center gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !resumeText.trim()}
                  className="px-8 py-3.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-full text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-xl disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? genStatusText || 'Synthesizing Adaptive Roadmap...'
                      : isGeminiActive && isGeminiConfigured()
                      ? '✨ Generate with Google Gemini AI'
                      : 'Generate My Perfect Interview Roadmap'}
                  </span>
                </button>
                {isGenerating && genStatusText && (
                  <span className="text-xs text-cyan-400 animate-pulse">{genStatusText}</span>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Interactive Day-by-Day Roadmap Dashboard */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Status Alert Banner */}
              {feedback && (
                <div
                  className={`px-6 py-2 flex items-center justify-between text-xs font-medium border-b ${
                    feedback.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/20'
                      : feedback.type === 'warning'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/20'
                      : 'bg-cyan-950/40 text-cyan-300 border-cyan-500/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{feedback.text}</span>
                  </div>
                  <button
                    onClick={() => setFeedback(null)}
                    className="text-gray-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Roadmap Header Stats Banner */}
              <div className="px-6 py-3 bg-[#141414] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 sm:gap-6">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Engine</span>
                    {activeRoadmap?.isGeminiGenerated ? (
                      <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Gemini AI
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Algorithmic
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Timeline</span>
                    <span className="text-sm font-semibold text-white">
                      {activeRoadmap?.daysAvailable} Days Total
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Skill Match</span>
                    <span className="text-sm font-semibold text-green-400">
                      {activeRoadmap?.matchPercentage}% Calibrated
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Tasks Completed</span>
                    <span className="text-sm font-semibold text-primary">
                      {completedTasks} / {totalTasks} ({progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar & New Roadmap Button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-28 sm:w-36 h-2 bg-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-primary font-bold">{progressPercent}%</span>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium rounded-lg text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>+ Rebuild Plan</span>
                  </button>
                </div>
              </div>

              {/* Skills Gap Analysis Bar */}
              {(activeRoadmap?.missingSkills?.length > 0 || activeRoadmap?.skillsExtracted?.length > 0) && (
                <div className="px-6 py-2 bg-[#121212] border-b border-white/5 flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="text-gray-400 font-medium">AI Gap Analysis:</span>
                  {activeRoadmap.skillsExtracted?.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ {s}
                    </span>
                  ))}
                  {activeRoadmap.missingSkills?.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Target Gap: {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Main Day-by-Day Workspace Grid */}
              <div className="grid grid-cols-12 flex-1 overflow-hidden">
                {/* Left Column: Days Sidebar */}
                <div className="col-span-12 md:col-span-4 border-r border-white/10 bg-[#121212] overflow-y-auto divide-y divide-white/5">
                  {activeRoadmap?.dailyPlans.map((day, idx) => {
                    const dayCompleted = day.tasks.every((t) => t.completed);
                    const isSelected = selectedDayIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-l-4 border-primary'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold text-primary">{day.phase}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                            {day.estimatedHours} hrs
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-medium text-white truncate">{day.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-[11px]">
                          <span className="text-gray-400 truncate max-w-[180px]">{day.category}</span>
                          {dayCompleted ? (
                            <span className="text-green-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {day.tasks.filter((t) => t.completed).length}/{day.tasks.length} tasks
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Selected Day Detail View */}
                {activeRoadmap?.dailyPlans[selectedDayIndex] && (
                  <div className="col-span-12 md:col-span-8 bg-[#101010] p-6 overflow-y-auto space-y-6">
                    {/* Day Banner */}
                    <div className="space-y-1 border-b border-white/10 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-primary font-bold">
                          {activeRoadmap.dailyPlans[selectedDayIndex].phase}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {activeRoadmap.dailyPlans[selectedDayIndex].category}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white">
                        {activeRoadmap.dailyPlans[selectedDayIndex].title}
                      </h3>
                    </div>

                    {/* Study Notes & Guide */}
                    <div className="bg-[#161616] p-5 rounded-2xl border border-white/10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" />
                        <span>Core Concept Study Notes & Architectural Guidance</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                        {activeRoadmap.dailyPlans[selectedDayIndex].studyGuide}
                      </div>
                    </div>

                    {/* Interactive Tasks Checklist */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center justify-between">
                        <span>Milestone Action Items (Stored in Database)</span>
                        <span className="text-[10px] text-gray-500">Click circle to mark complete</span>
                      </h4>
                      <div className="space-y-2">
                        {activeRoadmap.dailyPlans[selectedDayIndex].tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleToggleTask(selectedDayIndex, task.id)}
                            className="flex items-center gap-3 p-3.5 bg-[#141414] border border-white/5 rounded-xl hover:border-white/20 transition-all cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            )}
                            <span
                              className={`text-xs sm:text-sm ${
                                task.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* In-Platform Coding / DSA Test Round Trigger */}
                    <div className="p-5 bg-gradient-to-r from-primary/10 via-[#181818] to-[#141414] border border-primary/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                          <h4 className="text-sm font-semibold text-white">
                            Scheduled In-Platform Coding Test Round
                          </h4>
                        </div>
                        <p className="text-xs text-gray-400">
                          Execute code in the live editor with telemetry, test cases, and AI proctoring.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onLaunchMock) {
                            onLaunchMock(activeRoadmap.dailyPlans[selectedDayIndex].questionId);
                          }
                        }}
                        className="px-5 py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 flex-shrink-0 shadow-lg"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Coding Round</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
