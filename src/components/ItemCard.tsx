import React from 'react';
import { Calendar, MapPin, Tag, CheckCircle2, Clock, Check } from 'lucide-react';
import { Item } from '../types';
import { CategoryPlaceholder } from './CategoryPlaceholder';

interface Props {
  item: Item;
  onClick: () => void;
}

export const ItemCard: React.FC<Props> = ({ item, onClick }) => {
  // Status style mapping
  const renderStatusBadge = () => {
    switch (item.status) {
      case 'Returned':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-forest text-ivory">
            <Check className="w-3 h-3" />
            <span>Returned</span>
          </span>
        );
      case 'Claim Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-rust/15 text-rust border border-rust/30">
            <Clock className="w-3 h-3" />
            <span>Claim Pending</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sage/30 text-forest border border-sage/40">
            <CheckCircle2 className="w-3 h-3 text-forest" />
            <span>Available</span>
          </span>
        );
    }
  };

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-ivory-light border border-sage/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-cinematic hover:border-forest/40 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Media Container: Uniform 4:3 Aspect Ratio with Neutral Ivory-Dark Backing and Contain Fitting */}
      <div className="relative w-full aspect-[4/3] bg-[#EAE5DB]/70 overflow-hidden border-b border-sage/20 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <CategoryPlaceholder category={item.category} colour={item.colour} />
        )}

        {/* Type Ribbon Badge: Lost or Found */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase font-semibold tracking-widest shadow-sm ${
              item.type === 'found'
                ? 'bg-forest text-ivory'
                : 'bg-rust text-ivory'
            }`}
          >
            {item.type === 'found' ? 'Found' : 'Lost'}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {renderStatusBadge()}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Category & Date Line */}
          <div className="flex items-center justify-between text-xs font-mono text-charcoal-muted mb-2">
            <span className="flex items-center gap-1 uppercase tracking-wider">
              <Tag className="w-3 h-3 text-sage-dark" />
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sage-dark" />
              {item.approximate_date}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-forest leading-snug line-clamp-2 group-hover:text-forest-surface transition-colors mb-2">
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed mb-4 font-light">
            {item.description}
          </p>
        </div>

        {/* Footer: Location */}
        <div className="pt-3 border-t border-sage/20 flex items-center justify-between text-xs text-charcoal-muted">
          <span className="flex items-center gap-1.5 truncate max-w-[85%]">
            <MapPin className="w-3.5 h-3.5 text-rust flex-shrink-0" />
            <span className="truncate">{item.campus_location}</span>
          </span>
          <span className="text-forest text-[11px] font-mono uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            View &rarr;
          </span>
        </div>
      </div>
    </article>
  );
};
