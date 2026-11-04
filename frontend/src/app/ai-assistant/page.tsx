'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  TrendingDown,
  Clock,
  IndianRupee,
  HelpCircle,
  RefreshCw,
  FolderKanban
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'statistical_engine_fallback';
  relevantProjects?: any[];
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `### 🚀 Welcome to DevFlow AI Copilot.
I am your intelligent assistant for AI-Powered Software Development & Project Intelligence.

You can ask me to:
- Identify high-risk and delayed projects
- Diagnose root causes for cost overruns and bottlenecks
- Provide Earned Value Management (EVM) metrics for specific projects
- Recommend executive corrective actions and mitigations

How may I assist your project review today?`,
      source: 'statistical_engine_fallback',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQueries = [
    'Which projects are at high risk and need immediate attention?',
    'Which projects are likely to exceed their approved budget?',
    'Why is Eastern Dedicated Freight Corridor (PRJ-IR-002) delayed?',
    'Summarize performance for Polavaram Project (PRJ-POL-012)',
    'Suggest corrective actions for delayed highway projects'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.queryAi({ message: q });
      if (res.success) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.answer,
          source: res.source,
          relevantProjects: res.relevantProjects,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Sorry, unable to process your request: ${err.message || 'Server error'}. Please try asking about high-risk projects or budget overruns.`,
        source: 'statistical_engine_fallback',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                DevFlow AI Project Assistant
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                Live DB Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Zero hallucination domain assistant trained on MoSPI project dossiers and EVM equations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 mt-0.5 shadow-sm">
                <Bot className="h-4 w-4 text-cyan-200" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-sm rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans space-y-2">
                {m.text}
              </div>

              {m.relevantProjects && m.relevantProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Cited Projects:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {m.relevantProjects.map((rp: any) => (
                      <span
                        key={rp.projectId}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold"
                      >
                        {rp.projectId} ({rp.riskLevel} Risk)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.sender === 'assistant' && (
                  <span className="font-medium text-slate-400 italic">
                    {m.source === 'gemini' ? '✨ Generated via Google Gemini API' : '⚡ Generated via DevFlow AI Predictive Engine'}
                  </span>
                )}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 text-white shrink-0 mt-0.5">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-sm animate-pulse">
              <Bot className="h-4 w-4 text-cyan-200" />
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-500 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></div>
              <span>Querying live project database and computing EVM risk forecasts...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Suggestions:</span>
        {suggestedQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-all shadow-sm"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask DevFlow AI about any project, cost overrun, delay cause, or recommendation..."
          className="flex-1 px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

