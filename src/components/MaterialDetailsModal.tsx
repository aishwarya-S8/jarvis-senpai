import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Calendar,
  Clock,
  Package,
  Hash,
  Layers,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  FileText,
  TrendingDown,
  TrendingUp,
  Activity,
  Copy,
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  MaterialItem,
  BatchUsageLog,
  fetchBatchEntries,
  subscribeBatchUsageLogs,
  addBatchUsageLog,
  computeMaterialStatus,
} from '../services/materialService';

interface MaterialDetailsModalProps {
  material: MaterialItem | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onMaterialUpdated?: () => void;
}

export default function MaterialDetailsModal({
  material,
  isOpen,
  onClose,
  isDark,
  onMaterialUpdated,
}: MaterialDetailsModalProps) {
  if (!isOpen || !material) return null;

  const [activeTab, setActiveTab] = useState<'history' | 'specs'>('history');
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  // Firestore Batch Data
  const [batchEntries, setBatchEntries] = useState<MaterialItem[]>([]);
  const [usageLogs, setUsageLogs] = useState<BatchUsageLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Log Usage Form State
  const [isLoggingUsage, setIsLoggingUsage] = useState<boolean>(false);
  const [usageQuantity, setUsageQuantity] = useState<number>(1);
  const [usageAction, setUsageAction] = useState<BatchUsageLog['action']>('dispensed');
  const [usagePurpose, setUsagePurpose] = useState<string>('Production formulation');
  const [usageOperator, setUsageOperator] = useState<string>('QC Technician');
  const [isSubmittingLog, setIsSubmittingLog] = useState<boolean>(false);
  const [logSuccessNotice, setLogSuccessNotice] = useState<string | null>(null);

  const batchNo = material.batchNo || 'UNKNOWN-BATCH';
  const dynamicStatus = computeMaterialStatus(material.expiryDate);

  // Status Chip Colors
  let chipClasses = 'bg-[#34A853]/15 text-[#34A853] border-[#34A853]/40';
  let chipLabel = 'ok';
  let chipDot = 'bg-[#34A853]';

  if (dynamicStatus === 'expiring') {
    chipClasses = 'bg-[#f29900]/15 text-[#f29900] border-[#f29900]/40';
    chipLabel = 'expiring';
    chipDot = 'bg-[#f29900]';
  } else if (dynamicStatus === 'expired') {
    chipClasses = 'bg-[#EA4335]/15 text-[#EA4335] border-[#EA4335]/40';
    chipLabel = 'expired';
    chipDot = 'bg-[#EA4335]';
  }

  // 1. Fetch all Firestore entries with this Batch/LOT number
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHistory(true);

    if (material.batchNo) {
      fetchBatchEntries(material.batchNo).then((entries) => {
        if (isMounted) {
          setBatchEntries(entries);
        }
      });
    } else {
      setBatchEntries([material]);
    }

    return () => {
      isMounted = false;
    };
  }, [material.batchNo, material]);

  // 2. Real-time subscription to usage logs for this Batch/LOT number from Firestore
  useEffect(() => {
    if (!material.batchNo) {
      setUsageLogs([]);
      setIsLoadingHistory(false);
      return;
    }

    const unsubscribe = subscribeBatchUsageLogs(
      material.batchNo,
      (logs) => {
        setUsageLogs(logs);
        setIsLoadingHistory(false);
      },
      (err) => {
        console.warn('Error subscribing to batch usage logs:', err);
        setIsLoadingHistory(false);
      }
    );

    return () => unsubscribe();
  }, [material.batchNo]);

  // Copy batch number to clipboard
  const handleCopyBatch = () => {
    if (material.batchNo) {
      navigator.clipboard.writeText(material.batchNo);
      setCopiedBatch(true);
      setTimeout(() => setCopiedBatch(false), 2000);
    }
  };

  // Submit new usage log to Firestore
  const handleRecordUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.batchNo || usageQuantity <= 0) return;

    setIsSubmittingLog(true);
    setLogSuccessNotice(null);

    const currentQty = material.quantity ?? 0;
    const isDeduction = usageAction === 'dispensed' || usageAction === 'qc_inspection' || usageAction === 'disposed';
    const delta = isDeduction ? -Math.abs(usageQuantity) : Math.abs(usageQuantity);
    const newRemaining = Math.max(0, currentQty + delta);

    try {
      await addBatchUsageLog(
        {
          batchNo: material.batchNo,
          materialId: material.id,
          materialName: material.name,
          action: usageAction,
          quantityChange: delta,
          remainingQuantity: newRemaining,
          unit: material.unit || 'units',
          purposeOrNotes: usagePurpose.trim() || 'Dispensed from batch',
          operator: usageOperator.trim() || 'Technician',
          timestamp: new Date().toISOString(),
        },
        material.id,
        newRemaining
      );

      setLogSuccessNotice(`Logged ${Math.abs(delta)} ${material.unit || 'units'} (${usageAction}). New balance: ${newRemaining} ${material.unit || ''}`);
      setIsLoggingUsage(false);
      setUsageQuantity(1);

      if (onMaterialUpdated) {
        onMaterialUpdated();
      }

      setTimeout(() => setLogSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error('Failed to log batch usage:', err);
      alert(`Could not log usage: ${err?.message || 'Database error'}`);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Total quantity consumed across this batch
  const totalQuantityDispensed = usageLogs
    .filter((l) => l.quantityChange < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.quantityChange), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-[420px] max-h-[90vh] rounded-[28px] border flex flex-col shadow-2xl relative overflow-hidden transition-all ${
          isDark
            ? 'bg-[#10131b]/95 border-white/15 text-slate-100 shadow-[0_24px_60px_rgba(0,0,0,0.8)]'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Modal Top Bar */}
        <div
          className={`px-5 py-4 border-b flex items-start justify-between flex-shrink-0 z-10 transition-colors ${
            isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex-1 pr-3 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border capitalize flex items-center gap-1 ${chipClasses}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${chipDot}`} />
                <span>{chipLabel}</span>
              </span>
              <span className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {material.category || 'Inventory Item'}
              </span>
            </div>

            <h2 className="text-base font-bold truncate font-['Google_Sans',sans-serif]">
              {material.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: Batch History vs Specifications */}
        <div
          className={`flex items-center border-b px-4 z-10 ${
            isDark ? 'bg-black/20 border-white/5' : 'bg-slate-100/60 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#4285F4] text-[#4285F4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Batch History ({usageLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-[#4285F4] text-[#4285F4]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Item Details</span>
          </button>
        </div>

        {/* Success Notice Banner */}
        {logSuccessNotice && (
          <div className="mx-4 mt-3 p-3 rounded-[16px] bg-[#34A853]/15 border border-[#34A853]/30 text-[#34A853] text-xs font-medium flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{logSuccessNotice}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scroll-smooth">
          {/* Top Quick Batch Overview Card */}
          <div
            className={`p-3.5 rounded-[20px] border relative overflow-hidden ${
              isDark ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Hash className="w-3.5 h-3.5 text-[#4285F4]" />
                <span className="font-semibold text-slate-400">LOT / Batch:</span>
                <span className="font-mono font-bold">{batchNo}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyBatch}
                className="text-[11px] flex items-center gap-1 text-slate-400 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                title="Copy batch number"
              >
                {copiedBatch ? <Check className="w-3 h-3 text-[#34A853]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBatch ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className={`p-2 rounded-[14px] border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
                <span className="text-sm font-extrabold text-[#4285F4] block mt-0.5">
                  {material.quantity !== null ? `${material.quantity} ${material.unit || ''}` : '—'}
                </span>
              </div>

              <div className={`p-2 rounded-[14px] border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Used</span>
                <span className="text-sm font-extrabold text-[#EA4335] block mt-0.5">
                  {totalQuantityDispensed > 0 ? `${totalQuantityDispensed} ${material.unit || ''}` : '0'}
                </span>
              </div>

              <div className={`p-2 rounded-[14px] border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Expiry</span>
                <span className="text-xs font-bold block mt-1 truncate">
                  {material.expiryDate || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: BATCH HISTORY & USAGE LOGS                         */}
          {/* ========================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {/* Header with "Log Usage" trigger */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider font-['Google_Sans',sans-serif] flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#4285F4]" />
                    <span>Batch Timeline & Provenance</span>
                  </h3>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Fetched live from Firestore for LOT {batchNo}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLoggingUsage(!isLoggingUsage)}
                  className="px-3 py-1.5 rounded-[14px] ai-rainbow-gradient text-white text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isLoggingUsage ? 'Cancel' : 'Log Usage'}</span>
                </button>
              </div>

              {/* Log Usage Form Drawer */}
              {isLoggingUsage && (
                <form
                  onSubmit={handleRecordUsage}
                  className={`p-3.5 rounded-[20px] border space-y-3 animate-fade-in ${
                    isDark ? 'bg-[#181c29] border-[#4285F4]/40' : 'bg-blue-50/70 border-[#4285F4]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4285F4] flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Record Batch Usage / Dispensing</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Stock: {material.quantity} {material.unit}
                    </span>
                  </div>

                  {/* Action Selector */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'dispensed', label: 'Dispense', icon: TrendingDown },
                      { id: 'qc_inspection', label: 'QC Test', icon: ShieldCheck },
                      { id: 'adjustment', label: 'Restock', icon: TrendingUp },
                    ].map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setUsageAction(act.id as any)}
                        className={`py-1.5 px-2 rounded-[12px] text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          usageAction === act.id
                            ? 'bg-[#4285F4] text-white border-transparent shadow-sm'
                            : isDark
                            ? 'bg-white/5 border-white/10 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <act.icon className="w-3 h-3" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Quantity Input */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Quantity ({material.unit || 'units'}):
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={usageQuantity}
                        onChange={(e) => setUsageQuantity(parseFloat(e.target.value) || 0)}
                        required
                        className={`w-full h-9 px-3 rounded-[12px] text-xs font-bold outline-none border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Operator / Tech:
                      </label>
                      <input
                        type="text"
                        value={usageOperator}
                        onChange={(e) => setUsageOperator(e.target.value)}
                        placeholder="Operator name"
                        className={`w-full h-9 px-3 rounded-[12px] text-xs outline-none border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Purpose / Notes */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Purpose or Job Reference:
                    </label>
                    <input
                      type="text"
                      value={usagePurpose}
                      onChange={(e) => setUsagePurpose(e.target.value)}
                      placeholder="e.g. Batch run #4, Clinical formulation, Sample inspection"
                      className={`w-full h-9 px-3 rounded-[12px] text-xs outline-none border ${
                        isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLog || usageQuantity <= 0}
                    className="w-full h-10 rounded-[14px] ai-rainbow-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingLog ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Commit Usage to Firestore</span>
                  </button>
                </form>
              )}

              {/* Firestore Previous Entries matching this BatchNo */}
              {batchEntries.length > 1 && (
                <div
                  className={`p-3 rounded-[18px] border text-xs ${
                    isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#4285F4] mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Related Firestore Records ({batchEntries.length} with LOT #{batchNo})</span>
                  </div>
                  <div className="space-y-1">
                    {batchEntries.map((ent) => (
                      <div
                        key={ent.id}
                        className="flex items-center justify-between py-1 border-b border-white/5 last:border-0 text-[11px]"
                      >
                        <span className="truncate max-w-[170px] font-medium">{ent.name}</span>
                        <span className="font-mono text-slate-400">{ent.purchaseDate || 'No date'}</span>
                        <span className="font-bold text-[#4285F4]">{ent.quantity} {ent.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Logs Timeline */}
              {isLoadingHistory ? (
                <div className="text-center py-8 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#4285F4] mx-auto" />
                  <p className="text-xs text-slate-400">Loading batch records from Firestore...</p>
                </div>
              ) : usageLogs.length === 0 ? (
                <div
                  className={`text-center py-8 px-4 rounded-[20px] border ${
                    isDark ? 'bg-white/[0.02] border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <History className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  <div className="text-xs font-bold mb-1">No usage logs recorded for this LOT</div>
                  <p className="text-[11px] max-w-[240px] mx-auto text-slate-400 mb-3">
                    Start tracking consumption and dispensing events by tapping "Log Usage" above.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLoggingUsage(true)}
                    className="px-4 py-2 rounded-[14px] ai-rainbow-gradient text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Record First Usage
                  </button>
                </div>
              ) : (
                <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#4285F4] before:via-[#9B72CB] before:to-transparent">
                  {usageLogs.map((log) => {
                    const isPositive = log.quantityChange >= 0;
                    const dateFormatted = log.timestamp
                      ? new Date(log.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Recently';

                    return (
                      <div key={log.id || log.timestamp} className="relative group">
                        {/* Timeline Node Dot */}
                        <div
                          className={`absolute -left-5 top-1.5 w-3 h-3 rounded-full border-2 ${
                            isPositive
                              ? 'bg-[#34A853] border-white shadow-[0_0_8px_rgba(52,168,83,0.5)]'
                              : 'bg-[#4285F4] border-white shadow-[0_0_8px_rgba(66,133,244,0.5)]'
                          }`}
                        />

                        {/* Log Card */}
                        <div
                          className={`p-3 rounded-[16px] border text-xs transition-all ${
                            isDark
                              ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                              : 'bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold capitalize text-slate-200 flex items-center gap-1">
                              {log.action === 'initial_stock' && <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />}
                              {log.action === 'dispensed' && <TrendingDown className="w-3.5 h-3.5 text-[#EA4335]" />}
                              {log.action === 'qc_inspection' && <ShieldCheck className="w-3.5 h-3.5 text-[#34A853]" />}
                              {log.action === 'adjustment' && <TrendingUp className="w-3.5 h-3.5 text-[#4285F4]" />}
                              <span>{log.action.replace('_', ' ')}</span>
                            </span>

                            <span
                              className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-full ${
                                isPositive
                                  ? 'bg-[#34A853]/15 text-[#34A853]'
                                  : 'bg-[#EA4335]/15 text-[#EA4335]'
                              }`}
                            >
                              {isPositive ? `+${log.quantityChange}` : log.quantityChange} {log.unit}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 mb-1.5 leading-snug">
                            {log.purposeOrNotes}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{log.operator || 'Operator'}</span>
                            </span>

                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{dateFormatted}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SPECIFICATIONS & METADATA                          */}
          {/* ========================================================= */}
          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-[20px] border text-xs space-y-2.5 ${
                  isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Material Name:</span>
                  <span className="font-bold">{material.name}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold">{material.category || 'Standard'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Batch / LOT Number:</span>
                  <span className="font-mono font-bold text-[#4285F4]">{batchNo}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Current Stock:</span>
                  <span className="font-bold">{material.quantity} {material.unit}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Purchase / Mfr Date:</span>
                  <span className="font-medium">{material.purchaseDate || 'Not specified'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Shelf Life Period:</span>
                  <span className="font-medium">{material.shelfLifeDays || 90} days</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Calculated Expiry Date:</span>
                  <span className="font-bold text-[#EA4335]">{material.expiryDate || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Gemini Extraction Confidence:</span>
                  <span className="font-bold text-[#34A853]">
                    {Math.round((material.confidence ?? 0.95) * 100)}% Verified
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Firestore Document ID:</span>
                  <span className="font-mono text-[10px] text-slate-400">{material.id || 'Pending'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close Button */}
        <div
          className={`p-3 border-t flex items-center justify-between flex-shrink-0 ${
            isDark ? 'bg-black/30 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <span className="text-[11px] text-slate-400 font-mono">
            LOT #{batchNo}
          </span>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-[16px] text-xs font-bold transition-all cursor-pointer border ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/15 border-white/10'
                : 'bg-white text-slate-800 hover:bg-slate-200 border-slate-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
