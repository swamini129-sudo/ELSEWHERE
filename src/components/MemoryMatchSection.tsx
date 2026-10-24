import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle,
  Tag,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Item, ItemCategory, MemoryMatchResult } from '../types';
import { runMemoryMatch, MemoryMatchQuery } from '../services/memoryMatch';
import { CategoryPlaceholder } from './CategoryPlaceholder';

interface Props {
  allItems: Item[];
  onSelectItem: (item: Item) => void;
  onOpenReport: () => void;
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

// Presets for student testing convenience
const EXAMPLE_DESCRIPTIONS = [
  {
    title: 'Water Bottle with Stickers',
    category: 'Bottles' as ItemCategory,
    colour: 'Sage Green',
    location: 'Engineering Hall',
    text: 'Lost my sage green Hydroflask water bottle after lecture in room 102. Has slight dent on base rim and national park stickers.'
  },
  {
    title: 'Sony Headphones in Case',
    category: 'Electronics' as ItemCategory,
    colour: 'Silver',
    location: 'Central Library',
    text: 'Misplaced my silver Sony noise canceling headphones in a black zippered case near the 3rd floor study desks.'
  },
  {
    title: 'Leather Keychain with 3 Keys',
    category: 'Keys' as ItemCategory,
    colour: 'Brass & Brown',
    location: 'Student Union',
    text: 'Lost a brass keyring with 3 keys and a brown leather fob with stamped initials M.H. outside near the quad benches.'
  }
];

export const MemoryMatchSection: React.FC<Props> = ({
  allItems,
  onSelectItem,
  onOpenReport
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory | 'All'>('All');
  const [colour, setColour] = useState('');
  const [location, setLocation] = useState('');
  const [approxDate, setApproxDate] = useState('');

  const [hasSearched, setHasSearched] = useState(false);
  const [matchResults, setMatchResults] = useState<MemoryMatchResult[]>([]);

  const handleRunMatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!description.trim() && !colour.trim() && !location.trim()) {
      return;
    }

    const query: MemoryMatchQuery = {
      description: description.trim(),
      category: category === 'All' ? undefined : category,
      colour: colour.trim() || undefined,
      campus_location: location.trim() || undefined,
      approximate_date: approxDate.trim() || undefined
    };

    const results = runMemoryMatch(query, allItems);
    setMatchResults(results);
    setHasSearched(true);
  };

  const handleApplyPreset = (preset: typeof EXAMPLE_DESCRIPTIONS[0]) => {
    setDescription(preset.text);
    setCategory(preset.category);
    setColour(preset.colour);
    setLocation(preset.location);
    setApproxDate('2026-10-21');

    // Automatically trigger match
    const query: MemoryMatchQuery = {
      description: preset.text,
      category: preset.category,
      colour: preset.colour,
      campus_location: preset.location,
      approximate_date: '2026-10-21'
    };
    const results = runMemoryMatch(query, allItems);
    setMatchResults(results);
    setHasSearched(true);
  };

  return (
    <section id="memory-match" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-sage/30">
      {/* Section Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rust/10 border border-rust/20 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-rust" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-rust font-semibold">
            COGNITIVE DESCRIPTIVE RETRIEVAL
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
          Memory Match Engine
        </h2>
        <p className="text-sm sm:text-base text-charcoal-muted mt-2 font-light leading-relaxed">
          Describe the missing object as you remember it. Our explainable algorithm analyzes category agreement, colour tones, textual keywords, campus location, and date proximity against real cataloged items.
        </p>
      </div>

      {/* Main Grid: Input Form vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Query Form (5 cols) */}
        <div className="lg:col-span-5 bg-ivory-light border border-sage/40 rounded-xl p-6 shadow-cinematic space-y-5">
          {/* Quick example presets */}
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block mb-2 font-medium">
              Try an Example Description:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_DESCRIPTIONS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyPreset(ex)}
                  className="px-2.5 py-1 bg-ivory border border-sage/40 text-[11px] font-mono rounded hover:bg-forest hover:text-ivory transition-colors text-left truncate max-w-xs"
                >
                  {ex.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRunMatch} className="space-y-4 pt-2 border-t border-sage/20">
            {/* Description Textarea */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-charcoal font-semibold mb-1">
                Describe the Missing Belonging *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention specific shapes, brand names, materials, scratches, stickers, or where you last used it..."
                className="w-full p-3 text-sm bg-ivory border border-sage/40 rounded-lg focus:outline-none focus:border-forest text-charcoal font-light leading-relaxed"
              />
            </div>

            {/* Structured Supplementary Clues */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                  Category Clue
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory | 'All')}
                  className="w-full p-2 text-xs bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal font-mono"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                  Colour Tone
                </label>
                <input
                  type="text"
                  value={colour}
                  onChange={(e) => setColour(e.target.value)}
                  placeholder="e.g. Sage, Brass, Silver"
                  className="w-full p-2 text-xs bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                  Suspected Campus Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Library 3rd Floor"
                  className="w-full p-2 text-xs bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono tracking-wider text-charcoal-muted mb-1">
                  Approximate Date
                </label>
                <input
                  type="date"
                  value={approxDate}
                  onChange={(e) => setApproxDate(e.target.value)}
                  className="w-full p-2 text-xs bg-ivory border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-forest text-ivory rounded-lg font-mono text-xs uppercase tracking-widest font-semibold hover:bg-forest-surface transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-rust" />
              <span>Search Memory Matches</span>
            </button>
          </form>
        </div>

        {/* Right Column: Matched Candidate Items (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!hasSearched ? (
            <div className="p-8 border border-dashed border-sage/50 rounded-xl bg-ivory-light/50 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-forest/5 flex items-center justify-center mx-auto text-forest">
                <HelpCircle className="w-6 h-6 text-sage-dark" />
              </div>
              <h3 className="font-serif text-xl font-bold text-forest">
                Awaiting Memory Signals
              </h3>
              <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
                Provide details or pick one of the example items on the left to see calculated matches with transparent signal explanations.
              </p>
            </div>
          ) : matchResults.length === 0 ? (
            <div className="p-8 border border-sage/40 rounded-xl bg-ivory-light text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rust/10 flex items-center justify-center mx-auto text-rust">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                No Correlating Belongings Discovered
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed font-light">
                No currently registered found items correlate closely with your description. Would you like to file an official <strong>Lost Item Report</strong> so anyone who finds it can notify you?
              </p>
              <button
                onClick={onOpenReport}
                className="px-5 py-2.5 bg-rust text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold hover:bg-rust-hover transition-colors"
              >
                File a Lost Report Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-sage/30">
                <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                  {matchResults.length} {matchResults.length === 1 ? 'Possible Match' : 'Possible Matches'} Discovered
                </span>
                <span className="text-[11px] font-mono text-charcoal-muted italic">
                  Ranked by weighted confidence
                </span>
              </div>

              {matchResults.map((result) => {
                const { item, score, signals, confidenceText } = result;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="group cursor-pointer bg-ivory-light border border-sage/40 hover:border-forest/50 rounded-xl p-5 shadow-sm hover:shadow-cinematic transition-all space-y-4"
                  >
                    {/* Header: Score badge and item title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-ivory-dark flex-shrink-0 border border-sage/30">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <CategoryPlaceholder category={item.category} colour={item.colour} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-forest group-hover:text-forest-surface leading-tight">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs font-mono text-charcoal-muted mt-0.5">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-sage-dark" />
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-rust" />
                              {item.campus_location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-sage-dark" />
                              {item.approximate_date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Indicator */}
                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold tracking-wider ${
                            score >= 65
                              ? 'bg-forest text-ivory'
                              : score >= 40
                              ? 'bg-sage-dark text-ivory'
                              : 'bg-ivory-dark border border-sage/40 text-charcoal'
                          }`}
                        >
                          {score}% Match
                        </span>
                        <span className="text-[10px] font-mono text-charcoal-muted block mt-0.5 uppercase tracking-wider">
                          {confidenceText}
                        </span>
                      </div>
                    </div>

                    {/* Transparent Signals Explaining WHY it Matches */}
                    <div className="bg-ivory rounded-lg p-3 border border-sage/25 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-charcoal-muted font-bold block">
                        Matching Signals:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-forest/5 text-forest border border-forest/15"
                          >
                            <CheckCircle className="w-3 h-3 text-sage-dark" />
                            <span>{sig.label}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer: View & Claim Action */}
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-charcoal-muted line-clamp-1 italic text-[11px] max-w-[70%]">
                        "{item.description}"
                      </span>
                      <span className="text-forest uppercase tracking-wider font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Inspect &amp; Claim</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
