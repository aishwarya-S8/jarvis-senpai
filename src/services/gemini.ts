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
 * Calls the Gemini API generateContent endpoint with the image plus EXTRACTION prompt,
 * handles JSON parsing and returns the typed object { name, category, batchNo, purchaseDate, quantity, unit, confidence }.
 */
export async function sendToGemini(imageBase64: string): Promise<ExtractionResult> {
  if (!imageBase64) {
    throw new Error('Image base64 data is required for extraction');
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('/api/gemini/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeoutId);
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || `Server responded with status ${res.status}`);
    }

    const parsed = await res.json();

    return {
      name: parsed.name ? String(parsed.name).trim() : 'Detected Item',
      category: parsed.category ? String(parsed.category).trim() : 'General',
      batchNo: parsed.batchNo ? String(parsed.batchNo).trim() : 'N/A',
      purchaseDate: parsed.purchaseDate ? String(parsed.purchaseDate).trim() : new Date().toISOString().split('T')[0],
      quantity: typeof parsed.quantity === 'number' && !isNaN(parsed.quantity) ? parsed.quantity : 1,
      unit: parsed.unit ? String(parsed.unit).trim() : 'pcs',
      confidence: typeof parsed.confidence === 'number' && !isNaN(parsed.confidence) ? Math.min(Math.max(parsed.confidence, 0), 1) : 0.95,
    };
  } catch (error) {
    console.error('sendToGemini failed:', error);
    throw error;
  }
}
