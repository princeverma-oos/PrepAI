import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Sparkles, ArrowRight, CheckCircle2, Cpu, Check } from 'lucide-react';
import { SAMPLE_RESUMES } from '../utils/questionsData';

export default function ResumeReviewModal({ isOpen, onClose, onLaunchMock }) {
  const [activeSampleIndex, setActiveSampleIndex] = useState(0);
  const [resumeText, setResumeText] = useState(SAMPLE_RESUMES[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState({
    skills: SAMPLE_RESUMES[0].extractedSkills,
    questions: SAMPLE_RESUMES[0].tailoredQuestions,
    seniority: 'Senior / Staff (L5-L6)',
    targetReadiness: '86%',
  });

  const handleSelectSample = (idx) => {
    setActiveSampleIndex(idx);
    setResumeText(SAMPLE_RESUMES[idx].text);
    setAnalysisResult({
      skills: SAMPLE_RESUMES[idx].extractedSkills,
      questions: SAMPLE_RESUMES[idx].tailoredQuestions,
      seniority: idx === 0 ? 'Senior Fullstack (L5)' : 'Staff Distributed Systems (L6)',
      targetReadiness: idx === 0 ? '88%' : '92%',
    });
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Generate dynamic response based on resume keywords
      const lower = resumeText.toLowerCase();
      const skills = [];
      if (lower.includes('react') || lower.includes('frontend')) skills.push('React', 'State Management');
      if (lower.includes('node') || lower.includes('backend') || lower.includes('api'))
        skills.push('Distributed APIs', 'Node.js/Go');
      if (lower.includes('sql') || lower.includes('postgres') || lower.includes('database'))
        skills.push('Database Sharding', 'ACID');
      if (lower.includes('system') || lower.includes('microservices'))
        skills.push('System Architecture', 'Rate Limiting');
      if (skills.length === 0) skills.push('Problem Solving', 'Data Structures', 'System Design');

      setAnalysisResult({
        skills,
        questions: [
          'Based on your experience with high throughput services, how would you design distributed idempotent transactions?',
          'How do you manage zero-downtime database schema migrations with large table locks?',
          'Walk through how you would architect a real-time event streaming pipeline using Kafka/Redis.',
        ],
        seniority: lower.includes('staff') || lower.includes('lead') ? 'Staff / Principal' : 'Senior Engineer',
        targetReadiness: '85%',
      });
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-5xl h-[88vh] bg-[#101010] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <FileText className="w-3.5 h-3.5" />
                AI Resume Scanner & Interview Tailor
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close resume modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 overflow-hidden">
            {/* Left: Input / Sample Selector */}
            <div className="p-5 sm:p-6 border-r border-white/10 flex flex-col bg-[#121212] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-white uppercase tracking-wider">
                  Resume Content / Profile
                </label>
                <div className="flex gap-2">
                  {SAMPLE_RESUMES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(idx)}
                      className={`text-[11px] px-2.5 py-1 rounded transition-colors cursor-pointer ${
                        activeSampleIndex === idx
                          ? 'bg-primary text-black font-semibold'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {idx === 0 ? 'Fullstack' : 'Staff Backend'}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume markdown or experience text..."
                className="flex-1 w-full p-3 bg-[#181818] border border-white/10 rounded-xl text-xs sm:text-sm text-gray-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-primary min-h-[220px]"
              />

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !resumeText.trim()}
                className="mt-4 w-full py-2.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Extracting Core Competencies...' : 'Analyze & Tailor Questions'}</span>
              </button>
            </div>

            {/* Right: AI Intelligence Report */}
            <div className="p-5 sm:p-6 bg-[#101010] flex flex-col overflow-y-auto space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Extracted Career DNA</h3>
                <span className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  {analysisResult.seniority}
                </span>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider">Identified Pillars</span>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-primary" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailored Interview Questions */}
              <div className="space-y-3 flex-1">
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  Tailored High-Yield Interview Probes
                </span>
                <div className="space-y-2.5">
                  {analysisResult.questions.map((q, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#161616] border border-white/10 rounded-xl space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-mono text-xs font-bold mt-0.5">Q{i + 1}.</span>
                        <p className="text-xs sm:text-sm text-gray-200 leading-snug">{q}</p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            onClose();
                            if (onLaunchMock) onLaunchMock('system-design-rate-limiter');
                          }}
                          className="text-[11px] text-primary hover:text-[#E1E0CC] flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>Practice this in Mock Chamber</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
