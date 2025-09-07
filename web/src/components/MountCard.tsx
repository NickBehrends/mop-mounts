import type { Mount } from '../lib/types';
import { Link } from 'react-router-dom';

interface MountCardProps {
  mount: Mount;
}

export default function MountCard({ mount }: MountCardProps) {
  return (
    <div className="mount-card">
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