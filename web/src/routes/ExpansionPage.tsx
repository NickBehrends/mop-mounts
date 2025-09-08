import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Mount } from '../lib/types';
import { loadMounts, filterByExpansion } from '../lib/dataset';
import { getOwnershipStats } from '../lib/storage';
import MountCard from '../components/MountCard';
import ProgressBadge from '../components/ProgressBadge';

export default function ExpansionPage() {
  const { name } = useParams<{ name: string }>();
  const [mounts, setMounts] = useState<Mount[]>([]);
  const [allMounts, setAllMounts] = useState<Mount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const mountsData = await loadMounts();
        setAllMounts(mountsData);
        const filtered = name ? filterByExpansion(name) : filterByExpansion('all');
        setMounts(filtered);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mount data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [name]);

  if (loading) {
    return <div className="loading">Loading mounts...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Mounts</h2>
        <p>{error}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  const stats = allMounts.length > 0 && name ? getOwnershipStats(allMounts) : null;
  const expansionStats = stats?.byExpansion[name];

  return (
    <div className="expansion-page">
      <header>
        <Link to="/">← Back to Home</Link>
        <h1>{name} Mounts</h1>
        {expansionStats && (
          <ProgressBadge 
            owned={expansionStats.owned} 
            total={expansionStats.total}
            label={`${name} Progress`}
          />
        )}
        <p>{mounts.length} mount{mounts.length !== 1 ? 's' : ''} found</p>
      </header>

      <main>
        <div className="mounts-grid">
          {mounts.map((mount) => (
            <MountCard key={mount.id} mount={mount} />
          ))}
        </div>

        {mounts.length === 0 && (
          <div className="no-results">
            No mounts found for {name}.
          </div>
        )}
      </main>
    </div>
  );
}