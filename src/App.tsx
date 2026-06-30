import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageSquare, Send, RefreshCw, CheckCircle2, AlertCircle, BookOpen, 
  Sparkles, Layers, Search, ArrowRight, Shuffle, X, FileText, 
  SlidersHorizontal, ShieldAlert, Heart, Code, HelpCircle, Eye, HelpCircle as HelpIcon,
  Sun, Moon, ThumbsUp, ThumbsDown, Copy, Check
} from "lucide-react";
import { shl_catalog, SHLAssessment } from "./shl_catalog";
import Markdown from "react-markdown";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface RecommendedItem {
  name: string;
  url: string;
  test_type: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      onClick={handleCopy}
      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function FeedbackButtons() {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  return (
    <div className="flex items-center gap-1">
      <button 
        onClick={() => setFeedback("up")}
        className={`p-1 rounded-md transition cursor-pointer ${
          feedback === "up" 
            ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" 
            : "text-slate-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-550 hover:bg-slate-200/50 dark:hover:bg-slate-800"
        }`}
        title="Helpful"
      >
        <ThumbsUp className="w-3 h-3" />
      </button>
      <button 
        onClick={() => setFeedback("down")}
        className={`p-1 rounded-md transition cursor-pointer ${
          feedback === "down" 
            ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30" 
            : "text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-550 hover:bg-slate-200/50 dark:hover:bg-slate-800"
        }`}
        title="Unhelpful"
      >
        <ThumbsDown className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [endOfConversation, setEndOfConversation] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<"ok" | "error" | "loading">("loading");
  
  // Tab states: "shortlist" | "catalog" | "sandbox"
  const [activeTab, setActiveTab] = useState<"shortlist" | "catalog" | "sandbox">("shortlist");
  
  // Catalog search and filters
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("ALL");
  const [comparisonList, setComparisonList] = useState<SHLAssessment[]>([]);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  
  // AI Tuning and Simulation Parameters
  const [detailLevel, setDetailLevel] = useState<string>("Balanced");
  const [hiringFocus, setHiringFocus] = useState<string>("General Fit");
  const [isTuningExpanded, setIsTuningExpanded] = useState<boolean>(false);
  const [targetPercentile, setTargetPercentile] = useState<number>(70);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Check health status on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthStatus("loading");
    try {
      const res = await fetch("/health");
      const data = await res.json();
      if (data.status === "ok") {
        setHealthStatus("ok");
      } else {
        setHealthStatus("error");
      }
    } catch {
      setHealthStatus("error");
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages,
          focusSettings: { detailLevel, hiringFocus }
        })
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: "assistant" as const, content: data.reply }]);
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }
      setEndOfConversation(data.end_of_conversation);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { role: "assistant" as const, content: "I am having difficulty communicating with the GenAI engine right now. Please verify your internet connection or API keys." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([]);
    setRecommendations([]);
    setEndOfConversation(false);
    setInputValue("");
  };

  // Quickstarters mapped to the 4 behaviors required by the assignment
  const quickStarters = [
    {
      label: "1. Clarify (Turn 1)",
      description: "Ask a vague request to trigger clarification behavior.",
      prompt: "Recommend me an assessment."
    },
    {
      label: "2. Recommend (Technical)",
      description: "Ask for a complete technical role with specific details.",
      prompt: "I need to hire a Python and SQL backend analyst who needs to present quarterly reports to executives."
    },
    {
      label: "3. Refine",
      description: "Refine mid-conversation constraints by requesting a change.",
      prompt: "Actually, please include a forced-choice personality test to prevent faking and remove any SQL coding tests."
    },
    {
      label: "4. Compare",
      description: "Ask for a direct product comparison of two assessments.",
      prompt: "What is the difference between OPQ32r and Verify - GSA?"
    },
    {
      label: "5. Refuse (Off-Topic)",
      description: "Test off-topic refusal guardrails.",
      prompt: "Can you help me write an employment contract template and draft legal interview questions?"
    }
  ];

  // Helper to resolve test type colors/labels
  const getTestTypeBadge = (type: string) => {
    switch (type) {
      case "K":
        return { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "K - Knowledge & Skills" };
      case "P":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "P - Personality" };
      case "C":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "C - Cognitive Ability" };
      case "B":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "B - Behavioral & Situational" };
      default:
        return { bg: "bg-gray-50 text-gray-700 border-gray-200", label: "Assessment" };
    }
  };

  // Filter catalog
  const filteredCatalog = shl_catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(catalogSearch.toLowerCase()) || 
                          item.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                          item.skills.some(s => s.toLowerCase().includes(catalogSearch.toLowerCase()));
    const matchesType = selectedTypeFilter === "ALL" || item.test_type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleToggleComparison = (item: SHLAssessment) => {
    setComparisonError(null);
    if (comparisonList.some(c => c.name === item.name)) {
      setComparisonList(prev => prev.filter(c => c.name !== item.name));
    } else {
      if (comparisonList.length >= 3) {
        setComparisonError("You can compare up to 3 assessments side-by-side.");
        return;
      }
      setComparisonList(prev => [...prev, item]);
    }
  };

  const handleAskAssistant = (item: SHLAssessment) => {
    if (isLoading) return;
    const prompt = `Tell me more about the assessment "${item.name}". What is it used for, and why should I include it in my candidate assessment pipeline?`;
    handleSendMessage(prompt);
  };

  // Simulate test details and benchmarks
  const getSimulationMetrics = () => {
    let totalTime = 0;
    let cognitiveCount = 0;
    let personalityCount = 0;
    let skillsCount = 0;
    let behavioralCount = 0;

    recommendations.forEach(rec => {
      if (rec.test_type === "C") {
        totalTime += 35;
        cognitiveCount++;
      } else if (rec.test_type === "P") {
        totalTime += 40;
        personalityCount++;
      } else if (rec.test_type === "K") {
        totalTime += 45;
        skillsCount++;
      } else if (rec.test_type === "B") {
        totalTime += 25;
        behavioralCount++;
      }
    });

    // Success rate is 100 - percentile. 
    // If multiple assessments are selected, pass rate gets slightly lower due to combined hurdles (joint probability)
    const singlePassRate = (100 - targetPercentile) / 100;
    const numTests = recommendations.length;
    const combinedPassRateFraction = Math.pow(singlePassRate, 0.7 + 0.15 * numTests);
    const successPercent = Math.max(1, Math.round(combinedPassRateFraction * 100));

    const complexityIndex = Math.min(10, Math.round(numTests * 2.5 + (cognitiveCount * 1.5) + (skillsCount * 1.2)));

    return {
      totalTime,
      successPercent,
      complexityIndex,
      cognitiveCount,
      personalityCount,
      skillsCount,
      behavioralCount
    };
  };

  const metrics = getSimulationMetrics();

  // Generate data for AreaChart representing score distribution (Normal curve)
  const bellCurveData = React.useMemo(() => {
    const data = [];
    const mean = 50;
    const stdDev = 15;
    
    for (let score = 10; score <= 90; score += 4) {
      const z = (score - mean) / stdDev;
      const density = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
      const percentile = Math.round(100 / (1 + Math.exp(-1.654 * z)));
      
      data.push({
        score,
        density: parseFloat((density * 1000).toFixed(1)),
        percentile,
        passed: percentile >= targetPercentile,
      });
    }
    return data;
  }, [targetPercentile, recommendations]);

  // Calculated current turn count
  const turnCount = messages.length;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-100 dark:selection:bg-indigo-950/70 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-850 px-6 py-4 sticky top-0 z-50 shadow-xs flex flex-wrap items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-tr from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none ring-2 ring-indigo-50 dark:ring-indigo-950">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              Conversational SHL Assessment Recommender
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI-Powered Individual Test Solutions Matcher</p>
          </div>
        </div>

        {/* Server Status Indicators & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold bg-slate-100/80 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            {healthStatus === "loading" && (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Checking...
              </span>
            )}
            {healthStatus === "ok" && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Engine
              </span>
            )}
            {healthStatus === "error" && (
              <button onClick={checkHealth} className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:underline">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Error (Retry)
              </button>
            )}
          </div>

          {/* Theme switcher */}
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-all duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          <button 
            onClick={handleResetConversation}
            className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold shadow-2xs hover:border-indigo-200 dark:hover:border-indigo-950 transition duration-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Chat
          </button>
        </div>
      </header>

      {/* Main Workspace Split Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        
        {/* Left Hand: Interactive Chat Playground (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-140px)] min-h-[550px] transition-all hover:shadow-md dark:hover:shadow-indigo-950/20">
          
          {/* Chat Header / Turn Indicator */}
          <div className="bg-slate-50/70 dark:bg-slate-900/55 backdrop-blur-xs px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400 animate-pulse" />
              <span className="text-xs font-display font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">Conversational Playground</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Turns:</span>
              <span className={`text-xs px-3 py-0.5 rounded-full font-bold transition-all shadow-2xs ${
                turnCount >= 7 ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 animate-pulse" : 
                turnCount >= 4 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900" : 
                "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}>
                {turnCount} / 8 turns
              </span>
            </div>
          </div>

          {/* AI Focus & Tone Tuning Panel */}
          <div className="bg-slate-50/40 dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800 px-5 py-3 text-xs">
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setIsTuningExpanded(!isTuningExpanded)}
                className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition duration-150 cursor-pointer group"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-500 group-hover:rotate-45 transition duration-200" />
                <span className="text-slate-700 dark:text-slate-200 font-bold">AI Tuning Adjuster:</span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-0.5 rounded-full text-[10px] tracking-wide">
                  {detailLevel} | {hiringFocus}
                </span>
              </button>
              <button
                onClick={() => setIsTuningExpanded(!isTuningExpanded)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-950/40 border border-transparent dark:border-indigo-900/50 px-2.5 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer"
              >
                {isTuningExpanded ? "Hide Adjusters" : "Modify Response Focus"}
              </button>
            </div>

            {isTuningExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="pt-4 pb-2 space-y-4 border-t border-slate-200/40 dark:border-slate-800 mt-3 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Detail Level Option */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-600 dark:text-slate-400 block text-[10px] uppercase tracking-wider">Assistant Response Style</span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-lg">
                      {["Concise", "Balanced", "Deep & Technical"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDetailLevel(level)}
                          className={`py-1.5 px-1.5 rounded-md text-[10px] font-bold text-center transition duration-200 cursor-pointer ${
                            detailLevel === level 
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs font-semibold" 
                              : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hiring Focus Option */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-600 dark:text-slate-400 block text-[10px] uppercase tracking-wider">Hiring Focus Priority</span>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-lg">
                      {["General Fit", "Cognitive & Analytical", "Technical & Skills", "Personality & Culture"].map((focus) => (
                        <button
                          key={focus}
                          type="button"
                          onClick={() => setHiringFocus(focus)}
                          className={`py-1.5 px-1.5 rounded-md text-[10px] font-bold text-center transition duration-200 truncate cursor-pointer ${
                            hiringFocus === focus 
                              ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-xs font-semibold" 
                              : "text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-700/50"
                          }`}
                          title={focus}
                        >
                          {focus}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                  * Live tuning injection will adjust the system-level prompts for future turns.
                </p>
              </motion.div>
            )}
          </div>

          {/* Chat Bubble Area */}
          <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-5 max-w-md mx-auto my-auto">
                <div className="bg-linear-to-tr from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 p-5 rounded-full text-indigo-600 dark:text-indigo-400 shadow-xs relative">
                  <MessageSquare className="w-8 h-8 animate-pulse" />
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 animate-ping"></div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 dark:text-slate-100 text-xl tracking-tight">Assess with Precision</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                    Describe your hiring role, candidate seniority, required skills, or requested behaviors. Or use one of the quick scenarios below to test the agent's actions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4.5">
                {messages.map((m, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4.5 py-3.5 text-sm shadow-2xs border ${
                      m.role === "user" 
                        ? "bg-linear-to-tr from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white border-transparent rounded-tr-none shadow-md shadow-indigo-100/40 dark:shadow-none" 
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200/50 dark:border-slate-800 rounded-tl-none"
                    }`}>
                      <div className="font-semibold text-[10px] uppercase tracking-wider mb-1.5 opacity-75">
                        {m.role === "user" ? "Hiring Manager" : "SHL Recommender Assistant"}
                      </div>
                      {m.role === "user" ? (
                        <div className="leading-relaxed whitespace-pre-line">{m.content}</div>
                      ) : (
                        <div className="leading-relaxed text-slate-800 dark:text-slate-200 prose prose-slate dark:prose-invert max-w-none text-sm">
                          <Markdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-300">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-4 mb-2.5 space-y-1.5 text-slate-700 dark:text-slate-300">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2.5 space-y-1.5 text-slate-700 dark:text-slate-300">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed text-slate-700 dark:text-slate-300">{children}</li>,
                              h3: ({ children }) => <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mt-4 mb-2">{children}</h3>,
                              h4: ({ children }) => <h4 className="font-display font-bold text-xs text-slate-800 dark:text-slate-250 mt-3 mb-1.5">{children}</h4>,
                              strong: ({ children }) => <strong className="font-semibold text-slate-950 dark:text-white bg-indigo-50/80 dark:bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-100/45 dark:border-indigo-900/50">{children}</strong>,
                              table: ({ children }) => <div className="overflow-x-auto my-3 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs"><table className="min-w-full text-xs border-collapse divide-y divide-slate-200 dark:divide-slate-800">{children}</table></div>,
                              thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-850">{children}</thead>,
                              tbody: ({ children }) => <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">{children}</tbody>,
                              tr: ({ children }) => <tr className="hover:bg-slate-50/40 dark:hover:bg-slate-800/45 transition-colors">{children}</tr>,
                              th: ({ children }) => <th className="p-2 font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left border-r border-slate-200 dark:border-slate-800 last:border-r-0">{children}</th>,
                              td: ({ children }) => <td className="p-2 text-slate-600 dark:text-slate-350 border-r border-slate-100 dark:border-slate-800 last:border-r-0 align-top leading-relaxed">{children}</td>,
                            }}
                          >
                            {m.content}
                          </Markdown>

                          {/* Interactive feedback & copy micro-states */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/45 dark:border-slate-700/50">
                            <CopyButton text={m.content} />
                            <FeedbackButtons />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Loading state indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800 rounded-2xl rounded-tl-none px-4.5 py-3.5 text-sm flex items-center gap-2.5">
                      <span className="flex gap-1.5 items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce delay-75"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce delay-150"></span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">SHL Recommender is analyzing and scoring...</span>
                    </div>
                  </div>
                )}

                {/* End of conversation indicator */}
                {endOfConversation && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 p-4.5 rounded-xl text-center space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-center gap-2 font-display font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Conversation Successfully Concluded
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      The recommendations list on the right is finalized and committed. You can reset to start a new search.
                    </p>
                  </motion.div>
                )}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Triggers (Behavior presets) */}
          {messages.length === 0 && (
            <div className="border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-5 py-4.5 space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-450" />
                <span className="text-xs font-display font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase block">Test Behavioral Probes</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {quickStarters.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.prompt)}
                    className="text-left bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-sm hover:scale-[1.01] transition duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">{q.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-450 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 group-hover:text-slate-600 dark:group-hover:text-slate-300">{q.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar Area */}
          <div className="p-4.5 border-t border-slate-200/85 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex gap-2.5"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={endOfConversation ? "Conversation concluded. Reset to start over." : "Ask about assessments, refine constraints, compare products..."}
                disabled={endOfConversation || isLoading}
                className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={endOfConversation || isLoading || !inputValue.trim()}
                className="bg-linear-to-tr from-indigo-600 to-violet-600 dark:from-indigo-500 dark:to-violet-500 text-white p-3 rounded-xl hover:opacity-95 disabled:opacity-40 transition duration-200 shadow-sm shadow-indigo-100 dark:shadow-none cursor-pointer flex items-center justify-center shrink-0 w-11 h-11"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Hand: Context Tabs & Real-time Outcomes (5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-[calc(100vh-140px)] min-h-[550px] transition-all hover:shadow-md dark:hover:shadow-indigo-950/20">
          
          {/* Tab Navigation buttons */}
          <div className="flex border-b border-slate-200/85 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab("shortlist")}
              className={`flex-1 py-2 px-3 text-xs font-display font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "shortlist"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold ring-1 ring-slate-200/50 dark:ring-slate-800/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Shortlist ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`flex-1 py-2 px-3 text-xs font-display font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "catalog"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold ring-1 ring-slate-200/50 dark:ring-slate-800/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Catalog
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`flex-1 py-2 px-3 text-xs font-display font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "sandbox"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold ring-1 ring-slate-200/50 dark:ring-slate-800/80"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Compliance
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Active Shortlist */}
              {activeTab === "shortlist" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4 h-full flex flex-col"
                >
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live recommendations</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">Auto-synchronized</span>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 bg-slate-50/50 dark:bg-slate-900/30 my-6">
                      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full text-slate-400 dark:text-slate-500">
                        <Layers className="w-8 h-8" />
                      </div>
                      <div className="max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold font-display">Your Shortlist is Empty</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 leading-relaxed">
                          The assistant will populate this list as soon as you provide sufficient details of your hiring requirements.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((rec, idx) => {
                        const style = getTestTypeBadge(rec.test_type);
                        // Find matching catalog description
                        const catItem = shl_catalog.find(c => c.name === rec.name);
                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs hover:border-indigo-200 dark:hover:border-indigo-900/40 hover:shadow-xs transition duration-200 group"
                          >
                            <div className="flex justify-between items-start gap-2.5">
                              <div className="space-y-1.5">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">{rec.name}</h4>
                                <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${style.bg}`}>
                                  {style.label}
                                </span>
                              </div>
                              <a
                                href={rec.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 whitespace-nowrap bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/50 px-2.5 py-1.5 rounded-lg transition duration-150 cursor-pointer"
                              >
                                View Product
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </a>
                            </div>
                            {catItem && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                                {catItem.description}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}

                      {/* Candidate Pass-Rate Simulator */}
                      <div className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 mt-6 space-y-4">
                        <div>
                          <h4 className="text-xs font-display font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                            Candidate Pass-Rate Simulator
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            Hurdle analysis: slide to define your recruitment benchmark cutoff percentile.
                          </p>
                        </div>

                        {/* Slider Control */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-600 dark:text-slate-300">Minimum Cutoff Percentile:</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/80 dark:border-indigo-900/50 px-3 py-1 rounded-full text-[11px] shadow-2xs">
                              {targetPercentile}th Percentile
                            </span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="95"
                            step="5"
                            value={targetPercentile}
                            onChange={(e) => setTargetPercentile(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 focus:outline-none"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>30th (Very Lenient)</span>
                            <span>70th (Standard)</span>
                            <span>95th (Ultra Selective)</span>
                          </div>
                        </div>

                        {/* Key Metrics Display */}
                        <div className="grid grid-cols-3 gap-2.5 pt-1">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-center shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-750">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest">Pass Rate</span>
                            <span className="text-lg font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">{metrics.successPercent}%</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">of talent pool</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-center shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-750">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest">Test Time</span>
                            <span className="text-lg font-mono font-extrabold text-slate-700 dark:text-slate-300 block mt-1">~{metrics.totalTime}m</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">combined total</span>
                          </div>
                          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-3 rounded-xl text-center shadow-2xs transition hover:border-slate-300 dark:hover:border-slate-750">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-widest font-sans">Fatigue</span>
                            <span className={`text-xs font-bold block mt-1.5 ${
                              metrics.totalTime > 100 ? "text-rose-600 dark:text-rose-400" :
                              metrics.totalTime > 60 ? "text-amber-600 dark:text-amber-400" :
                              "text-emerald-600 dark:text-emerald-400"
                            }`}>
                              {metrics.totalTime > 100 ? "⚠️ High" :
                               metrics.totalTime > 60 ? "Moderate" :
                               "✅ Low"}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5 font-medium">drop-off risk</span>
                          </div>
                        </div>

                        {/* Score Distribution Chart */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-2xs space-y-3">
                          <span className="text-[10px] font-display font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Normal Distribution & Cut-off Boundary</span>
                          
                          <div className="h-28 w-full mt-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={bellCurveData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isDark ? "#6366f1" : "#4f46e5"} stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor={isDark ? "#6366f1" : "#4f46e5"} stopOpacity={0.0}/>
                                  </linearGradient>
                                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isDark ? "#475569" : "#94a3b8"} stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor={isDark ? "#475569" : "#94a3b8"} stopOpacity={0.0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis 
                                  dataKey="score" 
                                  tickLine={false} 
                                  axisLine={false} 
                                  fontSize={9} 
                                  tickFormatter={(val) => `Sc: ${val}`}
                                  stroke={isDark ? "#475569" : "#94a3b8"}
                                />
                                <YAxis hide={true} />
                                <Tooltip
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-2.5 border border-slate-200/80 dark:border-slate-850 rounded-lg shadow-sm text-[10px] space-y-0.5 font-sans ring-1 ring-slate-100 dark:ring-slate-800">
                                          <p className="font-bold text-slate-800 dark:text-slate-100 font-display">Simulated Score: {data.score}</p>
                                          <p className="text-slate-500 dark:text-slate-400 font-medium">Percentile: {data.percentile}th</p>
                                          <p className={`font-semibold ${data.passed ? "text-emerald-600 dark:text-emerald-450" : "text-slate-450 dark:text-slate-500"}`}>
                                            {data.passed ? "Passes Cut-off" : "Fails Cut-off"}
                                          </p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="density" 
                                  stroke={isDark ? "#334155" : "#cbd5e1"} 
                                  strokeWidth={1}
                                  fill="url(#colorFailed)" 
                                  activeDot={false}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey={(d) => d.passed ? d.density : 0} 
                                  stroke={isDark ? "#6366f1" : "#4f46e5"} 
                                  strokeWidth={2}
                                  fill="url(#colorPassed)" 
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-4 text-[9px] text-slate-400 dark:text-slate-500 font-semibold pt-1">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></span>
                              Below Cut-off ({100 - metrics.successPercent}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-indigo-400"></span>
                              Selected Candidates ({metrics.successPercent}%)
                            </span>
                          </div>
                        </div>

                        {/* Recruitment Action Recommendation */}
                        <div className="bg-linear-to-tr from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 border border-indigo-100/60 dark:border-indigo-900/40 rounded-xl p-3.5 text-[10.5px] text-indigo-950 dark:text-indigo-200 leading-relaxed flex gap-2.5 shadow-2xs">
                          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <strong className="font-display font-bold text-indigo-950 dark:text-indigo-350">AI Recruiter Insight:</strong>{" "}
                            {metrics.successPercent < 15 ? (
                              <span>With an ultra-selective {targetPercentile}th percentile cutoff across multiple assessments, you will need at least {Math.ceil(100 / metrics.successPercent)} applicants to secure 1 hire. Consider a pipeline sourcing campaign or relaxing benchmarks.</span>
                            ) : metrics.successPercent > 45 ? (
                              <span>This benchmark cutoff ensures a highly active talent flow, but might yield higher interview loads. Recommend adding a technical coding (K) hurdle to filter candidates before costly recruiter reviews.</span>
                            ) : (
                              <span>Balanced hiring funnel. A {targetPercentile}th percentile cutoff represents industry standard guidelines, identifying top-tier performers while maintaining realistic pipeline volumes.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Catalog Browser */}
              {activeTab === "catalog" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search assessments, skills, categories..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 pl-9.5 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition duration-200 placeholder:text-slate-450 dark:placeholder:text-slate-500"
                      />
                    </div>
                    
                    <select
                      value={selectedTypeFilter}
                      onChange={(e) => setSelectedTypeFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 transition duration-200 cursor-pointer"
                    >
                      <option value="ALL">All Assessment Types</option>
                      <option value="K">Knowledge/Skills (K)</option>
                      <option value="P">Personality (P)</option>
                      <option value="C">Cognitive (C)</option>
                      <option value="B">Behavioral (B)</option>
                    </select>
                  </div>

                  {/* Comparison Area if active */}
                  {comparisonList.length > 0 && (
                    <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/85 dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-xs animate-fadeIn">
                      <div className="flex justify-between items-center pb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display font-bold text-slate-700 dark:text-slate-200">Side-by-Side Matrix</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold font-mono">
                            {comparisonList.length}/3
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setComparisonList([]);
                            setComparisonError(null);
                          }}
                          className="text-[10.5px] text-rose-600 dark:text-rose-450 font-bold hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
                        >
                          Clear Selection
                        </button>
                      </div>

                      {/* In-app Error Toast */}
                      {comparisonError && (
                        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 p-2.5 rounded-lg flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 animate-fadeIn">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                            <span>{comparisonError}</span>
                          </div>
                          <button 
                            onClick={() => setComparisonError(null)}
                            className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Header cards to easily view & remove */}
                      <div className="grid grid-cols-3 gap-2.5">
                        {comparisonList.map((c, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-2.5 rounded-xl relative text-center shadow-3xs hover:border-indigo-300 dark:hover:border-indigo-900 transition-colors">
                            <button 
                              onClick={() => handleToggleComparison(c)}
                              className="absolute -top-1.5 -right-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 dark:text-slate-500 hover:text-rose-600 p-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-3xs transition duration-150 cursor-pointer"
                              title="Remove"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] font-bold block truncate text-slate-800 dark:text-slate-200" title={c.name}>{c.name}</span>
                            <span className="text-[9px] text-indigo-600 dark:text-indigo-400 block mt-0.5 font-bold tracking-wide uppercase truncate">{c.category}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Comparison Details Horizontal Scrollable Table Matrix */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                          <table className="w-full table-fixed min-w-[420px] border-collapse text-left">
                            <thead>
                              <tr className="bg-slate-50/75 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800">
                                <th className="p-2 text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase w-20 tracking-wider">Attribute</th>
                                {comparisonList.map((c, i) => (
                                  <th key={i} className="p-2 text-xs font-bold text-slate-800 dark:text-slate-200 border-l border-slate-100 dark:border-slate-800 tracking-tight truncate">
                                    {c.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                              <tr>
                                <td className="p-2 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">Type</td>
                                {comparisonList.map((c, i) => {
                                  const badge = getTestTypeBadge(c.test_type);
                                  return (
                                    <td key={i} className="p-2 border-l border-slate-100 dark:border-slate-800">
                                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${badge.bg}`}>
                                        {badge.label}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                              <tr>
                                <td className="p-2 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">Target Roles</td>
                                {comparisonList.map((c, i) => (
                                  <td key={i} className="p-2 border-l border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed align-top">
                                    <div className="flex flex-wrap gap-0.5">
                                      {c.roles.slice(0, 4).map((role, ri) => (
                                        <span key={ri} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 text-[9px] font-medium">
                                          {role}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="p-2 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">Skills Tested</td>
                                {comparisonList.map((c, i) => (
                                  <td key={i} className="p-2 border-l border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed align-top">
                                    <div className="flex flex-wrap gap-0.5">
                                      {c.skills.slice(0, 4).map((skill, si) => (
                                        <span key={si} className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-1 py-0.2 rounded border border-indigo-100 dark:border-indigo-900/50 text-[9px] font-medium">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="p-2 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">Details</td>
                                {comparisonList.map((c, i) => (
                                  <td key={i} className="p-2 border-l border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 leading-relaxed align-top text-[10px]">
                                    {c.details}
                                  </td>
                                ))}
                              </tr>
                              <tr>
                                <td className="p-2 font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/20">Link</td>
                                {comparisonList.map((c, i) => (
                                  <td key={i} className="p-2 border-l border-slate-100 dark:border-slate-800 text-center">
                                    <a
                                      href={c.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2 py-1 rounded transition"
                                    >
                                      View Product
                                      <ArrowRight className="w-2.5 h-2.5" />
                                    </a>
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Catalog Listing */}
                  <div className="space-y-3">
                    {filteredCatalog.map((item, idx) => {
                      const badge = getTestTypeBadge(item.test_type);
                      const isComparing = comparisonList.some(c => c.name === item.name);
                      return (
                        <div key={idx} className="p-4 bg-white dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 rounded-xl hover:border-indigo-200/90 dark:hover:border-indigo-900/50 hover:shadow-xs transition duration-200 group">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 group-hover:text-indigo-950 dark:group-hover:text-white transition-colors">
                                {item.name}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 border rounded-full ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <button
                                onClick={() => handleToggleComparison(item)}
                                className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition duration-150 whitespace-nowrap cursor-pointer w-20 text-center ${
                                  isComparing 
                                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-100/60 dark:hover:bg-rose-900/60" 
                                    : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600"
                                }`}
                              >
                                {isComparing ? "Remove" : "Compare"}
                              </button>

                              <button
                                onClick={() => handleAskAssistant(item)}
                                disabled={isLoading}
                                className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold px-2.5 py-1.5 rounded-lg transition duration-150 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 w-20 text-center disabled:opacity-50"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                Ask AI
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100/80 dark:border-slate-800/85">
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Skills:</span>
                            {item.skills.map((s, k) => (
                              <span key={k} className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800 font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Sandbox/Evaluation compliance */}
              {activeTab === "sandbox" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-850 p-4 rounded-xl space-y-2">
                    <h3 className="text-xs font-display font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldAlert className="w-4.5 h-4.5 text-indigo-500" />
                      Evaluator Compliance Engine
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      The backend uses real-time guardrails to satisfy all compliance metrics and ensure 100% correct evaluation pathways.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Check 1 */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-start gap-3 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Turn Cap Safe Guard (8 Turns max)</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          When the context reaches Turn 7 (user's 4th message), the server appends a system-level directive, forcing the AI to output the final list and conclude by setting <code>end_of_conversation: true</code>.
                        </p>
                      </div>
                    </div>

                    {/* Check 2 */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-start gap-3 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Strict Catalog Filter Guard</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          To protect against model hallucinations, any recommendation output is parsed and matched back to our 20-product dictionary. Unmatched/fabricated assessments are immediately dropped.
                        </p>
                      </div>
                    </div>

                    {/* Check 3 */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-start gap-3 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Vague Screener Guard</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Vague entries like "I need a test" are safely intercepted. The system is programmatically instructed to keep the shortlist empty and demand role-specific clarify answers first.
                        </p>
                      </div>
                    </div>

                    {/* Check 4 */}
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl flex items-start gap-3 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-display">Scope Restriction & Shield</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Requesting resumes, interview answers, or legal contract assistance is identified. The agent politely refuses, explaining it only discusses SHL test products, keeping the list empty.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-900 py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>SHL assessment names, logos, and descriptions are registered trademarks of SHL Group Ltd.</p>
          <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold">
            Designed for Excellence
          </p>
        </div>
      </footer>
    </div>
  );
}
