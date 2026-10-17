import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  Flame,
  ShieldAlert,
  ListTodo,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MaterialItem } from '../services/materialService';
import { AppLanguage, speakText, stopSpeech, generateBankaiSummary } from '../services/speechService';

interface BankaiTodayCardProps {
  isDark: boolean;
  materials: MaterialItem[];
  currentLang: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onNavigateToInventory: (filter?: 'all' | 'ok' | 'expiring' | 'expired') => void;
  onNavigateToScan: (itemName?: string) => void;
  onNavigateToSenpai: (prompt?: string) => void;
}

export default function BankaiTodayCard({
  isDark,
  materials,
  currentLang,
  onLanguageChange,
  onNavigateToInventory,
  onNavigateToScan,
  onNavigateToSenpai,
}: BankaiTodayCardProps) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hasAutoSpoken, setHasAutoSpoken] = useState<boolean>(false);

  // Compute live alerts from materials
  const expiredMaterials = materials.filter((m) => m.status === 'expired');
  const expiringMaterials = materials.filter((m) => m.status === 'expiring');

  // Pending operational tasks
  const pendingTasks = [
    {
      id: 'task-1',
      title: 'Quarantine check for batch LOT-SC-551',
      category: 'Quality Control',
      priority: 'high',
      actionPrompt: 'scan item Sodium Chloride reagent lot',
    },
    {
      id: 'task-2',
      title: 'Review supplier replenishment quote',
      category: 'Procurement',
      priority: 'medium',
      actionPrompt: 'find verified suppliers for organic coffee beans',
    },
  ];

  const totalAttentionCount = expiredMaterials.length + expiringMaterials.length + pendingTasks.length;

  const { greeting, spokenText } = generateBankaiSummary(
    totalAttentionCount,
    expiredMaterials.length,
    expiringMaterials.length,
    currentLang
  );

  // Speak one-line summary when opened
  useEffect(() => {
    if (!hasAutoSpoken) {
      const timer = setTimeout(() => {
        setIsSpeaking(true);
        speakText(
          spokenText,
          currentLang,
          () => setIsSpeaking(false),
          () => setIsSpeaking(false)
        );
        setHasAutoSpoken(true);
      }, 600); // Soft delay for smooth page transition

      return () => {
        clearTimeout(timer);
        stopSpeech();
      };
    }
  }, [hasAutoSpoken, spokenText, currentLang]);

  // Re-speak summary when user clicks speaker or switches language
  const handleSpeak = (langToUse = currentLang) => {
    stopSpeech();
    setIsSpeaking(true);
    const summary = generateBankaiSummary(
      totalAttentionCount,
      expiredMaterials.length,
      expiringMaterials.length,
      langToUse
    );
    speakText(
      summary.spokenText,
      langToUse,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const handleToggleLanguage = (lang: AppLanguage) => {
    onLanguageChange(lang);
    handleSpeak(lang);
  };

  return (
    <div
      className={`mx-4 my-2.5 rounded-[24px] border p-4 transition-all shadow-xl relative overflow-hidden backdrop-blur-2xl ${
        isDark
          ? 'bg-gradient-to-br from-[#161324]/90 via-[#111420]/90 to-[#19152b]/90 border-[#9B72CB]/30 shadow-[0_12px_40px_rgba(155,114,203,0.18)]'
          : 'bg-gradient-to-br from-[#f8f5ff] via-white to-[#f3eefc] border-[#9B72CB]/25 shadow-[0_8px_30px_rgba(155,114,203,0.12)]'
      }`}
    >
      {/* Decorative Aurora Glow behind Card */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#9B72CB]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#EA4335]/15 blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between mb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          {/* Bankai Lightning/Flame Avatar */}
          <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-[#9B72CB] via-[#EA4335] to-[#FBBC04] p-[1.5px] shadow-md flex items-center justify-center">
            <div className={`w-full h-full rounded-[10.5px] flex items-center justify-center ${isDark ? 'bg-[#0f111a]' : 'bg-white'}`}>
              <Flame className="w-4 h-4 text-[#9B72CB] animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight font-['Google_Sans',sans-serif]">
                Bankai — Today
              </span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-[6px] bg-[#9B72CB]/20 text-[#9B72CB] border border-[#9B72CB]/30">
                卍解
              </span>
            </div>
            <div className="text-[11px] font-medium text-[#EA4335] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-ping" />
              <span>{totalAttentionCount} items need attention</span>
            </div>
          </div>
        </div>

        {/* Audio Speaker & Language Switcher Chips */}
        <div className="flex items-center gap-1.5">
          {/* Language Switcher Chips (EN / HI / KN) */}
          <div className="flex items-center rounded-full p-0.5 border border-white/10 bg-black/20">
            {(['EN', 'HI', 'KN'] as AppLanguage[]).map((lang) => {
              const isSelected = currentLang === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleToggleLanguage(lang)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'ai-rainbow-gradient text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title={`Switch voice & UI language to ${lang}`}
                >
                  {lang}
                </button>
              );
            })}
          </div>

          {/* Speaker Button to Replay Speech */}
          <button
            type="button"
            onClick={() => (isSpeaking ? stopSpeech() : handleSpeak())}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              isSpeaking
                ? 'bg-[#EA4335] text-white border-transparent shadow-[0_0_14px_rgba(234,67,53,0.5)] animate-pulse'
                : isDark
                ? 'bg-white/10 text-slate-300 hover:text-white border-white/10'
                : 'bg-white text-slate-700 hover:text-black border-slate-200'
            }`}
            title={isSpeaking ? 'Stop voice summary' : 'Listen to Bankai voice summary'}
            aria-label="Speech Audio"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Accordion Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Spoken One-Line Summary Quote Banner */}
      <div
        className={`px-3 py-2 rounded-[14px] text-xs font-medium mb-3 flex items-start gap-2 border ${
          isDark
            ? 'bg-white/[0.04] border-white/10 text-slate-200'
            : 'bg-white/80 border-[#9B72CB]/20 text-slate-700'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#9B72CB] flex-shrink-0 mt-0.5" />
        <div className="flex-1 italic leading-snug">
          "{spokenText}"
        </div>
        {isSpeaking && (
          <span className="text-[10px] text-[#9B72CB] font-bold uppercase tracking-wider animate-pulse">
            Speaking
          </span>
        )}
      </div>

      {/* Collapsible Prioritised Alerts List */}
      {isExpanded && (
        <div className="space-y-2 mt-2">
          {/* Priority 1: Expired Materials (Critical Red) */}
          {expiredMaterials.length > 0 && (
            <div
              className={`p-2.5 rounded-[16px] border transition-all ${
                isDark ? 'bg-[#EA4335]/10 border-[#EA4335]/30' : 'bg-[#fce8e6] border-[#EA4335]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#EA4335]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Critical Expirations ({expiredMaterials.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToInventory('expired')}
                  className="text-[10px] font-bold text-[#EA4335] hover:underline flex items-center gap-0.5"
                >
                  <span>Resolve</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                {expiredMaterials.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2 py-1 rounded-[8px] bg-black/10"
                  >
                    <span className="font-semibold truncate max-w-[190px]">{item.name}</span>
                    <span className="text-[10px] font-bold text-[#EA4335] uppercase">
                      Expired: {item.expiryDate || 'Past'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority 2: Expiring Soon (Warning Amber) */}
          {expiringMaterials.length > 0 && (
            <div
              className={`p-2.5 rounded-[16px] border transition-all ${
                isDark ? 'bg-[#FBBC04]/10 border-[#FBBC04]/30' : 'bg-[#fef7e0] border-[#FBBC04]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#b06000]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Expiring Soon ({expiringMaterials.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToInventory('expiring')}
                  className="text-[10px] font-bold text-[#b06000] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-1">
                {expiringMaterials.slice(0, 2).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-2 py-1 rounded-[8px] bg-black/10"
                  >
                    <span className="font-semibold truncate max-w-[190px]">{item.name}</span>
                    <span className="text-[10px] font-bold text-[#b06000]">
                      Due: {item.expiryDate}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority 3: Pending Action Items / Tasks */}
          <div
            className={`p-2.5 rounded-[16px] border transition-all ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#9B72CB]">
                <ListTodo className="w-4 h-4" />
                <span>Operational Tasks ({pendingTasks.length})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between text-xs p-1.5 rounded-[10px] hover:bg-white/5 transition-colors"
                >
                  <div className="truncate max-w-[210px]">
                    <div className="font-medium text-slate-200 truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-400">{task.category}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToSenpai(task.actionPrompt)}
                    className="px-2 py-1 rounded-[8px] ai-rainbow-gradient text-white text-[10px] font-bold shadow-sm active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>Run</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
