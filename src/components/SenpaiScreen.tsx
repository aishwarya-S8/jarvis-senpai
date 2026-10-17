import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  AlertTriangle,
  Package,
  Camera,
  Truck,
  FileCheck,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  Info,
  CornerDownLeft,
  X,
  RotateCcw,
  MessageSquare,
  Bot,
  Zap,
  HelpCircle
} from 'lucide-react';
import {
  ChatMessage,
  SenpaiFunctionCall,
  sendVoiceToSenpai,
} from '../services/senpaiService';
import { MaterialItem } from '../services/materialService';
import {
  AppLanguage,
  speakText,
  stopSpeech,
  SUPPORTED_LANGUAGES,
} from '../services/speechService';
import { getTranslations } from '../services/i18n';

interface SenpaiScreenProps {
  isDark: boolean;
  materials: MaterialItem[];
  currentLang: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  initialPrompt?: string | null;
  onNavigateToScan: (presetItemName?: string) => void;
  onNavigateToInventory: (filter?: 'all' | 'ok' | 'expiring' | 'expired') => void;
}

type SenpaiPhase = 'idle' | 'listening' | 'thinking' | 'searching' | 'revealed';

export default function SenpaiScreen({
  isDark,
  materials,
  currentLang,
  onLanguageChange,
  initialPrompt,
  onNavigateToScan,
  onNavigateToInventory,
}: SenpaiScreenProps) {
  const t = getTranslations(currentLang);

  // Check SpeechRecognition browser API support
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
  const isSpeechSupported = !!SpeechRecognitionAPI;

  // Active View Mode: 'orb' (Two-State Hero Orb & Flip Card) or 'chat' (Transcript / History)
  const [viewMode, setViewMode] = useState<'orb' | 'chat'>('orb');

  // Senpai State Machine Phase
  const [phase, setPhase] = useState<SenpaiPhase>('idle');
  const [statusMessage, setStatusMessage] = useState<string>(t.tapToSpeak);

  // Real-time audio amplitude for liquid orb morphing (0.0 to 1.0)
  const [audioAmplitude, setAudioAmplitude] = useState<number>(0);

  // Live SpeechRecognition transcript
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');

  // Latest Result Revealed Card data
  const [latestAnswer, setLatestAnswer] = useState<{
    transcript: string;
    answer: string;
    functionCalls?: SenpaiFunctionCall[];
    timestamp: string;
  } | null>(null);

  // Sheen sweep trigger flag
  const [sheenTrigger, setSheenTrigger] = useState<boolean>(false);

  // Chat conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      sender: 'senpai',
      text: "Konnichiwa! I am Senpai, your AI inventory assistant in Jarvis Senpai 2026. Speak naturally—I'll transcribe your words locally and use Gemini to predict alerts, inspect materials, discover suppliers, or draft purchase orders.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Audio stream & SpeechRecognition refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // General controls
  const [autoSpeakAnswers, setAutoSpeakAnswers] = useState<boolean>(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [typedPrompt, setTypedPrompt] = useState<string>('');
  const [showTextInput, setShowTextInput] = useState<boolean>(!isSpeechSupported);
  const [approvedOrders, setApprovedOrders] = useState<Record<string, boolean>>({});

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Map AppLanguage to SpeechRecognition locale
  const getLocaleForLang = (lang: AppLanguage): string => {
    switch (lang) {
      case 'HI':
        return 'hi-IN';
      case 'KN':
        return 'kn-IN';
      case 'EN':
      default:
        return 'en-US';
    }
  };

  // Scroll chat to bottom on updates
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, phase]);

  // Handle external initial prompt if provided
  useEffect(() => {
    if (initialPrompt) {
      handleSendText(initialPrompt);
    }
  }, [initialPrompt]);

  // Clean up recognition, audio context, and speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopListening();
    };
  }, []);

  /**
   * Stop listening and release media stream / audio context
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore
      }
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAudioAmplitude(0);
  }, []);

  /**
   * Start listening:
   * 1. Launches browser SpeechRecognition in selected language
   * 2. Opens user media mic stream solely to calculate real-time amplitude for orb ripple
   */
  const startListening = async () => {
    setErrorMessage(null);
    stopSpeech();
    setCurrentlySpeakingId(null);
    setInterimTranscript('');
    setFinalTranscript('');

    if (!isSpeechSupported) {
      setShowTextInput(true);
      setErrorMessage(
        'Browser SpeechRecognition is not supported on this browser. Please type your query in the text box below or click a quick prompt.'
      );
      return;
    }

    try {
      // 1. AudioContext setup for orb amplitude morphing
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;

          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateAmp = () => {
              if (analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                const normalized = Math.min(1.0, avg / 128);
                setAudioAmplitude(normalized);
                animFrameRef.current = requestAnimationFrame(updateAmp);
              }
            };
            animFrameRef.current = requestAnimationFrame(updateAmp);
          }
        } catch (micErr) {
          console.warn('Microphone stream for amplitude visualization unavailable:', micErr);
        }
      }

      // 2. Initialize SpeechRecognition
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = getLocaleForLang(currentLang);

      recognition.onstart = () => {
        setPhase('listening');
        setStatusMessage('Listening…');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          setFinalTranscript(final);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        stopListening();
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please check browser permissions.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition notice: ${event.error}`);
        }
        setPhase('idle');
        setStatusMessage('Tap microphone to speak to Senpai');
      };

      recognition.onend = () => {
        stopListening();
        // If we captured a transcript, automatically send it
        const textToSend = finalTranscript.trim() || interimTranscript.trim();
        if (textToSend) {
          handleSendText(textToSend);
        } else {
          setPhase('idle');
          setStatusMessage('Tap microphone to speak to Senpai');
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start SpeechRecognition:', err);
      stopListening();
      setPhase('idle');
      setStatusMessage('Tap microphone to speak to Senpai');
      setErrorMessage(`Could not start speech recognition: ${err.message || 'Error occurred'}`);
    }
  };

  /**
   * Sends the user speech text to Gemini endpoint with SENPAI system prompt and 4 tools
   * NO audio upload to Gemini at all!
   */
  const handleSendText = async (text: string) => {
    const query = text.trim();
    if (!query) return;

    stopListening();
    stopSpeech();

    // Determine phase based on intent keywords
    const lower = query.toLowerCase();
    const isSearchIntent =
      lower.includes('supplier') ||
      lower.includes('vendor') ||
      lower.includes('alert') ||
      lower.includes('expire') ||
      lower.includes('scan') ||
      lower.includes('order');

    setPhase(isSearchIntent ? 'searching' : 'thinking');
    setStatusMessage(isSearchIntent ? 'Searching…' : 'Thinking…');

    const tempUserMsgId = `user-${Date.now()}`;
    const senpaiMsgId = `senpai-${Date.now()}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message to conversation list
    const userMsg: ChatMessage = {
      id: tempUserMsgId,
      sender: 'user',
      text: query,
      timestamp: timeNow,
      isAudio: true, // indicates it was spoken/voice query
    };

    setMessages((prev) => [...prev, userMsg]);
    setTypedPrompt('');

    try {
      // Send strictly TEXT to Gemini endpoint with registered tools
      const response = await sendVoiceToSenpai(undefined, undefined, query);

      const answerText = response.senpaiAnswer || "I've analyzed your inventory request.";
      const functionCalls = response.functionCalls || [];

      const senpaiMsg: ChatMessage = {
        id: senpaiMsgId,
        sender: 'senpai',
        text: answerText,
        timestamp: timeNow,
        functionCalls,
      };

      setMessages((prev) => [...prev, senpaiMsg]);

      // State 2: Found something → Reveal!
      setLatestAnswer({
        transcript: query,
        answer: answerText,
        functionCalls,
        timestamp: timeNow,
      });

      // Smoothly transition from orb to flipped card with shining halo sweep
      setPhase('revealed');
      setStatusMessage('Result ready');
      setSheenTrigger(true);
      setTimeout(() => setSheenTrigger(false), 1200);

      // Speak answer back with browser SpeechSynthesis API in current language
      if (autoSpeakAnswers && answerText) {
        setCurrentlySpeakingId(senpaiMsgId);
        speakText(
          answerText,
          currentLang,
          () => setCurrentlySpeakingId(null),
          () => setCurrentlySpeakingId(null)
        );
      }
    } catch (err: any) {
      console.error('Senpai text processing failed:', err);
      setErrorMessage(err.message || 'Failed to communicate with Senpai');
      setPhase('idle');
      setStatusMessage('Tap microphone to speak to Senpai');

      setMessages((prev) => [
        ...prev,
        {
          id: `senpai-${Date.now()}`,
          sender: 'senpai',
          text: `Gomen ne! I encountered an error: ${err.message || 'Please check your connection and try again.'}`,
          timestamp: timeNow,
        },
      ]);
    }
  };

  /**
   * Speak a specific message using browser SpeechSynthesis
   */
  const playSpeechForMessage = (messageId: string, textToSpeak: string) => {
    if (currentlySpeakingId === messageId) {
      stopSpeech();
      setCurrentlySpeakingId(null);
      return;
    }

    stopSpeech();
    setCurrentlySpeakingId(messageId);
    speakText(
      textToSpeak,
      currentLang,
      () => setCurrentlySpeakingId(null),
      () => setCurrentlySpeakingId(null)
    );
  };

  /**
   * Renders the interactive result card for one of the 4 registered tools:
   * 1. scanItem
   * 2. predictAlerts
   * 3. findSuppliers
   * 4. draftOrder
   */
  const renderToolResult = (call: SenpaiFunctionCall, callIndex: number) => {
    const { name, args } = call;

    if (name === 'scanItem') {
      const itemName = args.itemName || 'Specified Material';
      const category = args.category || 'General';

      return (
        <div
          key={`tool-${callIndex}`}
          className={`mt-3 p-3.5 rounded-[20px] border transition-all ${
            isDark ? 'bg-black/40 border-[#4285F4]/30' : 'bg-[#e8f0fe]/80 border-[#4285F4]/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#4285F4]/20 text-[#4285F4]">
                <Camera className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold font-['Google_Sans',sans-serif] text-[#4285F4]">
                Tool: scanItem
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#4285F4]/15 text-[#4285F4]">
              {category}
            </span>
          </div>

          <p className="text-xs mb-2.5">
            Ready to inspect barcode and batch certificate for <strong className="font-semibold">{itemName}</strong>.
          </p>

          <button
            type="button"
            onClick={() => onNavigateToScan(itemName)}
            className="w-full py-2 px-3 rounded-[14px] ai-rainbow-gradient text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Launch Camera Scanner Now</span>
          </button>
        </div>
      );
    }

    if (name === 'predictAlerts') {
      const expiringItems = materials.filter((m) => m.status === 'expiring' || m.status === 'expired');
      const filterDays = args.filterDays || 30;

      return (
        <div
          key={`tool-${callIndex}`}
          className={`mt-3 p-3.5 rounded-[20px] border transition-all ${
            isDark ? 'bg-black/40 border-[#FBBC04]/30' : 'bg-[#fef7e0]/80 border-[#FBBC04]/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#FBBC04]/20 text-[#FBBC04]">
                <AlertTriangle className="w-4 h-4 text-[#FBBC04]" />
              </span>
              <span className="text-xs font-bold font-['Google_Sans',sans-serif] text-[#FBBC04]">
                Tool: predictAlerts
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FBBC04]/20 text-[#FBBC04]">
              &lt; {filterDays} Days
            </span>
          </div>

          <div className="text-xs mb-2.5">
            Found <span className="font-bold text-[#EA4335]">{expiringItems.length}</span> batches requiring prompt action in the next {filterDays} days.
          </div>

          {expiringItems.length > 0 && (
            <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto pr-1">
              {expiringItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`text-[11px] p-2 rounded-[12px] flex items-center justify-between border ${
                    isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{item.batchNo}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.status === 'expired'
                        ? 'bg-[#EA4335]/20 text-[#EA4335]'
                        : 'bg-[#FBBC04]/20 text-[#FBBC04]'
                    }`}
                  >
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => onNavigateToInventory('expiring')}
            className="w-full py-2 px-3 rounded-[14px] bg-[#FBBC04] hover:bg-[#e2a900] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>View At-Risk Items in Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    if (name === 'findSuppliers') {
      const materialName = args.materialName || 'Bio-Pharmaceutical Reagents';
      const quantity = args.quantityNeeded || 50;

      const suppliers = [
        { name: 'Apex Bioscience Direct', quote: '$420.00 / lot', leadDays: '2 days', rating: '99.4%' },
        { name: 'Kanto Chemical Logistics', quote: '$395.50 / lot', leadDays: '4 days', rating: '98.1%' },
        { name: 'Global Material Hub', quote: '$380.00 / lot', leadDays: '7 days', rating: '96.8%' },
      ];

      return (
        <div
          key={`tool-${callIndex}`}
          className={`mt-3 p-3.5 rounded-[20px] border transition-all ${
            isDark ? 'bg-black/40 border-[#34A853]/30' : 'bg-[#e6f4ea]/80 border-[#34A853]/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#34A853]/20 text-[#34A853]">
                <Truck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold font-['Google_Sans',sans-serif] text-[#34A853]">
                Tool: findSuppliers
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#34A853]/20 text-[#34A853]">
              Need: {quantity} units
            </span>
          </div>

          <p className="text-xs mb-2">
            Verified suppliers for <strong className="font-semibold">{materialName}</strong>:
          </p>

          <div className="space-y-1.5 mb-3">
            {suppliers.map((sup, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-[12px] text-xs flex items-center justify-between border ${
                  isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="font-bold">{sup.name}</div>
                  <div className="text-[10px] text-slate-400">ETA: {sup.leadDays} • {sup.rating} reliable</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[#34A853]">{sup.quote}</div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleSendText(`Draft order for ${quantity} units of ${materialName} from Apex Bioscience Direct`)}
            className="w-full py-2 px-3 rounded-[14px] bg-[#34A853] hover:bg-[#2d9247] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Draft PO with Top Supplier</span>
          </button>
        </div>
      );
    }

    if (name === 'draftOrder') {
      const supplierName = args.supplierName || 'Apex Bioscience Direct';
      const items: Array<{ name: string; quantity: number; unit?: string }> = args.items || [
        { name: 'Amoxicillin 500mg Capsules', quantity: 25, unit: 'boxes' },
      ];
      const urgency = args.urgency || 'Expedited';
      const orderKey = `${supplierName}-${items.length}`;
      const isApproved = approvedOrders[orderKey];

      return (
        <div
          key={`tool-${callIndex}`}
          className={`mt-3 p-3.5 rounded-[20px] border transition-all ${
            isDark ? 'bg-black/40 border-[#9B72CB]/30' : 'bg-[#f3e8fd]/80 border-[#9B72CB]/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#9B72CB]/20 text-[#9B72CB]">
                <FileCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold font-['Google_Sans',sans-serif] text-[#9B72CB]">
                Tool: draftOrder (PO Draft)
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#9B72CB]/20 text-[#9B72CB]">
              {urgency} Priority
            </span>
          </div>

          <div className="text-xs mb-2">
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vendor:</div>
            <div className="font-bold">{supplierName}</div>
          </div>

          <div className={`rounded-[12px] p-2 text-xs mb-2.5 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`}>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Requisition Items</div>
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-b-0">
                <span className="font-medium">{it.name}</span>
                <span className="font-bold">{it.quantity} {it.unit || 'units'}</span>
              </div>
            ))}
          </div>

          {isApproved ? (
            <div className="py-2 px-3 rounded-[14px] bg-[#34A853]/20 border border-[#34A853]/40 text-[#34A853] text-xs font-bold flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Purchase Order Approved & Transmitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setApprovedOrders((prev) => ({ ...prev, [orderKey]: true }))}
              className="w-full py-2 px-3 rounded-[14px] ai-rainbow-gradient text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Transmit PO</span>
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full overflow-hidden relative">
      {/* ================================================================= */}
      {/* SUB-HEADER: Language Chips + TTS Toggle + View Switcher           */}
      {/* ================================================================= */}
      <div
        className={`px-4 py-2 border-b flex items-center justify-between text-xs z-10 transition-colors ${
          isDark ? 'bg-black/25 border-white/10' : 'bg-slate-50/70 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400">Language:</span>

          {/* Language Selector Chips: EN / HI / KN */}
          <div className="flex items-center rounded-full p-0.5 border border-white/10 bg-black/20">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang.code);
                    speakText(`Language switched to ${lang.label}`, lang.code);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'ai-rainbow-gradient text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-black'
                  }`}
                  title={`${lang.label} (${lang.nativeLabel})`}
                >
                  {lang.code}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Toggle: Orb Hero vs Chat History */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-full p-0.5 border border-white/10 bg-black/20">
            <button
              type="button"
              onClick={() => setViewMode('orb')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'orb'
                  ? 'bg-[#9B72CB]/30 text-[#9B72CB] border border-[#9B72CB]/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Senpai Orb</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chat')}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'chat'
                  ? 'bg-[#4285F4]/30 text-[#4285F4] border border-[#4285F4]/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Log ({messages.length})</span>
            </button>
          </div>

          {/* TTS Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (autoSpeakAnswers) stopSpeech();
              setAutoSpeakAnswers(!autoSpeakAnswers);
            }}
            className={`px-2 py-1 rounded-[10px] text-[10px] font-bold flex items-center gap-1 border transition-all ${
              autoSpeakAnswers
                ? 'bg-[#34A853]/20 border-[#34A853]/40 text-[#34A853]'
                : isDark
                ? 'bg-white/5 border-white/10 text-slate-400'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title={autoSpeakAnswers ? 'SpeechSynthesis TTS Auto-Speak ON' : 'SpeechSynthesis TTS OFF'}
          >
            {autoSpeakAnswers ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>TTS {autoSpeakAnswers ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN CONTENT AREA: TWO-STATE ORB VIEW OR CHAT LOG VIEW            */}
      {/* ================================================================= */}
      <div className="flex-1 px-4 py-3 overflow-y-auto flex flex-col justify-center items-center relative">
        {viewMode === 'orb' ? (
          /* =============================================================== */
          /* TWO-STATE SENPAI EXPERIENCE                                     */
          /* STATE 1: Fluid Orb Centred (Listening / Searching / Thinking)   */
          /* STATE 2: 3D Card-Flip Reveal (Results, POs, Expiry Predictions) */
          /* =============================================================== */
          <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto">
            {phase !== 'revealed' ? (
              /* STATE 1: FLUID GRADIENT SENPAI ORB */
              <div className="flex flex-col items-center justify-center animate-fade-in relative py-4">
                {/* Fluid Liquid Orb Container */}
                <div className="relative w-56 h-56 flex items-center justify-center">
                  {/* Outer Glowing Radial Halo */}
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-300"
                    style={{
                      background:
                        phase === 'listening'
                          ? `radial-gradient(circle, rgba(234,67,53,${0.4 + audioAmplitude * 0.4}) 0%, rgba(66,133,244,0.3) 50%, transparent 70%)`
                          : phase === 'searching' || phase === 'thinking'
                          ? 'radial-gradient(circle, rgba(251,188,4,0.4) 0%, rgba(155,114,203,0.3) 50%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(66,133,244,0.3) 0%, rgba(52,168,83,0.2) 50%, transparent 70%)',
                      transform: `scale(${1 + (phase === 'listening' ? audioAmplitude * 0.5 : 0.05)})`,
                    }}
                  />

                  {/* Concentric Audio Pulse Rings while Listening */}
                  {phase === 'listening' && (
                    <>
                      <div
                        className="absolute inset-2 rounded-full border border-[#EA4335]/50 animate-ping pointer-events-none"
                        style={{ animationDuration: '1.8s' }}
                      />
                      <div
                        className="absolute -inset-4 rounded-full border border-[#4285F4]/40 animate-pulse pointer-events-none"
                        style={{ animationDuration: '2.4s' }}
                      />
                    </>
                  )}

                  {/* The Fluid Liquid Blob Orb */}
                  <div
                    className={`relative w-44 h-44 rounded-full shadow-[0_0_50px_rgba(66,133,244,0.35)] transition-transform duration-150 ${
                      phase === 'idle'
                        ? 'senpai-orb-breathe-anim senpai-liquid-morph-anim'
                        : phase === 'listening'
                        ? 'senpai-liquid-morph-anim'
                        : 'senpai-orb-swirl-anim'
                    }`}
                    style={{
                      background:
                        'linear-gradient(135deg, #4285F4 0%, #9B72CB 35%, #EA4335 65%, #FBBC04 85%, #34A853 100%)',
                      transform: `scale(${1 + (phase === 'listening' ? audioAmplitude * 0.4 : 0)})`,
                    }}
                  >
                    {/* Inner Frosted Glass Highlight */}
                    <div className="absolute inset-2 rounded-full bg-white/15 backdrop-blur-[2px] flex items-center justify-center border border-white/30">
                      <div className="flex flex-col items-center justify-center text-white text-center p-3">
                        <Sparkles
                          className={`w-10 h-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                            phase === 'searching' || phase === 'thinking' ? 'animate-spin' : ''
                          }`}
                        />
                        <span className="font-['Google_Sans',sans-serif] font-black text-sm tracking-widest mt-1 text-white uppercase drop-shadow-md">
                          Senpai
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Label Beneath Orb */}
                <div className="mt-5 text-center px-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        phase === 'listening'
                          ? 'bg-[#EA4335] animate-ping'
                          : phase === 'searching'
                          ? 'bg-[#FBBC04] animate-pulse'
                          : phase === 'thinking'
                          ? 'bg-[#9B72CB] animate-spin'
                          : 'bg-[#34A853]'
                      }`}
                    />
                    <span className="font-['Google_Sans',sans-serif] font-bold text-xs tracking-wide">
                      {statusMessage}
                    </span>
                  </div>

                  {/* Real-time transcribed text preview during speech */}
                  {(interimTranscript || finalTranscript) && (
                    <p className="mt-2 text-xs italic text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-[14px] max-w-xs mx-auto animate-fade-in line-clamp-2">
                      &ldquo;{finalTranscript || interimTranscript}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* STATE 2: 3D CARD-FLIP REVEAL CONTAINER */
              <div className="w-full senpai-flip-perspective py-2 animate-fade-in">
                <div className={`senpai-card-flipper ${phase === 'revealed' ? 'is-flipped' : ''}`}>
                  {/* FRONT FACE (Turned over): Orb Crest */}
                  <div className="senpai-face-front">
                    <div
                      className={`h-72 rounded-[28px] border flex flex-col items-center justify-center p-6 ${
                        isDark ? 'bg-[#151922] border-white/10' : 'bg-white border-slate-200'
                      }`}
                    >
                      <Sparkles className="w-12 h-12 text-[#9B72CB] animate-pulse" />
                      <span className="font-bold text-sm mt-2">Senpai Analyzing...</span>
                    </div>
                  </div>

                  {/* BACK FACE: Revealed Result Card & Actionable Tools */}
                  <div className="senpai-face-back relative">
                    <div
                      className={`rounded-[28px] p-5 shadow-2xl border transition-all overflow-hidden relative ${
                        isDark
                          ? 'bg-[#121620]/95 border-white/15 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl'
                          : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl backdrop-blur-xl'
                      }`}
                    >
                      {/* Diagonal Shining Halo Sheen Sweep on Reveal */}
                      {sheenTrigger && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
                          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent senpai-sheen-active" />
                        </div>
                      )}

                      {/* Header Badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full ai-rainbow-gradient p-[1px]">
                            <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}>
                              <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs font-black font-['Google_Sans',sans-serif] tracking-wider uppercase text-[#4285F4]">
                              Senpai Result
                            </span>
                            <span className="text-[10px] text-slate-400 block">{latestAnswer?.timestamp}</span>
                          </div>
                        </div>

                        {/* Re-read / TTS Speak Button */}
                        {latestAnswer?.answer && (
                          <button
                            type="button"
                            onClick={() => playSpeechForMessage('latest-card', latestAnswer.answer)}
                            className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                              currentlySpeakingId === 'latest-card'
                                ? 'bg-[#EA4335] text-white animate-pulse border-transparent'
                                : isDark
                                ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                            title="Speak again"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* User Query Transcript Bubble */}
                      {latestAnswer?.transcript && (
                        <div className="mb-2.5 px-3 py-1.5 rounded-[14px] bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5">
                          <Mic className="w-3 h-3 text-[#4285F4] flex-shrink-0" />
                          <span className="italic truncate">&ldquo;{latestAnswer.transcript}&rdquo;</span>
                        </div>
                      )}

                      {/* Senpai Answer Text */}
                      <p className="text-xs sm:text-[13px] leading-relaxed font-normal mb-2 text-slate-200">
                        {latestAnswer?.answer}
                      </p>

                      {/* Function Tool Card Calls */}
                      {latestAnswer?.functionCalls && latestAnswer.functionCalls.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {latestAnswer.functionCalls.map((call, idx) => renderToolResult(call, idx))}
                        </div>
                      )}

                      {/* Bottom Action: Ask another query (Expands Orb back to State 1) */}
                      <button
                        type="button"
                        onClick={() => {
                          setPhase('idle');
                          setStatusMessage(t.tapToSpeak);
                        }}
                        className={`mt-4 w-full py-2.5 px-3 rounded-[16px] text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isDark
                            ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t.askAnother}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =============================================================== */
          /* CHAT LOG VIEW (Full Transcript History & Conversational Bubbles) */
          /* =============================================================== */
          <div
            ref={chatScrollRef}
            className="w-full max-w-lg space-y-3.5 overflow-y-auto max-h-[500px] pr-1"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isThisSpeaking = currentlySpeakingId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser ? (
                    <div className="w-8 h-8 rounded-full ai-rainbow-gradient p-[1.5px] flex-shrink-0 shadow-md">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-[#0e1118]' : 'bg-white'}`}>
                        <Sparkles className="w-4 h-4 text-[#4285F4]" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                      <Mic className="w-4 h-4 text-[#4285F4]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-[20px] p-3.5 shadow-md transition-all text-xs sm:text-[13px] leading-relaxed relative ${
                      isUser
                        ? 'rounded-tr-[4px] ai-rainbow-gradient text-white shadow-[0_4px_16px_rgba(66,133,244,0.25)]'
                        : isDark
                        ? 'rounded-tl-[4px] bg-[#1a1f2c]/90 border border-white/10 text-slate-100 backdrop-blur-xl'
                        : 'rounded-tl-[4px] bg-white border border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    {isUser && msg.isAudio && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold opacity-85 mb-1">
                        <Mic className="w-3 h-3" />
                        <span>Speech Transcribed Locally ({currentLang})</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {msg.functionCalls && msg.functionCalls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.functionCalls.map((call, idx) => renderToolResult(call, idx))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => playSpeechForMessage(msg.id, msg.text)}
                          className={`text-[10px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            isThisSpeaking
                              ? 'bg-[#EA4335] text-white animate-pulse'
                              : isDark
                              ? 'text-slate-400 hover:text-white hover:bg-white/10'
                              : 'text-slate-500 hover:text-black hover:bg-slate-100'
                          }`}
                        >
                          {isThisSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          <span>{isThisSpeaking ? 'Speaking...' : `Speak (${currentLang})`}</span>
                        </button>
                      )}

                      <span className="text-[9px] text-slate-400 ml-auto">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Error Notice Banner */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-[16px] bg-[#EA4335]/15 border border-[#EA4335]/30 text-[#EA4335] text-xs flex items-start gap-2 max-w-sm w-full animate-fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Notice: </span>
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 hover:bg-[#EA4335]/20 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* QUICK PROMPTS HORIZONTAL CAROUSEL                                 */}
      {/* ================================================================= */}
      <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {t.quickPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendText(item.text)}
            disabled={phase === 'listening' || phase === 'thinking' || phase === 'searching'}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer flex-shrink-0 ${
              isDark
                ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.1] hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ================================================================= */}
      {/* BOTTOM CONTROLS DOCK: Large Mic Button & Fallback Text Input       */}
      {/* ================================================================= */}
      <div
        className={`px-4 pt-2.5 pb-3 flex flex-col items-center justify-center border-t flex-shrink-0 transition-colors ${
          isDark ? 'bg-[#10131b]/95 border-white/10' : 'bg-white/95 border-slate-200'
        }`}
      >
        {/* Central Large Circular Microphone Button */}
        <div className="relative flex items-center justify-center my-0.5">
          {phase === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-[#EA4335]/60 mic-pulse-ring-1 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border-2 border-[#EA4335]/40 mic-pulse-ring-2 pointer-events-none" />
              <div className="absolute inset-0 rounded-full border-2 border-[#EA4335]/20 mic-pulse-ring-3 pointer-events-none" />
            </>
          )}

          <button
            type="button"
            onClick={phase === 'listening' ? stopListening : startListening}
            disabled={phase === 'thinking' || phase === 'searching'}
            aria-label={phase === 'listening' ? 'Stop Listening' : 'Start Speech-to-Text Recognition'}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl active:scale-95 ${
              phase === 'listening'
                ? 'bg-gradient-to-tr from-[#EA4335] to-[#c5221f] text-white shadow-[0_0_30px_rgba(234,67,53,0.6)] border-4 border-white/30'
                : 'ai-rainbow-gradient text-white shadow-[0_10px_30px_rgba(66,133,244,0.4)] hover:shadow-[0_12px_36px_rgba(66,133,244,0.6)] border-4 border-white/20'
            }`}
          >
            {phase === 'listening' ? (
              <div className="w-6 h-6 rounded-[6px] bg-white animate-pulse" />
            ) : (
              <Mic className="w-8 h-8 drop-shadow-md text-white" />
            )}
          </button>
        </div>

        {/* Action Prompt Subtitle */}
        <div className="mt-1.5 text-center">
          <p className="text-xs font-semibold font-['Google_Sans',sans-serif]">
            {phase === 'listening' ? (
              <span className="text-[#EA4335]">{t.listening}</span>
            ) : (
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                {t.tapToSpeak}
              </span>
            )}
          </p>
          <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Local browser speech-to-text • Gemini tool reasoning • TTS spoken back in {currentLang}
          </p>
        </div>

        {/* Text Input Drawer Toggle */}
        <div className="w-full mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className={`text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{showTextInput ? 'Hide keyboard input' : 'Or type a query'}</span>
          </button>

          {!isSpeechSupported && (
            <span className="text-[10px] text-[#FBBC04] font-medium">
              Speech-to-text unavailable in this browser
            </span>
          )}
        </div>

        {/* Fallback Text Input */}
        {showTextInput && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendText(typedPrompt);
            }}
            className="w-full mt-2 flex items-center gap-2"
          >
            <input
              type="text"
              value={typedPrompt}
              onChange={(e) => setTypedPrompt(e.target.value)}
              placeholder={t.typeQueryPlaceholder}
              className={`flex-1 h-10 px-3.5 rounded-[14px] text-xs outline-none border transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-[#4285F4]'
                  : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#4285F4]'
              }`}
            />
            <button
              type="submit"
              disabled={!typedPrompt.trim() || phase === 'thinking' || phase === 'searching'}
              className="h-10 px-4 rounded-[14px] ai-rainbow-gradient text-white text-xs font-bold flex items-center justify-center disabled:opacity-50 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
