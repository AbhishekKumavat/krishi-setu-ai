import { RETAILERS } from './data';
import { supabase } from '@/lib/supabase';

// Define the retailer type
export type Retailer = {
  id: string;
  name: string;
  image: string;
  location: string;
  mapsLink: string;
  iframeLink: string;
  rating: number;
  reviewsCount: number;
  contact: string;
  verified: boolean;
  stock: Array<{
    id: string;
    name: string;
    pricePerKg: number;
    quantity: string;
  }>;
};

// ─── Async wrappers using Supabase ────────────────────────────────────────────────────────────

export async function getAllRetailersAsync(): Promise<Retailer[]> {
  // Try fetching from Supabase
  const { data: dbRetailers, error } = await supabase.from('retailers').select('*');

  const mergedMap = new Map<string, Retailer>();

  // Start with static RETAILERS
  for (const r of RETAILERS) {
    mergedMap.set(r.id, r);
  }

  // Override / append with DB data
  if (!error && dbRetailers) {
    for (const r of dbRetailers) {
      const id = r.retailer_id || r.id;
      mergedMap.set(id, {
        id: id,
        name: r.name,
        image: r.image,
        location: r.location,
        mapsLink: r.maps_link || r.mapsLink,
        iframeLink: r.iframe_link || r.iframeLink,
        rating: r.rating || 0,
        reviewsCount: r.reviews_count || r.reviewsCount || 0,
        contact: r.contact,
        verified: !!r.verified,
        stock: r.stock || [],
      });
    }
  }

  return Array.from(mergedMap.values());
}

export async function getRetailerByIdAsync(id: string): Promise<Retailer | undefined> {
  const all = await getAllRetailersAsync();
  return all.find(r => r.id === id);
}

export async function addRetailerAsync(newRetailer: Omit<Retailer, 'stock'>): Promise<void> {
  await supabase.from('retailers').insert([{
    retailer_id: newRetailer.id,
    name: newRetailer.name,
    image: newRetailer.image,
    location: newRetailer.location,
    maps_link: newRetailer.mapsLink,
    iframe_link: newRetailer.iframeLink,
    rating: newRetailer.rating,
    reviews_count: newRetailer.reviewsCount,
    contact: newRetailer.contact,
    verified: newRetailer.verified,
    stock: []
  }]);
}

export async function updateRetailerAsync(updatedRetailer: Retailer): Promise<void> {
  // Try to update existing
  const { error } = await supabase.from('retailers').update({
    name: updatedRetailer.name,
    image: updatedRetailer.image,
    location: updatedRetailer.location,
    maps_link: updatedRetailer.mapsLink,
    iframe_link: updatedRetailer.iframeLink,
    rating: updatedRetailer.rating,
    reviews_count: updatedRetailer.reviewsCount,
    contact: updatedRetailer.contact,
    verified: updatedRetailer.verified,
    stock: updatedRetailer.stock
  }).eq('retailer_id', updatedRetailer.id);

  // If error (or doesn't exist), try insert as fallback
  if (error) {
    await supabase.from('retailers').insert([{
      retailer_id: updatedRetailer.id,
      name: updatedRetailer.name,
      image: updatedRetailer.image,
      location: updatedRetailer.location,
      maps_link: updatedRetailer.mapsLink,
      iframe_link: updatedRetailer.iframeLink,
      rating: updatedRetailer.rating,
      reviews_count: updatedRetailer.reviewsCount,
      contact: updatedRetailer.contact,
      verified: updatedRetailer.verified,
      stock: updatedRetailer.stock
    }]);
  }
}

export async function updateRetailerStockAsync(retailerId: string, updatedStock: Retailer['stock']): Promise<void> {
  // First ensure retailer exists in DB
  const { data } = await supabase.from('retailers').select('id').eq('retailer_id', retailerId).single();

  if (data) {
    await supabase.from('retailers').update({ stock: updatedStock }).eq('retailer_id', retailerId);
  } else {
    // Need to migrate static retailer to DB with new stock
    const staticRetailer = RETAILERS.find(r => r.id === retailerId);
    if (staticRetailer) {
      await supabase.from('retailers').insert([{
        retailer_id: staticRetailer.id,
        name: staticRetailer.name,
        image: staticRetailer.image,
        location: staticRetailer.location,
        maps_link: staticRetailer.mapsLink,
        iframe_link: staticRetailer.iframeLink,
        rating: staticRetailer.rating,
        reviews_count: staticRetailer.reviewsCount,
        contact: staticRetailer.contact,
        verified: staticRetailer.verified,
        stock: updatedStock
      }]);
    }
  }
}

// ─── Backward compatibility wrappers (for components still using sync methods, these will just hit static data) ──────────────────────────

export function getAllRetailers(): Retailer[] {
  console.warn('getAllRetailers (sync) called. Result may be stale. Use getAllRetailersAsync.');
  return RETAILERS;
}

export function getRetailerById(id: string): Retailer | undefined {
  console.warn('getRetailerById (sync) called. Result may be stale. Use getRetailerByIdAsync.');
  return RETAILERS.find(r => r.id === id);
}

export function addRetailer(newRetailer: Omit<Retailer, 'stock'>): void {
  console.error('addRetailer (sync) is deprecated. Use addRetailerAsync.');
}

export function updateRetailer(updatedRetailer: Retailer): void {
  console.error('updateRetailer (sync) is deprecated. Use updateRetailerAsync.');
}

export function updateRetailerStock(retailerId: string, updatedStock: Retailer['stock']): void {
  console.error('updateRetailerStock (sync) is deprecated. Use updateRetailerStockAsync.');
}

// ─── Deprecated sync aliases ───────────────────────────────────────────────────

export function getAllRetailersSync(): Retailer[] {
  return getAllRetailers();
}

export function getRetailerByIdSync(id: string): Retailer | undefined {
  return getRetailerById(id);
}
