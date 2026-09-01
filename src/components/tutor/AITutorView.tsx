import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  HelpCircle, 
  BookOpen, 
  Calculator, 
  Atom, 
  PenTool, 
  Flame,
  WifiOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

export const AITutorView: React.FC = () => {
  const { chatMessages, isTutorTyping, sendTutorMessage, clearChatHistory } = useApp();
  const toast = useToast();

  const [inputQuery, setInputQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTutorTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isTutorTyping) return;
    const text = inputQuery;
    setInputQuery('');
    await sendTutorMessage(text);
  };

  const handleSuggestedClick = async (question: string) => {
    if (isTutorTyping) return;
    await sendTutorMessage(question);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.info('Response copied to clipboard!', 'Copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleCategories = [
    { label: 'Study Methods', query: 'Explain the Feynman Technique', icon: BookOpen },
    { label: 'Active Recall', query: 'What is Active Recall and how do I do it?', icon: Flame },
    { label: 'Calculus Derivatives', query: 'How do I solve calculus derivatives with the Chain Rule?', icon: Calculator },
    { label: 'Physics Mechanics', query: 'Explain Newton’s Laws and Free Body Diagrams', icon: Atom },
    { label: 'Essay Writing', query: 'How to write a strong thesis statement for an argumentative essay?', icon: PenTool },
    { label: 'Emergency Exam Prep', query: 'How to prepare for an exam in 3 days without burning out?', icon: HelpCircle },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[580px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm shadow-indigo-600/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                AI Study Tutor
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <WifiOff className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Offline Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive academic problem solver, concepts explainer & study method advisor.
            </p>
          </div>
        </div>

        <button
          onClick={clearChatHistory}
          title="Reset conversation"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {chatMessages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 sm:p-5 ${
                isUser
                  ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-tl-sm border border-slate-200/70 dark:border-slate-700/60 shadow-sm'
              }`}>
                {/* Text Content */}
                <div className={`text-sm leading-relaxed whitespace-pre-line ${
                  isUser ? 'font-medium' : 'prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200'
                }`}>
                  {msg.text}
                </div>

                {/* Follow-up suggested questions */}
                {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Suggested Follow-Ups:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestedClick(q)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 transition-colors text-left"
                        >
                          → {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer timestamp & copy */}
                <div className={`flex items-center justify-between gap-3 mt-3 pt-2 text-[11px] ${
                  isUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator (3 dots) */}
        {isTutorTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">Tutor is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics Strip */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
          Topics:
        </span>
        {sampleCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestedClick(cat.query)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-600 shrink-0 transition-colors"
            >
              <Icon className="w-3 h-3 text-indigo-500" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Query Input Box */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            id="tutor-chat-input"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder="Ask anything about calculus, physics, coding, essay writing, or study habits..."
            disabled={isTutorTyping}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            id="btn-send-tutor-message"
            disabled={!inputQuery.trim() || isTutorTyping}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white shadow-sm shadow-indigo-600/25 transition-all flex items-center justify-center"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
