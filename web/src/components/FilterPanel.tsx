import { useState } from 'react';
import type { Expansion, MountCategory, Faction, SourceType } from '../lib/types';

export interface FilterState {
  expansions: Expansion[];
  category: MountCategory | 'all';
  faction: Faction | 'all';
  sourceType: SourceType | 'all';
  ownership: 'all' | 'owned' | 'not-owned';
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
}

const expansions: Expansion[] = [
  'Classic',
  'The Burning Crusade',
  'Wrath of the Lich King',
  'Cataclysm',
  'Mists of Pandaria'
];

const categories: MountCategory[] = ['Ground', 'Flying', 'Aquatic', 'Multi'];
const factions: Faction[] = ['Alliance', 'Horde', 'Neutral'];
const sourceTypes: SourceType[] = ['Drop', 'Vendor', 'Quest', 'Achievement', 'Crafting', 'Promotion', 'Other'];

export default function FilterPanel({ filters, onFiltersChange, resultCount }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpansionToggle = (expansion: Expansion) => {
    const newExpansions = filters.expansions.includes(expansion)
      ? filters.expansions.filter(e => e !== expansion)
      : [...filters.expansions, expansion];
    
    onFiltersChange({ ...filters, expansions: newExpansions });
  };

  const handleSingleSelectChange = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      expansions: [],
      category: 'all',
      faction: 'all',
      sourceType: 'all',
      ownership: 'all'
    });
  };

  const hasActiveFilters = filters.expansions.length > 0 || 
    filters.category !== 'all' || 
    filters.faction !== 'all' || 
    filters.sourceType !== 'all' || 
    filters.ownership !== 'all';

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <h3>Filters</h3>
          <span className="result-count">{resultCount} mounts</span>
        </div>
        <div className="filter-actions">
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="clear-filters"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="toggle-filters"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Expansion Multi-Select */}
          <div className="filter-group">
            <label className="filter-label">Expansions</label>
            <div className="checkbox-group">
              {expansions.map(expansion => (
                <label key={expansion} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.expansions.includes(expansion)}
                    onChange={() => handleExpansionToggle(expansion)}
                  />
                  <span>{expansion}</span>
                  {filters.expansions.includes(expansion) && <span className="checkmark">✓</span>}
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleSingleSelectChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Faction Filter */}
          <div className="filter-group">
            <label className="filter-label">Faction</label>
            <select
              value={filters.faction}
              onChange={(e) => handleSingleSelectChange('faction', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Factions</option>
              {factions.map(faction => (
                <option key={faction} value={faction}>{faction}</option>
              ))}
            </select>
          </div>

          {/* Source Type Filter */}
          <div className="filter-group">
            <label className="filter-label">Source Type</label>
            <select
              value={filters.sourceType}
              onChange={(e) => handleSingleSelectChange('sourceType', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Sources</option>
              {sourceTypes.map(sourceType => (
                <option key={sourceType} value={sourceType}>{sourceType}</option>
              ))}
            </select>
          </div>

          {/* Ownership Filter */}
          <div className="filter-group">
            <label className="filter-label">Ownership</label>
            <div className="radio-group">
              <label className="radio-item">
                <input
                  type="radio"
                  name="ownership"
                  value="all"
                  checked={filters.ownership === 'all'}
                  onChange={(e) => handleSingleSelectChange('ownership', e.target.value)}
                />
                <span>All</span>
              </label>
              <label className="radio-item">
                <input
                  type="radio"
                  name="ownership"
                  value="owned"
                  checked={filters.ownership === 'owned'}
                  onChange={(e) => handleSingleSelectChange('ownership', e.target.value)}
                />
                <span>Owned</span>
              </label>
              <label className="radio-item">
                <input
                  type="radio"
                  name="ownership"
                  value="not-owned"
                  checked={filters.ownership === 'not-owned'}
                  onChange={(e) => handleSingleSelectChange('ownership', e.target.value)}
                />
                <span>Not Owned</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}