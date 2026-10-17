export type AppLanguage = 'EN' | 'HI' | 'KN';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'EN', label: 'English', nativeLabel: 'English', locale: 'en-US' },
  { code: 'HI', label: 'Hindi', nativeLabel: 'हिंदी', locale: 'hi-IN' },
  { code: 'KN', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', locale: 'kn-IN' },
];

let isSpeakingGlobal = false;

/**
 * Speaks text using the browser's SpeechSynthesis API in the selected language.
 */
export function speakText(
  text: string,
  lang: AppLanguage = 'EN',
  onEnd?: () => void,
  onError?: (err: any) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech

    // Clean markdown/symbols from speech text
    const cleanText = text
      .replace(/<[^>]*>/g, '')
      .replace(/[*_#`~[\]]/g, '')
      .replace(/http\S+/g, '')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const targetLocale = lang === 'HI' ? 'hi-IN' : lang === 'KN' ? 'kn-IN' : 'en-US';
    utterance.lang = targetLocale;
    utterance.rate = 1.0;
    utterance.pitch = 1.05; // Friendly AI pitch

    // Find best voice match
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLocale.toLowerCase() || v.lang.startsWith(targetLocale.split('-')[0])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      isSpeakingGlobal = true;
    };

    utterance.onend = () => {
      isSpeakingGlobal = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      isSpeakingGlobal = false;
      console.warn('SpeechSynthesis error:', e);
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Failed to execute speakText:', err);
    if (onError) onError(err);
    return false;
  }
}

/**
 * Stops any ongoing browser speech synthesis
 */
export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeakingGlobal = false;
  }
}

export function isCurrentlySpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Generates the multi-lingual summary for the Bankai — Today card
 */
export function generateBankaiSummary(
  alertsCount: number,
  expiredCount: number,
  expiringCount: number,
  lang: AppLanguage = 'EN'
): { greeting: string; spokenText: string } {
  const hour = new Date().getHours();
  let timeGreetingEn = 'Good morning';
  let timeGreetingHi = 'शुभ प्रभात';
  let timeGreetingKn = 'ಶುಭೋದಯ';

  if (hour >= 12 && hour < 17) {
    timeGreetingEn = 'Good afternoon';
    timeGreetingHi = 'शुभ दोपहर';
    timeGreetingKn = 'ಶುಭ ಮಧ್ಯಾಹ್ನ';
  } else if (hour >= 17) {
    timeGreetingEn = 'Good evening';
    timeGreetingHi = 'शुभ संध्या';
    timeGreetingKn = 'ಶುಭ ಸಂಜೆ';
  }

  if (alertsCount === 0) {
    if (lang === 'HI') {
      return {
        greeting: `${timeGreetingHi} — सब कुछ ठीक है`,
        spokenText: `${timeGreetingHi} — सभी सामग्री सुरक्षित हैं और आज कोई तत्काल अलर्ट नहीं है।`,
      };
    }
    if (lang === 'KN') {
      return {
        greeting: `${timeGreetingKn} — ಎಲ್ಲವೂ ಸುರಕ್ಷಿತವಾಗಿದೆ`,
        spokenText: `${timeGreetingKn} — ಎಲ್ಲಾ ಸರಕುಗಳು ಉತ್ತಮ ಸ್ಥಿತಿಯಲ್ಲಿವೆ ಮತ್ತು ಇಂದು ಯಾವುದೇ ತುರ್ತು ಎಚ್ಚರಿಕೆಗಳಿಲ್ಲ.`,
      };
    }
    return {
      greeting: `${timeGreetingEn} — All clear`,
      spokenText: `${timeGreetingEn} — All materials are within safe shelf life and inventory is optimal today.`,
    };
  }

  // With open alerts
  if (lang === 'HI') {
    const details = [];
    if (expiredCount > 0) details.push(`${expiredCount} सामग्री समाप्त हो चुकी है`);
    if (expiringCount > 0) details.push(`${expiringCount} जल्द समाप्त होने वाली है`);
    const spokenText = `${timeGreetingHi} — ${alertsCount} वस्तुओं पर ध्यान देने की आवश्यकता है: ${details.join(' और ')}।`;
    return {
      greeting: `${timeGreetingHi} — ${alertsCount} वस्तुओं पर ध्यान आवश्यक`,
      spokenText,
    };
  }

  if (lang === 'KN') {
    const details = [];
    if (expiredCount > 0) details.push(`${expiredCount} ವಸ್ತುಗಳ ಅವಧಿ ಮೀರಿದೆ`);
    if (expiringCount > 0) details.push(`${expiringCount} ಶೀಘ್ರದಲ್ಲೇ ಅವಧಿ ಮುಗಿಯಲಿದೆ`);
    const spokenText = `${timeGreetingKn} — ${alertsCount} ವಸ್ತುಗಳಿಗೆ ಗಮನ ಬೇಕಾಗಿದೆ: ${details.join(' ಮತ್ತು ')}.`;
    return {
      greeting: `${timeGreetingKn} — ${alertsCount} ವಸ್ತುಗಳಿಗೆ ಗಮನ ಅಗತ್ಯ`,
      spokenText,
    };
  }

  // Default English
  const details = [];
  if (expiredCount > 0) details.push(`${expiredCount} expired`);
  if (expiringCount > 0) details.push(`${expiringCount} expiring soon`);
  const spokenText = `${timeGreetingEn} — ${alertsCount} items need attention: ${details.join(', ')}.`;

  return {
    greeting: `${timeGreetingEn} — ${alertsCount} items need attention`,
    spokenText,
  };
}
