import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Code2,
  CheckCircle2,
  Play,
  ChevronRight,
  Sparkles,
  BookOpen,
  Lightbulb,
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  Layers,
  Clock,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import CodeEditor from './CodeEditor';
import { MOCK_QUESTIONS } from '../utils/questionsData';
import { executeCode } from '../utils/codeRunner';
import { generateInterviewQuestionWithGemini, isGeminiConfigured } from '../utils/geminiService';

const CATEGORIES = [
  'All',
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Linked Lists',
  'Binary Search',
  'Dynamic Programming',
  'Trees & Graphs',
  'System Design',
];

export default function DsaPracticeModal({ isOpen, onClose, onLaunchMock }) {
  const [questionsList, setQuestionsList] = useState(MOCK_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState(MOCK_QUESTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(selectedQuestion.starterCode.javascript);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'solution' | 'theory' | 'testcases'
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [expandedTheoryIndex, setExpandedTheoryIndex] = useState(0);

  const filteredQuestions = questionsList.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesCat =
      categoryFilter === 'All' ||
      q.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesDiff && matchesCat;
  });

  const handleGenerateAiQuestion = async () => {
    if (!isGeminiConfigured()) {
      alert('Please configure your Gemini API Key in the AI Roadmap Builder or .env first!');
      return;
    }
    const topic = window.prompt(
      'Enter any DSA or System Design topic (e.g. Trie Prefix Tree, Dijkstra Shortest Path, Topological Sort, Edit Distance, Fenwick Tree):',
      'Trie Prefix Tree'
    );
    if (!topic || !topic.trim()) return;

    setIsGeneratingAi(true);
    try {
      const newQ = await generateInterviewQuestionWithGemini({
        topic: topic.trim(),
        targetRole: 'Software Engineer',
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : 'Medium',
      });
      setQuestionsList((prev) => [newQ, ...prev]);
      handleSelect(newQ);
    } catch (err) {
      alert('Error generating question with Gemini: ' + err.message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSelect = (q) => {
    setSelectedQuestion(q);
    setCode(q.starterCode[language] || q.starterCode.javascript);
    setTestResults(null);
    setActiveTab('editor');
    setCopiedSolution(false);
    setExpandedTheoryIndex(0);
  };

  const handleRun = () => {
    setIsRunning(true);
    setActiveTab('testcases');
    setTimeout(() => {
      const res = executeCode(code, language, selectedQuestion);
      setTestResults(res);
      setIsRunning(false);
    }, 500);
  };

  const handleCopySolution = () => {
    const solutionCode =
      selectedQuestion.solution?.[language] ||
      selectedQuestion.solution?.javascript ||
      '';
    navigator.clipboard.writeText(solutionCode);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleLoadSolutionToEditor = () => {
    const solutionCode =
      selectedQuestion.solution?.[language] ||
      selectedQuestion.solution?.javascript ||
      '';
    setCode(solutionCode);
    setActiveTab('editor');
  };

  if (!isOpen) return null;

  const currentSolution = selectedQuestion.solution;
  const theoryQuestions = selectedQuestion.theoryQuestions || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-7xl h-[92vh] bg-[#101010] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#E1E0CC]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Code2 className="w-3.5 h-3.5" />
                DSA & Architecture Practice
              </span>
              <h2 className="text-sm sm:text-base font-medium text-white hidden sm:block">
                Interactive Practice Workspace
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {onLaunchMock && (
                <button
                  onClick={() => {
                    onClose();
                    onLaunchMock(selectedQuestion.id);
                  }}
                  className="bg-primary hover:bg-[#E1E0CC] text-black font-semibold px-3 sm:px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch in Mock Chamber</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close practice modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-12 flex-1 overflow-hidden">
            {/* Left Problem List */}
            <div className="col-span-12 md:col-span-4 border-r border-white/10 flex flex-col h-full bg-[#121212] overflow-hidden">
              {/* Search & Filter & AI Generator */}
              <div className="p-3 border-b border-white/10 space-y-2.5 bg-[#141414]">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by algorithm, topic, or company..."
                    className="w-full bg-[#181818] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Difficulty Filters */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          difficultyFilter === diff
                            ? 'bg-primary text-black font-semibold'
                            : 'bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>

                  {/* Generate Bespoke Question with Gemini */}
                  <button
                    onClick={handleGenerateAiQuestion}
                    disabled={isGeneratingAi}
                    className="px-2.5 py-1 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isGeneratingAi ? 'Generating...' : '+ Gemini AI Question'}</span>
                  </button>
                </div>

                {/* Categories Filter Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded whitespace-nowrap cursor-pointer transition-colors ${
                        categoryFilter === cat
                          ? 'bg-white/20 text-white font-semibold'
                          : 'bg-white/5 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-0.5">
                  <span>Showing {filteredQuestions.length} of {questionsList.length} problems</span>
                  <span>Interactive Editor & Telemetry</span>
                </div>
              </div>

              {/* Problem List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleSelect(q)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      selectedQuestion.id === q.id
                        ? 'bg-primary/10 border-l-2 border-primary'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-white truncate max-w-[200px]">
                        {q.title}
                      </h4>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          q.difficulty === 'Hard'
                            ? 'bg-red-500/20 text-red-300'
                            : q.difficulty === 'Easy'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{q.category}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                      <span>{q.company}</span>
                      <span>{q.theoryQuestions?.length || 0} Theory Qs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Editor & Tabs Workspace */}
            <div className="col-span-12 md:col-span-8 flex flex-col h-full bg-[#101010] overflow-hidden">
              {/* Problem Statement Header */}
              <div className="p-4 border-b border-white/10 bg-[#141414]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">{selectedQuestion.title}</h3>
                  <span className="text-xs text-primary">{selectedQuestion.category}</span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                  {selectedQuestion.prompt}
                </p>
              </div>

              {/* Navigation Tabs Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'editor'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code Editor</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('solution')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'solution'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Solution & Breakdown</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('theory')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'theory'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Theory Questions ({theoryQuestions.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('testcases')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'testcases'
                        ? 'bg-primary text-black font-semibold shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Test Results {testResults && (testResults.success ? '✓' : '✗')}</span>
                  </button>
                </div>
              </div>

              {/* Main Tab Content */}
              <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col">
                {/* 1. CODE EDITOR TAB */}
                {activeTab === 'editor' && (
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                    onLanguageChange={(lang) => {
                      setLanguage(lang);
                      setCode(selectedQuestion.starterCode[lang] || selectedQuestion.starterCode.javascript);
                    }}
                    onRun={handleRun}
                    isRunning={isRunning}
                    onReset={() => setCode(selectedQuestion.starterCode[language])}
                  />
                )}

                {/* 2. DEDICATED SOLUTION TAB */}
                {activeTab === 'solution' && (
                  <div className="flex-1 bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
                    {/* Top Explanation Banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#181818] p-4 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-300 font-mono text-[10px] font-bold">
                            OPTIMAL SOLUTION
                          </span>
                          <span className="font-semibold text-white">
                            {currentSolution?.approach || 'Algorithmic Walkthrough'}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Review this reference solution if you get stuck, then try implementing it yourself.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopySolution}
                          className="px-3 py-1.5 rounded-lg border border-white/15 hover:bg-white/10 text-gray-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {copiedSolution ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Solution</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleLoadSolutionToEditor}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-[#E1E0CC] text-black font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>Load into Editor</span>
                        </button>
                      </div>
                    </div>

                    {/* Complexity Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-[#181818] p-3.5 rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Time Complexity</span>
                        </div>
                        <p className="text-gray-300 text-xs font-mono">
                          {currentSolution?.timeComplexity || 'O(N)'}
                        </p>
                      </div>

                      <div className="bg-[#181818] p-3.5 rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Space Complexity</span>
                        </div>
                        <p className="text-gray-300 text-xs font-mono">
                          {currentSolution?.spaceComplexity || 'O(N)'}
                        </p>
                      </div>
                    </div>

                    {/* Key Algorithmic Insights */}
                    {currentSolution?.keyInsights && (
                      <div className="bg-[#181818] p-4 rounded-xl border border-white/5 space-y-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                          Key Architectural Insights
                        </span>
                        <ul className="space-y-1.5 text-xs text-gray-300">
                          {currentSolution.keyInsights.map((insight, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white uppercase tracking-wider">
                          Annotated Reference Solution ({language.toUpperCase()})
                        </span>
                        <div className="flex gap-1.5">
                          {['javascript', 'python'].map((lang) => (
                            <button
                              key={lang}
                              onClick={() => setLanguage(lang)}
                              className={`text-[11px] px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                                language === lang
                                  ? 'bg-primary text-black font-semibold'
                                  : 'bg-white/5 text-gray-400 hover:text-white'
                              }`}
                            >
                              {lang === 'javascript' ? 'JavaScript' : 'Python'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <pre className="p-4 bg-[#0D0D0D] border border-white/10 rounded-xl text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
                        <code>
                          {currentSolution?.[language] ||
                            currentSolution?.javascript ||
                            '// Solution available in JavaScript and Python'}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* 3. DEDICATED THEORY QUESTIONS TAB */}
                {activeTab === 'theory' && (
                  <div className="flex-1 bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 overflow-y-auto space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Conceptual & Technical Theory Probes
                        </h4>
                        <p className="text-xs text-gray-400">
                          Interviewers ask these follow-up theoretical questions to test deep CS fundamentals and system architecture.
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                        {theoryQuestions.length} Questions
                      </span>
                    </div>

                    {theoryQuestions.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        No theory questions available for this problem yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {theoryQuestions.map((tq, idx) => {
                          const isExpanded = expandedTheoryIndex === idx;
                          return (
                            <div
                              key={tq.id || idx}
                              className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden transition-all"
                            >
                              <div
                                onClick={() =>
                                  setExpandedTheoryIndex(isExpanded ? null : idx)
                                }
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div className="space-y-0.5">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-400 uppercase font-mono">
                                      {tq.topic || 'Interview Theory'}
                                    </span>
                                    <h5 className="text-xs sm:text-sm font-medium text-white">
                                      {tq.question}
                                    </h5>
                                  </div>
                                </div>
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    isExpanded ? 'rotate-180 text-primary' : ''
                                  }`}
                                />
                              </div>

                              {isExpanded && (
                                <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-[#121212]">
                                  <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-sans pl-8">
                                    {tq.answer}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TEST CASES RESULTS TAB */}
                {activeTab === 'testcases' && (
                  <div className="flex-1 bg-[#141414] border border-white/10 rounded-xl p-4 overflow-y-auto space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-semibold text-white">Execution Telemetry</h4>
                      {testResults && (
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-400">
                            Runtime: <strong className="text-primary">{testResults.executionTimeMs}ms</strong>
                          </span>
                          <span className="text-gray-400">
                            Memory: <strong className="text-primary">{testResults.memoryEstimateMb} MB</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {testResults ? (
                      <div className="space-y-3">
                        {testResults.results.map((tc, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border text-xs font-mono ${
                              tc.passed
                                ? 'bg-green-500/5 border-green-500/20 text-green-300'
                                : 'bg-red-500/5 border-red-500/20 text-red-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold">Test Case #{tc.testCaseIndex}</span>
                              <span className="text-[11px]">{tc.passed ? '✓ PASSED' : '✗ FAILED'}</span>
                            </div>
                            <div className="text-[11px] text-gray-400">Input: {tc.input}</div>
                            <div className="text-[11px] text-gray-400">Expected: {tc.expected}</div>
                            <div className="text-[11px] font-semibold text-white">Output: {tc.actual}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500 text-xs">
                        Click "Run Code" in the editor to execute your solution against test cases.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Telemetry Footer */}
              {testResults && activeTab === 'editor' && (
                <div className="px-4 py-2.5 bg-[#161616] border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {testResults.success ? (
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> All Tests Passed
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold">Test Cases Incomplete</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-400">
                    <span>Latency: {testResults.executionTimeMs}ms</span>
                    <span>Memory: {testResults.memoryEstimateMb}MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
