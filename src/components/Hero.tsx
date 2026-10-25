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
  onMemoryMatchClick,
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    } else {
      onFindClick();
    }
  };

  return (
    <section
      id="hero"
      className="hero-stage relative isolate flex flex-col items-center overflow-hidden border-b border-sage/30 bg-ivory"
    >
      <div className="hero-light-wash pointer-events-none absolute inset-0" />
      <div className="hero-orbit hero-orbit-one pointer-events-none absolute" />
      <div className="hero-orbit hero-orbit-two pointer-events-none absolute" />
      <div className="hero-sweep pointer-events-none absolute" />

      {/* Content stays readable and interactive */}
      <div className="hero-content relative z-20 mx-auto w-full max-w-6xl px-4 pt-7 text-center sm:px-6 sm:pt-9 md:pt-12">
        <div className="hero-eyebrow mb-5 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-forest/5 px-3 py-1.5 sm:mb-6">
          <Compass className="h-3.5 w-3.5 shrink-0 animate-spin-slow text-rust" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-forest sm:text-[11px]">
            CAMPUS LOST &amp; FOUND
          </span>
        </div>

        <h1 className="hero-title mb-4 font-serif text-[2.5rem] font-medium leading-[1.04] tracking-tight text-forest sm:mb-5 sm:text-5xl md:text-[3.45rem]">
          Lost something
          <br />
          <span className="font-normal italic">on campus?</span>
        </h1>

        <p className="hero-subtitle mx-auto mb-5 max-w-md text-sm font-light leading-relaxed text-charcoal-muted sm:mb-6 sm:max-w-xl sm:text-base">
          Search for a missing belonging, or help return something you've found on campus.
        </p>

        <form
          onSubmit={handleSearch}
          className="hero-search relative z-30 mx-auto mb-4 w-full max-w-xl sm:mb-5"
          role="search"
        >
          <div className="relative flex items-center gap-1 rounded-full border border-forest/25 bg-ivory-light p-1.5 shadow-cinematic transition-colors hover:border-forest/50 focus-within:border-forest focus-within:ring-2 focus-within:ring-forest/20">
            <Search className="ml-2 h-5 w-5 shrink-0 text-forest/60 sm:ml-3" />

            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Try 'student ID', 'keys'..."
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm text-charcoal placeholder-charcoal-muted/70 focus:outline-none sm:text-base"
              aria-label="Search lost and found items"
            />

            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-forest px-3 py-2.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-forest-surface sm:px-5 sm:text-xs"
            >
              Search
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>

        <div
          className="hero-interaction-hint relative z-20 mt-3 text-xs leading-relaxed sm:text-sm"
          aria-label="How to use the homepage"
        >
          <span className="hint-primary">Search for an item to get started</span>
          <span className="hint-divider mx-2" aria-hidden="true">·</span>
          <span className="object-explore-hint">
            Tap the headphones to explore
          </span>
        </div>

        <div className="hero-signoff relative z-20 mt-4 font-mono text-[9px] leading-relaxed tracking-[0.13em] text-charcoal-muted/70 sm:text-[10px] sm:tracking-[0.16em]">
          A LITTLE LOST. A LITTLE FOUND.
          <br className="sm:hidden" /> ALWAYS WORTH LOOKING.
        </div>
        
      {/* Headphones showcase */}
      <div
        className="hero-object-showcase relative z-40 mx-auto mt-2 w-full max-w-md"
        aria-label="Featured campus belonging"
        style={{
          height: '220px',
          pointerEvents: 'auto',
        }}
      >
        <Hero3DCanvas
          reducedMotion={reducedMotion}
          onReportClick={onReportClick}
          onBrowseClick={onBrowseClick}
          onMemoryMatchClick={onMemoryMatchClick}
          onFindClick={onFindClick}
        />
      </div>

      </div>
    </section>
  );
};
