import React, { useState } from 'react';
import { Search, Filter, RotateCcw, AlertCircle, PlusCircle } from 'lucide-react';
import { Item, ItemCategory } from '../types';
import { ItemCard } from './ItemCard';

interface Props {
  mode?: 'registry' | 'find';
  items: Item[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectItem: (item: Item) => void;
  onOpenReport: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORIES: (ItemCategory | 'All')[] = [
  'All',
  'Keys',
  'Bottles',
  'Stationery',
  'Electronics',
  'ID Cards',
  'Other'
];

export const ListingsSection: React.FC<Props> = ({
  mode = 'registry',
  items,
  loading,
  error,
  onRefresh,
  onSelectItem,
  onOpenReport,
  searchQuery,
  onSearchChange
}) => {
  const [selectedType, setSelectedType] = useState<'all' | 'found' | 'lost'>('all');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'All'>('All');

  // Filter items in memory based on current selections
  const filteredItems = items.filter((item) => {
    // Type filter
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }

    // Search query filter (title, description, location, colour)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchLoc = item.campus_location.toLowerCase().includes(q);
      const matchCol = item.colour.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchCol) {
        return false;
      }
    }

    return true;
  });

  const awaitingFindQuery = mode === 'find' && !searchQuery.trim();

  return (
    <section id={mode === 'find' ? 'find-results' : 'listings'} className={`registry-section ${mode === 'find' ? 'find-mode' : 'browse-mode'} py-12 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto`}>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-sage/30 gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-forest font-semibold block mb-1">
            {mode === 'find' ? 'QUICK ITEM SEARCH' : 'ARCHIVAL REGISTRY'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            {mode === 'find' ? 'Start with what you remember.' : 'Recently Registered on Campus'}
          </h2>
          <p className="text-sm text-charcoal-muted mt-1 font-light">
            {mode === 'find' ? 'Type an item name, colour, description, or campus location to see matching records.' : 'Browse the full collection, then narrow it down by status, category, or keyword.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            title="Refresh listings"
            className="p-2.5 rounded border border-sage/40 text-forest hover:bg-forest/5 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenReport}
            className="px-4 py-2.5 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest-surface transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-rust" />
            <span>Report Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-forest/60 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, location (e.g. 'Library'), colour, or keyword..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-ivory-light border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-3 text-xs text-charcoal-muted hover:text-charcoal"
              >
                Clear
              </button>
            )}
          </div>

          {/* Lost / Found Toggle Buttons */}
          <div className="inline-flex rounded-lg border border-sage/40 p-1 bg-ivory-light shadow-sm flex-shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                selectedType === 'all'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal-muted hover:text-forest'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('found')}
              className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                selectedType === 'found'
                  ? 'bg-forest text-ivory shadow-sm'
                  : 'text-charcoal-muted hover:text-forest'
              }`}
            >
              Found
            </button>
            <button
              onClick={() => setSelectedType('lost')}
              className={`px-4 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                selectedType === 'lost'
                  ? 'bg-rust text-ivory shadow-sm'
                  : 'text-charcoal-muted hover:text-rust'
              }`}
            >
              Lost
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-sage-dark mr-1 flex-shrink-0 hidden sm:block" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-colors flex-shrink-0 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-forest text-ivory font-semibold'
                  : 'bg-ivory-light border border-sage/40 text-charcoal hover:border-forest/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rust/10 border border-rust/30 rounded-lg text-rust text-sm flex items-center gap-3 mb-8">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Unable to refresh records</p>
            <p className="text-xs text-charcoal-muted">{error}</p>
          </div>
        </div>
      )}

      {/* Search-first mode deliberately waits for a query; Browse Registry shows the full catalogue. */}
      {awaitingFindQuery ? (
        <div className="find-empty-state">
          <div className="find-orbit"><Search className="w-7 h-7" /></div>
          <span className="eyebrow">YOUR SEARCH STARTS HERE</span>
          <h3>What are we looking for?</h3>
          <p>Try “green bottle”, “student ID”, “library”, or even a colour. Your results will appear here.</p>
          <div className="find-suggestions">
            {['student ID', 'headphones', 'water bottle', 'keys'].map((term) => (
              <button key={term} onClick={() => onSearchChange(term)}>{term} <span>↗</span></button>
            ))}
          </div>
        </div>
      ) : loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-ivory-light border border-sage/30 rounded-lg overflow-hidden animate-pulse h-80"
            >
              <div className="w-full aspect-[4/3] bg-sage/20" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-sage/20 rounded w-1/3" />
                <div className="h-6 bg-sage/20 rounded w-4/5" />
                <div className="h-3 bg-sage/20 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-ivory-light border border-sage/30 rounded-xl max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-forest/5 border border-forest/20 flex items-center justify-center mx-auto text-forest">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-forest">
            No Belongings Found
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-light">
            We couldn't locate any records matching your search or filters. If you recently found or lost something, register a new report below.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                onSearchChange('');
                setSelectedCategory('All');
                setSelectedType('all');
              }}
              className="px-4 py-2 border border-forest/30 rounded font-mono text-xs uppercase tracking-wider hover:bg-forest/5"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest-surface"
            >
              Report an Item
            </button>
          </div>
        </div>
      ) : (
        /* Responsive Grid with Consistent Card Dimensions & Staggered Motion */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="animate-fade-stagger h-full"
              style={{ animationDelay: `${Math.min(idx * 60, 480)}ms` }}
            >
              <ItemCard
                item={item}
                onClick={() => onSelectItem(item)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
