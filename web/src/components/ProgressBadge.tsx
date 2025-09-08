interface ProgressBadgeProps {
  owned: number;
  total: number;
  label?: string;
}

export default function ProgressBadge({ owned, total, label }: ProgressBadgeProps) {
  const percentage = total > 0 ? Math.round((owned / total) * 100) : 0;
  
  return (
    <div className="progress-badge">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-stats">
        <span className="progress-count">{owned}/{total}</span>
        <span className="progress-percentage">({percentage}%)</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}