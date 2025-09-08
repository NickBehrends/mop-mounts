import { useState, useEffect } from 'react';
import type { Mount } from '../lib/types';
import { Link } from 'react-router-dom';
import { isMountOwned, toggleMountOwnership } from '../lib/storage';

interface MountCardProps {
  mount: Mount;
}

export default function MountCard({ mount }: MountCardProps) {
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    setOwned(isMountOwned(mount.id));
  }, [mount.id]);

  const handleToggleOwned = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    const newOwned = toggleMountOwnership(mount.id);
    setOwned(newOwned);
  };

  return (
    <div className={`mount-card ${owned ? 'owned' : ''}`}>
      <button 
        className={`ownership-toggle ${owned ? 'owned' : ''}`}
        onClick={handleToggleOwned}
        title={owned ? 'Mark as not owned' : 'Mark as owned'}
      >
        {owned ? '✓' : '○'}
      </button>
      
      <Link to={`/mount/${mount.id}`} className="mount-card-link">
        <h3>{mount.name}</h3>
        <p className="expansion">{mount.expansion}</p>
        <p className="source">{mount.sourceType}: {mount.sourceDetail}</p>
        {mount.zone && <p className="zone">{mount.zone}</p>}
        <div className="mount-meta">
          <span className="category">{mount.category}</span>
          <span className="faction">{mount.faction}</span>
        </div>
      </Link>
    </div>
  );
}