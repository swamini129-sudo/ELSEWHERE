export type ItemCategory = 
  | 'Keys' 
  | 'Bottles' 
  | 'Stationery' 
  | 'Electronics' 
  | 'ID Cards' 
  | 'Other';

export type ItemType = 'lost' | 'found';

export type ItemStatus = 'Available' | 'Claim Pending' | 'Returned';

export interface Item {
  id: string;
  reporter_id: string | null;
  reporter_name: string;
  title: string;
  category: ItemCategory;
  colour: string;
  description: string;
  campus_location: string;
  type: ItemType;
  approximate_date: string; // YYYY-MM-DD
  image_url?: string | null;
  status: ItemStatus;
  contact_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name: string;
  claimant_email?: string | null;
  claim_message: string;
  claim_status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MemoryMatchSignal {
  type: 'category' | 'colour' | 'location' | 'date' | 'keywords';
  label: string;
  matchedText?: string;
}

export interface MemoryMatchResult {
  item: Item;
  score: number; // 0 to 100
  signals: MemoryMatchSignal[];
  confidenceText: 'High confidence match' | 'Moderate match' | 'Possible match';
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
}
