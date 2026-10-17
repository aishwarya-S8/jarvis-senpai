import { AppLanguage } from './speechService';

export interface Translations {
  appName: string;
  scanTab: string;
  inventoryTab: string;
  senpaiTab: string;
  bankaiToday: string;
  bankaiSubtitle: string;
  allClear: string;
  criticalAlerts: string;
  attentionNeeded: string;
  resolveNow: string;
  runAudit: string;
  inspectLabel: string;
  viewInventory: string;
  tapToSpeak: string;
  listening: string;
  thinking: string;
  searching: string;
  resultReady: string;
  askAnother: string;
  quickPrompts: { label: string; text: string }[];
  statusOk: string;
  statusExpiring: string;
  statusExpired: string;
  statusAll: string;
  batchHistory: string;
  batchNo: string;
  quantity: string;
  category: string;
  expiryDate: string;
  purchaseDate: string;
  confidence: string;
  saveToFirestore: string;
  discard: string;
  draftPo: string;
  approvePo: string;
  suppliersFound: string;
  typeQueryPlaceholder: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  EN: {
    appName: 'Jarvis Senpai 2026',
    scanTab: 'Scan',
    inventoryTab: 'Inventory',
    senpaiTab: 'Senpai',
    bankaiToday: 'Bankai — Today',
    bankaiSubtitle: 'Prioritised daily alerts & replenishment briefing',
    allClear: 'All clear — Shelf-life optimal',
    criticalAlerts: 'Action Required',
    attentionNeeded: 'items need attention',
    resolveNow: 'Resolve in Inventory',
    runAudit: 'Ask Senpai to Audit',
    inspectLabel: 'Scan Material',
    viewInventory: 'View All in Inventory',
    tapToSpeak: 'Tap microphone to speak (EN)',
    listening: 'Listening… Tap to send',
    thinking: 'Thinking…',
    searching: 'Searching…',
    resultReady: 'Result Ready',
    askAnother: 'Ask Another Question',
    quickPrompts: [
      { label: 'Check 30-day alerts', text: 'predict alerts for expiring materials in 30 days' },
      { label: 'Find coffee suppliers', text: 'find verified suppliers for organic coffee beans' },
      { label: 'Draft Amoxicillin PO', text: 'draft replenishment order for 25 boxes of Amoxicillin 500mg' },
      { label: 'Scan chemical tag', text: 'scan item Sodium Chloride reagent lot' },
    ],
    statusOk: 'OK',
    statusExpiring: 'Expiring Soon',
    statusExpired: 'Expired',
    statusAll: 'All Items',
    batchHistory: 'Batch History & Traceability',
    batchNo: 'Batch / LOT No',
    quantity: 'Quantity',
    category: 'Category',
    expiryDate: 'Expiry Date',
    purchaseDate: 'Purchase Date',
    confidence: 'AI Confidence',
    saveToFirestore: 'Save to Firestore',
    discard: 'Discard',
    draftPo: 'Draft PO with Top Supplier',
    approvePo: 'Approve & Transmit PO',
    suppliersFound: 'Verified Suppliers Found',
    typeQueryPlaceholder: 'Ask Senpai about materials, alerts, suppliers, POs...',
  },
  HI: {
    appName: 'जार्विस सेनपाई २०२६',
    scanTab: 'स्कैन',
    inventoryTab: 'इन्वेंटरी',
    senpaiTab: 'सेनपाई',
    bankaiToday: 'बान्काई — आज',
    bankaiSubtitle: 'दैनिक प्राथमिकता अलर्ट और पुनःपूर्ति ब्रीफिंग',
    allClear: 'सब सुरक्षित — इन्वेंटरी स्थिति इष्टतम है',
    criticalAlerts: 'कार्रवाई आवश्यक',
    attentionNeeded: 'वस्तुओं पर ध्यान आवश्यक',
    resolveNow: 'इन्वेंटरी में हल करें',
    runAudit: 'सेनपाई से ऑडिट करवाएं',
    inspectLabel: 'सामग्री स्कैन करें',
    viewInventory: 'इन्वेंटरी में सभी देखें',
    tapToSpeak: 'बोलने के लिए माइक दबाएं (हिंदी)',
    listening: 'सुन रहा हूँ… भेजने के लिए टैप करें',
    thinking: 'सोच रहा हूँ…',
    searching: 'खोज रहा हूँ…',
    resultReady: 'परिणाम तैयार',
    askAnother: 'दूसरा प्रश्न पूछें',
    quickPrompts: [
      { label: '30-दिन के अलर्ट जांचें', text: '30 दिनों में समाप्त होने वाली सामग्री के अलर्ट का पूर्वानुमान लगाएं' },
      { label: 'कॉफ़ी आपूर्तिकर्ता खोजें', text: 'ऑर्गेनिक कॉफ़ी बीन्स के लिए सत्यापित आपूर्तिकर्ता खोजें' },
      { label: 'एमोक्सिसिलिन का PO बनाएं', text: 'एमोक्सिसिलिन 500mg के 25 बॉक्स के लिए पुनःपूर्ति आदेश ड्राफ्ट करें' },
      { label: 'रासायनिक टैग स्कैन करें', text: 'सोडियम क्लोराइड अभिकर्मक लॉट को स्कैन करें' },
    ],
    statusOk: 'ठीक है',
    statusExpiring: 'जल्द समाप्त',
    statusExpired: 'अवधि समाप्त',
    statusAll: 'सभी सामग्री',
    batchHistory: 'बैच इतिहास और ट्रेसबिलिटी',
    batchNo: 'बैच / लॉट संख्या',
    quantity: 'मात्रा',
    category: 'श्रेणी',
    expiryDate: 'समाप्ति तिथि',
    purchaseDate: 'खरीद तिथि',
    confidence: 'एआई सटीकता',
    saveToFirestore: 'फायरस्टोर में सहेजें',
    discard: 'रद्द करें',
    draftPo: 'शीर्ष आपूर्तिकर्ता के साथ PO बनाएं',
    approvePo: 'PO स्वीकृत और प्रेषित करें',
    suppliersFound: 'सत्यापित आपूर्तिकर्ता मिले',
    typeQueryPlaceholder: 'सामग्री, अलर्ट, आपूर्तिकर्ता या PO के बारे में पूछें...',
  },
  KN: {
    appName: 'ಜಾರ್ವಿಸ್ ಸೆನ್‌ಪೈ ೨೦೨೬',
    scanTab: 'ಸ್ಕ್ಯಾನ್',
    inventoryTab: 'ದಾಸ್ತಾನು',
    senpaiTab: 'ಸೆನ್‌ಪೈ',
    bankaiToday: 'ಬಾಂಕೈ — ಇಂದಿನ ಮಾಹಿತಿ',
    bankaiSubtitle: 'ದೈನಂದಿನ ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಮರುಪೂರಣ ವರದಿ',
    allClear: 'ಎಲ್ಲವೂ ಸುರಕ್ಷಿತ — ದಾಸ್ತಾನು ಸುಸ್ಥಿತಿಯಲ್ಲಿದೆ',
    criticalAlerts: 'ತುರ್ತು ಗಮನ ಅಗತ್ಯ',
    attentionNeeded: 'ವಸ್ತುಗಳಿಗೆ ತುರ್ತು ಗಮನ ಬೇಕಾಗಿದೆ',
    resolveNow: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಪರಿಹರಿಸಿ',
    runAudit: 'ಸೆನ್‌ಪೈ ಮೂಲಕ ಲೆಕ್ಕಪರಿಶೋಧನೆ ನಡೆಸಿ',
    inspectLabel: 'ವಸ್ತು ಲೇಬಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    viewInventory: 'ದಾಸ್ತಾನಿನಲ್ಲಿ ಎಲ್ಲಾ ವಸ್ತುಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    tapToSpeak: 'ಮಾತನಾಡಲು ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿರಿ (ಕನ್ನಡ)',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ… ಕಳುಹಿಸಲು ಸ್ಪರ್ಶಿಸಿ',
    thinking: 'ಆಲೋಚಿಸುತ್ತಿದ್ದೇನೆ…',
    searching: 'ಹುಡುಕುತ್ತಿದ್ದೇನೆ…',
    resultReady: 'ಫಲಿತಾಂಶ ಸಿದ್ಧವಾಗಿದೆ',
    askAnother: 'ಇನ್ನೊಂದು ಪ್ರಶ್ನೆ ಕೇಳಿ',
    quickPrompts: [
      { label: '30 ದಿನಗಳ ಎಚ್ಚರಿಕೆ ಪರಿಶೀಲಿಸಿ', text: 'ಮುಂದಿನ 30 ದಿನಗಳಲ್ಲಿ ಅವಧಿ ಮುಗಿಯುವ ವಸ್ತುಗಳ ಎಚ್ಚರಿಕೆಯನ್ನು ತಿಳಿಸಿ' },
      { label: 'ಕಾಫಿ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ', text: 'ಸಾವಯವ ಕಾಫಿ ಬೀಜಗಳಿಗೆ ಪರಿಶೀಲಿಸಿದ ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ' },
      { label: 'ಅಮೋಕ್ಸಿಸಿಲಿನ್ PO ತಯಾರಿಸಿ', text: '25 ಬಾಕ್ಸ್ ಅಮೋಕ್ಸಿಸಿಲಿನ್ 500mg ಗಾಗಿ ಮರುಪೂರಣ ಖರೀದಿ ಆದೇಶ ತಯಾರಿಸಿ' },
      { label: 'ರಾಸಾಯನಿಕ ಲೇಬಲ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ', text: 'ಸೋಡಿಯಂ ಕ್ಲೋರೈಡ್ ರೀಜೆಂಟ್ ಬ್ಯಾಚ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ' },
    ],
    statusOk: 'ಉತ್ತಮವಾಗಿದೆ',
    statusExpiring: 'ಶೀಘ್ರ ಮುಕ್ತಾಯ',
    statusExpired: 'ಅವಧಿ ಮೀರಿದೆ',
    statusAll: 'ಎಲ್ಲಾ ವಸ್ತುಗಳು',
    batchHistory: 'ಬ್ಯಾಚ್ ಇತಿಹಾಸ ಮತ್ತು ಪತ್ತೆಹಚ್ಚುವಿಕೆ',
    batchNo: 'ಬ್ಯಾಚ್ / ಲಾಟ್ ಸಂಖ್ಯೆ',
    quantity: 'ಪ್ರಮಾಣ',
    category: 'ವರ್ಗ',
    expiryDate: 'ಮುಕ್ತಾಯ ದಿನಾಂಕ',
    purchaseDate: 'ಖರೀದಿ ದಿನಾಂಕ',
    confidence: 'AI ವಿಶ್ವಾಸಾರ್ಹತೆ',
    saveToFirestore: 'ಫೈರ್‌ಸ್ಟೋರ್‌ಗೆ ಉಳಿಸಿ',
    discard: 'ರದ್ದುಮಾಡಿ',
    draftPo: 'ಉನ್ನತ ಪೂರೈಕೆದಾರರಿಗೆ PO ತಯಾರಿಸಿ',
    approvePo: 'PO ಅನುಮೋದಿಸಿ ಮತ್ತು ರವಾನಿಸಿ',
    suppliersFound: 'ಪರಿಶೀಲಿಸಿದ ಪೂರೈಕೆದಾರರು ಲಭ್ಯವಿದೆ',
    typeQueryPlaceholder: 'ವಸ್ತುಗಳು, ಎಚ್ಚರಿಕೆಗಳು, ಪೂರೈಕೆದಾರರು ಅಥವಾ PO ಬಗ್ಗೆ ಸೆನ್‌ಪೈ ಬಳಿ ಕೇಳಿ...',
  },
};

export function getTranslations(lang: AppLanguage): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.EN;
}
