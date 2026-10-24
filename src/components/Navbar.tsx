import React, { useState } from 'react';
import { User, Menu, X, Database, Sparkles, PlusCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenStatusModal: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onOpenAuth,
  onOpenStatusModal,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-sage/40 transition-smooth">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Wordmark */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('hero')}>
            <div className="w-8 h-8 rounded bg-forest text-ivory flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              E
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-forest block leading-none">
                ELSEWHERE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-charcoal-muted uppercase mt-1 block">
                Lost here. Found somewhere.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('listings')}
              className="text-xs uppercase font-mono tracking-widest text-charcoal hover:text-forest transition-colors font-medium relative group py-1"
            >
              LISTINGS
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('memory-match')}
              className="text-xs uppercase font-mono tracking-widest text-charcoal hover:text-forest transition-colors font-medium relative group py-1 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-rust" />
              MEMORY MATCH
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest transition-all duration-300 group-hover:w-full" />
            </button>

            <button
              onClick={() => handleNavClick('report')}
              className="text-xs uppercase font-mono tracking-widest text-charcoal hover:text-forest transition-colors font-medium relative group py-1 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-forest" />
              REPORT
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest transition-all duration-300 group-hover:w-full" />
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Supabase / Backend Status Indicator */}
            <button
              onClick={onOpenStatusModal}
              title="Click to view backend configuration & status"
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                isSupabaseConfigured
                  ? 'bg-sage/20 border-sage text-forest hover:bg-sage/30'
                  : 'bg-rust/10 border-rust/40 text-rust hover:bg-rust/20'
              }`}
            >
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Demo Mode (Local)'}</span>
            </button>

            {/* Auth / Account Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded border border-forest/30 text-forest hover:bg-forest hover:text-ivory text-xs uppercase font-mono tracking-wider transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser ? currentUser.display_name.split(' ')[0] : 'Sign In'}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenStatusModal}
              className={`p-1.5 rounded-full border text-xs ${
                isSupabaseConfigured ? 'border-sage text-forest' : 'border-rust text-rust'
              }`}
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-forest hover:text-forest-surface"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sage/30 bg-ivory-light px-4 pt-4 pb-6 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick('listings')}
              className="text-left py-2 text-sm uppercase font-mono tracking-widest text-charcoal hover:text-forest border-b border-sage/20"
            >
              LISTINGS
            </button>
            <button
              onClick={() => handleNavClick('memory-match')}
              className="text-left py-2 text-sm uppercase font-mono tracking-widest text-charcoal hover:text-forest border-b border-sage/20 flex items-center justify-between"
            >
              <span>MEMORY MATCH</span>
              <Sparkles className="w-4 h-4 text-rust" />
            </button>
            <button
              onClick={() => handleNavClick('report')}
              className="text-left py-2 text-sm uppercase font-mono tracking-widest text-charcoal hover:text-forest border-b border-sage/20 flex items-center justify-between"
            >
              <span>REPORT AN ITEM</span>
              <PlusCircle className="w-4 h-4 text-forest" />
            </button>
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-forest text-ivory rounded text-xs uppercase font-mono tracking-wider font-medium flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? `Account: ${currentUser.display_name}` : 'Sign In / Register'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
