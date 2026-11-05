import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BarChart3,
  HelpCircle,
  Volume2,
  RefreshCw,
  ArrowRight,
  Code2,
  Lightbulb,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  Cpu,
  Layers,
} from 'lucide-react';
import CodeEditor from './CodeEditor';
import { MOCK_QUESTIONS } from '../utils/questionsData';
import { executeCode, generateScorecard } from '../utils/codeRunner';
import {
  askGeminiProctor,
  generateInterviewQuestionWithGemini,
  isGeminiConfigured,
} from '../utils/geminiService';

export default function MockInterviewModal({ isOpen, onClose, initialQuestionId = null }) {
  const [questionsList, setQuestionsList] = useState(MOCK_QUESTIONS);
  const [selectedQuestion, setSelectedQuestion] = useState(
    MOCK_QUESTIONS.find((q) => q.id === initialQuestionId) || MOCK_QUESTIONS[0]
  );
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(selectedQuestion.starterCode.javascript);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'solution' | 'theory' | 'testcases'
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [expandedTheoryIndex, setExpandedTheoryIndex] = useState(0);

  // Live Timer
  const [secondsLeft, setSecondsLeft] = useState(selectedQuestion.timeLimitMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Chat & AI Proctor Log
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: selectedQuestion.aiProctorResponses[0],
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Evaluation Scorecard View
  const [scorecard, setScorecard] = useState(null);

  useEffect(() => {
    if (initialQuestionId) {
      const q = MOCK_QUESTIONS.find((item) => item.id === initialQuestionId);
      if (q) {
        setSelectedQuestion(q);
        setCode(q.starterCode[language] || q.starterCode.javascript);
        setSecondsLeft(q.timeLimitMinutes * 60);
      }
    }
  }, [initialQuestionId, language]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && secondsLeft > 0 && !scorecard) {
      interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsLeft, scorecard]);

  // Handle Question change
  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setCode(q.starterCode[language] || q.starterCode.javascript);
    setSecondsLeft(q.timeLimitMinutes * 60);
    setTestResults(null);
    setScorecard(null);
    setHintIndex(0);
    setActiveTab('editor');
    setCopiedSolution(false);
    setExpandedTheoryIndex(0);
    setChatLog([
      {
        sender: 'ai',
        text: q.aiProctorResponses[0],
        time: 'Just now',
      },
    ]);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (selectedQuestion.starterCode[lang]) {
      setCode(selectedQuestion.starterCode[lang]);
    }
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

  // Run Code
  const handleRunCode = () => {
    setIsRunning(true);
    setActiveTab('testcases');
    setTimeout(() => {
      const result = executeCode(code, language, selectedQuestion);
      setTestResults(result);
      setIsRunning(false);

      // Trigger realistic AI Proctor feedback
      if (result.success) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'All test cases passed cleanly! Consider discussing edge-case performance and concurrency bounds with me.',
            time: 'Just now',
          },
        ]);
      }
    }, 600);
  };

  // Generate New Bespoke Question with Gemini
  const handleGenerateNewQuestion = async () => {
    if (!isGeminiConfigured()) {
      alert('Please add your Gemini API Key in the Roadmap Builder or .env file first!');
      return;
    }
    const topic = window.prompt(
      'Enter interview topic or algorithm (e.g. Graph BFS, Dynamic Programming, Redis Token Bucket):',
      'Graph BFS & Shortest Path'
    );
    if (!topic || !topic.trim()) return;

    setIsGeneratingQuestion(true);
    try {
      const newQ = await generateInterviewQuestionWithGemini({
        topic: topic.trim(),
        targetRole: 'Software Engineer',
        difficulty: 'Medium',
      });
      setQuestionsList((prev) => [newQ, ...prev]);
      handleSelectQuestion(newQ);
    } catch (err) {
      alert('Error generating question with Gemini: ' + err.message);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Send Message to AI Proctor
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    const updatedHistory = [...chatLog, { sender: 'user', text: userMsg, time: 'Just now' }];
    setChatLog(updatedHistory);
    setInputMessage('');
    setIsAiThinking(true);

    if (isGeminiConfigured()) {
      try {
        const reply = await askGeminiProctor({
          questionTitle: selectedQuestion.title,
          problemDescription: selectedQuestion.prompt || selectedQuestion.description || '',
          candidateCode: code,
          candidateMessage: userMsg,
          chatHistory: updatedHistory,
        });
        setChatLog((prev) => [...prev, { sender: 'ai', text: reply, time: 'Just now' }]);
        setIsAiThinking(false);
        return;
      } catch (err) {
        console.warn('Gemini proctor failed, using fallback:', err);
      }
    }

    setTimeout(() => {
      const proctorReplies = selectedQuestion.aiProctorResponses || [
        'Understood. How would you adjust your space-time trade-off if this was deployed across a globally partitioned cluster?'
      ];
      const randomReply =
        proctorReplies[Math.min(chatLog.length, proctorReplies.length - 1)] ||
        'Good consideration. Walk me through the invariant properties of your data structure.';

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: randomReply,
          time: 'Just now',
        },
      ]);
      setIsAiThinking(false);
    }, 800);
  };

  // Provide Next Hint
  const handleRequestHint = () => {
    if (hintIndex < selectedQuestion.hints.length) {
      const hintText = selectedQuestion.hints[hintIndex];
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `💡 Hint (${hintIndex + 1}/${selectedQuestion.hints.length}): ${hintText}`,
          time: 'Just now',
        },
      ]);
      setHintIndex((prev) => prev + 1);
    }
  };

  // Finish Interview & Generate Rubrics
  const handleFinishInterview = () => {
    const elapsedSeconds = selectedQuestion.timeLimitMinutes * 60 - secondsLeft;
    const card = generateScorecard(selectedQuestion, code, chatLog, elapsedSeconds);
    setScorecard(card);

    // Save to local storage for Analytics tracking
    try {
      const existing = JSON.parse(localStorage.getItem('prepai_history') || '[]');
      localStorage.setItem('prepai_history', JSON.stringify([card, ...existing]));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
          {/* ── Top Header ── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#161616]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Live Interview Simulator
              </span>
              <h2 className="text-sm sm:text-base font-medium text-white hidden md:block">
                {selectedQuestion.title}
              </h2>
            </div>

            {/* Middle: Timer & Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1 rounded-full text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className={secondsLeft < 300 ? 'text-red-400 font-bold' : 'text-[#E1E0CC]'}>
                  {timeFormatted}
                </span>
              </div>

              {!scorecard && (
                <button
                  onClick={handleFinishInterview}
                  className="bg-primary hover:bg-[#E1E0CC] text-black font-semibold px-3 sm:px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Finish & Grade</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close interview chamber"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Main Workspace Body ── */}
          {!scorecard ? (
            <div className="grid grid-cols-12 flex-1 overflow-hidden">
              {/* Left Column: Problem Statement & AI Proctor Chat */}
              <div className="col-span-12 lg:col-span-5 border-r border-white/10 flex flex-col h-full bg-[#121212] overflow-hidden">
                {/* Question Selector & Meta */}
                <div className="p-3 sm:p-4 border-b border-white/10 bg-[#161616]/70 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedQuestion.id}
                      onChange={(e) => {
                        const q = questionsList.find((item) => item.id === e.target.value);
                        if (q) handleSelectQuestion(q);
                      }}
                      aria-label="Select interview problem"
                      className="bg-[#1A1A1A] border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
                    >
                      {questionsList.map((q) => (
                        <option key={q.id} value={q.id}>
                          [{q.difficulty}] {q.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleGenerateNewQuestion}
                      disabled={isGeneratingQuestion}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                      title="Generate bespoke question with Gemini AI"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isGeneratingQuestion ? 'Creating...' : '+ Gemini Question'}</span>
                    </button>
                  </div>

                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-400">
                    {selectedQuestion.company || 'Technical Drill'}
                  </span>
                </div>

                {/* Question Description */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 border-b border-white/10 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {selectedQuestion.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        selectedQuestion.difficulty === 'Hard'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-yellow-500/10 text-yellow-400'
                      }`}
                    >
                      {selectedQuestion.difficulty}
                    </span>
                  </div>

                  <div className="prose prose-invert prose-sm text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line font-sans">
                    {selectedQuestion.prompt}
                  </div>

                  {/* Hint Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleRequestHint}
                      disabled={hintIndex >= selectedQuestion.hints.length}
                      className="inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>
                        {hintIndex >= selectedQuestion.hints.length
                          ? 'All hints unlocked'
                          : `Need a hint? (${selectedQuestion.hints.length - hintIndex} left)`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* AI Proctor Live Interaction Chamber */}
                <div className="h-[220px] sm:h-[260px] flex flex-col bg-[#0E0E0E] border-t border-white/10">
                  {/* Voice / Audio Visualizer Bar */}
                  <div className="px-4 py-2 border-b border-white/5 bg-[#141414] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                      <span className="text-[11px] text-gray-400 font-medium">AI Proctor Active</span>
                    </div>
                    {/* Simulated Audio Soundwave Bars */}
                    <div className="flex items-center gap-1 h-3">
                      {[40, 70, 90, 60, 100, 50, 80, 45, 65].map((h, i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-primary/70 rounded-full animate-pulse"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: '1.2s',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                    {chatLog.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-[10px] font-bold">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[82%] px-3 py-2 rounded-xl ${
                            msg.sender === 'user'
                              ? 'bg-primary text-black font-medium'
                              : 'bg-[#1A1A1A] border border-white/10 text-gray-200'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isAiThinking && (
                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                        <span>PrepAI is formulating critique...</span>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="p-2 border-t border-white/10 flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask proctor for clarification or explain logic..."
                      className="flex-1 bg-[#181818] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-primary placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="bg-primary hover:bg-[#E1E0CC] text-black p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      aria-label="Send message to proctor"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Code Editor & Execution Test Suite */}
              <div className="col-span-12 lg:col-span-7 flex flex-col h-full bg-[#101010]">
                {/* Editor Tabs Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/10">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setActiveTab('editor')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                        activeTab === 'editor'
                          ? 'bg-primary text-black font-semibold shadow-sm'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Solution Editor</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('solution')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
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
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
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
                      className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
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

                {/* Editor Content Area */}
                <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col">
                  {/* 1. SOLUTION EDITOR */}
                  {activeTab === 'editor' && (
                    <CodeEditor
                      code={code}
                      onChange={setCode}
                      language={language}
                      onLanguageChange={handleLanguageChange}
                      onRun={handleRunCode}
                      isRunning={isRunning}
                      onReset={() => setCode(selectedQuestion.starterCode[language])}
                    />
                  )}

                  {/* 2. DEDICATED SOLUTION TAB */}
                  {activeTab === 'solution' && (
                    <div className="flex-1 bg-[#141414] border border-white/10 rounded-xl p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
                      {/* Top Action Banner */}
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
                            If you are stuck during the simulation, review the optimal solution and load it into your editor.
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

                      {/* Complexity Grid */}
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

                      {/* Key Insights */}
                      {currentSolution?.keyInsights && (
                        <div className="bg-[#181818] p-4 rounded-xl border border-white/5 space-y-2">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                            Key Architectural Takeaways
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

                      {/* Annotated Code Block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white uppercase tracking-wider">
                            Optimal Implementation ({language.toUpperCase()})
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
                              '// Optimal solution available in JavaScript and Python'}
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
                            Interview Follow-Up Theory & Conceptual Probes
                          </h4>
                          <p className="text-xs text-gray-400">
                            Technical interviewers frequently pose these conceptual questions during live coding rounds.
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
                          {theoryQuestions.length} Questions
                        </span>
                      </div>

                      {theoryQuestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-xs">
                          No theory questions available for this problem.
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
                                      {tq.topic || 'Interview Concept'}
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

                {/* 4. TEST RESULTS TAB */}
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
              </div>
            </div>
          ) : (
            /* ── AI Scorecard & Rubrics Modal View ── */
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                  Assessment Completed
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-white">
                  PrepAI Intelligent Performance Rubric
                </h3>
                <p className="text-xs sm:text-sm text-gray-400">
                  Evaluation for {scorecard.questionTitle} ({scorecard.category})
                </p>
              </div>

              {/* Scorecard Hero Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#181818] p-5 rounded-2xl border border-white/10 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Overall Score</span>
                  <div className="text-4xl sm:text-5xl font-bold text-primary my-1">
                    {scorecard.overallScore}%
                  </div>
                  <span className="text-xs text-green-400 font-medium">{scorecard.recommendation}</span>
                </div>

                <div className="bg-[#181818] p-5 rounded-2xl border border-white/10 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Time Invested</span>
                  <div className="text-3xl sm:text-4xl font-bold text-white my-2">
                    {scorecard.timeTakenFormatted}
                  </div>
                  <span className="text-xs text-gray-400">Paced within standard target</span>
                </div>

                <div className="bg-[#181818] p-5 rounded-2xl border border-white/10 text-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Hiring Bar Target</span>
                  <div className="text-3xl sm:text-4xl font-bold text-[#E1E0CC] my-2">L5 / Senior</div>
                  <span className="text-xs text-primary">Top 12% Candidate Benchmark</span>
                </div>
              </div>

              {/* Dimension Metrics */}
              <div className="bg-[#161616] p-6 rounded-2xl border border-white/10 space-y-4">
                <h4 className="text-sm font-semibold text-white">Detailed Dimension Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(scorecard.metrics).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-primary font-bold">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#161616] p-5 rounded-2xl border border-green-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-xs font-semibold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Demonstrated Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {scorecard.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#161616] p-5 rounded-2xl border border-yellow-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Areas For High-Yield Growth</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {scorecard.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-center gap-4 pt-4 pb-2">
                <button
                  onClick={() => setScorecard(null)}
                  className="px-5 py-2 rounded-full border border-white/20 text-white text-xs hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Return to Workspace
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-primary text-black font-semibold text-xs hover:bg-[#E1E0CC] transition-colors cursor-pointer"
                >
                  Done & Save Assessment
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
