import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Mount } from '../lib/types';
import { loadMounts } from '../lib/dataset';
import { debounce } from '../lib/debounce';
import { getOwnershipStats } from '../lib/storage';
import { applyFilters } from '../lib/filterUtils';
import SearchBox from '../components/SearchBox';
import FilterPanel from '../components/FilterPanel';
import type { FilterState } from '../components/FilterPanel';
import MountCard from '../components/MountCard';
import ProgressBadge from '../components/ProgressBadge';
import EmptyState from '../components/EmptyState';

export default function HomePage() {
  const [filteredMounts, setFilteredMounts] = useState<Mount[]>([]);
  const [allMounts, setAllMounts] = useState<Mount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    expansions: [],
    category: 'all',
    faction: 'all',
    sourceType: 'all',
    ownership: 'all'
  });

  // Debounced search and filter function
  const debouncedFilter = useCallback(
    debounce((query: string, filterState: FilterState, mounts: Mount[]) => {
      const results = applyFilters(mounts, query, filterState);
      setFilteredMounts(results);
    }, 150),
    []
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const mountsData = await loadMounts();
      setAllMounts(mountsData);
      
      // Run data migration to clean up invalid mount IDs
      const { migrateOwnedMounts } = await import('../lib/storage');
      const validMountIds = mountsData.map(mount => mount.id);
      migrateOwnedMounts(validMountIds);
      
      // Initial load with current filters
      const results = applyFilters(mountsData, searchQuery, filters);
      setFilteredMounts(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mount data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && allMounts.length > 0) {
      debouncedFilter(searchQuery, filters, allMounts);
    }
  }, [searchQuery, filters, allMounts, loading, debouncedFilter]);

  const handleRetry = () => {
    loadData();
  };

  if (loading) {
    return <div className="loading">Loading mounts...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Mounts</h2>
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const stats = allMounts.length > 0 ? getOwnershipStats(allMounts) : null;

  return (
    <div className="home-page">
      <header>
        <div className="header-top">
          <h1>MoP Mounts Collection</h1>
          <Link to="/settings" className="settings-link">⚙️ Settings</Link>
        </div>
        {stats && (
          <ProgressBadge 
            owned={stats.global.owned} 
            total={stats.global.total}
            label="Overall Progress"
          />
        )}
        <div className="search-section">
          <SearchBox 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search mounts by name, source, zone, or tags..."
          />
        </div>
      </header>

      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredMounts.length}
      />

      <main>        
        {filteredMounts.length > 0 ? (
          <div className="mounts-grid">
            {filteredMounts.map((mount) => (
              <MountCard key={mount.id} mount={mount} />
            ))}
          </div>
        ) : !loading ? (
          <EmptyState
            searchQuery={searchQuery}
            filters={filters}
            allMounts={allMounts}
            onClearFilters={() => setFilters({
              expansions: [],
              category: 'all',
              faction: 'all',
              sourceType: 'all',
              ownership: 'all'
            })}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : null}
      </main>
    </div>
  );
}