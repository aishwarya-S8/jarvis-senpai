/**
 * Supplier Service
 * Provides Google Search-grounded real supplier lookup via /api/suppliers.
 * Preserves a hardcoded sample list ONLY as an offline fallback, labeled "sample".
 */

export interface Supplier {
  id: string;
  name: string;
  link?: string | null;
  price?: string | number | null;
  contactEmail: string;
  leadDays: number;
  categories: string[];
  isSynthetic: boolean;
  notes: string;
}

export const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-alpha',
    name: 'Apex Industrial & Chemical Co. (Sample)',
    link: null,
    price: null,
    contactEmail: 'orders@apex-industrial.example',
    leadDays: 5,
    categories: ['Raw Materials', 'Laboratory Reagent', 'Chemicals'],
    isSynthetic: true,
    notes: 'Sample fallback supplier (offline)',
  },
  {
    id: 'sup-pharma',
    name: 'MedVance Pharma Distributors (Sample)',
    link: null,
    price: null,
    contactEmail: 'supply@medvance.example',
    leadDays: 3,
    categories: ['Pharmaceuticals', 'Medical Supplies', 'Health'],
    isSynthetic: true,
    notes: 'Sample fallback supplier (offline)',
  },
  {
    id: 'sup-global',
    name: 'Global Packaging & Food Essentials (Sample)',
    link: null,
    price: null,
    contactEmail: 'sales@globalpack.example',
    leadDays: 7,
    categories: ['Groceries', 'General Supplies', 'Packaging'],
    isSynthetic: true,
    notes: 'Sample fallback supplier (offline)',
  },
  {
    id: 'sup-tech',
    name: 'OmniTech Industrial Components (Sample)',
    link: null,
    price: null,
    contactEmail: 'dispatch@omnitech.example',
    leadDays: 10,
    categories: ['Hardware', 'Electronics', 'Machinery'],
    isSynthetic: true,
    notes: 'Sample fallback supplier (offline)',
  },
];

// Alias for existing callers if any
export const SYNTHETIC_SUPPLIERS: Supplier[] = SAMPLE_SUPPLIERS;

let cachedSuppliers: Supplier[] = [...SAMPLE_SUPPLIERS];

/**
 * Returns the offline sample suppliers list.
 */
export function getSampleSuppliers(): Supplier[] {
  return SAMPLE_SUPPLIERS;
}

/**
 * Asynchronously searches real suppliers by calling POST /api/suppliers (Google Search grounded).
 * Falls back to SAMPLE_SUPPLIERS only if offline or an error occurs.
 */
export async function getSuppliers(params?: {
  materialName?: string;
  category?: string;
  quantity?: number;
}): Promise<Supplier[]> {
  try {
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        materialName: params?.materialName || 'General Materials',
        category: params?.category || 'General',
        quantity: params?.quantity,
      }),
    });

    if (!res.ok) {
      console.warn(`[supplierService] /api/suppliers returned HTTP ${res.status}, using offline sample fallback.`);
      return SAMPLE_SUPPLIERS;
    }

    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : (data.suppliers || []);
    const sourceLinks: string[] = Array.isArray(data?.sourceLinks) ? data.sourceLinks : [];

    if (!list || list.length === 0) {
      return SAMPLE_SUPPLIERS;
    }

    const realSuppliers: Supplier[] = list.map((item: any, idx: number) => {
      const link = item.link || (sourceLinks[idx] || sourceLinks[0] || null);
      return {
        id: `real-sup-${idx + 1}`,
        name: item.name || `Supplier ${idx + 1}`,
        link: link || null,
        price: item.price !== undefined && item.price !== 'null' && item.price !== null ? item.price : null,
        contactEmail: '',
        leadDays: typeof item.leadDays === 'number' ? item.leadDays : 5,
        categories: params?.category ? [params.category] : ['General'],
        isSynthetic: false,
        notes: item.note || '',
      };
    });

    cachedSuppliers = realSuppliers;
    return realSuppliers;
  } catch (error) {
    console.warn('[supplierService] Error calling /api/suppliers, using offline sample fallback:', error);
    return SAMPLE_SUPPLIERS;
  }
}

export function getSupplierById(id?: string, list: Supplier[] = cachedSuppliers): Supplier | undefined {
  if (!id) return undefined;
  return list.find((s) => s.id === id) || SAMPLE_SUPPLIERS.find((s) => s.id === id);
}

export function getSuggestedSupplierForCategory(category?: string, list: Supplier[] = cachedSuppliers): Supplier {
  const candidateList = list && list.length > 0 ? list : SAMPLE_SUPPLIERS;
  if (!category) return candidateList[0];
  const matched = candidateList.find((s) =>
    s.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
  );
  return matched || candidateList[0];
}
