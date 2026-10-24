import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Compass, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  onNavigate: (sectionId: string) => void;
}

export const StorytellingSection: React.FC<Props> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(true);

  // Detect mobile width to switch to natural vertical editorial sequence
  useEffect(() => {
    // ELSEWHERE now uses a natural vertical editorial story on every viewport.
    // This avoids the fragile pinned horizontal track while keeping the same story cards.
    const checkMobile = () => {
      setIsMobile(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track scroll progress within the container for desktop pinned horizontal scrolling
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentProgress = Math.min(
        1,
        Math.max(0, -rect.top / totalScrollable)
      );
      setScrollProgress(currentProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Current active story step (0 to 3) based on scrollProgress
  const currentStep = Math.min(3, Math.floor(scrollProgress * 3.99));

  const panels = [
    {
      id: 'lost',
      stepNumber: '01',
      stage: 'THE MISPLACEMENT',
      headline: 'Every lost thing has a story.',
      subhead: 'A moment of distraction, a misplaced bag, or keys left on a quad bench.',
      description:
        'Belongings are more than physical objects—they contain coursework, memories, and identity. When something goes missing, students can immediately file an archival report detailing colors, distinguishing marks, and exact campus locations to initiate a recovery trail.',
      badge: 'STORY STAGE I',
      ctaText: 'Report a Lost Item',
      ctaAction: () => onNavigate('report'),
      graphic: (
        <svg
          className="w-36 h-36 md:w-48 md:h-48 text-rust/40 stroke-current animate-pulse-slow"
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth="1.2"
        >
          <circle cx="50" cy="50" r="42" strokeDasharray="4 3" />
          <path d="M50 16v12M50 72v12M16 50h12M72 50h12" />
          <circle cx="50" cy="50" r="14" strokeWidth="1.5" />
          <path d="M50 44v8l6 3" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'discovered',
      stepNumber: '02',
      stage: 'THE DISCOVERY',
      headline: 'Somewhere, someone found it.',
      subhead: 'Found on a lecture table, handed to security, or recovered by a classmate.',
      description:
        'Campus caretakers, students, and facility staff actively log orphan items into the central ELSEWHERE repository. Reports are tagged with timestamps, campus buildings, and optional authentic photographs to ensure immediate visibility across all faculties.',
      badge: 'STORY STAGE II',
      ctaText: 'Browse Found Registry',
      ctaAction: () => onNavigate('listings'),
      graphic: (
        <svg
          className="w-36 h-36 md:w-48 md:h-48 text-forest/40 stroke-current"
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth="1.2"
        >
          <rect x="20" y="24" width="60" height="52" rx="4" />
          <line x1="30" y1="38" x2="55" y2="38" />
          <line x1="30" y1="48" x2="70" y2="48" />
          <line x1="30" y1="58" x2="62" y2="58" />
          <circle cx="70" cy="66" r="16" fill="#F4F0E7" strokeWidth="1.5" />
          <path d="M66 66l3 3 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: 'matched',
      stepNumber: '03',
      stage: 'COGNITIVE CORRELATION',
      headline: 'The smallest details matter.',
      subhead: 'Explainable descriptive correlation without paid AI black-boxes.',
      description:
        'You do not need a serial number to reclaim what is yours. Memory Match transparently calculates category concordance, hue proximity, location proximity, and descriptive keyword overlap—surfacing possible matches and explaining precisely why they correlate.',
      badge: 'STORY STAGE III',
      ctaText: 'Launch Memory Match',
      ctaAction: () => onNavigate('memory-match'),
      graphic: (
        <svg
          className="w-36 h-36 md:w-48 md:h-48 text-sage-dark/60 stroke-current"
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth="1.2"
        >
          <circle cx="42" cy="46" r="24" />
          <circle cx="58" cy="46" r="24" />
          <circle cx="50" cy="62" r="22" strokeDasharray="3 3" />
          <path d="M50 42v8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="2.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'reunited',
      stepNumber: '04',
      stage: 'THE REUNION',
      headline: 'Back where it belongs.',
      subhead: 'Safe, authenticated reconnection between owners and finders.',
      description:
        'Submit a private ownership claim describing a unique verification detail—a hidden sticker, scratch, or lock combination. The reporter verifies the claim, coordinates a safe campus handover, and the item is marked Returned.',
      badge: 'STORY STAGE IV',
      ctaText: 'Explore Listings Now',
      ctaAction: () => onNavigate('listings'),
      graphic: (
        <svg
          className="w-36 h-36 md:w-48 md:h-48 text-rust/45 stroke-current"
          viewBox="0 0 100 100"
          fill="none"
          strokeWidth="1.2"
        >
          <rect x="26" y="42" width="48" height="38" rx="4" />
          <path d="M38 42V30a12 12 0 0124 0v12" strokeWidth="1.5" />
          <circle cx="50" cy="58" r="4" fill="currentColor" />
          <path d="M50 62v8" strokeWidth="2" strokeLinecap="round" />
          <path d="M22 22l6 6M78 22l-6 6" strokeDasharray="2 2" />
        </svg>
      )
    }
  ];

  return (
    <section
      id="storytelling"
      ref={containerRef}
      className={`relative bg-ivory border-b border-sage/30 ${
        isMobile ? 'py-16' : 'h-[320vh]'
      }`}
    >
      {/* =================================================================== */}
      {/* DESKTOP PINNED HORIZONTAL TRACK                                     */}
      {/* =================================================================== */}
      {!isMobile ? (
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
          {/* Top Progress & Step Bar */}
          <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 pt-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-forest animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-forest font-semibold">
                THE REUNION JOURNEY
              </span>
            </div>

            {/* Stepper Dots & Current Stage Label */}
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-2">
                {panels.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep
                        ? 'w-8 bg-forest'
                        : idx < currentStep
                        ? 'w-4 bg-forest/40'
                        : 'w-4 bg-sage/40'
                    }`}
                  />
                ))}
              </div>

              <span className="font-mono text-xs tracking-widest text-charcoal-muted">
                0{currentStep + 1} / 04
              </span>
            </div>
          </div>

          {/* Sliding Horizontal Viewport */}
          <div className="relative z-10 w-full flex-grow flex items-center overflow-hidden">
            <div
              className="flex h-full w-[400vw] will-change-transform transition-transform ease-out duration-100"
              style={{
                transform: `translate3d(-${scrollProgress * 75}%, 0, 0)`
              }}
            >
              {panels.map((panel, idx) => {
                const isActive = idx === currentStep;
                return (
                  <div
                    key={panel.id}
                    className="w-screen h-full flex-shrink-0 flex items-center justify-center px-6 sm:px-12 md:px-20 lg:px-28"
                  >
                    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                      {/* Left: Graphic Motif Frame */}
                      <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-ivory-light border border-sage/40 shadow-cinematic flex items-center justify-center p-8 overflow-hidden group">
                          {/* Archival corner registration marks */}
                          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-forest/30" />
                          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-forest/30" />
                          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-forest/30" />
                          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-forest/30" />

                          {/* Subtle background radial dot pattern */}
                          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#24372F_1px,transparent_1px)] [background-size:16px_16px]" />

                          <div className="relative z-10 transition-transform duration-700 ease-out group-hover:scale-105">
                            {panel.graphic}
                          </div>

                          <span className="absolute bottom-3 text-[10px] font-mono text-charcoal-muted tracking-widest uppercase">
                            STATION #{panel.stepNumber}
                          </span>
                        </div>
                      </div>

                      {/* Right: Narrative Typography */}
                      <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest/5 border border-forest/15">
                          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-forest font-semibold">
                            {panel.stage}
                          </span>
                        </div>

                        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-forest leading-[1.15]">
                          {panel.headline}
                        </h3>

                        <p className="font-serif italic text-lg sm:text-xl text-sage-dark font-normal leading-relaxed">
                          {panel.subhead}
                        </p>

                        <p className="text-sm sm:text-base text-charcoal-muted font-light leading-relaxed max-w-xl">
                          {panel.description}
                        </p>

                        {/* Contextual Action Button */}
                        <div className="pt-2 flex flex-wrap gap-3">
                          <button
                            onClick={panel.ctaAction}
                            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded bg-forest text-ivory font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest-surface hover:shadow-cinematic transition-all group"
                          >
                            <span>{panel.ctaText}</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>

                          {idx === 3 && (
                            <button
                              onClick={() => onNavigate('report')}
                              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded border border-forest/30 text-forest font-mono text-xs uppercase tracking-wider font-semibold hover:bg-forest/5 transition-all"
                            >
                              <span>Report an Item</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Scroll Guide Indicator */}
          <div className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-8 pb-8 flex items-center justify-between text-xs font-mono text-charcoal-muted border-t border-sage/20 pt-4">
            <span className="flex items-center gap-2 tracking-wider">
              <Compass className="w-3.5 h-3.5 text-rust animate-spin-slow" />
              <span>SCROLL DOWNWARD TO ADVANCE CHAPTERS</span>
            </span>
            <span className="tracking-widest uppercase text-[11px]">
              NEXT: LIVE CAMPUS REGISTRY &rarr;
            </span>
          </div>
        </div>
      ) : (
        /* =================================================================== */
        /* MOBILE NATURAL VERTICAL EDITORIAL SEQUENCE                          */
        /* =================================================================== */
        <div className="max-w-xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2 pb-4 border-b border-sage/30">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-forest font-semibold block">
              THE REUNION JOURNEY
            </span>
            <h2 className="font-serif text-3xl font-bold text-forest">
              Four Steps to Restoration
            </h2>
          </div>

          {panels.map((panel) => (
            <div
              key={panel.id}
              className="story-glass-card bg-ivory-light border border-sage/40 rounded-2xl p-6 sm:p-8 shadow-cinematic space-y-4 relative overflow-hidden animate-fade-stagger"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-forest/10 text-forest font-semibold">
                  {panel.stage}
                </span>
                <span className="font-mono text-xs text-charcoal-muted font-bold">
                  #{panel.stepNumber}
                </span>
              </div>

              <div className="flex justify-center py-2">
                <div className="w-24 h-24 flex items-center justify-center">
                  {panel.graphic}
                </div>
              </div>

              <h3 className="font-serif text-2xl font-bold text-forest leading-snug">
                {panel.headline}
              </h3>

              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-light">
                {panel.description}
              </p>

              <button
                onClick={panel.ctaAction}
                className="w-full mt-2 py-2.5 bg-forest text-ivory rounded font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5"
              >
                <span>{panel.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {panel.id === 'reunited' && (
                <button
                  onClick={() => onNavigate('report')}
                  className="w-full mt-2 py-2.5 border border-forest/30 text-forest rounded font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center"
                >
                  <span>Report an Item</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
