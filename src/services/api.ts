import { Item, Claim, ItemCategory, ItemStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY_ITEMS = 'elsewhere_items_data_v1';
const STORAGE_KEY_CLAIMS = 'elsewhere_claims_data_v1';

async function requireSignedInUser() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Sign in is required for this action. Connect Supabase and sign in first.');
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Please sign in before continuing.');
  }

  return data.user;
}

// Seed initial realistic items for demonstration if local storage is empty
const INITIAL_DEMO_ITEMS: Item[] = [
  {
    id: 'f1a2b3c4-1111-4000-8000-000000000001',
    reporter_id: null,
    reporter_name: 'Elena Vance (Arts Faculty)',
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'Electronics',
    colour: 'Silver / Grey',
    description: 'Found on the 3rd floor quiet study area near row 14 desks. Kept in original black zipped case with audio cable.',
    campus_location: 'Central Library, 3rd Floor Desk 14',
    type: 'found',
    approximate_date: '2026-10-21',
    image_url: null,
    status: 'Available',
    contact_email: 'elena.v@campus.edu',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'f1a2b3c4-2222-4000-8000-000000000002',
    reporter_id: null,
    reporter_name: 'Marcus Bell (Student Union)',
    title: 'Brass Ring with 3 Keys & Leather Campus Fob',
    category: 'Keys',
    colour: 'Brass & Brown Leather',
    description: 'Found under the wooden bench outside the Student Pavilion. Tag has worn initials "M.H." stamped in brass.',
    campus_location: 'Student Union North Quad',
    type: 'found',
    approximate_date: '2026-10-20',
    image_url: null,
    status: 'Available',
    contact_email: 'marcus.b@campus.edu',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'f1a2b3c4-3333-4000-8000-000000000003',
    reporter_id: null,
    reporter_name: 'Campus Security Desk',
    title: 'Undergraduate Student ID Card',
    category: 'ID Cards',
    colour: 'Ivory & Dark Green',
    description: 'Handed in by cleaner. Belongs to Dept of Architecture student. Surname begins with K. Stored safely at Security.',
    campus_location: 'Main Gate Security Office',
    type: 'found',
    approximate_date: '2026-10-22',
    image_url: null,
    status: 'Available',
    contact_email: 'security@campus.edu',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'f1a2b3c4-4444-4000-8000-000000000004',
    reporter_id: null,
    reporter_name: 'Julian Chen',
    title: 'Sage Green Hydroflask Bottle (32oz)',
    category: 'Bottles',
    colour: 'Sage Green',
    description: 'Found after morning Fluid Dynamics lecture. Has national park stickers and slight dent on base rim.',
    campus_location: 'Engineering Hall, Lecture Room 102',
    type: 'found',
    approximate_date: '2026-10-19',
    image_url: null,
    status: 'Available',
    contact_email: 'julian.c@campus.edu',
    created_at: new Date(Date.now() - 250000000).toISOString(),
    updated_at: new Date(Date.now() - 250000000).toISOString()
  },
  {
    id: 'f1a2b3c4-5555-4000-8000-000000000005',
    reporter_id: null,
    reporter_name: 'Amina Nour',
    title: 'Hardcover Moleskine Grid Notebook (Forest Green)',
    category: 'Stationery',
    colour: 'Forest Green',
    description: 'Found on table near the coffee counter. Contains handwritten research diagrams and literature notes.',
    campus_location: 'Campus Humanities Cafe',
    type: 'found',
    approximate_date: '2026-10-18',
    image_url: null,
    status: 'Claim Pending',
    contact_email: 'amina.n@campus.edu',
    created_at: new Date(Date.now() - 340000000).toISOString(),
    updated_at: new Date(Date.now() - 340000000).toISOString()
  },
  {
    id: 'f1a2b3c4-6666-4000-8000-000000000006',
    reporter_id: null,
    reporter_name: 'Devon Patel',
    title: 'Lost: Casio Scientific Calculator (fx-991EX)',
    category: 'Electronics',
    colour: 'Black & Carbon',
    description: 'Misplaced right after the mid-semester Physics practical. Has a small blue sticker on the battery cover sliding lid.',
    campus_location: 'Science Complex, Lab B4',
    type: 'lost',
    approximate_date: '2026-10-21',
    image_url: null,
    status: 'Available',
    contact_email: 'devon.p@campus.edu',
    created_at: new Date(Date.now() - 72000000).toISOString(),
    updated_at: new Date(Date.now() - 72000000).toISOString()
  }
];

// Helper to access LocalStorage safe from SSR
function getLocalItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);

    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_DEMO_ITEMS));
      return INITIAL_DEMO_ITEMS;
    }

    return JSON.parse(raw);
  } catch (err) {
    console.error('LocalStorage read error:', err);
    return INITIAL_DEMO_ITEMS;
  }
}

function saveLocalItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

function getLocalClaims(): Claim[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLAIMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalClaims(claims: Claim[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Convert File to base64 Data URL for persistent local storage
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);

    reader.readAsDataURL(file);
  });
}

// ==========================================
// EXPORTED API METHODS
// ==========================================

export const api = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  getBackendMode(): 'supabase' | 'local_demo' {
    return isSupabaseConfigured ? 'supabase' : 'local_demo';
  },

  /**
   * Upload an item photo to Supabase Storage or persist locally.
   * Signed-in users use their own folder; guests use the guest folder.
   */
  async uploadPhoto(file: File): Promise<string> {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be under 5 MB');
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      throw new Error('Only JPEG, PNG and WebP files are allowed');
    }

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.warn(
          'Could not check current session; continuing as guest.',
          authError.message
        );
      }

      const user = authData.user;

      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${fileExt}`;

      const filePath = user
        ? `${user.id}/items/${fileName}`
        : `guest/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      const { data: publicData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    }

    // Local demo mode
    return await fileToDataUrl(file);
  },

  /**
   * Fetch all items with optional filters
   */
  async fetchItems(filters?: {
    type?: 'all' | 'lost' | 'found';
    category?: ItemCategory | 'All';
    search?: string;
  }): Promise<Item[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase fetch items error:', error);
        throw new Error(`Could not load items: ${error.message}`);
      }

      let items: Item[] = (data || []).map(row => ({
        ...row,
        contact_email: null
      } as Item));

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();

        items = items.filter(
          item =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.campus_location.toLowerCase().includes(q) ||
            item.colour.toLowerCase().includes(q)
        );
      }

      return items;
    } else {
      // Local demo mode
      let items = getLocalItems();

      if (filters?.type && filters.type !== 'all') {
        items = items.filter(item => item.type === filters.type);
      }

      if (filters?.category && filters.category !== 'All') {
        items = items.filter(item => item.category === filters.category);
      }

      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();

        items = items.filter(
          item =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.campus_location.toLowerCase().includes(q) ||
            item.colour.toLowerCase().includes(q)
        );
      }

      return items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }
  },

  /**
   * Get single item by ID
   */
  async getItemById(id: string): Promise<Item | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase getItem error:', error);
        return null;
      }

      return data ? ({ ...data, contact_email: null } as Item) : null;
    } else {
      const items = getLocalItems();
      return items.find(item => item.id === id) || null;
    }
  },

  /**
   * Create a new item report.
   * Allows both signed-in users and guests to report items.
   */
  async createItem(
    itemData: Omit<Item, 'id' | 'created_at' | 'updated_at' | 'status'>,
    photoFile?: File | null
  ): Promise<Item> {
    let imageUrl: string | null = null;

    if (photoFile) {
      imageUrl = await this.uploadPhoto(photoFile);
    }

    if (isSupabaseConfigured && supabase) {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.warn(
          'Could not check current session; continuing as guest.',
          authError.message
        );
      }

      const user = authData.user;

      const {
        contact_email,
        reporter_id: _ignoredReporterId,
        ...publicItemData
      } = itemData;

      const reporterName = user
        ? (
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email?.split('@')[0] ||
            itemData.reporter_name ||
            'Student'
          )
        : (itemData.reporter_name?.trim() || 'Campus Guest');

      const { data, error } = await supabase
        .from('items')
        .insert([{
          ...publicItemData,
          reporter_id: user?.id ?? null,
          reporter_name: reporterName,
          image_url: imageUrl,
          status: 'Available'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase createItem error:', error);
        throw new Error(`Failed to publish report: ${error.message}`);
      }

      // Keep contact details private. Guest contact emails are not stored here.
      let savedContactEmail: string | null = null;

      if (user && contact_email?.trim()) {
        const { error: contactError } = await supabase
          .from('item_contacts')
          .insert({
            item_id: data.id,
            contact_email: contact_email.trim()
          });

        if (contactError) {
          console.error(
            'Could not save private contact details:',
            contactError
          );
        } else {
          savedContactEmail = contact_email.trim();
        }
      }

      return {
        ...data,
        contact_email: savedContactEmail
      } as Item;
    }

    // Local demo mode
    const newItem: Item = {
      ...itemData,
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      image_url: imageUrl,
      status: 'Available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existing = getLocalItems();
    const updated = [newItem, ...existing];

    saveLocalItems(updated);

    return newItem;
  },

  /**
   * Update item status
   */
  async updateItemStatus(
    itemId: string,
    status: ItemStatus
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('items')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Supabase updateItemStatus error:', error);
        throw new Error(`Failed to update status: ${error.message}`);
      }
    } else {
      const items = getLocalItems();

      const updated = items.map(item =>
        item.id === itemId
          ? { ...item, status, updated_at: new Date().toISOString() }
          : item
      );

      saveLocalItems(updated);
    }
  },

  /**
   * Submit an authenticated or verified claim for an item
   */
  async submitClaim(claimData: {
    item_id: string;
    claimant_id: string;
    claimant_name: string;
    claimant_email?: string;
    claim_message: string;
  }): Promise<Claim> {
    if (isSupabaseConfigured && supabase) {
      const user = await requireSignedInUser();

      const { data, error } = await supabase
        .from('claims')
        .insert([{
          item_id: claimData.item_id,
          claimant_id: user.id,
          claimant_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            claimData.claimant_name,
          claimant_email: user.email ?? null,
          claim_message: claimData.claim_message,
          claim_status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase submitClaim error:', error);
        throw new Error(`Failed to submit claim: ${error.message}`);
      }

      // The database trigger updates item status atomically.
      return data;
    } else {
      const newClaim: Claim = {
        id: 'claim-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        item_id: claimData.item_id,
        claimant_id: claimData.claimant_id,
        claimant_name: claimData.claimant_name,
        claimant_email: claimData.claimant_email,
        claim_message: claimData.claim_message,
        claim_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const claims = getLocalClaims();
      saveLocalClaims([newClaim, ...claims]);

      // Update item status to 'Claim Pending'
      await this.updateItemStatus(claimData.item_id, 'Claim Pending');

      return newClaim;
    }
  },

  /**
   * Fetch claims for an item
   */
  async getClaimsForItem(itemId: string): Promise<Claim[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getClaimsForItem error:', error);
        return [];
      }

      return data || [];
    } else {
      const claims = getLocalClaims();
      return claims.filter(claim => claim.item_id === itemId);
    }
  },

  /**
   * Update claim status (accept or reject)
   */
  async updateClaimStatus(
    claimId: string,
    itemId: string,
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await requireSignedInUser();

      const { error } = await supabase
        .from('claims')
        .update({
          claim_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId)
        .eq('item_id', itemId);

      if (error) {
        console.error('Supabase updateClaimStatus error:', error);
        throw new Error(`Failed to update claim: ${error.message}`);
      }

      // RLS ensures only the item's reporter can resolve claims.
    } else {
      const claims = getLocalClaims();

      const updatedClaims = claims.map(claim =>
        claim.id === claimId
          ? { ...claim, claim_status: status, updated_at: new Date().toISOString() }
          : claim
      );

      saveLocalClaims(updatedClaims);

      if (status === 'accepted') {
        await this.updateItemStatus(itemId, 'Returned');
      } else if (status === 'rejected') {
        const hasOtherPending = updatedClaims.some(
          claim => claim.item_id === itemId && claim.claim_status === 'pending'
        );

        if (!hasOtherPending) {
          await this.updateItemStatus(itemId, 'Available');
        }
      }
    }
  }
};