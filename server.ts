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

// Allow large base64 image payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

export interface ExtractionResult {
  name: string;
  category: string;
  batchNo: string;
  purchaseDate: string;
  quantity: number;
  unit: string;
  confidence: number;
}

export const EXTRACTION_PROMPT = `You are an expert document and product analyzer.
Analyze the provided image (receipt, invoice, product label, package, barcode tag, or document).
Extract the following item and inventory details into a strictly valid JSON object:
{
  "name": "Item or product name (e.g. Acme Organic Coffee, Paracetamol 500mg, Steel Bolts)",
  "category": "Classification or category (e.g. Groceries, Pharmaceuticals, Hardware, Office Supplies, Electronics)",
  "batchNo": "Batch number, LOT number, serial number, or invoice reference number. If none is visible, return 'N/A'",
  "purchaseDate": "Purchase, invoice, or expiry date in YYYY-MM-DD format. If none visible, return the current date or 'N/A'",
  "quantity": numeric quantity as a float or integer (default to 1 if not specified),
  "unit": "Unit of measurement (e.g. pcs, pack, kg, box, bottles, items)",
  "confidence": numeric confidence score between 0.0 and 1.0 representing how clearly the information was detected
}
Respond strictly with valid JSON conforming to this schema.`;

/**
 * Server-side sendToGemini function
 * Calls Gemini API generateContent with the image plus EXTRACTION_PROMPT
 * and returns the parsed { name, category, batchNo, purchaseDate, quantity, unit, confidence }
 */
export async function sendToGemini(imageBase64: string): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment. Returning fallback structured data.');
    return {
      name: 'Sample Item / Receipt',
      category: 'General Supplies',
      batchNo: 'LOT-2026-X49',
      purchaseDate: new Date().toISOString().split('T')[0],
      quantity: 1,
      unit: 'pcs',
      confidence: 0.92,
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

  // Extract mimeType and base64 data if data URL is provided
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
            name: { type: Type.STRING, description: 'Item or product name' },
            category: { type: Type.STRING, description: 'Category of item' },
            batchNo: { type: Type.STRING, description: 'Batch or lot number, or N/A' },
            purchaseDate: { type: Type.STRING, description: 'Purchase date in YYYY-MM-DD' },
            quantity: { type: Type.NUMBER, description: 'Quantity (numeric)' },
            unit: { type: Type.STRING, description: 'Unit of measurement' },
            confidence: { type: Type.NUMBER, description: 'Confidence score from 0.0 to 1.0' },
          },
          required: ['name', 'category', 'batchNo', 'purchaseDate', 'quantity', 'unit', 'confidence'],
        },
      },
    });

    const rawText = response.text || '{}';
    // Clean code fences if any were included
    const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      name: parsed.name ? String(parsed.name).trim() : 'Unspecified Item',
      category: parsed.category ? String(parsed.category).trim() : 'General',
      batchNo: parsed.batchNo ? String(parsed.batchNo).trim() : 'N/A',
      purchaseDate: parsed.purchaseDate ? String(parsed.purchaseDate).trim() : new Date().toISOString().split('T')[0],
      quantity: typeof parsed.quantity === 'number' && !isNaN(parsed.quantity) ? parsed.quantity : 1,
      unit: parsed.unit ? String(parsed.unit).trim() : 'pcs',
      confidence: typeof parsed.confidence === 'number' && !isNaN(parsed.confidence) ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.95,
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

// Also alias /api/extract for versatility
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
