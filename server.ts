import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Allow large base64 image and audio payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

export interface ExtractionResult {
  name: string | null;
  category: string | null;
  batchNo: string | null;
  purchaseDate: string | null;
  quantity: number | null;
  unit: string | null;
  confidence: number;
}

export const EXTRACTION_PROMPT = `You extract data from a photo of a material/product label. Return ONLY valid JSON:
{ "name","category","batchNo","purchaseDate","quantity","unit","confidence" }.
Rules:
- If the image is NOT a product/material label (e.g. a screenshot, a person, random text),
  set every field to null and confidence to 0, and set name to "No label detected".
- "name" = the real product name printed on the label. NEVER use a filename, a long number,
  or a guess. If not clearly visible, null.
- Return a value ONLY if you can actually read it. Never invent batchNo, dates, or quantity.
- "confidence" (0-1) must reflect what you truly read — near 0 when fields are null.`;

export const SENPAI_SYSTEM_PROMPT = `You are Senpai, an ultra-smart, proactive, and charismatic inventory AI assistant in Jarvis Senpai 2026.
You are equipped with voice processing and four operational tools:
1. scanItem(itemName, category): Initiates scanner or checks material in inventory.
2. predictAlerts(filterDays, urgency): Analyzes stock, predicts expiring materials, and identifies shortage risks.
3. findSuppliers(materialName, quantityNeeded, region): Finds verified suppliers, quotes, unit costs, and delivery ETAs.
4. draftOrder(supplierName, items, urgency): Creates a procurement purchase order draft to replenish needed items.

Language Support & Script Rules:
- You natively understand and speak English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ).
- When the user query or language is in Kannada (ಕನ್ನಡ), reply in polite, fluent Kannada script so browser SpeechSynthesis (kn-IN) reads it naturally.
- When the user query is in Hindi, reply in fluent Hindi Devanagari script for (hi-IN) TTS.
- Otherwise provide a sharp, supportive, and natural answer in English.
- Always invoke the corresponding tool function (scanItem, predictAlerts, findSuppliers, draftOrder) if appropriate to fulfill their intent.`;

export const senpaiFunctionDeclarations: any[] = [
  {
    name: 'scanItem',
    description: 'Prepare the camera scanner or look up details for a material or label.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        itemName: {
          type: Type.STRING,
          description: 'Name or keyword of the material to scan or inspect.',
        },
        category: {
          type: Type.STRING,
          description: 'Optional category of the material.',
        },
      },
      required: ['itemName'],
    },
  },
  {
    name: 'predictAlerts',
    description: 'Analyze inventory stock, identify materials expiring within a timeframe, and forecast stockout risks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filterDays: {
          type: Type.NUMBER,
          description: 'Number of days ahead to check for expiring materials (e.g. 7, 14, 30, 90). Default is 30.',
        },
        urgency: {
          type: Type.STRING,
          description: "Urgency level ('critical', 'warning', 'all').",
        },
      },
    },
  },
  {
    name: 'findSuppliers',
    description: 'Search and recommend verified material suppliers, vendors, estimated delivery times, and price quotes.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        materialName: {
          type: Type.STRING,
          description: 'The material name to find suppliers for.',
        },
        quantityNeeded: {
          type: Type.NUMBER,
          description: 'Estimated quantity needed to order.',
        },
        region: {
          type: Type.STRING,
          description: 'Preferred sourcing region or vendor location.',
        },
      },
      required: ['materialName'],
    },
  },
  {
    name: 'draftOrder',
    description: 'Draft a formal procurement purchase order or replenishment requisition for needed materials.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        supplierName: {
          type: Type.STRING,
          description: 'Name of the vendor/supplier.',
        },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              unit: { type: Type.STRING },
            },
            required: ['name', 'quantity'],
          },
          description: 'List of items to order.',
        },
        urgency: {
          type: Type.STRING,
          description: 'Order priority level (Standard, Expedited, Overnight).',
        },
      },
      required: ['supplierName', 'items'],
    },
  },
];

/**
 * Server-side sendToGemini function
 * Calls Gemini API generateContent with the image plus EXTRACTION_PROMPT
 * and returns the parsed { name, category, batchNo, purchaseDate, quantity, unit, confidence }
 */
export async function sendToGemini(imageBase64: string): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment. Returning fallback result.');
    return {
      name: 'No label detected',
      category: null,
      batchNo: null,
      purchaseDate: null,
      quantity: null,
      unit: null,
      confidence: 0,
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let mimeType = 'image/jpeg';
  let cleanBase64 = imageBase64;
  const dataUrlMatch = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    cleanBase64 = dataUrlMatch[2];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              nullable: true,
              description: 'The real product name printed on the label. If not clearly visible, null. If not a label, "No label detected".',
            },
            category: {
              type: Type.STRING,
              nullable: true,
              description: 'Category of the product/material. Null if not a label or not visible.',
            },
            batchNo: {
              type: Type.STRING,
              nullable: true,
              description: 'Batch number or LOT number actually readable on label. Null if not clearly visible or not a label.',
            },
            purchaseDate: {
              type: Type.STRING,
              nullable: true,
              description: 'Date in YYYY-MM-DD. Return ONLY if actually readable on the label, otherwise null.',
            },
            quantity: {
              type: Type.NUMBER,
              nullable: true,
              description: 'Numeric quantity actually readable on the label, otherwise null.',
            },
            unit: {
              type: Type.STRING,
              nullable: true,
              description: 'Unit of measurement actually readable on label, otherwise null.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Confidence score (0 to 1) reflecting what was truly read. 0 if not a label, near 0 when fields are null.',
            },
          },
          required: ['name', 'category', 'batchNo', 'purchaseDate', 'quantity', 'unit', 'confidence'],
        },
      },
    });

    const rawText = response.text || '{}';
    const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    if (parsed.name === 'No label detected' || parsed.confidence === 0) {
      return {
        name: 'No label detected',
        category: null,
        batchNo: null,
        purchaseDate: null,
        quantity: null,
        unit: null,
        confidence: 0,
      };
    }

    const name = parsed.name && typeof parsed.name === 'string' && parsed.name.trim() !== '' ? parsed.name.trim() : null;
    const category = parsed.category && typeof parsed.category === 'string' && parsed.category.trim() !== '' ? parsed.category.trim() : null;
    const batchNo = parsed.batchNo && typeof parsed.batchNo === 'string' && parsed.batchNo.trim() !== '' && parsed.batchNo.toLowerCase() !== 'n/a' && parsed.batchNo.toLowerCase() !== 'null' ? parsed.batchNo.trim() : null;
    const purchaseDate = parsed.purchaseDate && typeof parsed.purchaseDate === 'string' && parsed.purchaseDate.trim() !== '' && parsed.purchaseDate.toLowerCase() !== 'n/a' && parsed.purchaseDate.toLowerCase() !== 'null' ? parsed.purchaseDate.trim() : null;
    const quantity = typeof parsed.quantity === 'number' && !isNaN(parsed.quantity) ? parsed.quantity : null;
    const unit = parsed.unit && typeof parsed.unit === 'string' && parsed.unit.trim() !== '' && parsed.unit.toLowerCase() !== 'n/a' ? parsed.unit.trim() : null;
    
    let confidence = typeof parsed.confidence === 'number' && !isNaN(parsed.confidence) ? Math.min(Math.max(parsed.confidence, 0), 1) : 0;
    
    if (!name && !batchNo && !purchaseDate && quantity === null) {
      confidence = 0;
    }

    return {
      name: name || (confidence === 0 ? 'No label detected' : null),
      category,
      batchNo,
      purchaseDate,
      quantity,
      unit,
      confidence,
    };
  } catch (err) {
    console.error('Error in sendToGemini:', err);
    throw err;
  }
}

// API endpoint for client requests
app.post('/api/gemini/extract', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required in request body' });
    }

    const result = await sendToGemini(imageBase64);
    return res.json(result);
  } catch (error: any) {
    console.error('API /api/gemini/extract error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract data using Gemini API',
    });
  }
});

// Also alias /api/extract
app.post('/api/extract', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required in request body' });
    }

    const result = await sendToGemini(imageBase64);
    return res.json(result);
  } catch (error: any) {
    console.error('API /api/extract error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to extract data using Gemini API',
    });
  }
});

/**
 * SENPAI VOICE & CHAT ENDPOINT
 * Receives audioBase64 from MediaRecorder, calls Gemini with SENPAI system prompt and 4 tools
 */
app.post('/api/senpai/voice-chat', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', textPrompt } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const query = (textPrompt || 'voice query').toLowerCase();
      const isKannada = /[\u0C80-\u0CFF]/.test(textPrompt || '') || query.includes('kannada');
      const isHindi = /[\u0900-\u097F]/.test(textPrompt || '') || query.includes('hindi');

      let senpaiAnswer = isKannada
        ? "ನಮಸ್ಕಾರ! ನಾನು ಸೆನ್‌ಪೈ. ದಾಸ್ತಾನು ತಪಾಸಣೆ, ಅವಧಿ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಪೂರೈಕೆದಾರರ ಹುಡುಕಾಟಕ್ಕೆ ನಾನು ಸಿದ್ಧನಿದ್ದೇನೆ."
        : isHindi
        ? "नमस्ते! मैं सेनपाई हूँ। इन्वेंटरी जांच, समाप्ति अलर्ट और आपूर्तिकर्ता खोजने के लिए मैं तैयार हूँ।"
        : "Konnichiwa! Senpai is online. I'm ready to inspect materials, predict expiration alerts, find reliable suppliers, or draft purchase orders.";
      const functionCalls: any[] = [];

      if (query.includes('scan') || query.includes('camera') || query.includes('label') || query.includes('ಸ್ಕ್ಯಾನ್') || query.includes('ತಪಾಸಣೆ')) {
        functionCalls.push({
          name: 'scanItem',
          args: { itemName: 'Organic Fairtrade Coffee', category: 'Groceries' },
        });
        senpaiAnswer = isKannada
          ? "ಸ್ಕ್ಯಾನರ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಕ್ಯಾಮೆರಾವನ್ನು ಲೇಬಲ್‌ನತ್ತ ತೋರಿಸಿ!"
          : isHindi
          ? "स्कैनर तैयार है। अपने कैमरे को सामग्री लेबल की ओर रखें!"
          : "I've triggered the scanner for you. Point your camera at the material label or batch tag!";
      } else if (query.includes('alert') || query.includes('expire') || query.includes('warning') || query.includes('check') || query.includes('ಎಚ್ಚರಿಕೆ') || query.includes('ಅವಧಿ')) {
        functionCalls.push({
          name: 'predictAlerts',
          args: { filterDays: 30, urgency: 'warning' },
        });
        senpaiAnswer = isKannada
          ? "ನಿಮ್ಮ ದಾಸ್ತಾನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ. ಮುಂಬರುವ 30 ದಿನಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳುವ ವಸ್ತುಗಳ ಪಟ್ಟಿ ಇಲ್ಲಿದೆ!"
          : isHindi
          ? "मैंने आपकी इन्वेंटरी का विश्लेषण किया है। 30 दिनों में समाप्त होने वाली सामग्री यहाँ है!"
          : "I analyzed your inventory stock. Here are the materials approaching expiration within 30 days!";
      } else if (query.includes('supplier') || query.includes('vendor') || query.includes('quote') || query.includes('source') || query.includes('ಪೂರೈಕೆದಾರ') || query.includes('ಬೆಲೆ')) {
        functionCalls.push({
          name: 'findSuppliers',
          args: { materialName: 'Organic Fairtrade Coffee Beans', quantityNeeded: 50, region: 'Asia-Pacific' },
        });
        senpaiAnswer = isKannada
          ? "ಪರಿಶೀಲಿಸಿದ 3 ವಿಶ್ವಾಸಾರ್ಹ ಪೂರೈಕೆದಾರರ ವಿವರಗಳು ಮತ್ತು ಬೆಲೆ ಪಟ್ಟಿ ಲಭ್ಯವಿದೆ."
          : isHindi
          ? "सत्यापित डिलीवरी समय और प्रतिस्पर्धी मूल्य वाले 3 आपूर्तिकर्ता मिले।"
          : "Found 3 verified suppliers with verified lead times and competitive volume pricing.";
      } else if (query.includes('order') || query.includes('purchase') || query.includes('draft') || query.includes('buy') || query.includes('ಆದೇಶ') || query.includes('ಖರೀದಿ')) {
        functionCalls.push({
          name: 'draftOrder',
          args: {
            supplierName: 'Global Bio-Pharma Logistics',
            items: [{ name: 'Amoxicillin 500mg Capsules', quantity: 25, unit: 'boxes' }],
            urgency: 'Expedited',
          },
        });
        senpaiAnswer = isKannada
          ? "ಮರುಪೂರಣ ಖರೀದಿ ಆದೇಶವನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ!"
          : isHindi
          ? "मैंने आपकी समीक्षा के लिए पुनःपूर्ति खरीद आदेश तैयार किया है।"
          : "I've drafted a replenishment purchase order for your review. Check the details below!";
      }

      return res.json({
        userTranscript: textPrompt || 'Voice query received (Demo Mode)',
        senpaiAnswer,
        functionCalls,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const parts: any[] = [];

    if (audioBase64) {
      // 1. Strip data-URI prefix completely to leave only raw base64
      let cleanBase64 = audioBase64;
      const commaIdx = cleanBase64.indexOf(',');
      if (commaIdx !== -1 && cleanBase64.slice(0, commaIdx).startsWith('data:')) {
        cleanBase64 = cleanBase64.slice(commaIdx + 1);
      }
      cleanBase64 = cleanBase64.trim();

      // 2. Sanitize MIME type to official Gemini supported types (no parameters like ;codecs=opus)
      let cleanMime = 'audio/ogg';
      const rawMime = (mimeType || '').split(';')[0].trim().toLowerCase();
      if (rawMime === 'audio/ogg' || rawMime === 'audio/opus') {
        cleanMime = 'audio/ogg';
      } else if (rawMime === 'audio/webm') {
        cleanMime = 'audio/webm';
      } else if (rawMime === 'audio/wav' || rawMime === 'audio/x-wav') {
        cleanMime = 'audio/wav';
      } else if (rawMime === 'audio/mp3' || rawMime === 'audio/mpeg') {
        cleanMime = 'audio/mp3';
      } else if (rawMime === 'audio/aac' || rawMime === 'audio/mp4' || rawMime === 'audio/m4a') {
        cleanMime = 'audio/aac';
      } else if (rawMime === 'audio/flac') {
        cleanMime = 'audio/flac';
      }

      parts.push({
        inlineData: {
          mimeType: cleanMime,
          data: cleanBase64,
        },
      });

      parts.push({
        text: 'Listen to the user audio. First, output <user_transcript>The exact words spoken by the user</user_transcript>. Second, answer as Senpai, and invoke the appropriate tool (scanItem, predictAlerts, findSuppliers, draftOrder) if appropriate to fulfill their intent.',
      });
    } else if (textPrompt) {
      parts.push({
        text: textPrompt,
      });
    } else {
      return res.status(400).json({ error: 'Either audioBase64 or textPrompt is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction: SENPAI_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: senpaiFunctionDeclarations }],
      },
    });

    const rawText = response.text || '';
    const transcriptMatch = rawText.match(/<user_transcript>([\s\S]*?)<\/user_transcript>/i);
    const userTranscript = transcriptMatch
      ? transcriptMatch[1].trim()
      : textPrompt || 'Audio message received';
    let senpaiAnswer = rawText.replace(/<user_transcript>[\s\S]*?<\/user_transcript>/gi, '').trim();

    const functionCalls = response.functionCalls || [];

    // Provide friendly response if function call was made without inline text
    if (!senpaiAnswer && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'scanItem') {
        senpaiAnswer = `Opening scanner to inspect ${(call.args as any)?.itemName || 'item'}. Hold steady!`;
      } else if (call.name === 'predictAlerts') {
        senpaiAnswer = `Analyzing inventory health for items expiring within ${(call.args as any)?.filterDays || 30} days.`;
      } else if (call.name === 'findSuppliers') {
        senpaiAnswer = `Looking up verified suppliers for ${(call.args as any)?.materialName || 'requested material'}.`;
      } else if (call.name === 'draftOrder') {
        senpaiAnswer = `Drafting purchase order for ${(call.args as any)?.supplierName || 'vendor'}.`;
      }
    }

    return res.json({
      userTranscript,
      senpaiAnswer: senpaiAnswer || "Senpai here! How can I assist your inventory today?",
      functionCalls,
    });
  } catch (error: any) {
    console.error('API /api/senpai/voice-chat error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to process voice request',
    });
  }
});

// Mount Vite or static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
