import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Compass } from 'lucide-react';
import { Hero3DCanvas } from './HeroScene';

interface Props {
  onSearchSubmit: (query: string) => void;
  onFindClick: () => void;
  onReportClick: () => void;
  onBrowseClick: () => void;
  onMemoryMatchClick: () => void;
}

export const Hero: React.FC<Props> = ({
  onSearchSubmit,
  onFindClick,
  onReportClick,
  onBrowseClick,
  onMemoryMatchClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    } else {
      onFindClick();
    }
  };

  return (
    <section id="hero" className="hero-stage relative flex items-center justify-center overflow-hidden bg-ivory border-b border-sage/30">
      {/* Cinematic 3D Canvas Background (Procedural objects kept along outer periphery) */}
      <Hero3DCanvas reducedMotion={reducedMotion} onReportClick={onReportClick} onBrowseClick={onBrowseClick} onMemoryMatchClick={onMemoryMatchClick} onFindClick={onFindClick} />

      {/* Atmospheric light, fine film grain, and a restrained orbital frame (CSS only). */}
      <div className="hero-light-wash absolute inset-0 pointer-events-none" />
      <div className="hero-orbit hero-orbit-one absolute pointer-events-none" />
      <div className="hero-orbit hero-orbit-two absolute pointer-events-none" />
      <div className="hero-sweep absolute pointer-events-none" />

      {/* 
        PROTECTED CONTENT CONTAINER:
        Strictly centered with maximum width and backdrop blur protection so 3D objects NEVER overlap text, search, or buttons.
      */}
      <div className="hero-content relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-4 md:py-5 text-center">
        {/* Eyebrow */}
        <div className="hero-eyebrow inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/15 mb-3 md:mb-4">
          <Compass className="w-3.5 h-3.5 text-rust animate-spin-slow" />
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-forest font-semibold">
            CAMPUS LOST &amp; FOUND
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="hero-title font-serif text-4xl sm:text-5xl md:text-[3.45rem] font-medium tracking-tight text-forest leading-[.98] mb-3 md:mb-4">
          Lost something <br className="hidden sm:inline" />
          <span className="italic font-normal">on campus?</span>
        </h1>

        {/* Supporting Text */}
        <p className="hero-subtitle text-sm sm:text-base text-charcoal-muted max-w-xl mx-auto font-light leading-relaxed mb-3 md:mb-4">
          Search for a missing belonging, or help return something you've found on campus.
        </p>

        {/* Functional Search Bar */}
        <form onSubmit={handleSearch} className="hero-search max-w-2xl mx-auto mb-3 md:mb-4">
          <div className="relative flex items-center bg-ivory-light rounded-full border border-forest/25 shadow-cinematic hover:border-forest/50 transition-all p-1.5 focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest">
            <Search className="w-5 h-5 text-forest/60 ml-3 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try ‘student ID’, ‘keys’ or ‘headphones’…"
              className="w-full bg-transparent text-sm sm:text-base text-charcoal placeholder-charcoal-muted/60 focus:outline-none py-1.5 pr-2"
              aria-label="Search lost and found items"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-5 py-2.5 bg-forest text-ivory rounded-full text-xs uppercase font-mono tracking-wider font-medium hover:bg-forest-surface transition-colors flex items-center gap-1.5"
            >
              <span>Search</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="hero-interaction-hint mt-4" aria-label="How to use the floating objects">
          <span className="hint-primary">Search for an item to get started</span>
          <span className="hint-divider" aria-hidden="true">·</span>
          <span className="object-explore-hint">
  or click an object to explore, drag to reposition
</span>
        </div>

        <div className="hero-signoff mt-3 md:mt-4 text-[10px] font-mono text-charcoal-muted/70 tracking-[0.16em]">
          A LITTLE LOST. A LITTLE FOUND. ALWAYS WORTH LOOKING.
        </div>
      </div>
    </section>
  );
};
