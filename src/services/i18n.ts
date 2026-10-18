import { AppLanguage } from './speechService';

export interface Translations {
  // App & Header
  appName: string;
  appYear: string;
  headerScanSubtitle: string;
  headerInventorySubtitle: string;
  headerSenpaiSubtitle: string;
  switchThemeLight: string;
  switchThemeDark: string;

  // Tabs
  scanTab: string;
  inventoryTab: string;
  senpaiTab: string;
  alertsTab: string;
  ordersTab: string;
  stockSettings: string;
  draftPo: string;

  // Bankai Card
  bankaiToday: string;
  bankaiSubtitle: string;
  allClear: string;
  criticalAlerts: string;
  attentionNeeded: string;
  resolveNow: string;
  runAudit: string;
  expiredItems: string;
  expiringItems: string;
  speakBriefing: string;
  stopBriefing: string;
  briefingFinished: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  dailyBriefingSummaryPrefix: string;

  // Mode Selector Chips
  modeMaterialLabel: string;
  modeProductBox: string;
  modeBatchTag: string;

  // Viewfinder & Camera
  tapToCapture: string;
  alignWithinFrame: string;
  grid: string;
  flash: string;
  rotate: string;
  uploadImage: string;
  samplePhotosTitle: string;
  dragDropPrompt: string;
  analyzingWithGemini: string;
  readingLabelDetails: string;

  // Captured Card & Extracted Data
  frontPhotoTitle: string;
  flipToDetails: string;
  flipToPhoto: string;
  retake: string;
  extractedDetails: string;
  materialName: string;
  category: string;
  batchNo: string;
  purchaseDate: string;
  quantity: string;
  unit: string;
  estimatedShelfLife: string;
  days: string;
  calculatedExpiryDate: string;
  confidence: string;
  saveToInventory: string;
  savingToFirestore: string;
  discard: string;
  noLabelDetected: string;
  noLabelGuidance: string;

  // Inventory Screen
  searchPlaceholder: string;
  statusAll: string;
  statusOk: string;
  statusExpiring: string;
  statusExpired: string;
  emptyInventoryTitle: string;
  emptyInventorySubtitle: string;
  emptySearchTitle: string;
  emptySearchSubtitle: string;
  loadingInventory: string;
  itemBatch: string;
  itemPurchased: string;
  itemExpires: string;
  daysRemaining: string;
  daysAgo: string;
  expiredLabel: string;
  viewBatchHistory: string;
  reorderWithSenpai: string;
  deleteItem: string;
  confirmDelete: string;

  // Batch History Modal
  batchModalTitle: string;
  batchCopied: string;
  tabUsageHistory: string;
  tabBatchEntries: string;
  logUsageBtn: string;
  cancelUsageBtn: string;
  dispenseQuantity: string;
  actionDispensed: string;
  actionAudited: string;
  actionQuarantined: string;
  actionDisposed: string;
  purposeLabel: string;
  purposePlaceholder: string;
  operatorLabel: string;
  operatorPlaceholder: string;
  submitUsage: string;
  recordingUsage: string;
  usageRecordedSuccess: string;
  timelineTitle: string;
  noUsageLogs: string;
  noUsageLogsSubtitle: string;
  lotReceiptTitle: string;
  totalCurrentStock: string;
  firstReceived: string;
  shelfLifeDaysLabel: string;
  close: string;

  // Senpai Screen
  senpaiOrbTab: string;
  chatLogTab: string;
  ttsOn: string;
  ttsOff: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  searching: string;
  resultReady: string;
  queryTranscript: string;
  senpaiAnalysis: string;
  executedActions: string;
  askAnother: string;
  toolScanItem: string;
  toolPredictAlerts: string;
  toolFindSuppliers: string;
  toolDraftOrder: string;
  supplierQuotes: string;
  unitCost: string;
  deliveryEta: string;
  rating: string;
  reliability: string;
  draftPoWithSupplier: string;
  approvePo: string;
  poApproved: string;
  poNumber: string;
  totalCost: string;
  items: string;
  urgency: string;
  hideKeyboard: string;
  orTypeQuery: string;
  speechUnavailable: string;
  typeQueryPlaceholder: string;
  speak: string;
  speaking: string;
  quickPrompts: { label: string; text: string }[];

  inspectLabel: string;
  viewInventory: string;
  suppliersFound: string;

  // Toasts & Notices
  toastSaved: string;
  toastDeleted: string;
  toastTargeting: string;
  languageSwitched: string;

  // Senpai Copilot narration & messages ({placeholders} filled via formatT)
  senpaiGreeting: string;
  senpaiDefaultAnswer: string;
  senpaiAnswerScan: string;
  senpaiAnswerAlerts: string;
  senpaiAnswerSuppliers: string;
  senpaiAnswerDraft: string;
  senpaiErrorReply: string;
  senpaiErrorFallback: string;
  senpaiCommError: string;
  speechErrNotSupported: string;
  speechErrNoSpeech: string;
  speechErrNotAllowed: string;
  speechErrNetwork: string;
  speechErrAborted: string;
  speechErrAudioCapture: string;
  speechErrGeneric: string;
  speechErrCouldNotStart: string;
  readyToInspect: string;
  vendorLabel: string;
  speechTranscribedLocally: string;
  speakAgain: string;
  senpaiFooter: string;
  urgencyStandard: string;
  urgencyExpedited: string;
  urgencyOvernight: string;
  draftOrderPrompt: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  EN: {
    // App & Header
    appName: 'Jarvis Senpai',
    appYear: '2026',
    headerScanSubtitle: 'Multimodal Material Vision',
    headerInventorySubtitle: 'Cloud Firestore Inventory',
    headerSenpaiSubtitle: 'Voice Agent & Registered Tools',
    switchThemeLight: 'Switch to Light theme',
    switchThemeDark: 'Switch to Dark theme',

    // Tabs
    scanTab: 'Scan',
    inventoryTab: 'Inventory',
    senpaiTab: 'Senpai',
    alertsTab: 'Alerts',
    ordersTab: 'Orders',
    stockSettings: 'Settings',
    draftPo: 'Draft PO',

    // Bankai Card
    bankaiToday: 'Bankai — Today',
    bankaiSubtitle: 'Prioritised daily alerts & replenishment briefing',
    allClear: 'All clear — Shelf-life optimal',
    criticalAlerts: 'Action Required',
    attentionNeeded: 'items need attention',
    resolveNow: 'Resolve in Inventory',
    runAudit: 'Ask Senpai to Audit',
    expiredItems: 'Expired items',
    expiringItems: 'Expiring within 30 days',
    speakBriefing: 'Speak Briefing',
    stopBriefing: 'Stop Briefing',
    briefingFinished: 'Briefing finished',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    dailyBriefingSummaryPrefix: 'Bankai briefing',

    // Mode Selector Chips
    modeMaterialLabel: 'Material Label',
    modeProductBox: 'Product Box',
    modeBatchTag: 'LOT / Batch Tag',

    // Viewfinder & Camera
    tapToCapture: 'Tap anywhere to capture',
    alignWithinFrame: 'Align material label within frame',
    grid: 'Grid',
    flash: 'Flash',
    rotate: 'Rotate',
    uploadImage: 'Upload Image',
    samplePhotosTitle: 'Sample Test Photos',
    dragDropPrompt: 'Drag & drop photos or select from library',
    analyzingWithGemini: 'Analyzing with Gemini multimodal AI...',
    readingLabelDetails: 'Reading label, batch & shelf-life dates',

    // Captured Card & Extracted Data
    frontPhotoTitle: 'Material Photo Captured',
    flipToDetails: 'Flip to Data',
    flipToPhoto: 'Flip to Photo',
    retake: 'Retake',
    extractedDetails: 'Extracted Material Details',
    materialName: 'Material Name',
    category: 'Category',
    batchNo: 'Batch / LOT No',
    purchaseDate: 'Purchase Date',
    quantity: 'Quantity',
    unit: 'Unit',
    estimatedShelfLife: 'Estimated Shelf Life',
    days: 'days',
    calculatedExpiryDate: 'Calculated Expiry Date',
    confidence: 'AI Confidence',
    saveToInventory: 'Save to Inventory',
    savingToFirestore: 'Saving to Firestore...',
    discard: 'Discard',
    noLabelDetected: 'No Label Detected',
    noLabelGuidance: 'Please frame a clear material or packaging label with name, lot, and dates.',

    // Inventory Screen
    searchPlaceholder: 'Search materials by name, batch, category...',
    statusAll: 'All Items',
    statusOk: 'OK',
    statusExpiring: 'Expiring Soon',
    statusExpired: 'Expired',
    emptyInventoryTitle: 'No materials in inventory',
    emptyInventorySubtitle: 'Scan a material label or test with sample photos to populate your Firestore inventory.',
    emptySearchTitle: 'No matching items',
    emptySearchSubtitle: 'Try adjusting your search query or filter tags.',
    loadingInventory: 'Loading inventory from Firestore...',
    itemBatch: 'LOT / Batch',
    itemPurchased: 'Purchased',
    itemExpires: 'Expires',
    daysRemaining: 'days remaining',
    daysAgo: 'days ago',
    expiredLabel: 'Expired',
    viewBatchHistory: 'Batch History & Traceability',
    reorderWithSenpai: 'Reorder with Senpai',
    deleteItem: 'Delete',
    confirmDelete: 'Are you sure you want to delete this material?',

    // Batch History Modal
    batchModalTitle: 'Batch History & Traceability',
    batchCopied: 'Batch ID copied to clipboard',
    tabUsageHistory: 'Usage Logs & Dispensing',
    tabBatchEntries: 'Lot Receipts & Specs',
    logUsageBtn: 'Log Material Usage',
    cancelUsageBtn: 'Cancel',
    dispenseQuantity: 'Quantity to Dispense',
    actionDispensed: 'Dispensed to Production',
    actionAudited: 'Inventory Audit / QC',
    actionQuarantined: 'Quarantined / Damaged',
    actionDisposed: 'Disposed / Expired',
    purposeLabel: 'Purpose / Batch Reference',
    purposePlaceholder: 'e.g. Formulation batch #402, testing, dispensing',
    operatorLabel: 'Technician / Operator',
    operatorPlaceholder: 'Name or ID',
    submitUsage: 'Record Usage in Firestore',
    recordingUsage: 'Recording...',
    usageRecordedSuccess: 'Usage entry successfully recorded in Firestore.',
    timelineTitle: 'Immutable Audit Trail',
    noUsageLogs: 'No usage logged yet for this Batch/LOT',
    noUsageLogsSubtitle: 'Click "Log Material Usage" above to record dispensing, QC audits, or write-offs.',
    lotReceiptTitle: 'Batch Receipts on File',
    totalCurrentStock: 'Total Stock on Hand',
    firstReceived: 'First Received',
    shelfLifeDaysLabel: 'Shelf Life Days',
    close: 'Close',

    // Senpai Screen
    senpaiOrbTab: 'Senpai Orb',
    chatLogTab: 'Log',
    ttsOn: 'TTS ON',
    ttsOff: 'TTS OFF',
    tapToSpeak: 'Tap microphone to speak to Senpai',
    listening: 'Listening… Tap to finish',
    thinking: 'Thinking…',
    searching: 'Searching…',
    resultReady: 'Result Ready',
    queryTranscript: 'User Voice Prompt',
    senpaiAnalysis: 'Senpai Intelligence',
    executedActions: 'Operational Tools Triggered',
    askAnother: 'Ask Another Question',
    toolScanItem: 'Material Scanner',
    toolPredictAlerts: 'Predictive Expiry Analysis',
    toolFindSuppliers: 'Verified Supplier Quotations',
    toolDraftOrder: 'Purchase Order Replenishment Draft',
    supplierQuotes: 'Verified Supplier Quotations',
    unitCost: 'Unit Cost',
    deliveryEta: 'Delivery ETA',
    rating: 'Rating',
    reliability: 'Reliability',
    draftPoWithSupplier: 'Draft PO with Top Supplier',
    approvePo: 'Approve & Transmit PO',
    poApproved: 'PO Approved & Transmitted',
    poNumber: 'PO Number',
    totalCost: 'Total Cost',
    items: 'Items',
    urgency: 'Urgency',
    hideKeyboard: 'Hide keyboard input',
    orTypeQuery: 'Or type a query',
    speechUnavailable: 'Speech-to-text unavailable in this browser',
    typeQueryPlaceholder: 'Ask Senpai about materials, alerts, suppliers, POs...',
    speak: 'Speak',
    speaking: 'Speaking...',
    quickPrompts: [
      { label: 'Check 30-day alerts', text: 'predict alerts for expiring materials in 30 days' },
      { label: 'Find coffee suppliers', text: 'find verified suppliers for organic coffee beans' },
      { label: 'Draft Amoxicillin PO', text: 'draft replenishment order for 25 boxes of Amoxicillin 500mg' },
      { label: 'Scan chemical tag', text: 'scan item Sodium Chloride reagent lot' },
    ],

    inspectLabel: 'Inspect & Scan Material',
    viewInventory: 'View In Inventory',
    suppliersFound: 'Verified suppliers located',

    // Toasts & Notices
    toastSaved: 'Material saved to Firestore inventory successfully!',
    toastDeleted: 'Material removed from inventory.',
    toastTargeting: 'Targeting material:',
    languageSwitched: 'Language switched to English',
    senpaiGreeting: 'Konnichiwa! I am Senpai, your AI inventory assistant in Jarvis Senpai 2026. Speak naturally—I\'ll transcribe your words locally and use Gemini to predict alerts, inspect materials, discover suppliers, or draft purchase orders.',
    senpaiDefaultAnswer: 'Senpai here! How can I assist your inventory today?',
    senpaiAnswerScan: 'Opening the scanner to inspect {item}. Point your camera at the material label or batch tag!',
    senpaiAnswerAlerts: 'Analyzing inventory health for items expiring within {days} days.',
    senpaiAnswerSuppliers: 'Looking up suppliers for {material}.',
    senpaiAnswerDraft: 'Drafting a purchase order for {supplier}. Please review the details below.',
    senpaiErrorReply: 'Gomen ne! I encountered an error: {message}',
    senpaiErrorFallback: 'Please check your connection and try again.',
    senpaiCommError: 'Failed to communicate with Senpai',
    speechErrNotSupported: 'Browser SpeechRecognition is not supported on this browser. Please type your query in the text box below or click a quick prompt.',
    speechErrNoSpeech: 'No speech detected. Please speak closer to your microphone or type your query below.',
    speechErrNotAllowed: 'Microphone permission was denied. Please allow microphone access in your browser or type your query below.',
    speechErrNetwork: 'Network error communicating with speech recognition service. Please check your connection or type below.',
    speechErrAborted: 'Speech recognition was aborted. Tap the microphone to try again or type below.',
    speechErrAudioCapture: 'Audio capture failed. Ensure your microphone is working and not used by another application.',
    speechErrGeneric: 'Speech recognition error: {error}. You can type your query below.',
    speechErrCouldNotStart: 'Could not start speech recognition: {error}. Please type below.',
    readyToInspect: 'Ready to inspect barcode and batch certificate for',
    vendorLabel: 'Vendor:',
    speechTranscribedLocally: 'Speech Transcribed Locally',
    speakAgain: 'Speak again',
    senpaiFooter: 'Local browser speech-to-text • Gemini tool reasoning • TTS spoken back in English (en-US)',
    urgencyStandard: 'Standard',
    urgencyExpedited: 'Expedited',
    urgencyOvernight: 'Overnight',
    draftOrderPrompt: 'Draft order for {quantity} units of {material} from {supplier}',
  },

  HI: {
    // App & Header
    appName: 'जार्विस सेनपाई',
    appYear: '२०२६',
    headerScanSubtitle: 'मल्टीमॉडल सामग्री विज़न',
    headerInventorySubtitle: 'क्लाउड फायरस्टोर इन्वेंटरी',
    headerSenpaiSubtitle: 'वॉयस एजेंट और पंजीकृत टूल्स',
    switchThemeLight: 'लाइट थीम में बदलें',
    switchThemeDark: 'डार्क थीम में बदलें',

    // Tabs
    scanTab: 'स्कैन',
    inventoryTab: 'इन्वेंटरी',
    senpaiTab: 'सेनपाई',
    alertsTab: 'अलर्ट',
    ordersTab: 'ऑर्डर',
    stockSettings: 'सेटिंग्स',
    draftPo: 'ड्राफ्ट PO',

    // Bankai Card
    bankaiToday: 'बान्काई — आज',
    bankaiSubtitle: 'दैनिक प्राथमिकता अलर्ट और पुनःपूर्ति ब्रीफिंग',
    allClear: 'सब सुरक्षित — इन्वेंटरी स्थिति इष्टतम है',
    criticalAlerts: 'कार्रवाई आवश्यक',
    attentionNeeded: 'वस्तुओं पर ध्यान आवश्यक',
    resolveNow: 'इन्वेंटरी में हल करें',
    runAudit: 'सेनपाई से ऑडिट करवाएं',
    expiredItems: 'अवधि समाप्त वस्तुएं',
    expiringItems: '30 दिनों में समाप्त होने वाली वस्तुएं',
    speakBriefing: 'ब्रीफिंग सुनें',
    stopBriefing: 'ब्रीफिंग रोकें',
    briefingFinished: 'ब्रीफिंग पूर्ण हुई',
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    dailyBriefingSummaryPrefix: 'बान्काई ब्रीफिंग',

    // Mode Selector Chips
    modeMaterialLabel: 'सामग्री लेबल',
    modeProductBox: 'उत्पाद डिब्बा',
    modeBatchTag: 'लॉट / बैच टैग',

    // Viewfinder & Camera
    tapToCapture: 'फोटो लेने के लिए कहीं भी टैप करें',
    alignWithinFrame: 'सामग्री लेबल को फ्रेम के अंदर रखें',
    grid: 'ग्रिड',
    flash: 'फ़्लैश',
    rotate: 'घुमाएँ',
    uploadImage: 'फोटो अपलोड करें',
    samplePhotosTitle: 'नमूना टेस्ट फोटो',
    dragDropPrompt: 'फोटो खींचकर छोड़ें या लाइब्रेरी से चुनें',
    analyzingWithGemini: 'जेमिनी मल्टीमॉडल एआई से विश्लेषण जारी...',
    readingLabelDetails: 'लेबल, बैच और शेल्फ-लाइफ तिथियां पढ़ी जा रही हैं',

    // Captured Card & Extracted Data
    frontPhotoTitle: 'सामग्री फोटो ली गई',
    flipToDetails: 'डेटा कार्ड पलटें',
    flipToPhoto: 'फोटो देखें',
    retake: 'पुनः लें',
    extractedDetails: 'निकाली गई सामग्री विवरण',
    materialName: 'सामग्री का नाम',
    category: 'श्रेणी',
    batchNo: 'बैच / लॉट संख्या',
    purchaseDate: 'खरीद तिथि',
    quantity: 'मात्रा',
    unit: 'इकाई',
    estimatedShelfLife: 'अनुमानित शेल्फ लाइफ',
    days: 'दिन',
    calculatedExpiryDate: 'गणना की गई समाप्ति तिथि',
    confidence: 'एआई सटीकता',
    saveToInventory: 'इन्वेंटरी में सहेजें',
    savingToFirestore: 'फायरस्टोर में सहेजा जा रहा है...',
    discard: 'रद्द करें',
    noLabelDetected: 'कोई लेबल नहीं मिला',
    noLabelGuidance: 'कृपया नाम, लॉट और तारीख वाले स्पष्ट लेबल को फ्रेम में रखें।',

    // Inventory Screen
    searchPlaceholder: 'नाम, बैच, श्रेणी द्वारा सामग्री खोजें...',
    statusAll: 'सभी सामग्री',
    statusOk: 'सुरक्षित',
    statusExpiring: 'जल्द समाप्त',
    statusExpired: 'अवधि समाप्त',
    emptyInventoryTitle: 'इन्वेंटरी में कोई सामग्री नहीं है',
    emptyInventorySubtitle: 'फायरस्टोर इन्वेंटरी भरने के लिए कोई सामग्री लेबल स्कैन करें या नमूना फोटो आज़माएं।',
    emptySearchTitle: 'कोई मेल खाता आइटम नहीं मिला',
    emptySearchSubtitle: 'अपने खोज शब्द या फ़िल्टर बदलकर देखें।',
    loadingInventory: 'फायरस्टोर से इन्वेंटरी लोड हो रही है...',
    itemBatch: 'लॉट / बैच',
    itemPurchased: 'खरीदी गई',
    itemExpires: 'समाप्ति',
    daysRemaining: 'दिन शेष',
    daysAgo: 'दिन पहले',
    expiredLabel: 'अवधि समाप्त',
    viewBatchHistory: 'बैच इतिहास और ट्रेसबिलिटी',
    reorderWithSenpai: 'सेनपाई से पुनः ऑर्डर करें',
    deleteItem: 'हटाएं',
    confirmDelete: 'क्या आप वाकई इस सामग्री को हटाना चाहते हैं?',

    // Batch History Modal
    batchModalTitle: 'बैच इतिहास और ट्रेसबिलिटी',
    batchCopied: 'बैच आईडी क्लिपबोर्ड पर कॉपी की गई',
    tabUsageHistory: 'उपयोग लॉग और वितरण',
    tabBatchEntries: 'लॉट रसीदें और विवरण',
    logUsageBtn: 'सामग्री उपयोग दर्ज करें',
    cancelUsageBtn: 'रद्द करें',
    dispenseQuantity: 'वितरित करने की मात्रा',
    actionDispensed: 'उत्पादन के लिए वितरित',
    actionAudited: 'इन्वेंटरी ऑडिट / क्यूसी',
    actionQuarantined: 'संगरोध / क्षतिग्रस्त',
    actionDisposed: 'निपटान / समाप्त',
    purposeLabel: 'उद्देश्य / बैच संदर्भ',
    purposePlaceholder: 'जैसे: बैच रन #402, निर्माण, परीक्षण',
    operatorLabel: 'तकनीशियन / संचालक',
    operatorPlaceholder: 'नाम या आईडी',
    submitUsage: 'फायरस्टोर में उपयोग दर्ज करें',
    recordingUsage: 'दर्ज हो रहा है...',
    usageRecordedSuccess: 'उपयोग विवरण सफलतापूर्वक फायरस्टोर में दर्ज किया गया।',
    timelineTitle: 'अपरिवर्तनीय ऑडिट ट्रेल',
    noUsageLogs: 'इस बैच/लॉट के लिए अभी तक कोई उपयोग दर्ज नहीं हुआ है',
    noUsageLogsSubtitle: 'वितरण, क्यूसी ऑडिट या राइट-ऑफ दर्ज करने के लिए ऊपर "सामग्री उपयोग दर्ज करें" पर क्लिक करें।',
    lotReceiptTitle: 'फ़ाइल पर बैच रसीदें',
    totalCurrentStock: 'कुल उपलब्ध स्टॉक',
    firstReceived: 'पहली बार प्राप्त',
    shelfLifeDaysLabel: 'शेल्फ लाइफ दिन',
    close: 'बंद करें',

    // Senpai Screen
    senpaiOrbTab: 'सेनपाई ऑर्ब',
    chatLogTab: 'लॉग',
    ttsOn: 'आवाज़ चालू',
    ttsOff: 'आवाज़ बंद',
    tapToSpeak: 'सेनपाई से बात करने के लिए माइक दबाएं',
    listening: 'सुन रहा हूँ… पूरा करने के लिए टैप करें',
    thinking: 'सोच रहा हूँ…',
    searching: 'खोज रहा हूँ…',
    resultReady: 'परिणाम तैयार',
    queryTranscript: 'उपयोगकर्ता वॉयस प्रॉम्प्ट',
    senpaiAnalysis: 'सेनपाई विश्लेषण',
    executedActions: 'परिचालित टूल्स सक्रिय',
    askAnother: 'दूसरा प्रश्न पूछें',
    toolScanItem: 'सामग्री स्कैनर',
    toolPredictAlerts: 'पूर्वानुमानित समाप्ति विश्लेषण',
    toolFindSuppliers: 'सत्यापित आपूर्तिकर्ता उद्धरण',
    toolDraftOrder: 'खरीद आदेश पुनःपूर्ति ड्राफ्ट',
    supplierQuotes: 'सत्यापित आपूर्तिकर्ता उद्धरण',
    unitCost: 'इकाई लागत',
    deliveryEta: 'वितरण समय',
    rating: 'रेटिंग',
    reliability: 'विश्वसनीयता',
    draftPoWithSupplier: 'शीर्ष आपूर्तिकर्ता के साथ PO बनाएं',
    approvePo: 'PO स्वीकृत और प्रेषित करें',
    poApproved: 'PO स्वीकृत और प्रेषित किया गया',
    poNumber: 'PO संख्या',
    totalCost: 'कुल लागत',
    items: 'वस्तुएं',
    urgency: 'प्राथमिकता',
    hideKeyboard: 'कीबोर्ड छुपाएं',
    orTypeQuery: 'या प्रश्न टाइप करें',
    speechUnavailable: 'इस ब्राउज़र में वाक् पहचान उपलब्ध नहीं है',
    typeQueryPlaceholder: 'सामग्री, अलर्ट, आपूर्तिकर्ता या PO के बारे में पूछें...',
    speak: 'बोलें',
    speaking: 'बोल रहा है...',
    quickPrompts: [
      { label: '30-दिन के अलर्ट जांचें', text: '30 दिनों में समाप्त होने वाली सामग्री के अलर्ट का पूर्वानुमान लगाएं' },
      { label: 'कॉफ़ी आपूर्तिकर्ता खोजें', text: 'ऑर्गेनिक कॉफ़ी बीन्स के लिए सत्यापित आपूर्तिकर्ता खोजें' },
      { label: 'एमोक्सिसिलिन का PO बनाएं', text: 'एमोक्सिसिलिन 500mg के 25 बॉक्स के लिए पुनःपूर्ति आदेश ड्राफ्ट करें' },
      { label: 'रासायनिक टैग स्कैन करें', text: 'सोडियम क्लोराइड अभिकर्मक लॉट को स्कैन करें' },
    ],

    inspectLabel: 'सामग्री का निरीक्षण और स्कैन करें',
    viewInventory: 'इन्वेंटरी में देखें',
    suppliersFound: 'सत्यापित आपूर्तिकर्ता मिले',

    // Toasts & Notices
    toastSaved: 'सामग्री सफलतापूर्वक फायरस्टोर इन्वेंटरी में सहेजी गई!',
    toastDeleted: 'सामग्री इन्वेंटरी से हटा दी गई।',
    toastTargeting: 'लक्षित सामग्री:',
    languageSwitched: 'भाषा बदलकर हिंदी की गई',
    senpaiGreeting: 'नमस्ते! मैं सेनपाई हूँ, जार्विस सेनपाई 2026 में आपका AI इन्वेंटरी सहायक। स्वाभाविक रूप से बोलें—मैं आपके शब्दों को स्थानीय रूप से लिखूँगा और जेमिनी की मदद से अलर्ट का अनुमान, सामग्री की जाँच, आपूर्तिकर्ताओं की खोज या खरीद आदेश तैयार करूँगा।',
    senpaiDefaultAnswer: 'सेनपाई यहाँ है! आज मैं आपकी इन्वेंटरी में कैसे मदद कर सकता हूँ?',
    senpaiAnswerScan: '{item} की जाँच के लिए स्कैनर खोल रहा हूँ। अपने कैमरे को सामग्री लेबल या बैच टैग की ओर रखें!',
    senpaiAnswerAlerts: '{days} दिनों में समाप्त होने वाली वस्तुओं के लिए इन्वेंटरी की स्थिति का विश्लेषण कर रहा हूँ।',
    senpaiAnswerSuppliers: '{material} के लिए आपूर्तिकर्ता खोज रहा हूँ।',
    senpaiAnswerDraft: '{supplier} के लिए खरीद आदेश तैयार कर रहा हूँ। कृपया नीचे विवरण की समीक्षा करें।',
    senpaiErrorReply: 'माफ़ कीजिए! एक त्रुटि हुई: {message}',
    senpaiErrorFallback: 'कृपया अपना कनेक्शन जाँचें और फिर से प्रयास करें।',
    senpaiCommError: 'सेनपाई से संपर्क नहीं हो सका',
    speechErrNotSupported: 'इस ब्राउज़र में वाक् पहचान समर्थित नहीं है। कृपया नीचे टेक्स्ट बॉक्स में अपना प्रश्न लिखें या कोई त्वरित प्रश्न चुनें।',
    speechErrNoSpeech: 'कोई आवाज़ नहीं मिली। कृपया माइक्रोफ़ोन के पास बोलें या नीचे अपना प्रश्न लिखें।',
    speechErrNotAllowed: 'माइक्रोफ़ोन की अनुमति नहीं दी गई। कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें या नीचे अपना प्रश्न लिखें।',
    speechErrNetwork: 'वाक् पहचान सेवा से संपर्क में नेटवर्क त्रुटि। कृपया कनेक्शन जाँचें या नीचे लिखें।',
    speechErrAborted: 'वाक् पहचान रोक दी गई। फिर से प्रयास करने के लिए माइक दबाएँ या नीचे लिखें।',
    speechErrAudioCapture: 'ऑडियो रिकॉर्ड नहीं हो सका। सुनिश्चित करें कि माइक्रोफ़ोन काम कर रहा है और किसी अन्य ऐप में उपयोग नहीं हो रहा।',
    speechErrGeneric: 'वाक् पहचान त्रुटि: {error}। आप नीचे अपना प्रश्न लिख सकते हैं।',
    speechErrCouldNotStart: 'वाक् पहचान शुरू नहीं हो सकी: {error}। कृपया नीचे लिखें।',
    readyToInspect: 'बारकोड और बैच प्रमाणपत्र की जाँच के लिए तैयार:',
    vendorLabel: 'विक्रेता:',
    speechTranscribedLocally: 'आवाज़ स्थानीय रूप से लिखी गई',
    speakAgain: 'फिर से सुनें',
    senpaiFooter: 'स्थानीय वाक् पहचान • जेमिनी टूल्स • हिंदी आवाज़ (hi-IN)',
    urgencyStandard: 'सामान्य',
    urgencyExpedited: 'त्वरित',
    urgencyOvernight: 'रातोंरात',
    draftOrderPrompt: '{supplier} से {material} की {quantity} इकाइयों का खरीद आदेश तैयार करें',
  },

  KN: {
    // App & Header
    appName: 'ಜಾರ್ವಿಸ್ ಸೆನ್‌ಪೈ',
    appYear: '೨೦೨೬',
    headerScanSubtitle: 'ಮಲ್ಟಿಮೋಡಲ್ ಸಾಮಗ್ರಿ ದೃಷ್ಟಿ',
    headerInventorySubtitle: 'ಕ್ಲೌಡ್ ಫೈರ್‌ಸ್ಟೋರ್ ದಾಸ್ತಾನು',
    headerSenpaiSubtitle: 'ಧ್ವನಿ ಸಹಾಯಕ ಮತ್ತು ನೋಂದಾಯಿತ ಪರಿಕರಗಳು',
    switchThemeLight: 'ಬೆಳಕಿನ ಥೀಮ್‌ಗೆ ಬದಲಾಯಿಸಿ',
    switchThemeDark: 'ಕತ್ತಲೆಯ ಥೀಮ್‌ಗೆ ಬದಲಾಯಿಸಿ',

    // Tabs
    scanTab: 'ಸ್ಕ್ಯಾನ್',
    inventoryTab: 'ದಾಸ್ತಾನು',
    senpaiTab: 'ಸೆನ್‌ಪೈ',
    alertsTab: 'ಎಚ್ಚರಿಕೆಗಳು',
    ordersTab: 'ಆರ್ಡರ್‌ಗಳು',
    stockSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    draftPo: 'ಡ್ರಾಫ್ಟ್ PO',

    // Bankai Card
    bankaiToday: 'ಬಾಂಕೈ — ಇಂದಿನ ಮಾಹಿತಿ',
    bankaiSubtitle: 'ದೈನಂದಿನ ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಮರುಪೂರಣ ವರದಿ',
    allClear: 'ಎಲ್ಲವೂ ಸುರಕ್ಷಿತ — ದಾಸ್ತಾನು ಸುಸ್ಥಿತಿಯಲ್ಲಿದೆ',
    criticalAlerts: 'ತುರ್ತು ಗಮನ ಅಗತ್ಯ',
    attentionNeeded: 'ವಸ್ತುಗಳಿಗೆ ತುರ್ತು ಗಮನ ಬೇಕಾಗಿದೆ',
    resolveNow: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಪರಿಹರಿಸಿ',
    runAudit: 'ಸೆನ್‌ಪೈ ಮೂಲಕ ಲೆಕ್ಕಪರಿಶೋಧನೆ ನಡೆಸಿ',
    expiredItems: 'ಅವಧಿ ಮೀರಿದ ವಸ್ತುಗಳು',
    expiringItems: '30 ದಿನಗಳಲ್ಲಿ ಅವಧಿ ಮುಗಿಯುವ ವಸ್ತುಗಳು',
    speakBriefing: 'ವರದಿ ಆಲಿಸಿ',
    stopBriefing: 'ವರದಿ ನಿಲ್ಲಿಸಿ',
    briefingFinished: 'ವರದಿ ಮುಕ್ತಾಯವಾಯಿತು',
    goodMorning: 'ಶುಭೋದಯ',
    goodAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
    goodEvening: 'ಶುಭ ಸಂಜೆ',
    dailyBriefingSummaryPrefix: 'ಬಾಂಕೈ ದೈನಂದಿನ ವರದಿ',

    // Mode Selector Chips
    modeMaterialLabel: 'ಸಾಮಗ್ರಿ ಲೇಬಲ್',
    modeProductBox: 'ಉತ್ಪನ್ನದ ಬಾಕ್ಸ್',
    modeBatchTag: 'ಲಾಟ್ / ಬ್ಯಾಚ್ ಟ್ಯಾಗ್',

    // Viewfinder & Camera
    tapToCapture: 'ಫೋಟೋ ತೆಗೆಯಲು ಎಲ್ಲಿಯಾದರೂ ಸ್ಪರ್ಶಿಸಿ',
    alignWithinFrame: 'ಸಾಮಗ್ರಿ ಲೇಬಲ್ ಅನ್ನು ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇರಿಸಿ',
    grid: 'ಗ್ರಿಡ್',
    flash: 'ಫ್ಲ್ಯಾಶ್',
    rotate: 'ತಿರುಗಿಸಿ',
    uploadImage: 'ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    samplePhotosTitle: 'ಮಾದರಿ ಪರೀಕ್ಷಾ ಫೋಟೋಗಳು',
    dragDropPrompt: 'ಫೋಟೋಗಳನ್ನು ಎಳೆಯಿರಿ ಅಥವಾ ಲೈಬ್ರರಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ',
    analyzingWithGemini: 'ಜೆಮಿನಿ ಮಲ್ಟಿಮೋಡಲ್ AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
    readingLabelDetails: 'ಲೇಬಲ್, ಬ್ಯಾಚ್ ಮತ್ತು ಮುಕ್ತಾಯ ದಿನಾಂಕಗಳನ್ನು ಓದಲಾಗುತ್ತಿದೆ',

    // Captured Card & Extracted Data
    frontPhotoTitle: 'ಸಾಮಗ್ರಿ ಫೋಟೋ ಸೆರೆಹಿಡಿಯಲಾಗಿದೆ',
    flipToDetails: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    flipToPhoto: 'ಫೋಟೋ ವೀಕ್ಷಿಸಿ',
    retake: 'ಮತ್ತೆ ತೆಗೆಯಿರಿ',
    extractedDetails: 'ಹೊರತೆಗೆಯಲಾದ ಸಾಮಗ್ರಿ ವಿವರಗಳು',
    materialName: 'ಸಾಮಗ್ರಿಯ ಹೆಸರು',
    category: 'ವರ್ಗ',
    batchNo: 'ಬ್ಯಾಚ್ / ಲಾಟ್ ಸಂಖ್ಯೆ',
    purchaseDate: 'ಖರೀದಿ ದಿನಾಂಕ',
    quantity: 'ಪ್ರಮಾಣ',
    unit: 'ಘಟಕ',
    estimatedShelfLife: 'ಅಂದಾಜು ಶೆಲ್ಫ್ ಲೈಫ್',
    days: 'ದಿನಗಳು',
    calculatedExpiryDate: 'ಲೆಕ್ಕಹಾಕಿದ ಮುಕ್ತಾಯ ದಿನಾಂಕ',
    confidence: 'AI ವಿಶ್ವಾಸಾರ್ಹತೆ',
    saveToInventory: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಉಳಿಸಿ',
    savingToFirestore: 'ಫೈರ್‌ಸ್ಟೋರ್‌ಗೆ ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
    discard: 'ರದ್ದುಮಾಡಿ',
    noLabelDetected: 'ಯಾವುದೇ ಲೇಬಲ್ ಪತ್ತೆಯಾಗಿಲ್ಲ',
    noLabelGuidance: 'ದಯವಿಟ್ಟು ಹೆಸರು, ಲಾಟ್ ಮತ್ತು ದಿನಾಂಕಗಳಿರುವ ಸ್ಪಷ್ಟ ಸಾಮಗ್ರಿ ಲೇಬಲ್ ಅನ್ನು ಚೌಕಟ್ಟಿನಲ್ಲಿರಿಸಿ.',

    // Inventory Screen
    searchPlaceholder: 'ಹೆಸರು, ಬ್ಯಾಚ್, ವರ್ಗದ ಮೂಲಕ ಹುಡುಕಿ...',
    statusAll: 'ಎಲ್ಲಾ ವಸ್ತುಗಳು',
    statusOk: 'ಉತ್ತಮವಾಗಿದೆ',
    statusExpiring: 'ಶೀಘ್ರ ಮುಕ್ತಾಯ',
    statusExpired: 'ಅವಧಿ ಮೀರಿದೆ',
    emptyInventoryTitle: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಯಾವುದೇ ವಸ್ತುಗಳಿಲ್ಲ',
    emptyInventorySubtitle: 'ಫೈರ್‌ಸ್ಟೋರ್ ದಾಸ್ತಾನು ತುಂಬಲು ಸಾಮಗ್ರಿ ಲೇಬಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಮಾದರಿ ಫೋಟೋಗಳನ್ನು ಬಳಸಿ.',
    emptySearchTitle: 'ಯಾವುದೇ ಸಾಮಗ್ರಿಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
    emptySearchSubtitle: 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಪದಗಳು ಅಥವಾ ಫಿಲ್ಟರ್‌ಗಳನ್ನು ಬದಲಾಯಿಸಿ ಪ್ರಯತ್ನಿಸಿ.',
    loadingInventory: 'ಫೈರ್‌ಸ್ಟೋರ್‌ನಿಂದ ದಾಸ್ತಾನು ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    itemBatch: 'ಲಾಟ್ / ಬ್ಯಾಚ್',
    itemPurchased: 'ಖರೀದಿಸಲಾಗಿದೆ',
    itemExpires: 'ಮುಕ್ತಾಯ',
    daysRemaining: 'ದಿನಗಳು ಬಾಕಿ',
    daysAgo: 'ದಿನಗಳ ಹಿಂದೆ',
    expiredLabel: 'ಅವಧಿ ಮೀರಿದೆ',
    viewBatchHistory: 'ಬ್ಯಾಚ್ ಇತಿಹಾಸ ಮತ್ತು ಪತ್ತೆಹಚ್ಚುವಿಕೆ',
    reorderWithSenpai: 'ಸೆನ್‌ಪೈ ಬಳಿ ಮರುಆರ್ಡರ್ ಮಾಡಲು ಕೇಳಿ',
    deleteItem: 'ಅಳಿಸಿ',
    confirmDelete: 'ನೀವು ಖಚಿತವಾಗಿ ಈ ಸಾಮಗ್ರಿಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?',

    // Batch History Modal
    batchModalTitle: 'ಬ್ಯಾಚ್ ಇತಿಹಾಸ ಮತ್ತು ಪತ್ತೆಹಚ್ಚುವಿಕೆ',
    batchCopied: 'ಬ್ಯಾಚ್ ಐಡಿ ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ಗೆ ನಕಲಿಸಲಾಗಿದೆ',
    tabUsageHistory: 'ಬಳಕೆ ದಾಖಲೆಗಳು ಮತ್ತು ವಿತರಣೆ',
    tabBatchEntries: 'ಲಾಟ್ ರಸೀದಿಗಳು ಮತ್ತು ವಿವರಗಳು',
    logUsageBtn: 'ಸಾಮಗ್ರಿ ಬಳಕೆ ದಾಖಲಿಸಿ',
    cancelUsageBtn: 'ರದ್ದುಮಾಡಿ',
    dispenseQuantity: 'ವಿತರಿಸಬೇಕಾದ ಪ್ರಮಾಣ',
    actionDispensed: 'ಉತ್ಪಾದನೆಗೆ ವಿತರಿಸಲಾಗಿದೆ',
    actionAudited: 'ದಾಸ್ತಾನು ಪರಿಶೋಧನೆ / ಕ್ಯೂಸಿ',
    actionQuarantined: 'ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ / ಹಾನಿಗೊಳಗಾಗಿದೆ',
    actionDisposed: 'ವಿಲೇವಾರಿ / ಅವಧಿ ಮೀರಿದೆ',
    purposeLabel: 'ಉದ್ದೇಶ / ಬ್ಯಾಚ್ ಉಲ್ಲೇಖ',
    purposePlaceholder: 'ಉದಾ: ಬ್ಯಾಚ್ ರನ್ #402, ಉತ್ಪಾದನೆ, ಪರೀಕ್ಷೆ',
    operatorLabel: 'ತಂತ್ರಜ್ಞ / ನಿರ್ವಾಹಕ',
    operatorPlaceholder: 'ಹೆಸರು ಅಥವಾ ಐಡಿ',
    submitUsage: 'ಫೈರ್‌ಸ್ಟೋರ್‌ನಲ್ಲಿ ಬಳಕೆ ದಾಖಲಿಸಿ',
    recordingUsage: 'ದಾಖಲಾಗುತ್ತಿದೆ...',
    usageRecordedSuccess: 'ಬಳಕೆ ವಿವರವನ್ನು ಫೈರ್‌ಸ್ಟೋರ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ.',
    timelineTitle: 'ಶಾಶ್ವತ ಲೆಕ್ಕಪರಿಶೋಧನಾ ಇತಿಹಾಸ',
    noUsageLogs: 'ಈ ಬ್ಯಾಚ್/ಲಾಟ್‌ಗಾಗಿ ಇನ್ನೂ ಯಾವುದೇ ಬಳಕೆ ದಾಖಲಾಗಿಲ್ಲ',
    noUsageLogsSubtitle: 'ವಿತರಣೆ, ಕ್ಯೂಸಿ ಆಡಿಟ್ ದಾಖಲಿಸಲು ಮೇಲಿನ "ಸಾಮಗ್ರಿ ಬಳಕೆ ದಾಖಲಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ.',
    lotReceiptTitle: 'ದಾಖಲೆಯಲ್ಲಿರುವ ಬ್ಯಾಚ್ ರಸೀದಿಗಳು',
    totalCurrentStock: 'ಲಭ್ಯವಿರುವ ಒಟ್ಟು ದಾಸ್ತಾನು',
    firstReceived: 'ಮೊದಲು ಸ್ವೀಕರಿಸಿದ್ದು',
    shelfLifeDaysLabel: 'ಶೆಲ್ಫ್ ಲೈಫ್ ದಿನಗಳು',
    close: 'ಮುಚ್ಚಿ',

    // Senpai Screen
    senpaiOrbTab: 'ಸೆನ್‌ಪೈ ಗೋಳ',
    chatLogTab: 'ದಾಖಲೆ',
    ttsOn: 'ಧ್ವನಿ ಆನ್',
    ttsOff: 'ಧ್ವನಿ ಆಫ್',
    tapToSpeak: 'ಸೆನ್‌ಪೈ ಜೊತೆ ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ… ಪೂರ್ಣಗೊಳಿಸಲು ಸ್ಪರ್ಶಿಸಿ',
    thinking: 'ಆಲೋಚಿಸುತ್ತಿದ್ದೇನೆ…',
    searching: 'ಹುಡುಕುತ್ತಿದ್ದೇನೆ…',
    resultReady: 'ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ',
    queryTranscript: 'ಬಳಕೆದಾರರ ಧ್ವನಿ ಪ್ರಶ್ನೆ',
    senpaiAnalysis: 'ಸೆನ್‌ಪೈ ವಿಶ್ಲೇಷಣೆ',
    executedActions: 'ಕಾರ್ಯಗತಗೊಳಿಸಿದ ಪರಿಕರಗಳು',
    askAnother: 'ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ',
    toolScanItem: 'ಸಾಮಗ್ರಿ ಸ್ಕ್ಯಾನರ್',
    toolPredictAlerts: 'ಮುನ್ಸೂಚಕ ಮುಕ್ತಾಯ ವಿಶ್ಲೇಷಣೆ',
    toolFindSuppliers: 'ದೃಢೀಕೃತ ಪೂರೈಕೆದಾರರ ಉಲ್ಲೇಖಗಳು',
    toolDraftOrder: 'ಖರೀದಿ ಆದೇಶ ಮರುಪೂರಣ ಕರಡು',
    supplierQuotes: 'ದೃಢೀಕೃತ ಪೂರೈಕೆದಾರರ ಉಲ್ಲೇಖಗಳು',
    unitCost: 'ಘಟಕ ದರ',
    deliveryEta: 'ವಿತರಣೆಯ ದಿನಗಳು',
    rating: 'ರೇಟಿಂಗ್',
    reliability: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
    draftPoWithSupplier: 'ಉನ್ನತ ಪೂರೈಕೆದಾರರಿಗೆ PO ತಯಾರಿಸಿ',
    approvePo: 'PO ಅನುಮೋದಿಸಿ ಮತ್ತು ರವಾನಿಸಿ',
    poApproved: 'PO ಅನುಮೋದಿಸಿ ರವಾನಿಸಲಾಗಿದೆ',
    poNumber: 'PO ಸಂಖ್ಯೆ',
    totalCost: 'ಒಟ್ಟು ವೆಚ್ಚ',
    items: 'ವಸ್ತುಗಳು',
    urgency: 'ತುರ್ತು',
    hideKeyboard: 'ಕೀಬೋರ್ಡ್ ಮರೆಮಾಡಿ',
    orTypeQuery: 'ಅಥವಾ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ',
    speechUnavailable: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ',
    typeQueryPlaceholder: 'ವಸ್ತುಗಳು, ಎಚ್ಚರಿಕೆಗಳು, ಪೂರೈಕೆದಾರರು ಅಥವಾ PO ಬಗ್ಗೆ ಸೆನ್‌ಪೈ ಬಳಿ ಕೇಳಿ...',
    speak: 'ಆಲಿಸಿ',
    speaking: 'ನುಡಿಯುತ್ತಿದೆ...',
    quickPrompts: [
      { label: '30 ದಿನಗಳ ಎಚ್ಚರಿಕೆ ಪರಿಶೀಲಿಸಿ', text: 'ಮುಂದಿನ 30 ದಿನಗಳಲ್ಲಿ ಅವಧಿ ಮುಗಿಯುವ ವಸ್ತುಗಳ ಎಚ್ಚರಿಕೆಯನ್ನು ತಿಳಿಸಿ' },
      { label: 'ಕಾಫಿ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ', text: 'ಸಾವಯವ ಕಾಫಿ ಬೀಜಗಳಿಗೆ ಪರಿಶೀಲಿಸಿದ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ' },
      { label: 'ಅಮೋಕ್ಸಿಸಿಲಿನ್ PO ತಯಾರಿಸಿ', text: '25 ಬಾಕ್ಸ್ ಅಮೋಕ್ಸಿಸಿಲಿನ್ 500mg ಗಾಗಿ ಮರುಪೂರಣ ಖರೀದಿ ಆದೇಶ ತಯಾರಿಸಿ' },
      { label: 'ರಾಸಾಯನಿಕ ಲೇಬಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', text: 'ಸೋಡಿಯಂ ಕ್ಲೋರೈಡ್ ರೀಜೆಂಟ್ ಬ್ಯಾಚ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },
    ],

    inspectLabel: 'ಸಾಮಗ್ರಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    viewInventory: 'ದಾಸ್ತಾನುಗಳಲ್ಲಿ ವೀಕ್ಷಿಸಿ',
    suppliersFound: 'ಪರಿಶೀಲಿಸಿದ ಸರಬರಾಜುದಾರರು ಕಂಡುಬಂದಿದ್ದಾರೆ',

    // Toasts & Notices
    toastSaved: 'ಸಾಮಗ್ರಿಯನ್ನು ಫೈರ್‌ಸ್ಟೋರ್ ದಾಸ್ತಾನಿನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
    toastDeleted: 'ಸಾಮಗ್ರಿಯನ್ನು ದಾಸ್ತಾನಿನಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.',
    toastTargeting: 'ಗುರಿಪಡಿಸಿದ ಸಾಮಗ್ರಿ:',
    languageSwitched: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ',
    senpaiGreeting: 'ನಮಸ್ಕಾರ! ನಾನು ಸೆನ್‌ಪೈ, ಜಾರ್ವಿಸ್ ಸೆನ್‌ಪೈ 2026 ರಲ್ಲಿ ನಿಮ್ಮ AI ದಾಸ್ತಾನು ಸಹಾಯಕ. ಸಹಜವಾಗಿ ಮಾತನಾಡಿ—ನಿಮ್ಮ ಮಾತುಗಳನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಬರೆದು, ಜೆಮಿನಿ ಮೂಲಕ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಊಹಿಸುತ್ತೇನೆ, ವಸ್ತುಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತೇನೆ, ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕುತ್ತೇನೆ ಅಥವಾ ಖರೀದಿ ಆದೇಶಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತೇನೆ.',
    senpaiDefaultAnswer: 'ಸೆನ್‌ಪೈ ಇಲ್ಲಿದ್ದೇನೆ! ಇಂದು ನಿಮ್ಮ ದಾಸ್ತಾನಿಗೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    senpaiAnswerScan: '{item} ಪರಿಶೀಲಿಸಲು ಸ್ಕ್ಯಾನರ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಕ್ಯಾಮೆರಾವನ್ನು ವಸ್ತುವಿನ ಲೇಬಲ್ ಅಥವಾ ಬ್ಯಾಚ್ ಟ್ಯಾಗ್‌ನತ್ತ ತೋರಿಸಿ!',
    senpaiAnswerAlerts: '{days} ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳುವ ವಸ್ತುಗಳಿಗಾಗಿ ದಾಸ್ತಾನಿನ ಸ್ಥಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದ್ದೇನೆ.',
    senpaiAnswerSuppliers: '{material} ಗಾಗಿ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕುತ್ತಿದ್ದೇನೆ.',
    senpaiAnswerDraft: '{supplier} ಗಾಗಿ ಖರೀದಿ ಆದೇಶವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    senpaiErrorReply: 'ಕ್ಷಮಿಸಿ! ಒಂದು ದೋಷ ಎದುರಾಯಿತು: {message}',
    senpaiErrorFallback: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    senpaiCommError: 'ಸೆನ್‌ಪೈ ಜೊತೆ ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    speechErrNotSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಪಠ್ಯ ಪೆಟ್ಟಿಗೆಯಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ತ್ವರಿತ ಪ್ರಶ್ನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    speechErrNoSpeech: 'ಯಾವುದೇ ಧ್ವನಿ ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಹತ್ತಿರ ಮಾತನಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
    speechErrNotAllowed: 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
    speechErrNetwork: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸೇವೆಯೊಂದಿಗೆ ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
    speechErrAborted: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಲು ಮೈಕ್ ಒತ್ತಿ ಅಥವಾ ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
    speechErrAudioCapture: 'ಆಡಿಯೋ ಸೆರೆಹಿಡಿಯಲು ವಿಫಲವಾಗಿದೆ. ಮೈಕ್ರೊಫೋನ್ ಕೆಲಸ ಮಾಡುತ್ತಿದೆಯೇ ಮತ್ತು ಬೇರೆ ಅಪ್ಲಿಕೇಶನ್ ಬಳಸುತ್ತಿಲ್ಲವೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
    speechErrGeneric: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ದೋಷ: {error}. ನೀವು ಕೆಳಗೆ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಬಹುದು.',
    speechErrCouldNotStart: 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ: {error}. ದಯವಿಟ್ಟು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ.',
    readyToInspect: 'ಬಾರ್‌ಕೋಡ್ ಮತ್ತು ಬ್ಯಾಚ್ ಪ್ರಮಾಣಪತ್ರ ಪರಿಶೀಲನೆಗೆ ಸಿದ್ಧ:',
    vendorLabel: 'ಮಾರಾಟಗಾರ:',
    speechTranscribedLocally: 'ಧ್ವನಿಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಬರೆಯಲಾಗಿದೆ',
    speakAgain: 'ಮತ್ತೆ ಕೇಳಿ',
    senpaiFooter: 'ಸ್ಥಳೀಯ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ • ಜೆಮಿನಿ ಪರಿಕರಗಳು • ಕನ್ನಡ ಧ್ವನಿ (kn-IN)',
    urgencyStandard: 'ಸಾಮಾನ್ಯ',
    urgencyExpedited: 'ತ್ವರಿತ',
    urgencyOvernight: 'ರಾತ್ರೋರಾತ್ರಿ',
    draftOrderPrompt: '{supplier} ಇಂದ {material} ನ {quantity} ಘಟಕಗಳಿಗೆ ಖರೀದಿ ಆದೇಶ ಸಿದ್ಧಪಡಿಸಿ',
  },
};

/**
 * Fills {placeholder} tokens in a translated string.
 */
export function formatT(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

export function getTranslations(lang: AppLanguage): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.EN;
}
