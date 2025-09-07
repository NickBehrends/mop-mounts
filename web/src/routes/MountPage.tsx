import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Mount } from '../lib/types';
import { loadMounts } from '../lib/dataset';

export default function MountPage() {
  const { id } = useParams<{ id: string }>();
  const [mount, setMount] = useState<Mount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allMounts = await loadMounts();
        const foundMount = allMounts.find(m => m.id === id);
        if (!foundMount) {
          setError('Mount not found');
        } else {
          setMount(foundMount);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mount data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading mount details...</div>;
  }

  if (error || !mount) {
    return (
      <div className="error">
        <h2>Error Loading Mount</h2>
        <p>{error || 'Mount not found'}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="mount-page">
      <header>
        <Link to="/">← Back to Home</Link>
        <Link to={`/expansion/${mount.expansion}`}>← Back to {mount.expansion}</Link>
      </header>

      <main>
        <div className="mount-details">
          <h1>{mount.name}</h1>
          
          <div className="mount-info">
            <div className="info-group">
              <h3>Basic Info</h3>
              <p><strong>Expansion:</strong> {mount.expansion}</p>
              <p><strong>Category:</strong> {mount.category}</p>
              <p><strong>Faction:</strong> {mount.faction}</p>
            </div>

            <div className="info-group">
              <h3>Source</h3>
              <p><strong>Type:</strong> {mount.sourceType}</p>
              <p><strong>Details:</strong> {mount.sourceDetail}</p>
              {mount.zone && <p><strong>Zone:</strong> {mount.zone}</p>}
            </div>

            {(mount.requiresRiding || mount.professionReq || mount.reputationReq || mount.cost) && (
              <div className="info-group">
                <h3>Requirements</h3>
                {mount.requiresRiding && <p><strong>Riding:</strong> {mount.requiresRiding}</p>}
                {mount.professionReq && <p><strong>Profession:</strong> {mount.professionReq}</p>}
                {mount.reputationReq && <p><strong>Reputation:</strong> {mount.reputationReq}</p>}
                {mount.cost && <p><strong>Cost:</strong> {mount.cost}</p>}
              </div>
            )}

            {mount.isLimitedTime && (
              <div className="info-group">
                <h3>Availability</h3>
                <p className="limited-time">⚠️ Limited Time</p>
              </div>
            )}

            {mount.tags && mount.tags.length > 0 && (
              <div className="info-group">
                <h3>Tags</h3>
                <div className="tags">
                  {mount.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {mount.notes && (
              <div className="info-group">
                <h3>Notes</h3>
                <p>{mount.notes}</p>
              </div>
            )}

            {mount.wowheadId && (
              <div className="info-group">
                <h3>External Links</h3>
                <a 
                  href={`https://www.wowhead.com/item=${mount.wowheadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wowhead-link"
                >
                  View on Wowhead
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}