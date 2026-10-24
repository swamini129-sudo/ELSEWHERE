import { Item, MemoryMatchResult, MemoryMatchSignal } from '../types';

export interface MemoryMatchQuery {
  category?: string;
  colour?: string;
  campus_location?: string;
  approximate_date?: string;
  description: string;
}

// Stop words to remove from keyword extraction
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'lost', 'found', 'missing', 'left', 'somewhere', 'please', 'help'
]);

// Extract significant tokens/keywords
function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

// Calculate days between two ISO date strings
function daysDifference(date1Str: string, date2Str: string): number {
  try {
    const d1 = new Date(date1Str).getTime();
    const d2 = new Date(date2Str).getTime();
    if (isNaN(d1) || isNaN(d2)) return 999;
    return Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
  } catch {
    return 999;
  }
}

/**
 * Perform transparent, weighted memory matching against real campus reports
 */
export function runMemoryMatch(
  query: MemoryMatchQuery,
  candidateItems: Item[]
): MemoryMatchResult[] {
  // Only match against 'found' items (or available items that could be the user's lost belonging)
  const pool = candidateItems.filter(item => item.type === 'found' && item.status !== 'Returned');

  const queryKeywords = extractKeywords(query.description);
  const queryColours = extractKeywords(query.colour || '');
  const queryLocations = extractKeywords(query.campus_location || '');

  const results: MemoryMatchResult[] = [];

  for (const item of pool) {
    let score = 0;
    const signals: MemoryMatchSignal[] = [];

    // 1. Category Agreement (Weight: 30%)
    if (query.category && query.category !== 'All' && query.category !== 'Other') {
      if (item.category.toLowerCase() === query.category.toLowerCase()) {
        score += 30;
        signals.push({
          type: 'category',
          label: `Category matches (${item.category})`,
          matchedText: item.category
        });
      }
    } else if (item.category) {
      // If user didn't specify category, check if query description mentions the category name
      const catLower = item.category.toLowerCase();
      if (query.description.toLowerCase().includes(catLower)) {
        score += 20;
        signals.push({
          type: 'category',
          label: `Description mentions category (${item.category})`,
          matchedText: item.category
        });
      }
    }

    // 2. Colour Overlap (Weight: 20%)
    const itemColours = extractKeywords(item.colour);
    const itemDescColours = extractKeywords(item.description);
    const allItemColours = new Set([...itemColours, ...itemDescColours]);

    const matchingColours = queryColours.filter(c => allItemColours.has(c));
    // Also check if any query colour is contained in item's colour field
    if (matchingColours.length > 0) {
      score += 20;
      signals.push({
        type: 'colour',
        label: `Similar colour detected (${matchingColours.join(', ')})`,
        matchedText: matchingColours.join(', ')
      });
    } else if (query.colour && item.colour.toLowerCase().includes(query.colour.toLowerCase())) {
      score += 15;
      signals.push({
        type: 'colour',
        label: `Colour tone corresponds (${item.colour})`,
        matchedText: item.colour
      });
    }

    // 3. Location Proximity / Overlap (Weight: 20%)
    const itemLocations = extractKeywords(item.campus_location);
    const matchingLocations = queryLocations.filter(loc => itemLocations.includes(loc));
    if (matchingLocations.length > 0) {
      score += 20;
      signals.push({
        type: 'location',
        label: `Campus location matches (${item.campus_location})`,
        matchedText: item.campus_location
      });
    } else if (
      query.campus_location && 
      (item.campus_location.toLowerCase().includes(query.campus_location.toLowerCase()) ||
       query.campus_location.toLowerCase().includes(item.campus_location.toLowerCase()))
    ) {
      score += 15;
      signals.push({
        type: 'location',
        label: `Near same campus sector (${item.campus_location})`,
        matchedText: item.campus_location
      });
    }

    // 4. Description & Title Keywords (Weight: 20%)
    const itemKeywords = extractKeywords(`${item.title} ${item.description}`);
    const matchedKeywords = queryKeywords.filter(k => itemKeywords.includes(k));

    if (matchedKeywords.length > 0) {
      // Calculate overlap ratio
      const keywordScore = Math.min(20, matchedKeywords.length * 7);
      score += keywordScore;
      signals.push({
        type: 'keywords',
        label: `Shared keywords (${matchedKeywords.slice(0, 4).join(', ')})`,
        matchedText: matchedKeywords.join(', ')
      });
    }

    // 5. Date Proximity (Weight: 10%)
    if (query.approximate_date && item.approximate_date) {
      const diffDays = daysDifference(query.approximate_date, item.approximate_date);
      if (diffDays <= 2) {
        score += 10;
        signals.push({
          type: 'date',
          label: `Found within 48 hours of estimated loss (${item.approximate_date})`,
          matchedText: `${diffDays === 0 ? 'Same day' : `${Math.round(diffDays)}d difference`}`
        });
      } else if (diffDays <= 7) {
        score += 6;
        signals.push({
          type: 'date',
          label: `Found within the same week (${item.approximate_date})`,
          matchedText: `${Math.round(diffDays)} days apart`
        });
      }
    }

    // Only include items with at least some notable correlation (e.g. score >= 15)
    if (score >= 15) {
      const normalizedScore = Math.min(100, Math.round(score));
      let confidenceText: 'High confidence match' | 'Moderate match' | 'Possible match' = 'Possible match';
      if (normalizedScore >= 65) {
        confidenceText = 'High confidence match';
      } else if (normalizedScore >= 40) {
        confidenceText = 'Moderate match';
      }

      results.push({
        item,
        score: normalizedScore,
        signals,
        confidenceText
      });
    }
  }

  // Rank by score descending
  return results.sort((a, b) => b.score - a.score);
}
