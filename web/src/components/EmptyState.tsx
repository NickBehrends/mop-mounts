import type { FilterState } from './FilterPanel';
import { getFilterSuggestions, getActiveFilterSummary } from '../lib/filterUtils';
import type { Mount } from '../lib/types';

interface EmptyStateProps {
  searchQuery: string;
  filters: FilterState;
  allMounts: Mount[];
  onClearFilters: () => void;
  onClearSearch: () => void;
}

export default function EmptyState({ 
  searchQuery, 
  filters, 
  allMounts, 
  onClearFilters, 
  onClearSearch 
}: EmptyStateProps) {
  const suggestions = getFilterSuggestions(filters, allMounts);
  const activeFilters = getActiveFilterSummary(filters);
  const hasActiveFilters = activeFilters.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        🔍
      </div>
      
      <h3 className="empty-state-title">
        No mounts found
      </h3>
      
      <div className="empty-state-description">
        {hasSearchQuery && hasActiveFilters ? (
          <p>
            No mounts match your search "{searchQuery}" with the current filters: {activeFilters.join(', ')}.
          </p>
        ) : hasSearchQuery ? (
          <p>
            No mounts match your search for "{searchQuery}".
          </p>
        ) : hasActiveFilters ? (
          <p>
            No mounts match your current filters: {activeFilters.join(', ')}.
          </p>
        ) : (
          <p>
            No mounts available to display.
          </p>
        )}
      </div>

      <div className="empty-state-suggestions">
        <h4>Try these suggestions:</h4>
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>

      <div className="empty-state-actions">
        {hasSearchQuery && (
          <button 
            onClick={onClearSearch}
            className="empty-state-button secondary"
          >
            Clear search
          </button>
        )}
        
        {hasActiveFilters && (
          <button 
            onClick={onClearFilters}
            className="empty-state-button primary"
          >
            Clear all filters
          </button>
        )}
        
        {!hasSearchQuery && !hasActiveFilters && (
          <p className="empty-state-help">
            Try browsing all available mounts or check back later for new additions.
          </p>
        )}
      </div>
    </div>
  );
}