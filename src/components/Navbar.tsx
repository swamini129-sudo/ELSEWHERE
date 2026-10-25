import React, { useState } from 'react';
import {
  User,
  Menu,
  X,
  Sparkles,
  PlusCircle,
  Home,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { UserProfile } from '../types';
interface Props {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onOpenStatusModal: () => void;
  onNavigate: (sectionId: string) => void;
  currentPage?: string;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onOpenAuth,
  onOpenStatusModal,
  onNavigate,
  currentPage = 'home',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (destination: string) => {
    onNavigate(destination);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, destination: 'home' },
    { id: 'registry', label: 'Browse', icon: LayoutGrid, destination: 'listings' },
    { id: 'report', label: 'Report', icon: PlusCircle, destination: 'report' },
    { id: 'memory-match', label: 'Play', icon: Sparkles, destination: 'memory-match' },
  ];

  const isActive = (id: string) => {
    if (id === 'registry') {
      return currentPage === 'registry' || currentPage === 'find';
    }
    return currentPage === id;
  };

  return (
    <>
      <header className="glass-nav sticky top-0 z-40 border-b border-sage/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[68px] items-center justify-between sm:h-20">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="group flex min-w-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rust sm:gap-3"
              aria-label="ELSEWHERE home"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest font-serif text-xl font-bold text-ivory shadow-sm transition-transform duration-300 group-hover:rotate-[-5deg] sm:h-10 sm:w-10">
                E
              </span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-xl font-bold tracking-[0.12em] text-forest sm:text-2xl sm:tracking-[0.15em]">
                  ELSEWHERE
                </span>
                <span className="mt-1 hidden text-[9px] font-mono uppercase tracking-[0.16em] text-charcoal-muted sm:block">
                  Lost here. Found somewhere.
                </span>
              </span>
            </button>

            <nav
              className="hidden items-center gap-6 md:flex lg:gap-8"
              aria-label="Main navigation"
            >
              <button
                type="button"
                onClick={() => handleNavClick('listings')}
                className={`nav-link ${isActive('registry') ? 'nav-link-active' : ''}`}
              >
                Browse listings
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('memory-match')}
                className={`nav-link ${isActive('memory-match') ? 'nav-link-active' : ''}`}
              >
                <Sparkles size={15} />
                Memory Match
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('report')}
                className="nav-report-button"
              >
                <PlusCircle size={15} />
                Report an item
              </button>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="account-button"
                aria-label={currentUser ? 'Open account' : 'Sign in or register'}
              >
                <User size={17} />
                <span className="hidden lg:inline">
                  {currentUser ? currentUser.display_name.split(' ')[0] : 'Sign in'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="menu-button"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="secondary-mobile-menu"
              >
                {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="secondary-mobile-menu"
            className="mobile-secondary-menu"
          >
            <button
              type="button"
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
            >
              <User size={17} />
              {currentUser ? 'Your account' : 'Sign in / Register'}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('find')}
            >
              <Search size={17} />
              Find a missing item
            </button>
            
            <button
              type="button"
              onClick={() => handleNavClick('listings')}
            >
              <LayoutGrid size={17} />
              Browse the Registry
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('memory-match')}
            >
              <Sparkles size={17} />
              Memory Match
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('report')}
            >
              <PlusCircle size={17} />
              Report an Item
            </button>

          </div>
        )}
      </header>

      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {navItems.map(({ id, label, icon: Icon, destination }) => {
          const active = isActive(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavClick(destination)}
              className={`mobile-bottom-nav-item ${active ? 'is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="mobile-bottom-nav-icon">
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
