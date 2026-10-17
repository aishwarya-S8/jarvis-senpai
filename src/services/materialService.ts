import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ExtractionResult } from './gemini';

export interface MaterialItem {
  id?: string;
  name: string;
  category: string;
  batchNo: string;
  purchaseDate: string;
  shelfLifeDays: number;
  expiryDate: string;
  quantity: number;
  unit: string;
  confidence: number;
  status: 'ok' | 'expiring' | 'expired';
  createdAt: string;
}

/**
 * Calculates expiryDate = purchaseDate + shelfLifeDays
 * Returns ISO date string YYYY-MM-DD
 */
export function calculateExpiryDate(purchaseDateStr: string, shelfLifeDays: number = 90): string {
  try {
    const parts = purchaseDateStr.split('-');
    let date: Date;
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      date = new Date(purchaseDateStr);
    }

    if (isNaN(date.getTime())) {
      date = new Date();
    }

    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().split('T')[0];
  } catch (err) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + shelfLifeDays);
    return fallback.toISOString().split('T')[0];
  }
}

/**
 * Computes dynamic status:
 * - Red 'expired': expiry date is in the past
 * - Amber 'expiring': expiry date is within 7 days
 * - Green 'ok': expiry date is > 7 days away
 */
export function computeMaterialStatus(expiryDateStr: string): 'ok' | 'expiring' | 'expired' {
  if (!expiryDateStr) return 'ok';
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const parts = expiryDateStr.split('-');
    let expiry: Date;
    if (parts.length === 3) {
      expiry = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      expiry = new Date(expiryDateStr);
    }

    if (isNaN(expiry.getTime())) return 'ok';
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 7) {
      return 'expiring';
    } else {
      return 'ok';
    }
  } catch {
    return 'ok';
  }
}

/**
 * Writes an extracted material result to Firestore collection "materials"
 * with expiryDate = purchaseDate + shelfLifeDays and status "ok".
 */
export async function saveMaterialToFirestore(
  extracted: ExtractionResult,
  shelfLifeDays: number = 90
): Promise<string> {
  const expiryDate = calculateExpiryDate(extracted.purchaseDate, shelfLifeDays);

  const newMaterial: Omit<MaterialItem, 'id'> = {
    name: extracted.name || 'Unnamed Material',
    category: extracted.category || 'General',
    batchNo: extracted.batchNo || 'N/A',
    purchaseDate: extracted.purchaseDate || new Date().toISOString().split('T')[0],
    shelfLifeDays,
    expiryDate,
    quantity: extracted.quantity || 1,
    unit: extracted.unit || 'pcs',
    confidence: extracted.confidence ?? 0.95,
    status: 'ok', // explicitly written as "ok" per prompt requirements
    createdAt: new Date().toISOString(),
  };

  const path = 'materials';
  try {
    const docRef = await addDoc(collection(db, path), newMaterial);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

/**
 * Subscribes to the real-time materials list from Firestore
 */
export function subscribeMaterials(
  onUpdate: (items: MaterialItem[]) => void,
  onError?: (err: any) => void
): () => void {
  const path = 'materials';
  const q = query(collection(db, path));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MaterialItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<MaterialItem, 'id'>;
        return {
          id: docSnap.id,
          ...data,
        };
      });

      // Sort by createdAt desc
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Delete a material document
 */
export async function deleteMaterial(id: string): Promise<void> {
  const path = `materials/${id}`;
  try {
    await deleteDoc(doc(db, 'materials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
