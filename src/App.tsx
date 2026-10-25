import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ListingsSection } from './components/ListingsSection';
import { MemoryMatchSection } from './components/MemoryMatchSection';
import { ReportFormSection } from './components/ReportFormSection';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AuthModal } from './components/AuthModal';
import { BackendStatusModal } from './components/BackendStatusModal';
import { Footer } from './components/Footer';
import { Item, UserProfile } from './types';
import { api } from './services/api';
import { authService } from './services/auth';

export const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Authentication
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Backend architecture modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Selected item detail modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Search query shared between Hero and Listings
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState<
    'home' | 'report' | 'registry' | 'find' | 'memory-match'
  >('home');

  // Fetch items from API
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.fetchItems();
      setItems(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load campus items');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session and items on mount
  useEffect(() => {
    loadItems();
    authService.getCurrentUser().then(setCurrentUser);
  }, [loadItems]);

  // Page navigation
  const handleNavigate = (destination: string) => {
    const normalized = destination.toLowerCase();

    if (normalized === 'hero' || normalized === 'home') {
      setPage('home');
    } else if (normalized === 'report') {
      setPage('report');
    } else if (
      normalized === 'memory-match' ||
      normalized === 'memory'
    ) {
      setPage('memory-match');
    } else if (normalized === 'find') {
      setPage('find');
    } else if (
      normalized === 'listings' ||
      normalized === 'registry' ||
      normalized === 'browse'
    ) {
      setPage('registry');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hero search
  const handleHeroSearch = (term: string) => {
    setSearchQuery(term);
    setPage('find');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle newly created item
  const handleItemCreated = (newItem: Item) => {
    setItems((prev) => [
      newItem,
      ...prev.filter((item) => item.id !== newItem.id),
    ]);

    loadItems();
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory text-charcoal selection:bg-forest selection:text-ivory overflow-x-hidden">
      {/* Persistent Navigation */}
    <Navbar
  currentUser={currentUser}
  currentPage={page}
  onOpenAuth={() => setAuthModalOpen(true)}
  onOpenStatusModal={() => setStatusModalOpen(true)}
  onNavigate={handleNavigate}
/>

      <main className="flex-grow min-h-[70vh]">
        {/* Homepage */}
        {page === 'home' && (
          <Hero
            onSearchSubmit={handleHeroSearch}
            onFindClick={() => handleNavigate('find')}
            onReportClick={() => handleNavigate('report')}
            onBrowseClick={() => handleNavigate('registry')}
            onMemoryMatchClick={() =>
              handleNavigate('memory-match')
            }
          />
        )}

        {/* Registry and Search */}
        {(page === 'registry' || page === 'find') && (
          <div className="page-enter">
            <div className="page-heading cinematic-atmosphere">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <button
                  onClick={() => handleNavigate('home')}
                  className="back-home-link"
                >
                  ← Back to home
                </button>

                <p className="eyebrow">
                  {page === 'find'
                    ? 'SEARCH & REUNITE'
                    : 'THE CAMPUS REGISTRY'}
                </p>

                <h1>
                  {page === 'find'
                    ? 'Let’s find what’s yours.'
                    : 'Browse the registry.'}
                </h1>

                <p>
                  {page === 'find'
                    ? 'Search by item, colour, description, or campus location.'
                    : 'Explore reported lost and found belongings across campus.'}
                </p>
              </div>
            </div>

            <ListingsSection
              mode={page === 'find' ? 'find' : 'registry'}
              items={items}
              loading={loading}
              error={error}
              onRefresh={loadItems}
              onSelectItem={(item) => setSelectedItem(item)}
              onOpenReport={() => handleNavigate('report')}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {/* Memory Match */}
        {page === 'memory-match' && (
          <div className="page-enter">
            <div className="page-heading cinematic-atmosphere">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <button
                  onClick={() => handleNavigate('home')}
                  className="back-home-link"
                >
                  ← Back to home
                </button>

                <p className="eyebrow">A LITTLE HELP FROM MEMORY</p>

                <h1>Let’s reconnect the clues.</h1>

                <p>
                  Describe what went missing and explore possible matches.
                </p>
              </div>
            </div>

            <MemoryMatchSection
              allItems={items}
              onSelectItem={(item) => setSelectedItem(item)}
              onOpenReport={() => handleNavigate('report')}
            />
          </div>
        )}

        {/* Report Form */}
        {page === 'report' && (
          <div className="page-enter">
            <div className="page-heading cinematic-atmosphere">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <button
                  onClick={() => handleNavigate('home')}
                  className="back-home-link"
                >
                  ← Back to home
                </button>

                <p className="eyebrow">HELP IT FIND ITS WAY</p>

                <h1>Report an item.</h1>

                <p>
                  Share the details that could bring a belonging back to its owner.
                </p>
              </div>
            </div>

            <ReportFormSection
              currentUser={currentUser}
              onItemCreated={handleItemCreated}
              onRequireAuth={() => setAuthModalOpen(true)}
              onNavigateListings={() => handleNavigate('listings')}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Item Detail and Claim Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        currentUser={currentUser}
        onItemUpdated={loadItems}
        onRequireAuth={() => setAuthModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      {/* Backend Status Modal */}
      <BackendStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </div>
  );
};

export default App;