import React from 'react';
import { Copy, Check, RotateCcw, Play } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  language = 'javascript',
  onLanguageChange,
  onRun,
  isRunning = false,
  onReset,
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = Math.max(12, (code || '').split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#141414] rounded-xl border border-white/10 overflow-hidden font-mono text-xs sm:text-sm">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#1A1A1A] border-b border-white/10 text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          {onLanguageChange && (
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Programming Language"
              className="bg-black/50 border border-white/10 text-[#E1E0CC] rounded px-2 py-0.5 text-xs focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="javascript">JavaScript (ES6)</option>
              <option value="python">Python 3</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 hover:text-[#E1E0CC] hover:bg-white/5 rounded transition-colors cursor-pointer"
              title="Reset starter code"
              aria-label="Reset code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:text-[#E1E0CC] hover:bg-white/5 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
            title="Copy code"
            aria-label="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {onRun && (
            <button
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-primary hover:bg-[#E1E0CC] text-black font-semibold px-3 py-1 rounded text-xs transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex flex-1 relative overflow-hidden bg-[#101010]">
        {/* Line Numbers */}
        <div className="select-none text-right pr-3 pl-3 py-3 text-gray-600 bg-[#0C0C0C] border-r border-white/5 font-mono text-[11px] leading-5 w-10 sm:w-12">
          {lineNumbers.map((num) => (
            <div key={num}>{num}</div>
          ))}
        </div>

        {/* Textarea Input */}
        <div className="relative flex-1 h-full">
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Code Editor Input"
            className="w-full h-full p-3 bg-transparent text-[#E1E0CC] font-mono text-xs sm:text-sm leading-5 resize-none focus:outline-none selection:bg-primary/20 selection:text-white"
            style={{ tabSize: 2 }}
          />
        </div>
      </div>
    </div>
  );
}
