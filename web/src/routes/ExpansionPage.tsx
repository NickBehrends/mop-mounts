import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Mount } from '../lib/types';
import { loadMounts, filterByExpansion, sortMounts, type SortOption } from '../lib/dataset';
import { getOwnershipStats, bulkToggleOwnership, loadOwnedMounts } from '../lib/storage';
import MountCard from '../components/MountCard';
import ProgressBadge from '../components/ProgressBadge';
import ConfirmModal from '../components/ConfirmModal';
import UndoSnackbar from '../components/UndoSnackbar';

export default function ExpansionPage() {
  const { name } = useParams<{ name: string }>();
  const [mounts, setMounts] = useState<Mount[]>([]);
  const [allMounts, setAllMounts] = useState<Mount[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'markAllOwned' | 'markAllUnowned' | null;
  }>({ isOpen: false, type: null });
  const [undoState, setUndoState] = useState<{
    isVisible: boolean;
    previousOwnedIds: string[];
    action: string;
  }>({ isVisible: false, previousOwnedIds: [], action: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const mountsData = await loadMounts();
        setAllMounts(mountsData);
        const filtered = name ? filterByExpansion(name) : filterByExpansion('all');
        const sorted = sortMounts(filtered, sortBy);
        setMounts(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mount data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [name, sortBy]);

  // Sort effect
  useEffect(() => {
    if (mounts.length > 0) {
      const sorted = sortMounts(mounts, sortBy);
      setMounts(sorted);
    }
  }, [sortBy]);

  // Bulk actions
  const handleMarkAllOwned = () => {
    setConfirmModal({ isOpen: true, type: 'markAllOwned' });
  };

  const handleMarkAllUnowned = () => {
    setConfirmModal({ isOpen: true, type: 'markAllUnowned' });
  };

  const confirmBulkAction = () => {
    if (!confirmModal.type) return;

    const previousOwnedIds = loadOwnedMounts();
    const mountIds = mounts.map(mount => mount.id);
    const makeOwned = confirmModal.type === 'markAllOwned';
    
    bulkToggleOwnership(mountIds, makeOwned);
    
    // Force re-render of mount cards by triggering a state update
    setMounts([...mounts]);
    
    setUndoState({
      isVisible: true,
      previousOwnedIds,
      action: makeOwned ? `Marked ${mountIds.length} mounts as owned` : `Marked ${mountIds.length} mounts as unowned`
    });
    
    setConfirmModal({ isOpen: false, type: null });
  };

  const handleUndo = () => {
    // Restore previous state
    const { saveOwnedMounts } = require('../lib/storage');
    saveOwnedMounts(undoState.previousOwnedIds);
    
    // Force re-render of mount cards by triggering a state update
    setMounts([...mounts]);
    
    setUndoState({ isVisible: false, previousOwnedIds: [], action: '' });
  };

  const closeUndoSnackbar = () => {
    setUndoState({ isVisible: false, previousOwnedIds: [], action: '' });
  };

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
  const expansionStats = stats && name ? stats.byExpansion[name] : undefined;

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

      <div className="controls-section">
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="name">Name</option>
            <option value="sourceType">Source Type</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div className="bulk-actions">
          <button 
            onClick={handleMarkAllOwned}
            className="bulk-button mark-owned"
            disabled={mounts.length === 0}
          >
            Mark All Owned
          </button>
          <button 
            onClick={handleMarkAllUnowned}
            className="bulk-button mark-unowned"
            disabled={mounts.length === 0}
          >
            Mark All Unowned
          </button>
        </div>
      </div>

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

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: null })}
          onConfirm={confirmBulkAction}
          title={confirmModal.type === 'markAllOwned' ? 'Mark All Owned' : 'Mark All Unowned'}
          message={`Are you sure you want to mark all ${mounts.length} ${name} mounts as ${confirmModal.type === 'markAllOwned' ? 'owned' : 'unowned'}?`}
          confirmText={confirmModal.type === 'markAllOwned' ? 'Mark Owned' : 'Mark Unowned'}
          type="warning"
        />
      )}

      <UndoSnackbar
        isVisible={undoState.isVisible}
        message={undoState.action}
        onUndo={handleUndo}
        onClose={closeUndoSnackbar}
      />
    </div>
  );
}