import React from 'react';
import { ItemCategory } from '../types';

interface Props {
  category: ItemCategory;
  colour: string;
  className?: string;
}

export const CategoryPlaceholder: React.FC<Props> = ({ category, colour, className = '' }) => {
  // Render procedural SVG linework based on category
  const renderIcon = () => {
    switch (category) {
      case 'Keys':
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="24" r="14" />
            <circle cx="24" cy="24" r="5" />
            <path d="M34 34L54 54M45 45L49 41M50 50L55 45" />
          </svg>
        );
      case 'Bottles':
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="24" y="8" width="16" height="8" rx="2" />
            <path d="M26 16v4l-6 8v24a4 4 0 004 4h16a4 4 0 004-4V28l-6-8v-4" />
            <path d="M20 38h24" strokeDasharray="3 3" />
          </svg>
        );
      case 'Stationery':
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="18" y="10" width="28" height="44" rx="2" />
            <path d="M24 10v44M30 22h10M30 30h10M30 38h6" />
            <path d="M38 54l3 4 3-4" />
          </svg>
        );
      case 'Electronics':
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="14" y="14" width="36" height="36" rx="4" />
            <path d="M24 50v4M40 50v4M20 54h24" />
            <circle cx="32" cy="32" r="8" />
            <path d="M32 20v2M32 42v2M20 32h2M42 32h2" />
          </svg>
        );
      case 'ID Cards':
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="10" y="16" width="44" height="32" rx="3" />
            <circle cx="22" cy="28" r="5" />
            <path d="M16 40c0-3 3-5 6-5s6 2 6 5" />
            <path d="M34 26h14M34 32h10M34 38h12" />
            <rect x="28" y="12" width="8" height="4" rx="1" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 stroke-current" viewBox="0 0 64 64" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="32" cy="32" r="20" strokeDasharray="4 4" />
            <path d="M32 24v16M24 32h16" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-ivory to-ivory-dark text-forest select-none overflow-hidden ${className}`}
    >
      {/* Delicate background geometrical grid pattern */}
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#24372F_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Decorative archival frame corners */}
      <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-forest/30" />
      <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-forest/30" />
      <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-forest/30" />
      <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-forest/30" />

      {/* Center Icon */}
      <div className="relative z-10 opacity-75 transform hover:scale-105 transition-transform duration-300">
        {renderIcon()}
      </div>

      {/* Editorial subtitle label */}
      <div className="relative z-10 mt-3 text-center">
        <span className="text-[11px] font-mono uppercase tracking-widest text-forest/70 block">
          {category}
        </span>
        <span className="text-[10px] text-charcoal-muted tracking-tight italic mt-0.5">
          {colour}
        </span>
      </div>
    </div>
  );
};
