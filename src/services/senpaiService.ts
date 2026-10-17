export interface SenpaiFunctionCall {
  name: 'scanItem' | 'predictAlerts' | 'findSuppliers' | 'draftOrder' | string;
  args: Record<string, any>;
}

export interface SenpaiVoiceResponse {
  userTranscript: string;
  senpaiAnswer: string;
  functionCalls?: SenpaiFunctionCall[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'senpai';
  text: string;
  timestamp: string;
  isAudio?: boolean;
  audioBlobUrl?: string;
  functionCalls?: SenpaiFunctionCall[];
}

/**
 * Strips data URI prefix (e.g., 'data:audio/webm;codecs=opus;base64,' or 'data:audio/ogg;base64,')
 * returning strictly the raw base64 encoded string.
 */
export function stripDataUri(input: string): string {
  if (!input) return '';
  const commaIdx = input.indexOf(',');
  if (commaIdx !== -1 && input.slice(0, commaIdx).startsWith('data:')) {
    return input.slice(commaIdx + 1).trim();
  }
  return input.trim();
}

/**
 * Normalizes audio MIME type to a Gemini-supported audio format
 * Note: Parameters like ';codecs=opus' are stripped because Gemini rejects them.
 */
export function sanitizeGeminiMimeType(mimeType: string): string {
  if (!mimeType) return 'audio/ogg';
  const base = mimeType.split(';')[0].trim().toLowerCase();
  if (base === 'audio/ogg' || base === 'audio/opus') return 'audio/ogg';
  if (base === 'audio/webm') return 'audio/webm';
  if (base === 'audio/wav' || base === 'audio/x-wav') return 'audio/wav';
  if (base === 'audio/mp3' || base === 'audio/mpeg') return 'audio/mp3';
  if (base === 'audio/aac' || base === 'audio/mp4' || base === 'audio/m4a') return 'audio/aac';
  if (base === 'audio/flac') return 'audio/flac';
  return 'audio/ogg';
}

/**
 * Converts a Blob to raw base64 string (without data URI prefix)
 */
export function blobToRawBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(stripDataUri(dataUrl));
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Legacy compatibility: converts Blob to full Data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Sends audio base64 or text prompt to the Senpai voice & Gemini generateContent endpoint.
 * Ensures data-URI prefix is stripped and mimeType is Gemini-compatible.
 */
export async function sendVoiceToSenpai(
  audioBase64?: string,
  mimeType: string = 'audio/ogg',
  textPrompt?: string
): Promise<SenpaiVoiceResponse> {
  try {
    const rawBase64 = audioBase64 ? stripDataUri(audioBase64) : undefined;
    const cleanMime = sanitizeGeminiMimeType(mimeType);

    const res = await fetch('/api/senpai/voice-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64: rawBase64,
        mimeType: cleanMime,
        textPrompt,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || `Server returned ${res.status}`);
    }

    const data: SenpaiVoiceResponse = await res.json();
    return data;
  } catch (error) {
    console.error('sendVoiceToSenpai failed:', error);
    throw error;
  }
}
