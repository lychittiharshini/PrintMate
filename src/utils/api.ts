import { Guide, PrintingCategory, ProductCategory, Product, SharedDataPayload } from '../types';
import {
  saveGuides,
  savePrintingCategories,
  saveCategories,
  saveProducts,
  getSavedGuides,
  getSavedPrintingCategories,
  getSavedCategories,
  getSavedProducts,
} from './storage';

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

/**
 * Fetch complete shared data from the central server.
 * Updates local cache immediately on success so the app has instant loading on next start.
 */
export async function fetchCentralData(): Promise<SharedDataPayload | null> {
  try {
    const res = await fetch('/api/data', {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Central server returned status ${res.status}`);
    }
    const data = await res.json();
    if (data && data.success) {
      // Sync to local storage for instant offline loading
      if (Array.isArray(data.guides)) saveGuides(data.guides);
      if (Array.isArray(data.printingCategories)) savePrintingCategories(data.printingCategories);
      if (Array.isArray(data.categories)) saveCategories(data.categories);
      if (Array.isArray(data.products)) saveProducts(data.products);

      return {
        guides: data.guides,
        printingCategories: data.printingCategories,
        categories: data.categories,
        products: data.products,
        lastUpdated: data.lastUpdated || Date.now(),
      };
    }
    return null;
  } catch (err: any) {
    console.warn('Could not fetch from central server, using local cache:', err.message);
    return null;
  }
}

/**
 * Persist entire shared dataset to central database immediately.
 */
export async function saveCentralData(payload: {
  guides?: Guide[];
  printingCategories?: PrintingCategory[];
  categories?: ProductCategory[];
  products?: Product[];
}): Promise<boolean> {
  // Update local storage first (optimistic UI)
  if (payload.guides) saveGuides(payload.guides);
  if (payload.printingCategories) savePrintingCategories(payload.printingCategories);
  if (payload.categories) saveCategories(payload.categories);
  if (payload.products) saveProducts(payload.products);

  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Central server save failed with status ${res.status}`);
    }
    const result = await res.json();
    return !!result.success;
  } catch (err) {
    console.error('Failed to sync to central server:', err);
    return false;
  }
}

/**
 * Save or update a single guide to the central database.
 */
export async function saveGuideApi(guide: Guide, allGuides: Guide[]): Promise<boolean> {
  const updatedList = allGuides.some(g => g.id === guide.id)
    ? allGuides.map(g => g.id === guide.id ? guide : g)
    : [...allGuides, guide];
  
  saveGuides(updatedList);

  try {
    const res = await fetch('/api/guides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guide),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving guide to server:', err);
    return false;
  }
}

/**
 * Delete a guide from the central database.
 */
export async function deleteGuideApi(guideId: string, allGuides: Guide[]): Promise<boolean> {
  const remaining = allGuides.filter(g => g.id !== guideId);
  saveGuides(remaining);

  try {
    const res = await fetch(`/api/guides/${guideId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting guide from server:', err);
    return false;
  }
}

/**
 * Save or update a printing category.
 */
export async function savePrintingCategoryApi(
  cat: PrintingCategory,
  allCats: PrintingCategory[]
): Promise<boolean> {
  const updatedList = allCats.some(c => c.id === cat.id)
    ? allCats.map(c => c.id === cat.id ? cat : c)
    : [...allCats, cat];

  savePrintingCategories(updatedList);

  try {
    const res = await fetch('/api/printing-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving printing category to server:', err);
    return false;
  }
}

/**
 * Delete a printing category.
 */
export async function deletePrintingCategoryApi(
  catId: string,
  allCats: PrintingCategory[]
): Promise<boolean> {
  const remaining = allCats.filter(c => c.id !== catId);
  savePrintingCategories(remaining);

  try {
    const res = await fetch(`/api/printing-categories/${catId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting printing category from server:', err);
    return false;
  }
}
