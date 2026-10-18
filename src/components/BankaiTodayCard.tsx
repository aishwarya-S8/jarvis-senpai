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
  ChevronUp,
  Package,
  TrendingDown,
  Layers,
  Inbox
} from 'lucide-react';
import { MaterialItem, computeMaterialStatus } from '../services/materialService';
import { AppLanguage, speakText, stopSpeech, generateBankaiSummary } from '../services/speechService';
import { useLanguage } from '../context/LanguageContext';

interface BankaiTodayCardProps {
  isDark: boolean;
  materials: MaterialItem[];
  onNavigateToInventory: (filter?: 'all' | 'ok' | 'expiring' | 'expired') => void;
  onNavigateToScan: (itemName?: string) => void;
  onNavigateToSenpai: (prompt?: string) => void;
}

export interface AttentionItem {
  id: string;
  name: string;
  batchNo?: string | null;
  category?: string | null;
  type: 'expired' | 'expiring' | 'low_stock' | 'task';
  statusLabel: string;
  statusBadgeClasses: string;
  dotColor: string;
  detail: string;
  inventoryFilter: 'all' | 'ok' | 'expiring' | 'expired';
  taskPrompt?: string;
}

export default function BankaiTodayCard({
  isDark,
  materials,
  onNavigateToInventory,
  onNavigateToScan,
  onNavigateToSenpai,
}: BankaiTodayCardProps) {
  const { currentLang, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [hasAutoSpoken, setHasAutoSpoken] = useState<boolean>(false);

  // 1. Live computed expired items
  const expiredItems: AttentionItem[] = materials
    .filter((m) => computeMaterialStatus(m.expiryDate) === 'expired' || m.status === 'expired')
    .map((m) => ({
      id: m.id || `exp-${m.name}-${m.batchNo}`,
      name: m.name,
      batchNo: m.batchNo,
      category: m.category,
      type: 'expired',
      statusLabel: t.statusExpired,
      statusBadgeClasses: 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/35',
      dotColor: 'bg-[#EA4335]',
      detail: `${t.itemExpires}: ${m.expiryDate || 'Past'}`,
      inventoryFilter: 'expired',
    }));

  // 2. Live computed expiring soon items
  const expiringItems: AttentionItem[] = materials
    .filter((m) => computeMaterialStatus(m.expiryDate) === 'expiring' || m.status === 'expiring')
    .map((m) => ({
      id: m.id || `expiring-${m.name}-${m.batchNo}`,
      name: m.name,
      batchNo: m.batchNo,
      category: m.category,
      type: 'expiring',
      statusLabel: t.statusExpiring,
      statusBadgeClasses: 'bg-[#FBBC04]/20 text-[#b06000] border-[#FBBC04]/40',
      dotColor: 'bg-[#f29900]',
      detail: `${t.itemExpires}: ${m.expiryDate || 'Soon'}`,
      inventoryFilter: 'expiring',
    }));

  // 3. Live computed low-stock items (quantity <= 10 and not already expired/expiring)
  const lowStockItems: AttentionItem[] = materials
    .filter(
      (m) =>
        m.quantity !== null &&
        m.quantity !== undefined &&
        m.quantity <= 10 &&
        computeMaterialStatus(m.expiryDate) === 'ok'
    )
    .map((m) => ({
      id: m.id || `low-${m.name}-${m.batchNo}`,
      name: m.name,
      batchNo: m.batchNo,
      category: m.category,
      type: 'low_stock',
      statusLabel: currentLang === 'KN' ? 'ಕಡಿಮೆ ದಾಸ್ತಾನು' : currentLang === 'HI' ? 'कम स्टॉक' : 'Low Stock',
      statusBadgeClasses: 'bg-[#FF6D00]/15 text-[#FF6D00] border-[#FF6D00]/35',
      dotColor: 'bg-[#FF6D00]',
      detail: `${t.quantity}: ${m.quantity} ${m.unit || ''}`.trim(),
      inventoryFilter: 'all',
    }));

  // 4. Pending operational tasks
  const pendingTasks: AttentionItem[] = [
    {
      id: 'task-1',
      name:
        currentLang === 'KN'
          ? 'ಬ್ಯಾಚ್ LOT-SC-551 ಕ್ವಾರಂಟೈನ್ ತಪಾಸಣೆ'
          : currentLang === 'HI'
          ? 'बैच LOT-SC-551 के लिए संगरोध जांच'
          : 'Quarantine check for batch LOT-SC-551',
      category:
        currentLang === 'KN' ? 'ಗುಣಮಟ್ಟ ನಿಯಂತ್ರಣ' : currentLang === 'HI' ? 'गुणवत्ता नियंत्रण' : 'Quality Control',
      type: 'task',
      statusLabel: currentLang === 'KN' ? 'ಕಾರ್ಯ' : currentLang === 'HI' ? 'कार्य' : 'Pending Task',
      statusBadgeClasses: 'bg-[#9B72CB]/20 text-[#9B72CB] border-[#9B72CB]/35',
      dotColor: 'bg-[#9B72CB]',
      detail: currentLang === 'KN' ? 'ಗುಣಮಟ್ಟ ತಪಾಸಣೆ ಅಗತ್ಯವಿದೆ' : currentLang === 'HI' ? 'गुणवत्ता जांच आवश्यक' : 'QC audit required',
      inventoryFilter: 'all',
      taskPrompt:
        currentLang === 'KN'
          ? 'ಸೋಡಿಯಂ ಕ್ಲೋರೈಡ್ ರೀಜೆಂಟ್ ಬ್ಯಾಚ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ'
          : currentLang === 'HI'
          ? 'सोडियम क्लोराइड अभिकर्मक लॉट को स्कैन करें'
          : 'scan item Sodium Chloride reagent lot',
    },
    {
      id: 'task-2',
      name:
        currentLang === 'KN'
          ? 'ಪೂರೈಕೆದಾರರ ಮರುಪೂರಣ ದರ ಪರಿಶೀಲನೆ'
          : currentLang === 'HI'
          ? 'आपूर्तिकर्ता पुनःपूर्ति उद्धरण की समीक्षा करें'
          : 'Review supplier replenishment quote',
      category:
        currentLang === 'KN' ? 'ಖರೀದಿ ವಿಭಾಗ' : currentLang === 'HI' ? 'खरीद विभाग' : 'Procurement',
      type: 'task',
      statusLabel: currentLang === 'KN' ? 'ಮರುಪೂರಣ' : currentLang === 'HI' ? 'पुनःपूर्ति' : 'Reorder',
      statusBadgeClasses: 'bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/35',
      dotColor: 'bg-[#4285F4]',
      detail: currentLang === 'KN' ? 'ಪೂರೈಕೆದಾರರ ದರ ಸಿದ್ಧವಾಗಿದೆ' : currentLang === 'HI' ? 'आपूर्तिकर्ता कोट तैयार' : 'Supplier quotes ready',
      inventoryFilter: 'all',
      taskPrompt:
        currentLang === 'KN'
          ? 'ಸಾವಯವ ಕಾಫಿ ಬೀಜಗಳಿಗೆ ಪರಿಶೀಲಿಸಿದ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ'
          : currentLang === 'HI'
          ? 'ऑर्गेनिक कॉफ़ी बीन्स के लिए सत्यापित आपूर्तिकर्ता खोजें'
          : 'find verified suppliers for organic coffee beans',
    },
  ];

  // Fallback demo alerts if no items exist in Firestore yet
  const fallbackAlertItems: AttentionItem[] = [
    {
      id: 'fallback-1',
      name: 'Amoxicillin 500mg Capsules',
      batchNo: 'LOT-AMX-2026',
      category: 'Pharmaceuticals',
      type: 'expiring',
      statusLabel: t.statusExpiring,
      statusBadgeClasses: 'bg-[#FBBC04]/20 text-[#b06000] border-[#FBBC04]/40',
      dotColor: 'bg-[#f29900]',
      detail: `${t.itemExpires}: 2026-11-10 (${currentLang === 'KN' ? '೪ ದಿನಗಳು ಬಾಕಿ' : currentLang === 'HI' ? '4 दिन शेष' : '4 days left'})`,
      inventoryFilter: 'expiring',
    },
    {
      id: 'fallback-2',
      name: 'Sodium Chloride Analytical Grade',
      batchNo: 'LOT-SC-551',
      category: 'Raw Materials',
      type: 'low_stock',
      statusLabel: currentLang === 'KN' ? 'ಕಡಿಮೆ ದಾಸ್ತಾನು' : currentLang === 'HI' ? 'कम स्टॉक' : 'Low Stock',
      statusBadgeClasses: 'bg-[#FF6D00]/15 text-[#FF6D00] border-[#FF6D00]/35',
      dotColor: 'bg-[#FF6D00]',
      detail: `${t.quantity}: 2 kg (${currentLang === 'KN' ? 'ಮರುಪೂರಣ ಅಗತ್ಯ' : currentLang === 'HI' ? 'पुनःपूर्ति आवश्यक' : 'Restock needed'})`,
      inventoryFilter: 'all',
    },
  ];

  // Combined list of all attention items
  const combinedMaterialAlerts = [...expiredItems, ...expiringItems, ...lowStockItems];
  const allAttentionItems: AttentionItem[] =
    combinedMaterialAlerts.length > 0
      ? [...combinedMaterialAlerts, ...pendingTasks]
      : [...fallbackAlertItems, ...pendingTasks];

  const totalAttentionCount = allAttentionItems.length;

  const { greeting, spokenText } = generateBankaiSummary(
    totalAttentionCount,
    expiredItems.length > 0 ? expiredItems.length : 1,
    expiringItems.length > 0 ? expiringItems.length : 1,
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
      }, 600);

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
      expiredItems.length > 0 ? expiredItems.length : 1,
      expiringItems.length > 0 ? expiringItems.length : 1,
      langToUse
    );
    speakText(
      summary.spokenText,
      langToUse,
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`mx-4 my-2.5 rounded-[24px] border p-4 transition-all shadow-xl relative backdrop-blur-2xl flex-shrink-0 z-20 ${
        isDark
          ? 'bg-gradient-to-br from-[#161324]/95 via-[#111420]/95 to-[#19152b]/95 border-[#9B72CB]/30 shadow-[0_12px_40px_rgba(155,114,203,0.18)]'
          : 'bg-gradient-to-br from-[#f8f5ff] via-white to-[#f3eefc] border-[#9B72CB]/25 shadow-[0_8px_30px_rgba(155,114,203,0.12)]'
      }`}
    >
      {/* Decorative Aurora Glow behind Card - Pointer events none so it never blocks desktop clicks */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#9B72CB]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-[#EA4335]/15 blur-2xl pointer-events-none" />

      {/* Whole Header Row is a Single Interactive Button for Expand/Collapse (Desktop + Mobile) */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpanded();
          }
        }}
        aria-expanded={isExpanded}
        className={`w-full flex items-center justify-between p-1.5 -m-1.5 rounded-[16px] transition-all cursor-pointer relative z-20 outline-none select-none ${
          isDark
            ? 'hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[#9B72CB]'
            : 'hover:bg-[#9B72CB]/10 focus-visible:ring-2 focus-visible:ring-[#9B72CB]'
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Bankai Flame Avatar */}
          <div className="w-8 h-8 rounded-[12px] bg-gradient-to-br from-[#9B72CB] via-[#EA4335] to-[#FBBC04] p-[1.5px] shadow-md flex items-center justify-center flex-shrink-0">
            <div className={`w-full h-full rounded-[10.5px] flex items-center justify-center ${isDark ? 'bg-[#0f111a]' : 'bg-white'}`}>
              <Flame className="w-4 h-4 text-[#9B72CB] animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight font-['Google_Sans',sans-serif]">
                {t.bankaiToday}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-[#9B72CB]/20 text-[#9B72CB] border border-[#9B72CB]/30">
  {new Date().toLocaleDateString(
    currentLang === 'KN' ? 'kn-IN' : currentLang === 'HI' ? 'hi-IN' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  )}
</span>
            </div>
            <div className="text-[11px] font-medium text-[#EA4335] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-ping" />
              <span>
                {totalAttentionCount} {t.attentionNeeded}
              </span>
            </div>
          </div>
        </div>

        {/* Audio Speaker & Accordion Chevron */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Speaker Button to Replay Speech */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isSpeaking) {
                stopSpeech();
                setIsSpeaking(false);
              } else {
                handleSpeak();
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              isSpeaking
                ? 'bg-[#EA4335] text-white border-transparent shadow-[0_0_14px_rgba(234,67,53,0.5)] animate-pulse'
                : isDark
                ? 'bg-white/10 text-slate-300 hover:text-white border-white/10'
                : 'bg-white text-slate-700 hover:text-black border-slate-200'
            }`}
            title={isSpeaking ? t.stopBriefing : t.speakBriefing}
            aria-label="Speech Audio"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Accordion Chevron Toggle Button */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                : 'bg-white/80 border-slate-200 text-slate-600 hover:text-black hover:bg-white'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Spoken One-Line Summary Quote Banner */}
      <div
        className={`px-3 py-2 rounded-[14px] text-xs font-medium my-2.5 flex items-start gap-2 border relative z-10 ${
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
          <span className="text-[10px] text-[#9B72CB] font-bold uppercase tracking-wider animate-pulse flex-shrink-0">
            {t.speaking}
          </span>
        )}
      </div>

      {/* ========================================================================= */}
      {/* COLLAPSIBLE PRIORITISED ATTENTION ITEMS PANEL                             */}
      {/* Has guaranteed real min-height and scrollable max-height on web & mobile  */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div className="w-full max-h-[360px] sm:max-h-[440px] overflow-y-auto space-y-2 mt-2 pt-2 border-t border-white/10 relative z-30 min-h-[140px] pr-1">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1 text-slate-400">
            <span>
              {currentLang === 'KN'
                ? 'ಗಮನಿಸಬೇಕಾದ ಮುಕ್ತ ಎಚ್ಚರಿಕೆಗಳು & ಕಾರ್ಯಗಳು'
                : currentLang === 'HI'
                ? 'ध्यान देने योग्य अलर्ट और लंबित कार्य'
                : 'Open Attention Items & Operational Tasks'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9B72CB]/15 text-[#9B72CB]">
              {allAttentionItems.length} {t.items}
            </span>
          </div>

          {allAttentionItems.map((item) => {
            const isTask = item.type === 'task';
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-[16px] border transition-all flex flex-wrap items-center justify-between gap-x-2.5 gap-y-2 shadow-sm hover:shadow-md ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                    : 'bg-white border-slate-200 hover:border-[#9B72CB]/40 hover:bg-slate-50'
                }`}
              >
                {/* Left: Type Icon & Info (takes the full row on narrow screens; actions wrap below) */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1 basis-[200px]">
                  <div
                    className={`w-7 h-7 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                      item.type === 'expired'
                        ? 'bg-[#EA4335]/20 text-[#EA4335]'
                        : item.type === 'expiring'
                        ? 'bg-[#FBBC04]/20 text-[#f29900]'
                        : item.type === 'low_stock'
                        ? 'bg-[#FF6D00]/20 text-[#FF6D00]'
                        : 'bg-[#9B72CB]/20 text-[#9B72CB]'
                    }`}
                  >
                    {item.type === 'expired' && <Flame className="w-3.5 h-3.5" />}
                    {item.type === 'expiring' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {item.type === 'low_stock' && <TrendingDown className="w-3.5 h-3.5" />}
                    {item.type === 'task' && <ListTodo className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col">
                    <h4
                      className={`text-xs font-bold leading-snug line-clamp-2 break-words ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.name}
                    </h4>
                    {item.batchNo && (
                      <span className="text-[10px] font-mono text-[#4285F4] truncate mt-0.5">{item.batchNo}</span>
                    )}
                    <div
                      className={`text-[10px] mt-0.5 truncate ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {item.detail}
                    </div>
                  </div>
                </div>

                {/* Right: Status Chip + Shortcut Button to Inventory */}
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border capitalize flex items-center gap-1 whitespace-nowrap ${item.statusBadgeClasses}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                    <span>{item.statusLabel}</span>
                  </span>

                  {isTask && item.taskPrompt ? (
                    <button
                      type="button"
                      onClick={() => onNavigateToSenpai(item.taskPrompt)}
                      className="h-7 px-2.5 rounded-[10px] ai-rainbow-gradient text-white text-[10px] font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                      title={t.runAudit}
                    >
                      <span>{t.runAudit}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateToInventory(item.inventoryFilter)}
                      className={`h-7 px-2.5 rounded-[10px] text-[10px] font-bold border flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isDark
                          ? 'bg-[#4285F4]/15 hover:bg-[#4285F4]/25 text-[#4285F4] border-[#4285F4]/30'
                          : 'bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#1a73e8] border-[#4285F4]/25'
                      }`}
                      title={t.resolveNow}
                    >
                      <Package className="w-3 h-3" />
                      <span>{t.inventoryTab}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
