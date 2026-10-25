import React from 'react';

interface Props {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<Props> = ({ onNavigate }) => {
  return (
    <footer className="bg-forest-deep text-ivory/80 border-t border-forest-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">

        {/* Brand Column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-forest-surface border border-sage/30 text-ivory flex items-center justify-center font-serif text-base font-bold">
              E
            </div>

            <span className="font-serif text-xl font-bold tracking-[0.18em] text-ivory">
              ELSEWHERE
            </span>
          </div>

          <p className="font-serif italic text-sage-light text-base leading-relaxed">
            “Lost here. Found somewhere.”
          </p>

          <p className="text-xs text-ivory/60 max-w-sm leading-relaxed font-light">
            A campus lost-and-found utility platform connecting
            students, faculties and campus facilities to safeguard and reunite
            misplaced possessions.
          </p>

          <div className="pt-2 text-[11px] font-mono text-ivory/40">
            Made for the things we hope to find again.
          </div>
        </div>

        {/* Directory Navigation */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-sage-light font-semibold">
            Repository Directory
          </h4>

          <ul className="space-y-2 text-xs font-mono text-ivory/70">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('listings')}
                className="hover:text-ivory transition-colors"
              >
                Cataloged Listings
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => onNavigate('memory-match')}
                className="hover:text-ivory transition-colors"
              >
                Memory Match Engine
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => onNavigate('report')}
                className="hover:text-ivory transition-colors"
              >
                File Lost/Found Report
              </button>
            </li>
          </ul>
        </div>

        {/* Campus Community Column */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-sage-light font-semibold">
            Made for the Campus Community
          </h4>

          <p className="text-xs text-ivory/60 max-w-xs leading-relaxed font-light">
            Every misplaced belonging has a story. ELSEWHERE helps connect
            lost items with the people looking for them.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-mono text-ivory/40 pt-2">
            <span>
              &copy; {new Date().getFullYear()} ELSEWHERE
            </span>
            <span>•</span>
            <span>Built for campus community</span>
          </div>
        </div>

      </div>
    </footer>
  );
};