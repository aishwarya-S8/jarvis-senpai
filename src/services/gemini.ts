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

/**
 * Calls the Gemini API generateContent endpoint with the image plus EXTRACTION prompt,
 * handles JSON parsing and returns the typed object { name, category, batchNo, purchaseDate, quantity, unit, confidence }.
 */
export async function sendToGemini(imageBase64: string): Promise<ExtractionResult> {
  if (!imageBase64) {
    throw new Error('Image base64 data is required for extraction');
  }

  try {
    const res = await fetch('/api/gemini/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error || `Server responded with status ${res.status}`);
    }

    const parsed = await res.json();

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
  } catch (error) {
    console.error('sendToGemini failed:', error);
    throw error;
  }
}
