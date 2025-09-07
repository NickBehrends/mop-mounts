import { useState, useEffect } from 'react';
import type { Mount } from '../lib/types';
import { loadMounts, searchMounts, filterByExpansion } from '../lib/dataset';
import SearchBox from '../components/SearchBox';
import ExpansionFilter from '../components/ExpansionFilter';
import MountCard from '../components/MountCard';

export default function HomePage() {
  const [mounts, setMounts] = useState<Mount[]>([]);
  const [filteredMounts, setFilteredMounts] = useState<Mount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpansion, setSelectedExpansion] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const mountsData = await loadMounts();
      setMounts(mountsData);
      setFilteredMounts(mountsData);
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
    let filtered = mounts;
    filtered = filterByExpansion(filtered, selectedExpansion);
    filtered = searchMounts(filtered, searchQuery);
    setFilteredMounts(filtered);
  }, [mounts, searchQuery, selectedExpansion]);

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

  return (
    <div className="home-page">
      <header>
        <h1>MoP Mounts Collection</h1>
        <div className="filters">
          <SearchBox 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search mounts..."
          />
          <ExpansionFilter 
            value={selectedExpansion} 
            onChange={setSelectedExpansion}
          />
        </div>
      </header>

      <main>
        <div className="results-count">
          {filteredMounts.length} mount{filteredMounts.length !== 1 ? 's' : ''} found
        </div>
        
        <div className="mounts-grid">
          {filteredMounts.map((mount) => (
            <MountCard key={mount.id} mount={mount} />
          ))}
        </div>

        {filteredMounts.length === 0 && !loading && (
          <div className="no-results">
            No mounts found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}