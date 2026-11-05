import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map, CheckCircle2, Circle, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

const ROADMAP_MODULES = [
  {
    phase: 'Phase 1',
    title: 'Algorithmic Foundations & Pattern Intuition',
    duration: '2 Weeks',
    topics: [
      { name: 'Two Pointers & Sliding Window', completed: true, questionId: 'two-sum' },
      { name: 'Prefix Sums & Frequency Maps', completed: true, questionId: 'two-sum' },
      { name: 'Fast & Slow Pointers (Cycle Detection)', completed: false, questionId: 'two-sum' },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Complex Data Structures & Memory Hierarchy',
    duration: '3 Weeks',
    topics: [
      { name: 'LRU & LFU Cache Implementations', completed: true, questionId: 'lru-cache' },
      { name: 'Monotonic Stack & Priority Queues', completed: false, questionId: 'two-sum' },
      { name: 'Trie Trees & Multi-Pattern Search', completed: false, questionId: 'two-sum' },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Distributed Systems & Scalability Architecture',
    duration: '3 Weeks',
    topics: [
      { name: 'Distributed Rate Limiters & Token Buckets', completed: false, questionId: 'system-design-rate-limiter' },
      { name: 'Consistent Hashing & Partitioning Schemes', completed: false, questionId: 'system-design-rate-limiter' },
      { name: 'Event-Driven Messaging & Idempotency', completed: false, questionId: 'system-design-rate-limiter' },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Executive Behavioral & STAR Communication',
    duration: '1 Week',
    topics: [
      { name: 'Conflict Resolution & Technical RFCs', completed: false, questionId: 'behavioral-conflict' },
      { name: 'Mentorship & Cross-Functional Alignment', completed: false, questionId: 'behavioral-conflict' },
    ],
  },
];

export default function RoadmapModal({ isOpen, onClose, onLaunchMock }) {
  const [modules, setModules] = useState(ROADMAP_MODULES);

  const toggleTopic = (moduleIdx, topicIdx) => {
    setModules((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[moduleIdx].topics[topicIdx].completed = !copy[moduleIdx].topics[topicIdx].completed;
      return copy;
    });
  };

  if (!isOpen) return null;

  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = modules.reduce(
    (acc, m) => acc + m.topics.filter((t) => t.completed).length,
    0
  );
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-4xl h-[88vh] bg-[#101010] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Map className="w-3.5 h-3.5" />
                Adaptive Prep Roadmap
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close roadmap modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar Header */}
          <div className="px-6 py-4 bg-[#141414] border-b border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-gray-400">Curated Milestone Progression</span>
              <div className="text-sm font-semibold text-white">
                {completedTopics} of {totalTopics} Mastery Topics Completed ({progressPercent}%)
              </div>
            </div>
            <div className="w-36 h-2 bg-black rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {modules.map((m, mIdx) => (
              <div key={mIdx} className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-semibold">
                      {m.phase}
                    </span>
                    <h3 className="text-sm sm:text-base font-semibold text-white">{m.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500">{m.duration}</span>
                </div>

                <div className="space-y-2">
                  {m.topics.map((t, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex items-center justify-between p-3 bg-[#1A1A1A] border border-white/5 rounded-xl hover:border-white/20 transition-all"
                    >
                      <div
                        onClick={() => toggleTopic(mIdx, tIdx)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        {t.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
                            t.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                          }`}
                        >
                          {t.name}
                        </span>
                      </div>

                      {t.questionId && (
                        <button
                          onClick={() => {
                            onClose();
                            if (onLaunchMock) onLaunchMock(t.questionId);
                          }}
                          className="text-[11px] text-primary hover:text-[#E1E0CC] flex items-center gap-1 font-medium cursor-pointer ml-3 flex-shrink-0"
                        >
                          <span>Practice</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
