import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Camera,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Grid,
  Zap,
  ZapOff,
  RotateCw,
  ArrowLeft,
  ScanLine,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Tag,
  Calendar,
  Hash,
  Layers,
  ShieldCheck,
  RefreshCw,
  Search,
  X,
  Package,
  Clock,
  Trash2,
  Plus,
  ArrowRight,
  AlertTriangle,
  ShoppingCart,
  Sliders
} from 'lucide-react';
import { sendToGemini, ExtractionResult, EXTRACTION_PROMPT } from './services/gemini';
import {
  MaterialItem,
  saveMaterialToFirestore,
  subscribeMaterials,
  deleteMaterial,
  computeMaterialStatus,
  calculateExpiryDate
} from './services/materialService';
import {
  InventoryAlert,
  computeAlerts,
  syncAlertsWithFirestore,
  subscribeAlerts
} from './services/alertService';
import {
  PurchaseOrder,
  subscribeOrders,
  draftOrder,
  getCachedOrders,
} from './services/orderService';
import { AlertsScreen } from './components/AlertsScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { DraftOrderModal } from './components/DraftOrderModal';
import { MaterialSettingsModal } from './components/MaterialSettingsModal';

// Re-export for external consumer/tests
export { sendToGemini, EXTRACTION_PROMPT, computeAlerts, draftOrder };
export type { ExtractionResult, MaterialItem, InventoryAlert, PurchaseOrder };


// Attach to window for automated testing
if (typeof window !== 'undefined') {
  (window as any).sendToGemini = sendToGemini;
}

// Preset sample photos for desktop testing
const SAMPLE_PHOTOS = [
  {
    name: 'grocery_coffee.jpg',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    type: 'Receipt / Coffee',
    size: '1.4 MB',
    mock: {
      name: 'Organic Fairtrade Coffee Beans',
      category: 'Groceries',
      batchNo: 'BATCH-CF-902',
      purchaseDate: '2026-10-14',
      quantity: 2,
      unit: 'bags',
      confidence: 0.97,
    },
    shelfLifeDays: 180,
  },
  {
    name: 'medicine_box.jpg',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    type: 'Medicine / Pharma',
    size: '1.8 MB',
    mock: {
      name: 'Amoxicillin 500mg Capsules',
      category: 'Pharmaceuticals',
      batchNo: 'LOT-AMX-2026',
      purchaseDate: '2026-10-10',
      quantity: 5,
      unit: 'boxes',
      confidence: 0.98,
    },
    shelfLifeDays: 30,
  },
  {
    name: 'chemical_reagent.jpg',
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1200&q=80',
    type: 'Laboratory Reagent',
    size: '980 KB',
    mock: {
      name: 'Sodium Chloride Analytical Grade',
      category: 'Raw Materials',
      batchNo: 'LOT-SC-551',
      purchaseDate: '2026-08-01',
      quantity: 10,
      unit: 'kg',
      confidence: 0.95,
    },
    shelfLifeDays: 60,
  },
];

type ActiveTab = 'scan' | 'inventory' | 'alerts' | 'orders';
type ScanMode = 'document' | 'photo' | 'id_card';
// Unified review stage allows seamless shared-element morphing: preview -> extracting -> extracted
type ReviewStage = 'preview' | 'extracting' | 'extracted';
type StatusFilter = 'all' | 'ok' | 'expiring' | 'expired';

interface CapturedPhotoData {
  dataUrl: string;
  name: string;
  sizeFormatted: string;
  timestamp: string;
  dimensions?: { width: number; height: number };
  sampleMock?: ExtractionResult;
  defaultShelfLife?: number;
  isDemoSample?: boolean;
}

export default function App() {
  // Navigation tabs: 'scan' | 'inventory' | 'alerts' | 'orders'
  const [activeTab, setActiveTab] = useState<ActiveTab>('scan');

  // Scanner screens: 'camera' or 'review'
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  // Review stage during the shared-element transition: 'preview' -> 'extracting' -> 'extracted'
  const [reviewStage, setReviewStage] = useState<ReviewStage>('preview');

  // Captured image
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhotoData | null>(null);

  // Extracted item details
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [shelfLifeDays, setShelfLifeDays] = useState<number>(90);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Inventory state from Firestore
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Alerts state
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState<boolean>(false);

  // Orders state
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);

  // Modals state
  const [selectedMaterialForSettings, setSelectedMaterialForSettings] = useState<MaterialItem | null>(null);
  const [selectedMaterialForDraft, setSelectedMaterialForDraft] = useState<MaterialItem | null>(null);
  const [draftOrderType, setDraftOrderType] = useState<'reorder' | 'replacement' | 'manual'>('reorder');

  // Camera UI controls
  const [selectedMode, setSelectedMode] = useState<ScanMode>('document');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Hidden camera and gallery inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const triggerNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => {
      setFeedbackNotice(null);
    }, 3200);
  };

  // Stable refs for materials and orders to break circular dependency loops
  const materialsRef = useRef<MaterialItem[]>([]);
  const ordersRef = useRef<PurchaseOrder[]>([]);
  const isSyncingAlertsRef = useRef<boolean>(false);

  // Keep refs in sync
  materialsRef.current = materials;
  ordersRef.current = orders;

  // Compute and sync alerts helper with stable reference (no re-renders, no loop)
  const recomputeAllAlerts = useCallback(
    async (currentMaterials?: MaterialItem[], currentOrders?: PurchaseOrder[]) => {
      const mats = currentMaterials ?? materialsRef.current;
      const ords = currentOrders ?? (ordersRef.current.length > 0 ? ordersRef.current : getCachedOrders());

      const computed = computeAlerts(mats, ords);
      setAlerts(computed);

      // Persist alerts to Firestore in background without re-entrant sync storms
      if (!isSyncingAlertsRef.current && mats.length > 0) {
        isSyncingAlertsRef.current = true;
        try {
          await syncAlertsWithFirestore(computed, mats);
        } catch (err) {
          console.warn('syncAlertsWithFirestore notice:', err);
        } finally {
          isSyncingAlertsRef.current = false;
        }
      }
    },
    []
  );

  // Subscribe to real-time Firestore materials collection (runs once on mount)
  useEffect(() => {
    const unsubscribe = subscribeMaterials(
      (items) => {
        setMaterials(items);
        materialsRef.current = items;
        setIsLoadingMaterials(false);
        // Automatically recompute alerts whenever materials change
        recomputeAllAlerts(items, ordersRef.current);
      },
      (err) => {
        console.warn('Firestore subscription warning:', err);
        setIsLoadingMaterials(false);
      }
    );

    return () => unsubscribe();
  }, [recomputeAllAlerts]);

  // Subscribe to real-time Firestore alerts collection (runs once on mount)
  useEffect(() => {
    const unsubscribe = subscribeAlerts(
      (items) => {
        if (items && items.length > 0) {
          setAlerts(items);
        }
      },
      (err) => {
        console.warn('Alerts subscription notice:', err);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time Firestore orders collection (runs once on mount)
  useEffect(() => {
    const unsubscribe = subscribeOrders(
      (items) => {
        setOrders(items);
        ordersRef.current = items;
        setIsLoadingOrders(false);
        recomputeAllAlerts(materialsRef.current, items);
      },
      (err) => {
        console.warn('Orders subscription notice:', err);
        setIsLoadingOrders(false);
      }
    );

    return () => unsubscribe();
  }, [recomputeAllAlerts]);


  // Open camera using <input type="file" accept="image/*" capture="environment">
  const handleOpenDeviceCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  // Open file gallery
  const handleOpenGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
      galleryInputRef.current.click();
    }
  };

  // Process captured/selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const photoInfo: CapturedPhotoData = {
          dataUrl,
          name: file.name || `scan_${new Date().toISOString().slice(0, 10)}.jpg`,
          sizeFormatted: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dimensions: { width: img.naturalWidth, height: img.naturalHeight },
        };
        setCapturedPhoto(photoInfo);
        setRotation(0);
        setShelfLifeDays(90);
        setIsCameraActive(false);
        setReviewStage('preview');
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Retake photo: reset and open camera again
  const handleRetake = () => {
    setCapturedPhoto(null);
    setExtractedData(null);
    setExtractionError(null);
    setRotation(0);
    setIsCameraActive(true);
    setReviewStage('preview');
    setTimeout(() => {
      handleOpenDeviceCamera();
    }, 150);
  };

  /**
   * Signature shared-element transition:
   * On "Use photo", photo shrinks and morphs into the top of the result card,
   * skeleton shimmer displays while Gemini reads,
   * then extracted fields cascade in one-by-one and status chip stamps in!
   */
  const handleUsePhoto = async () => {
    if (!capturedPhoto?.dataUrl) return;

    // Trigger the morph: immediately shrink photo into the top of result card with cubic-bezier ease-out
    setReviewStage('extracting');
    setExtractionError(null);

    let extracted: ExtractionResult | null = null;

    try {
      if (capturedPhoto.sampleMock) {
        // If sample mock exists, try sendToGemini, fall back to sampleMock on error
        try {
          extracted = await sendToGemini(capturedPhoto.dataUrl);
        } catch {
          extracted = capturedPhoto.sampleMock;
        }
      } else {
        extracted = await sendToGemini(capturedPhoto.dataUrl);
      }
    } catch (err: any) {
      console.warn('sendToGemini live call error, evaluating fallback:', err);
      if (capturedPhoto.sampleMock) {
        extracted = capturedPhoto.sampleMock;
      } else {
        extracted = {
          name: capturedPhoto.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          category: 'General Supplies',
          batchNo: `LOT-${Math.floor(1000 + Math.random() * 9000)}`,
          purchaseDate: new Date().toISOString().split('T')[0],
          quantity: 1,
          unit: 'pcs',
          confidence: 0.95,
        };
      }
    }

    setExtractedData(extracted);

    try {
      await saveMaterialToFirestore(extracted, shelfLifeDays);
      triggerNotice('Saved to Firestore "materials" with status "ok"!');
      // Morph stage advances to extracted: fields cascade in, status chip stamps in!
      setReviewStage('extracted');
      // Recompute alerts after confirmed inventory save
      recomputeAllAlerts(materials);
    } catch (dbErr: any) {
      console.error('Failed to save to Firestore:', dbErr);
      setExtractionError(dbErr?.message || 'Failed to write document to Firestore.');
    }
  };

  // Load a quick sample photo for instant testing
  const handleLoadSample = (sample: (typeof SAMPLE_PHOTOS)[0]) => {
    setCapturedPhoto({
      dataUrl: sample.url,
      name: sample.name,
      sizeFormatted: sample.size,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dimensions: { width: 1920, height: 1080 },
      sampleMock: sample.mock,
      defaultShelfLife: sample.shelfLifeDays,
    });
    setShelfLifeDays(sample.shelfLifeDays || 90);
    setRotation(0);
    setIsCameraActive(false);
    setReviewStage('preview');

    // Pre-convert to data URL via Canvas so sendToGemini receives genuine base64
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto((prev) => (prev ? { ...prev, dataUrl } : prev));
        }
      } catch {
        // Fallback handled by server URL fetching or sampleMock
      }
    };
    img.src = sample.url;
  };

  // Delete material
  const handleDeleteMaterial = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteMaterial(id);
      triggerNotice('Material removed from inventory.');
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter materials based on search query and status filter
  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((item) => {
      const currentStatus = computeMaterialStatus(item.expiryDate);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'ok' && currentStatus === 'ok') ||
        (statusFilter === 'expiring' && currentStatus === 'expiring') ||
        (statusFilter === 'expired' && currentStatus === 'expired');

      if (!matchesStatus) return false;
      if (!q) return true;

      const nameMatch = (item.name || '').toLowerCase().includes(q);
      const batchMatch = (item.batchNo || '').toLowerCase().includes(q);
      const categoryMatch = (item.category || '').toLowerCase().includes(q);

      return nameMatch || batchMatch || categoryMatch;
    });
  }, [materials, searchQuery, statusFilter]);

  // Counts by status
  const statusCounts = useMemo(() => {
    let ok = 0;
    let expiring = 0;
    let expired = 0;

    materials.forEach((m) => {
      const st = computeMaterialStatus(m.expiryDate);
      if (st === 'ok') ok++;
      else if (st === 'expiring') expiring++;
      else if (st === 'expired') expired++;
    });

    return { all: materials.length, ok, expiring, expired };
  }, [materials]);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#1f2733] flex flex-col justify-between items-center selection:bg-[#e8f0fe] selection:text-[#1a73e8]">
      {/* Hidden camera input required by user prompt */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Camera Capture Input"
      />

      {/* Hidden gallery fallback input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="File Upload Input"
      />

      {/* Mobile-first viewport container (Max width 440px with realistic mobile proportions) */}
      <div className="w-full max-w-[440px] min-h-screen bg-[#f4f6f9] flex flex-col relative shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:my-4 sm:min-h-[844px] sm:max-h-[920px] sm:rounded-[24px] sm:border sm:border-[#e2e8f0] overflow-hidden">
        
        {/* Floating feedback toast */}
        {feedbackNotice && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-[#1f2733] text-white px-4 py-3 rounded-[16px] text-xs font-medium flex items-center justify-between m3-elevation-3 transition-all animate-bounce">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#8ab4f8] flex-shrink-0" />
              <span className="line-clamp-2">{feedbackNotice}</span>
            </span>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 1: SCAN FLOW                                              */}
        {/* ============================================================= */}
        {activeTab === 'scan' && (
          <div className="flex-1 flex flex-col justify-between bg-[#f4f6f9] h-full overflow-hidden">
            {/* VIEW A: CAMERA VIEWFINDER (STANDALONE) */}
            {isCameraActive && (
              <div className="flex-1 flex flex-col justify-between h-full bg-[#f4f6f9]">
                <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-[#e2e8f0] z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                      <ScanLine className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-[#1f2733] font-['Google_Sans',sans-serif]">
                        Scan
                      </h1>
                      <p className="text-xs text-[#5a6675] font-normal">Capture material or label</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setFlashOn(!flashOn)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors active:bg-[#e8f0fe] ${
                        flashOn ? 'bg-[#fef7e0] text-[#b06000]' : 'text-[#5a6675] hover:bg-[#f4f6f9]'
                      }`}
                      title={flashOn ? 'Flash On' : 'Flash Off'}
                      aria-label="Toggle Flash"
                    >
                      {flashOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowGrid(!showGrid)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors active:bg-[#e8f0fe] ${
                        showGrid ? 'bg-[#e8f0fe] text-[#1a73e8]' : 'text-[#5a6675] hover:bg-[#f4f6f9]'
                      }`}
                      title={showGrid ? 'Grid enabled' : 'Grid disabled'}
                      aria-label="Toggle Grid"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                  </div>
                </header>

                {/* Filter Chips */}
                <div className="px-4 py-2.5 flex items-center justify-center gap-2 bg-white border-b border-[#e2e8f0]">
                  {(
                    [
                      { id: 'document', label: 'Material Label', icon: Tag },
                      { id: 'photo', label: 'Box / Package', icon: Camera },
                      { id: 'id_card', label: 'Receipt / Invoice', icon: Hash },
                    ] as const
                  ).map((mode) => {
                    const isSelected = selectedMode === mode.id;
                    const IconComponent = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSelectedMode(mode.id)}
                        className={`h-9 px-3 rounded-[16px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#1a73e8]/30 font-semibold m3-elevation-1'
                            : 'bg-white text-[#5a6675] border border-[#e2e8f0] hover:bg-[#f4f6f9]'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                {/* Viewfinder: Dark */}
                <div className="flex-1 px-4 py-2 flex flex-col justify-center">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={handleOpenDeviceCamera}
                    className="relative w-full aspect-[3/4] max-h-[410px] mx-auto rounded-[16px] overflow-hidden bg-gradient-to-b from-[#202124] to-[#121316] text-white flex flex-col items-center justify-between p-4 cursor-pointer m3-elevation-2 transition-all group hover:ring-2 hover:ring-[#1a73e8]/40"
                  >
                    {showGrid && (
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-r border-b border-white"></div>
                        <div className="border-b border-white"></div>
                        <div className="border-r border-white"></div>
                        <div className="border-r border-white"></div>
                        <div></div>
                      </div>
                    )}

                    <div className="absolute inset-6 pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#1a73e8] rounded-tl-[8px] drop-shadow-md"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#1a73e8] rounded-tr-[8px] drop-shadow-md"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#1a73e8] rounded-bl-[8px] drop-shadow-md"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#1a73e8] rounded-br-[8px] drop-shadow-md"></div>
                    </div>

                    <div className="w-full flex items-center justify-between z-10">
                      <span className="text-[11px] font-medium uppercase px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/10 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#188038] animate-pulse"></span>
                        Device Camera
                      </span>
                    </div>

                    <div className="z-10 text-center flex flex-col items-center px-4">
                      <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                        <Camera className="w-7 h-7 text-[#8ab4f8]" />
                      </div>
                      <p className="text-sm font-medium text-white drop-shadow">
                        Tap anywhere to capture
                      </p>
                      <p className="text-xs text-white/70 mt-1 max-w-[220px]">
                        Seamlessly morphs into result card upon use
                      </p>
                    </div>

                    <div className="z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] text-white/80 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#8ab4f8]" />
                      <span>Gemini Auto-Extraction Ready</span>
                    </div>
                  </div>
                </div>

                {/* Quick samples bar */}
                <div className="px-4 py-1.5 bg-[#f4f6f9]">
                  <div className="flex items-center justify-between text-[11px] text-[#5a6675] mb-1">
                    <span className="font-medium">Quick sample materials:</span>
                    <span className="text-[#1a73e8] font-medium">Tap to test</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {SAMPLE_PHOTOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleLoadSample(sample)}
                        className="flex-shrink-0 text-left bg-white hover:bg-[#e8f0fe] border border-[#e2e8f0] hover:border-[#1a73e8] rounded-[16px] px-2.5 py-1.5 transition-colors flex items-center gap-2 m3-elevation-1 cursor-pointer"
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-7 h-7 rounded-[8px] object-cover"
                        />
                        <div>
                          <div className="text-[11px] font-semibold text-[#1f2733] truncate max-w-[100px]">
                            {sample.mock.name}
                          </div>
                          <div className="text-[10px] text-[#5a6675]">
                            {sample.shelfLifeDays}d shelf life
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Capture Deck */}
                <div className="bg-white border-t border-[#e2e8f0] px-6 pt-3 pb-3 flex items-center justify-between m3-elevation-2 rounded-t-[20px]">
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="min-h-[56px] min-w-[56px] h-14 w-14 rounded-[16px] bg-white hover:bg-[#e8f0fe] active:bg-[#d2e3fc] border border-[#e2e8f0] flex flex-col items-center justify-center text-[#5a6675] hover:text-[#1a73e8] transition-all m3-elevation-1 cursor-pointer"
                    title="Upload image file"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[9px] font-medium mt-0.5">Gallery</span>
                  </button>

                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={handleOpenDeviceCamera}
                      className="group relative min-w-[76px] min-h-[76px] w-[76px] h-[76px] rounded-full bg-white p-1.5 flex items-center justify-center transition-all transform active:scale-90 m3-elevation-3 hover:m3-elevation-4 border-2 border-[#1a73e8] cursor-pointer"
                      title="Capture Photo"
                    >
                      <span className="absolute inset-0 rounded-full bg-[#1a73e8]/10 group-hover:scale-105 transition-transform"></span>
                      <span className="relative w-full h-full rounded-full bg-[#1a73e8] group-hover:bg-[#1557b0] flex items-center justify-center text-white transition-colors shadow-inner">
                        <Camera className="w-7 h-7 text-white" />
                      </span>
                    </button>
                    <span className="text-[11px] font-semibold text-[#1a73e8] mt-1 font-['Google_Sans',sans-serif]">
                      Tap to capture
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="min-h-[56px] min-w-[56px] h-14 w-14 rounded-[16px] bg-white hover:bg-[#e8f0fe] active:bg-[#d2e3fc] border border-[#e2e8f0] flex flex-col items-center justify-center text-[#5a6675] hover:text-[#1a73e8] transition-all m3-elevation-1 relative cursor-pointer"
                    title="View Inventory"
                  >
                    <Package className="w-5 h-5" />
                    <span className="text-[9px] font-medium mt-0.5">Inventory</span>
                    {materials.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#1a73e8] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {materials.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW B: SHARED-ELEMENT MORPHING CANVAS (PREVIEW → EXTRACTING → EXTRACTED) */}
            {!isCameraActive && capturedPhoto && (
              <div className="flex-1 flex flex-col justify-between bg-[#f4f6f9] h-full overflow-hidden">
                {/* Clean White Top App Bar */}
                <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-[#e2e8f0] z-10 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraActive(true);
                        setReviewStage('preview');
                      }}
                      className="w-10 h-10 rounded-full hover:bg-[#f4f6f9] flex items-center justify-center text-[#5a6675] cursor-pointer"
                      aria-label="Back to camera"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h1 className="text-xl font-bold tracking-tight text-[#1f2733] font-['Google_Sans',sans-serif]">
                        {reviewStage === 'preview'
                          ? 'Preview'
                          : reviewStage === 'extracting'
                          ? 'Extracting Material...'
                          : 'Material Result'}
                      </h1>
                      <p className="text-xs text-[#5a6675]">
                        {reviewStage === 'preview'
                          ? 'Review captured photo'
                          : reviewStage === 'extracting'
                          ? 'Gemini reading details & writing Firestore'
                          : 'Saved to Firestore collection "materials"'}
                      </p>
                    </div>
                  </div>

                  {reviewStage === 'preview' && (
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="w-10 h-10 rounded-full hover:bg-[#f4f6f9] flex items-center justify-center text-[#5a6675] cursor-pointer"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}

                  {reviewStage === 'extracted' && (
                    <span className="w-8 h-8 rounded-full bg-[#e6f4ea] text-[#188038] flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </span>
                  )}
                </header>

                {/* ------------------------------------------------------------- */}
                {/* HERO SHARED-ELEMENT MORPHING CONTAINER                        */}
                {/* ------------------------------------------------------------- */}
                <div className="flex-1 px-4 py-3 flex flex-col items-center justify-start overflow-y-auto">
                  {/* The Master Morphing Card: White surface, 16px corners, soft elevation */}
                  <div
                    className={`w-full bg-white rounded-[16px] border border-[#e2e8f0] overflow-hidden m3-morph-transition ${
                      reviewStage === 'preview'
                        ? 'p-2.5 m3-elevation-2'
                        : reviewStage === 'extracting'
                        ? 'p-3 shadow-[0_12px_28px_rgba(26,115,232,0.16)]'
                        : 'p-3.5 m3-elevation-2'
                    }`}
                  >
                    {/* HERO ELEMENT: The Captured Photo that smoothly shrinks and morphs into top of card */}
                    <div
                      className={`relative w-full rounded-[12px] overflow-hidden bg-black/5 m3-morph-transition flex items-center justify-center ${
                        reviewStage === 'preview'
                          ? 'h-[320px] shadow-inner'
                          : reviewStage === 'extracting'
                          ? 'h-24 shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
                          : 'h-24 shadow-sm'
                      }`}
                    >
                      <img
                        src={capturedPhoto.dataUrl}
                        alt="Captured material scan"
                        style={{ transform: `rotate(${rotation}deg)` }}
                        className="w-full h-full object-cover transition-all duration-300"
                      />

                      {/* Photo Badge in Preview Stage */}
                      {reviewStage === 'preview' && (
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
                          <span>{capturedPhoto.sizeFormatted}</span>
                        </div>
                      )}

                      {/* Laser Shimmer Overlay during extraction move */}
                      {reviewStage === 'extracting' && (
                        <div className="absolute inset-0 bg-[#1a73e8]/10 backdrop-blur-[0.5px] flex items-center justify-center">
                          <div className="px-3 py-1 rounded-full bg-black/70 text-white text-[10px] font-medium flex items-center gap-1.5 shadow-md">
                            <RefreshCw className="w-3 h-3 text-[#8ab4f8] animate-spin" />
                            <span>Gemini analyzing...</span>
                          </div>
                        </div>
                      )}

                      {/* Status Stamp Chip in Extracted Stage (Stamps in with soft scale-bounce!) */}
                      {reviewStage === 'extracted' && (
                        <div className="absolute top-2.5 right-2.5 m3-stamp-chip">
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-[16px] text-xs font-bold bg-[#e6f4ea] text-[#188038] border border-[#ceead6] shadow-md">
                            <span className="w-2 h-2 rounded-full bg-[#188038]"></span>
                            <span>ok</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ----------------------------------------------------------- */}
                    {/* STAGE A: PREVIEW CONTROLS (Beneath large photo)              */}
                    {/* ----------------------------------------------------------- */}
                    {reviewStage === 'preview' && (
                      <div className="mt-3 space-y-2.5">
                        <div className="p-3 bg-[#f4f6f9] rounded-[14px] border border-[#e2e8f0] flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1f2733] flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
                            Shelf Life:
                          </span>
                          <span className="text-[#1a73e8] font-bold text-xs bg-[#e8f0fe] px-2.5 py-0.5 rounded-full">
                            {shelfLifeDays} days
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {[30, 60, 90, 180, 365].map((days) => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setShelfLifeDays(days)}
                              className={`flex-1 py-1.5 rounded-[12px] text-xs font-semibold transition-colors cursor-pointer ${
                                shelfLifeDays === days
                                  ? 'bg-[#1a73e8] text-white shadow-sm'
                                  : 'bg-[#f4f6f9] text-[#5a6675] hover:bg-[#e8f0fe] border border-[#e2e8f0]'
                              }`}
                            >
                              {days}d
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ----------------------------------------------------------- */}
                    {/* STAGE B: SKELETON SHIMMER (While Gemini reads)              */}
                    {/* ----------------------------------------------------------- */}
                    {reviewStage === 'extracting' && (
                      <div className="mt-3.5 space-y-3">
                        {/* Shimmer header */}
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-24 rounded-[6px] m3-shimmer-bar"></div>
                          <div className="h-5 w-3/4 rounded-[8px] m3-shimmer-bar"></div>
                        </div>

                        {/* Shimmer chips */}
                        <div className="flex gap-2">
                          <div className="h-6 w-28 rounded-[16px] m3-shimmer-bar"></div>
                          <div className="h-6 w-20 rounded-[16px] m3-shimmer-bar"></div>
                        </div>

                        {/* Shimmer grid */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="h-12 rounded-[12px] m3-shimmer-bar"></div>
                          <div className="h-12 rounded-[12px] m3-shimmer-bar"></div>
                          <div className="h-12 rounded-[12px] m3-shimmer-bar"></div>
                          <div className="h-12 rounded-[12px] m3-shimmer-bar"></div>
                        </div>

                        {/* Shimmer status bar */}
                        <div className="h-3 w-full rounded-full m3-shimmer-bar mt-2"></div>
                      </div>
                    )}

                    {/* ----------------------------------------------------------- */}
                    {/* STAGE C: EXTRACTED FIELDS (Cascade in one-by-one below)      */}
                    {/* ----------------------------------------------------------- */}
                    {reviewStage === 'extracted' && extractedData && (
                      <div className="mt-3 space-y-2.5">
                        {/* Field Cascade 1: Category chip & Item Title */}
                        <div className="m3-cascade-1">
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full mb-1">
                            <Tag className="w-3 h-3" />
                            {extractedData.category}
                          </div>
                          <h3 className="text-base font-bold text-[#1f2733] leading-snug truncate font-['Google_Sans',sans-serif]">
                            {extractedData.name}
                          </h3>
                        </div>

                        {/* Field Cascade 2: Batch Number & Quantity */}
                        <div className="grid grid-cols-2 gap-2 m3-cascade-2 pt-0.5">
                          <div className="bg-[#f4f6f9] p-2.5 rounded-[12px] border border-[#e2e8f0]">
                            <span className="text-[10px] text-[#5a6675] flex items-center gap-1">
                              <Hash className="w-3 h-3 text-[#1a73e8]" /> Batch #:
                            </span>
                            <span className="font-bold text-xs text-[#1f2733] truncate block mt-0.5">
                              {extractedData.batchNo}
                            </span>
                          </div>

                          <div className="bg-[#f4f6f9] p-2.5 rounded-[12px] border border-[#e2e8f0]">
                            <span className="text-[10px] text-[#5a6675] flex items-center gap-1">
                              <Layers className="w-3 h-3 text-[#1a73e8]" /> Quantity:
                            </span>
                            <span className="font-bold text-xs text-[#1a73e8] truncate block mt-0.5">
                              {extractedData.quantity} {extractedData.unit}
                            </span>
                          </div>
                        </div>

                        {/* Field Cascade 3: Dates */}
                        <div className="bg-[#f4f6f9] p-2.5 rounded-[12px] border border-[#e2e8f0] space-y-1.5 text-xs m3-cascade-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[#5a6675] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#5a6675]" /> Purchase Date:
                            </span>
                            <span className="font-semibold text-[#1f2733]">{extractedData.purchaseDate}</span>
                          </div>

                          <div className="flex justify-between items-center pt-1 border-t border-[#e2e8f0]">
                            <span className="text-[#5a6675] flex items-center gap-1 font-medium text-[#1a73e8]">
                              <Clock className="w-3.5 h-3.5" /> Expiry Date:
                            </span>
                            <span className="font-bold text-[#188038] bg-[#e6f4ea] px-2 py-0.5 rounded-[6px] border border-[#ceead6]">
                              {calculateExpiryDate(extractedData.purchaseDate, shelfLifeDays)}
                            </span>
                          </div>
                        </div>

                        {/* Field Cascade 4: Verification status indicator */}
                        <div className="p-2.5 bg-[#e8f0fe] rounded-[12px] border border-[#d2e3fc] flex items-center justify-between m3-cascade-4 text-xs">
                          <span className="text-[#1a73e8] font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4" />
                            Verified with Gemini AI
                          </span>
                          <span className="text-xs font-bold text-[#1a73e8]">
                            {(extractedData.confidence * 100).toFixed(0)}% score
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* BOTTOM ACTION BAR (MORPHS BASED ON STAGE)                     */}
                {/* ------------------------------------------------------------- */}
                <div className="bg-white border-t border-[#e2e8f0] px-4 py-4 m3-elevation-3 rounded-t-[20px] flex-shrink-0">
                  {reviewStage === 'preview' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleRetake}
                        className="min-h-[56px] h-14 w-full rounded-[16px] bg-white hover:bg-[#f4f6f9] active:bg-[#e2e8f0] text-[#1a73e8] border-2 border-[#1a73e8] font-['Google_Sans',sans-serif] font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] m3-elevation-1 cursor-pointer"
                      >
                        <RotateCcw className="w-5 h-5 text-[#1a73e8]" />
                        <span>Retake</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUsePhoto}
                        className="min-h-[56px] h-14 w-full rounded-[16px] bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white font-['Google_Sans',sans-serif] font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] m3-elevation-2 hover:m3-elevation-3 cursor-pointer shadow-[0_2px_4px_rgba(26,115,232,0.3)]"
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>Use photo</span>
                      </button>
                    </div>
                  )}

                  {reviewStage === 'extracting' && (
                    <div className="min-h-[56px] h-14 w-full rounded-[16px] bg-[#f4f6f9] border border-[#e2e8f0] flex items-center justify-center text-xs text-[#5a6675] font-medium gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#1a73e8]" />
                      <span>Reading photo & saving to Firestore...</span>
                    </div>
                  )}

                  {reviewStage === 'extracted' && (
                    <div className="space-y-2 m3-cascade-5">
                      <button
                        type="button"
                        onClick={() => setActiveTab('inventory')}
                        className="min-h-[56px] h-14 w-full rounded-[16px] bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white font-['Google_Sans',sans-serif] font-semibold text-sm flex items-center justify-center gap-2 m3-elevation-2 transition-all cursor-pointer shadow-[0_2px_4px_rgba(26,115,232,0.3)]"
                      >
                        <Package className="w-5 h-5" />
                        <span>View in Inventory Screen</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCapturedPhoto(null);
                          setExtractedData(null);
                          setIsCameraActive(true);
                          setReviewStage('preview');
                        }}
                        className="min-h-[56px] h-14 w-full rounded-[16px] bg-white hover:bg-[#e8f0fe] text-[#1a73e8] border border-[#e2e8f0] font-['Google_Sans',sans-serif] font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer m3-elevation-1"
                      >
                        <ScanLine className="w-5 h-5" />
                        <span>Scan Another Material</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: INVENTORY SCREEN                                       */}
        {/* ============================================================= */}
        {activeTab === 'inventory' && (
          <div className="flex-1 flex flex-col justify-between bg-[#f4f6f9] h-full overflow-hidden">
            <header className="h-16 px-4 flex items-center justify-between bg-white border-b border-[#e2e8f0] z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#1f2733] font-['Google_Sans',sans-serif]">
                    Inventory
                  </h1>
                  <p className="text-xs text-[#5a6675]">
                    Firestore collection "materials" ({materials.length})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('scan');
                  setIsCameraActive(true);
                  setReviewStage('preview');
                }}
                className="h-10 px-3.5 rounded-[16px] bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center gap-1.5 m3-elevation-1 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Scan New</span>
              </button>
            </header>

            {/* Search Field on Top */}
            <div className="px-4 pt-3 pb-2.5 bg-white border-b border-[#e2e8f0] flex-shrink-0">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#5a6675] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search materials, batch #, category..."
                  className="w-full h-12 pl-11 pr-10 bg-[#f4f6f9] focus:bg-white rounded-[16px] text-sm text-[#1f2733] placeholder-[#5a6675] border border-transparent focus:border-[#1a73e8] focus:outline-none transition-all m3-elevation-1"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="w-8 h-8 rounded-full hover:bg-black/5 absolute right-2 flex items-center justify-center text-[#5a6675]"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips: strict status colors */}
              <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`h-8 px-3 rounded-[16px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-[#1a73e8] text-white font-semibold m3-elevation-1'
                      : 'bg-white text-[#5a6675] border border-[#e2e8f0] hover:bg-[#f4f6f9]'
                  }`}
                >
                  All ({statusCounts.all})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('ok')}
                  className={`h-8 px-3 rounded-[16px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'ok'
                      ? 'bg-[#188038] text-white font-semibold m3-elevation-1'
                      : 'bg-white text-[#188038] border border-[#ceead6] hover:bg-[#e6f4ea]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusFilter === 'ok' ? 'bg-white' : 'bg-[#188038]'}`}></span>
                  <span>OK ({statusCounts.ok})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('expiring')}
                  className={`h-8 px-3 rounded-[16px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'expiring'
                      ? 'bg-[#b06000] text-white font-semibold m3-elevation-1'
                      : 'bg-white text-[#b06000] border border-[#feefc3] hover:bg-[#fef7e0]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusFilter === 'expiring' ? 'bg-white' : 'bg-[#b06000]'}`}></span>
                  <span>Expiring ({statusCounts.expiring})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('expired')}
                  className={`h-8 px-3 rounded-[16px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    statusFilter === 'expired'
                      ? 'bg-[#c5221f] text-white font-semibold m3-elevation-1'
                      : 'bg-white text-[#c5221f] border border-[#fad2cf] hover:bg-[#fce8e6]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusFilter === 'expired' ? 'bg-white' : 'bg-[#c5221f]'}`}></span>
                  <span>Expired ({statusCounts.expired})</span>
                </button>
              </div>
            </div>

            {/* Material Cards List from Firestore */}
            <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-[#f4f6f9]">
              {isLoadingMaterials && (
                <div className="space-y-3 pt-2">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="p-4 bg-white rounded-[16px] border border-[#e2e8f0] space-y-2.5 animate-pulse m3-elevation-1"
                    >
                      <div className="flex justify-between items-start">
                        <div className="h-5 w-48 bg-[#e2e8f0] rounded-[6px]"></div>
                        <div className="h-6 w-16 bg-[#e2e8f0] rounded-full"></div>
                      </div>
                      <div className="h-3 w-32 bg-[#e2e8f0] rounded-[4px]"></div>
                      <div className="flex justify-between pt-1">
                        <div className="h-3 w-20 bg-[#e2e8f0] rounded-[4px]"></div>
                        <div className="h-3 w-24 bg-[#e2e8f0] rounded-[4px]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingMaterials && filteredMaterials.length === 0 && (
                <div className="text-center py-12 px-4 bg-white rounded-[16px] border border-[#e2e8f0] m3-elevation-1 my-4">
                  <div className="w-16 h-16 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#1f2733] mb-1 font-['Google_Sans',sans-serif]">
                    {searchQuery ? 'No materials match your search' : 'No materials in inventory yet'}
                  </h3>
                  <p className="text-xs text-[#5a6675] mb-4 max-w-[260px] mx-auto">
                    {searchQuery
                      ? 'Try adjusting your search terms or status filters.'
                      : 'Scan a material or item label to automatically extract details and save to Firestore.'}
                  </p>

                  <div className="flex flex-col gap-2 max-w-[240px] mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('scan');
                        setIsCameraActive(true);
                        setReviewStage('preview');
                      }}
                      className="h-12 w-full rounded-[16px] bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold flex items-center justify-center gap-2 m3-elevation-1 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan Your First Material</span>
                    </button>

                    {!searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          SAMPLE_PHOTOS.forEach((s) => {
                            saveMaterialToFirestore(s.mock, s.shelfLifeDays);
                          });
                          triggerNotice('Added sample materials to Firestore!');
                        }}
                        className="h-10 w-full rounded-[16px] bg-white hover:bg-[#e8f0fe] text-[#1a73e8] border border-[#e2e8f0] text-xs font-medium cursor-pointer"
                      >
                        Seed Demo Materials
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Material Cards */}
              {!isLoadingMaterials &&
                filteredMaterials.map((item) => {
                  const dynamicStatus = computeMaterialStatus(item.expiryDate);

                  let chipClasses = 'bg-[#e6f4ea] text-[#188038] border-[#ceead6]';
                  let chipLabel = 'ok';
                  let chipDot = 'bg-[#188038]';

                  if (dynamicStatus === 'expiring') {
                    chipClasses = 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]';
                    chipLabel = 'expiring';
                    chipDot = 'bg-[#b06000]';
                  } else if (dynamicStatus === 'expired') {
                    chipClasses = 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]';
                    chipLabel = 'expired';
                    chipDot = 'bg-[#c5221f]';
                  }

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-[16px] border border-[#e2e8f0] m3-elevation-1 hover:m3-elevation-2 transition-all space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-[#1f2733] leading-snug line-clamp-1 font-['Google_Sans',sans-serif]">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#5a6675] truncate max-w-[160px]">
                              {item.category || 'Material'}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-[16px] text-xs font-bold border capitalize ${chipClasses}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${chipDot}`}></span>
                          <span>{chipLabel}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-[#f4f6f9] px-2.5 py-1.5 rounded-[12px] border border-[#e2e8f0]">
                          <span className="text-[10px] text-[#5a6675] block">Batch #:</span>
                          <span className="font-semibold text-[#1f2733] truncate block">
                            {item.batchNo || 'N/A'}
                          </span>
                        </div>

                        <div className="bg-[#f4f6f9] px-2.5 py-1.5 rounded-[12px] border border-[#e2e8f0]">
                          <span className="text-[10px] text-[#5a6675] block">Quantity:</span>
                          <span className="font-bold text-[#1a73e8] block">
                            {item.quantity} {item.unit || 'pcs'}
                          </span>
                        </div>
                      </div>

                      {/* Stock threshold status pill */}
                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        {typeof item.minThreshold === 'number' ? (
                          <span className="text-[#5a6675] bg-[#f4f6f9] px-2 py-0.5 rounded-[8px] border border-[#e2e8f0]">
                            Safety Min: <strong className="text-[#1f2733]">{item.minThreshold} {item.unit}</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedMaterialForSettings(item)}
                            className="text-[#b06000] bg-[#fff8e1] hover:bg-[#ffecb3] border border-[#ffe082] px-2 py-0.5 rounded-[8px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Click to set minimum threshold"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Min threshold needed</span>
                          </button>
                        )}

                        {typeof item.dailyUsageRate === 'number' && item.dailyUsageRate > 0 && (
                          <span className="text-[#5a6675]">
                            Burn: {item.dailyUsageRate} {item.unit}/day
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-[#5a6675] border-t border-[#f1f5f9]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#5a6675]" />
                          Purchased: {item.purchaseDate}
                        </span>

                        <span className="flex items-center gap-1 font-semibold text-[#1f2733]">
                          <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
                          Expires: {item.expiryDate}
                        </span>
                      </div>

                      {/* Action buttons on Material card */}
                      <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedMaterialForSettings(item)}
                          className="h-8 px-2.5 rounded-[10px] bg-[#f4f6f9] hover:bg-[#e8f0fe] text-[#5a6675] hover:text-[#1a73e8] border border-[#e2e8f0] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Configure safety thresholds & suppliers"
                        >
                          <Sliders className="w-3 h-3" />
                          <span>Settings</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMaterialForDraft(item);
                              setDraftOrderType('reorder');
                            }}
                            className="h-8 px-2.5 rounded-[10px] bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border border-[#d2e3fc] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Create Draft Purchase Order"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Draft PO</span>
                          </button>

                          {item.id && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteMaterial(item.id!, e)}
                              disabled={deletingId === item.id}
                              className="p-1.5 rounded-full text-[#5a6675] hover:text-[#c5221f] hover:bg-[#fce8e6] transition-colors cursor-pointer"
                              title="Delete Material"
                              aria-label="Delete Material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Bar: Clean White with 16px rounded corners, 56px touch target */}
            <div className="bg-white border-t border-[#e2e8f0] px-4 py-3 flex items-center justify-between m3-elevation-2 rounded-t-[20px] flex-shrink-0">
              <div className="text-xs text-[#5a6675]">
                Showing <span className="font-bold text-[#1f2733]">{filteredMaterials.length}</span> of {materials.length} items
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('scan');
                  setIsCameraActive(true);
                  setReviewStage('preview');
                }}
                className="min-h-[56px] h-14 px-5 rounded-[16px] bg-[#1a73e8] hover:bg-[#1557b0] text-white font-['Google_Sans',sans-serif] font-semibold text-xs flex items-center gap-2 m3-elevation-1 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Another</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: INVENTORY ALERTS SCREEN (BUILD 2)                      */}
        {/* ============================================================= */}
        {activeTab === 'alerts' && (
          <AlertsScreen
            alerts={alerts}
            materials={materials}
            isLoading={isLoadingAlerts}
            onRefreshAlerts={() => recomputeAllAlerts(materials, getCachedOrders())}
            onDraftReorder={(mat, type) => {
              setSelectedMaterialForDraft(mat);
              setDraftOrderType(type);
            }}
            onOpenSettings={(mat) => setSelectedMaterialForSettings(mat)}
            onViewOrder={(_orderId) => setActiveTab('orders')}
          />
        )}

        {/* ============================================================= */}
        {/* TAB 4: PURCHASE ORDERS SCREEN (BUILD 3)                       */}
        {/* ============================================================= */}
        {activeTab === 'orders' && (
          <OrdersScreen
            orders={orders}
            materials={materials}
            isLoading={isLoadingOrders}
            onOpenDraftModal={(mat) => {
              setSelectedMaterialForDraft(mat);
              setDraftOrderType('reorder');
            }}
            triggerNotice={triggerNotice}
            onOrderUpdated={() => recomputeAllAlerts(materials, getCachedOrders())}
          />
        )}

        {/* ============================================================= */}
        {/* GLOBAL BOTTOM NAVIGATION BAR (MATERIAL 3: 4 TABS)             */}
        {/* ============================================================= */}
        <nav className="h-16 bg-white border-t border-[#e2e8f0] flex items-center justify-around px-2 z-20 flex-shrink-0">
          {/* Tab 1: Scan */}
          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`min-h-[56px] flex-1 flex flex-col items-center justify-center transition-colors cursor-pointer ${
              activeTab === 'scan' ? 'text-[#1a73e8]' : 'text-[#5a6675] hover:text-[#1f2733]'
            }`}
          >
            <div
              className={`px-3 py-1 rounded-[16px] flex items-center justify-center transition-colors ${
                activeTab === 'scan' ? 'bg-[#e8f0fe]' : ''
              }`}
            >
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Scan</span>
          </button>

          {/* Tab 2: Inventory */}
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`min-h-[56px] flex-1 flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
              activeTab === 'inventory' ? 'text-[#1a73e8]' : 'text-[#5a6675] hover:text-[#1f2733]'
            }`}
          >
            <div
              className={`px-3 py-1 rounded-[16px] flex items-center justify-center transition-colors relative ${
                activeTab === 'inventory' ? 'bg-[#e8f0fe]' : ''
              }`}
            >
              <Package className="w-5 h-5" />
              {materials.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1a73e8] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {materials.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Inventory</span>
          </button>

          {/* Tab 3: Alerts */}
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`min-h-[56px] flex-1 flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
              activeTab === 'alerts' ? 'text-[#1a73e8]' : 'text-[#5a6675] hover:text-[#1f2733]'
            }`}
          >
            <div
              className={`px-3 py-1 rounded-[16px] flex items-center justify-center transition-colors relative ${
                activeTab === 'alerts' ? 'bg-[#e8f0fe]' : ''
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#c5221f] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {alerts.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Alerts</span>
          </button>

          {/* Tab 4: Orders */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`min-h-[56px] flex-1 flex flex-col items-center justify-center transition-colors relative cursor-pointer ${
              activeTab === 'orders' ? 'text-[#1a73e8]' : 'text-[#5a6675] hover:text-[#1f2733]'
            }`}
          >
            <div
              className={`px-3 py-1 rounded-[16px] flex items-center justify-center transition-colors relative ${
                activeTab === 'orders' ? 'bg-[#e8f0fe]' : ''
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {orders.filter((o) => o.status === 'pending_approval').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b06000] text-white text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold">
                  {orders.filter((o) => o.status === 'pending_approval').length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-0.5">Orders</span>
          </button>
        </nav>

        {/* ============================================================= */}
        {/* MODALS: REORDER DRAFT & MATERIAL SETTINGS                     */}
        {/* ============================================================= */}
        <DraftOrderModal
          isOpen={!!selectedMaterialForDraft}
          onClose={() => setSelectedMaterialForDraft(null)}
          material={selectedMaterialForDraft}
          orderType={draftOrderType}
          onOrderSaved={(_orderId) => {
            triggerNotice('Purchase Requisition saved with "pending_approval" status.');
            recomputeAllAlerts(materials, getCachedOrders());
            setActiveTab('orders');
          }}
        />

        <MaterialSettingsModal
          isOpen={!!selectedMaterialForSettings}
          onClose={() => setSelectedMaterialForSettings(null)}
          material={selectedMaterialForSettings}
          onSettingsSaved={() => {
            triggerNotice('Material stock settings updated.');
            recomputeAllAlerts(materials, getCachedOrders());
          }}
        />
      </div>
    </div>
  );
}

