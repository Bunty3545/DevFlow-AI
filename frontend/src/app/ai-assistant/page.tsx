'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  Mic,
  MicOff,
  Camera,
  ImagePlus,
  X,
  Key,
  FolderKanban,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle2,
  Cpu,
  RotateCcw
} from 'lucide-react';

interface TokenStats {
  totalBudget: number;
  usedTokens: number;
  remainingTokens: number;
  promptTokensUsed: number;
  responseTokensUsed: number;
  requestsCount: number;
  lastModel: string;
  contextWindowLimit: number;
}

interface AttachedImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
  name: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  imagePreview?: string;
  projectId?: string;
  source?: 'gemini' | 'statistical_engine_fallback';
  modelUsed?: string;
  tokenUsage?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  relevantProjects?: any[];
  timestamp: Date;
}

interface ProjectOption {
  projectId: string;
  name: string;
  riskLevel: string;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={i} className="text-sm font-bold pt-1 text-slate-900 dark:text-white">
              {renderInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="text-sm font-extrabold pt-1 text-slate-900 dark:text-white">
              {renderInlineFormatting(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <div
              key={i}
              className="border-l-2 border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-1.5 rounded-r-lg text-[11px] text-amber-900 dark:text-amber-200"
            >
              {renderInlineFormatting(trimmed.slice(2))}
            </div>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start space-x-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{renderInlineFormatting(trimmed.slice(2))}</span>
            </div>
          );
        }
        const numberedMatch = trimmed.match(/^(\d+\.)\s+(.+)$/);
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start space-x-2 pl-1">
              <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                {numberedMatch[1]}
              </span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }
        return <p key={i}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `### 🚀 Welcome to DevFlow AI Copilot
I am your real-time multimodal assistant for **Project Intelligence, Voice Queries & Screenshot Analysis**.

You can:
- **Speak directly** using the Microphone button (English or Hindi voice input)
- **Upload, Paste (Ctrl+V), or Capture a Screenshot** of any dashboard, error, site photo, or chart
- **Select a specific project** above to analyze its live EVM metrics, risks, milestones, and bottlenecks
- Ask about cost overruns, delayed milestones, or recommended corrective actions`,
      source: 'statistical_engine_fallback',
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [attachedImage, setAttachedImage] = useState<AttachedImage | null>(null);

  // Voice & TTS states
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [voiceError, setVoiceError] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Gemini status, token tracking & quick key modal
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [tokenStats, setTokenStats] = useState<TokenStats>({
    totalBudget: 1000000,
    usedTokens: 0,
    remainingTokens: 1000000,
    promptTokensUsed: 0,
    responseTokensUsed: 0,
    requestsCount: 0,
    lastModel: 'gemini-3.8-flash',
    contextWindowLimit: 1048576
  });
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [quickApiKey, setQuickApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const suggestedQueries = [
    'Which projects are at high risk and need immediate attention?',
    'Which projects are likely to exceed their approved budget?',
    'Why is Eastern Dedicated Freight Corridor (PRJ-IR-002) delayed?',
    'Analyze the selected project risks and suggest mitigations'
  ];

  useEffect(() => {
    loadInitialContext();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadInitialContext = async () => {
    try {
      const [statusRes, projectsRes] = await Promise.allSettled([
        api.getAiStatus(),
        api.getProjects({ limit: '50' })
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.success) {
        setGeminiConfigured(Boolean(statusRes.value.geminiConfigured));
        if (statusRes.value.tokenStats) {
          setTokenStats(statusRes.value.tokenStats);
        }
      }
      if (projectsRes.status === 'fulfilled' && projectsRes.value?.success) {
        setProjects(projectsRes.value.data || []);
      }
    } catch {}
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image or screenshot file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        // Resize large screenshots down to max 1600px width/height for fast upload
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = compressedUrl.split(',')[1];
          setAttachedImage({
            dataUrl: compressedUrl,
            base64,
            mimeType: 'image/jpeg',
            name: file.name || 'screenshot.jpg'
          });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleCaptureScreen = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert('Screen capture is not supported in this browser. You can upload a screenshot or press Ctrl+V to paste one.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait briefly for frame to render
      await new Promise(resolve => setTimeout(resolve, 250));

      const maxDim = 1600;
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const base64 = dataUrl.split(',')[1];
        setAttachedImage({
          dataUrl,
          base64,
          mimeType: 'image/jpeg',
          name: `ScreenCapture_${new Date().toLocaleTimeString().replace(/[: ]/g, '-')}.jpg`
        });
      }

      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') {
        alert(err?.message || 'Unable to capture screen.');
      }
    }
  };

  const toggleVoiceInput = () => {
    setVoiceError('');
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = speechLang;
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscriptBuffer = input ? `${input.trim()} ` : '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptBuffer += `${transcript} `;
        } else {
          interim += transcript;
        }
      }
      setInput((finalTranscriptBuffer + interim).trimStart());
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceError(`Mic error: ${event.error}. Check browser microphone permission.`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const toggleSpeakMessage = (msg: ChatMessage) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speakingId === msg.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = msg.text.replace(/[#*`>_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = speechLang;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msg.id);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetTokens = async () => {
    try {
      const res = await api.resetTokenStats();
      if (res.success && res.tokenStats) {
        setTokenStats(res.tokenStats);
      }
    } catch {}
  };

  const handleSaveQuickKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApiKey.trim()) return;
    setSavingKey(true);
    setKeyStatusMsg('');
    try {
      const res = await api.updateSettings({ geminiApiKey: quickApiKey.trim() });
      if (res.success) {
        setGeminiConfigured(true);
        setQuickApiKey('');
        setKeyStatusMsg('Gemini API Key activated! Live Voice + Screenshot AI is now ready.');
        setTimeout(() => {
          setKeyModalOpen(false);
          setKeyStatusMsg('');
        }, 1200);
      }
    } catch (err: any) {
      setKeyStatusMsg(err.message || 'Failed to save API key. Try switching to Administrator/Officer role.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleSend = async (queryText?: string) => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    }

    const q = (queryText !== undefined ? queryText : input).trim();
    if (!q && !attachedImage) return;

    const currentImage = attachedImage;
    const displayPrompt =
      q || (selectedProjectId ? `Analyze this screenshot for project ${selectedProjectId}` : 'Analyze this screenshot');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: displayPrompt,
      imagePreview: currentImage?.dataUrl,
      projectId: selectedProjectId || undefined,
      timestamp: new Date()
    };

    const historyPayload = messages.slice(-6).map(m => ({
      role: m.sender,
      text: m.text
    }));

    setMessages(prev => [...prev, userMsg]);
    if (queryText === undefined) setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const res = await api.queryAi({
        message: displayPrompt,
        projectId: selectedProjectId || undefined,
        image: currentImage
          ? { data: currentImage.base64, mimeType: currentImage.mimeType }
          : undefined,
        history: historyPayload
      });

      if (res.success) {
        if (res.source === 'gemini') setGeminiConfigured(true);
        if (res.tokenStats) setTokenStats(res.tokenStats);
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.answer,
          source: res.source,
          modelUsed: res.modelUsed,
          tokenUsage: res.tokenUsage,
          relevantProjects: res.relevantProjects,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Sorry, unable to process your request: ${err.message || 'Server error'}.`,
        source: 'statistical_engine_fallback',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shrink-0">
            <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                DevFlow AI Project Assistant
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {geminiConfigured ? 'Gemini Multimodal Live' : 'Statistical Fallback Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Voice-enabled + Screenshot Vision Copilot grounded in live project EVM data.
            </p>
          </div>
        </div>

        {/* Project Selector + API Key + Clear */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
            <FolderKanban className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none max-w-[210px]"
              title="Select project context to analyze"
            >
              <option value="" className="dark:bg-slate-900">All Portfolio Projects (16)</option>
              {projects.map(p => (
                <option key={p.projectId} value={p.projectId} className="dark:bg-slate-900">
                  {p.projectId} — {p.name.length > 26 ? `${p.name.slice(0, 26)}...` : p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              geminiConfigured
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>{geminiConfigured ? 'API Key Active' : 'Set Gemini API Key'}</span>
          </button>

          <button
            type="button"
            onClick={() => setMessages([messages[0]])}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Live Token Quota & Usage Tracker Bar */}
      {(() => {
        const usedPct = tokenStats.totalBudget > 0
          ? Math.min(100, Number(((tokenStats.usedTokens / tokenStats.totalBudget) * 100).toFixed(2)))
          : 0;
        return (
          <div className="px-4 py-2.5 rounded-2xl border border-gov-border dark:border-gov-darkBorder bg-white dark:bg-gov-darkCard shadow-sm shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Cpu className="h-3.5 w-3.5 text-blue-600" />
                  <span>Total Quota:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {tokenStats.totalBudget.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Used:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {tokenStats.usedTokens.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    (In: {tokenStats.promptTokensUsed.toLocaleString('en-IN')} • Out: {tokenStats.responseTokensUsed.toLocaleString('en-IN')})
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-500 dark:text-slate-400">Remaining:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {tokenStats.remainingTokens.toLocaleString('en-IN')}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 hidden md:inline">
                  Context Limit: {(tokenStats.contextWindowLimit / 1000).toFixed(0)}k tokens/req • Requests: {tokenStats.requestsCount}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-500">{usedPct}% used</span>
                <button
                  type="button"
                  onClick={handleResetTokens}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                  title="Reset used token counter"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  usedPct >= 90 ? 'bg-red-500' : usedPct >= 70 ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.max(usedPct, tokenStats.usedTokens > 0 ? 1 : 0)}%` }}
              />
            </div>
          </div>
        );
      })()}

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
              {m.projectId && (
                <div className="mb-2 inline-block px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold">
                  Project Focus: {m.projectId}
                </div>
              )}

              {m.imagePreview && (
                <div className="mb-2.5 overflow-hidden rounded-xl border border-white/20 bg-black/20">
                  <img
                    src={m.imagePreview}
                    alt="Uploaded screenshot"
                    className="max-h-60 w-auto object-contain rounded-lg"
                  />
                </div>
              )}

              {m.sender === 'assistant' ? (
                <FormattedMessage text={m.text} />
              ) : (
                <div className="whitespace-pre-wrap font-sans">{m.text}</div>
              )}

              {m.relevantProjects && m.relevantProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Cited Projects:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {m.relevantProjects.map((rp: any) => (
                      <Link
                        key={rp.projectId}
                        href={`/projects/${rp.projectId}`}
                        className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold hover:underline"
                      >
                        {rp.projectId} ({rp.riskLevel} Risk)
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between gap-3 text-[10px] pt-1 opacity-75">
                <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {m.sender === 'assistant' && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleSpeakMessage(m)}
                      className="inline-flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                      title={speakingId === m.id ? 'Stop reading' : 'Read aloud'}
                    >
                      {speakingId === m.id ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      <span>{speakingId === m.id ? 'Stop' : 'Listen'}</span>
                    </button>
                    <span className="font-medium italic">
                      {m.source === 'gemini'
                        ? `✨ Gemini (${m.modelUsed || 'Flash'})${m.tokenUsage?.totalTokens ? ` • ${m.tokenUsage.totalTokens.toLocaleString('en-IN')} tok (In ${m.tokenUsage.promptTokens} / Out ${m.tokenUsage.responseTokens})` : ''}`
                        : '⚡ DevFlow Predictive Engine'}
                    </span>
                  </div>
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
              <span>Analyzing live project telemetry & visual context...</span>
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
            type="button"
            onClick={() => handleSend(sq)}
            className="text-[11px] px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-all shadow-sm"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Voice / Attachment Status Strip */}
      {(attachedImage || voiceError || isListening) && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
          {isListening && (
            <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening ({speechLang === 'en-IN' ? 'English' : 'Hindi'})... Speak now</span>
            </div>
          )}

          {voiceError && (
            <span className="text-xs text-red-600 dark:text-red-400">{voiceError}</span>
          )}

          {attachedImage && (
            <div className="flex items-center space-x-2.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
              <img
                src={attachedImage.dataUrl}
                alt="Attached preview"
                className="h-10 w-14 object-cover rounded border border-slate-300 dark:border-slate-700"
              />
              <div className="text-[11px]">
                <p className="font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                  {attachedImage.name}
                </p>
                <p className="text-slate-400">Ready to analyze with AI</p>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                title="Remove screenshot"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Form with Voice + Screenshot Upload + Screen Capture */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Screenshot Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
          title="Upload Screenshot / Image"
        >
          <ImagePlus className="h-4 w-4" />
        </button>

        {/* Capture Screen Button */}
        <button
          type="button"
          onClick={handleCaptureScreen}
          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
          title="Capture Live Screen / Tab Screenshot"
        >
          <Camera className="h-4 w-4" />
        </button>

        {/* Speech Language Toggle + Mic Button */}
        <button
          type="button"
          onClick={() => setSpeechLang(prev => (prev === 'en-IN' ? 'hi-IN' : 'en-IN'))}
          className="px-2.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500 shadow-sm"
          title="Switch voice recognition language (English / Hindi)"
        >
          {speechLang === 'en-IN' ? 'EN' : 'HI'}
        </button>

        <button
          type="button"
          onClick={toggleVoiceInput}
          className={`p-3 rounded-xl border transition-all shadow-sm ${
            isListening
              ? 'border-red-500 bg-red-600 text-white animate-pulse'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600'
          }`}
          title={isListening ? 'Stop voice input' : 'Speak your question (Voice Input)'}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
          placeholder="Speak, type, paste a screenshot (Ctrl+V), or upload an image..."
          className="flex-1 min-w-[200px] px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />

        <button
          type="submit"
          disabled={loading || (!input.trim() && !attachedImage)}
          className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 transition-all flex items-center space-x-1.5"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Quick Gemini API Key Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Key className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Configure Google Gemini API Key
                </h2>
              </div>
              <button
                onClick={() => setKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your Google Gemini API Key (<code className="text-[11px]">AIzaSy...</code>) below to activate real-time Voice and Screenshot Vision AI immediately. You can also save it in{' '}
              <Link href="/settings" className="text-blue-600 underline font-medium">
                System Settings
              </Link>{' '}
              or <code className="text-[11px]">backend/.env</code>.
            </p>

            {keyStatusMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{keyStatusMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickKey} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={quickApiKey}
                  onChange={(e) => setQuickApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/settings"
                  className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-blue-600"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Full Settings Page</span>
                </Link>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setKeyModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingKey || !quickApiKey.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
                  >
                    {savingKey ? 'Activating...' : 'Activate Key'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
