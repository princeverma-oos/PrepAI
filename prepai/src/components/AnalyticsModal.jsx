import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, TrendingUp, Award, Clock, ArrowRight, Target, CheckCircle2 } from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose, onLaunchMock }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('prepai_history') || '[]');
      if (stored.length === 0) {
        // Seed default sample data if empty
        const sampleHistory = [
          {
            id: 'eval_1',
            date: 'Aug 24, 2026',
            questionTitle: 'Two Sum & Optimization',
            category: 'Data Structures & Algorithms',
            difficulty: 'Medium',
            overallScore: 92,
            recommendation: 'Strong Hire',
            timeTakenFormatted: '18m 40s',
            metrics: { codeQuality: 95, complexityOptimization: 90, communication: 88, problemSolving: 94 },
          },
          {
            id: 'eval_2',
            date: 'Aug 22, 2026',
            questionTitle: 'Distributed Rate Limiter Design',
            category: 'System Design',
            difficulty: 'Medium',
            overallScore: 86,
            recommendation: 'Hire',
            timeTakenFormatted: '26m 15s',
            metrics: { codeQuality: 84, complexityOptimization: 88, communication: 90, problemSolving: 82 },
          },
        ];
        setHistory(sampleHistory);
      } else {
        setHistory(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((acc, curr) => acc + (curr.overallScore || 85), 0) / history.length)
      : 88;

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
                <BarChart3 className="w-3.5 h-3.5" />
                Performance & Readiness Analytics
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close analytics modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Top Stat Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#161616] p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Estimated Readiness</span>
                <div className="text-3xl font-bold text-primary mt-1">{avgScore}%</div>
                <span className="text-[11px] text-green-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" /> Top 10% candidate pool
                </span>
              </div>

              <div className="bg-[#161616] p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Sessions Completed</span>
                <div className="text-3xl font-bold text-white mt-1">{history.length}</div>
                <span className="text-[11px] text-gray-400">Total Mock Evaluations</span>
              </div>

              <div className="bg-[#161616] p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Avg Response Latency</span>
                <div className="text-3xl font-bold text-white mt-1">21m</div>
                <span className="text-[11px] text-gray-400">Ideal target: &lt; 25m</span>
              </div>

              <div className="bg-[#161616] p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] text-gray-400 uppercase tracking-wider">Target Level</span>
                <div className="text-3xl font-bold text-[#E1E0CC] mt-1">L5 Senior</div>
                <span className="text-[11px] text-primary">FAANG / Tier-1 Ready</span>
              </div>
            </div>

            {/* Radar Dimension Progress Bars */}
            <div className="bg-[#161616] p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-semibold text-white">Competency Radar Dimensions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Data Structures & Algorithms', score: 92 },
                  { label: 'System Design & Scalability', score: 86 },
                  { label: 'Communication & Tone Clarity', score: 89 },
                  { label: 'Concurrency & Edge-Case Handling', score: 82 },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5 bg-[#121212] p-3.5 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-300 font-medium">{item.label}</span>
                      <span className="text-primary font-bold">{item.score}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Session Logs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Recent Assessment Records</h3>
                <button
                  onClick={() => {
                    onClose();
                    if (onLaunchMock) onLaunchMock();
                  }}
                  className="text-xs text-primary hover:text-[#E1E0CC] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <span>Start New Mock</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-[#141414] border border-white/10 rounded-xl flex items-center justify-between hover:border-primary/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {record.questionTitle}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {record.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{record.date}</span>
                        <span>•</span>
                        <span>Time: {record.timeTakenFormatted}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{record.overallScore}%</div>
                      <span className="text-[10px] text-green-400 font-medium">
                        {record.recommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
