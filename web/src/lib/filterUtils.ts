import type { Mount } from './types';
import { matchesSearch } from './searchUtils';
import { isMountOwned } from './storage';
import type { FilterState } from '../components/FilterPanel';

export const applyFilters = (
  mounts: Mount[], 
  searchQuery: string, 
  filters: FilterState
): Mount[] => {
  return mounts.filter(mount => {
    // Search query filter
    if (!matchesSearch(mount, searchQuery)) {
      return false;
    }

    // Expansion filter (multi-select)
    if (filters.expansions.length > 0 && !filters.expansions.includes(mount.expansion)) {
      return false;
    }

    // Category filter
    if (filters.category !== 'all' && mount.category !== filters.category) {
      return false;
    }

    // Faction filter
    if (filters.faction !== 'all' && mount.faction !== filters.faction) {
      return false;
    }

    // Source Type filter
    if (filters.sourceType !== 'all' && mount.sourceType !== filters.sourceType) {
      return false;
    }

    // Ownership filter
    if (filters.ownership !== 'all') {
      const isOwned = isMountOwned(mount.id);
      if (filters.ownership === 'owned' && !isOwned) {
        return false;
      }
      if (filters.ownership === 'not-owned' && isOwned) {
        return false;
      }
    }

    return true;
  });
};

export const getFilterSuggestions = (
  filters: FilterState,
  allMounts: Mount[]
): string[] => {
  const suggestions: string[] = [];

  // Check what filters are currently active
  const hasExpansionFilter = filters.expansions.length > 0;
  const hasCategoryFilter = filters.category !== 'all';
  const hasFactionFilter = filters.faction !== 'all';
  const hasSourceTypeFilter = filters.sourceType !== 'all';
  const hasOwnershipFilter = filters.ownership !== 'all';

  // Suggest clearing the most restrictive filters first
  if (hasExpansionFilter && filters.expansions.length === 1) {
    suggestions.push('Try selecting more expansions');
  }

  if (hasCategoryFilter) {
    suggestions.push('Try changing the category filter');
  }

  if (hasFactionFilter) {
    suggestions.push('Try changing the faction filter');
  }

  if (hasSourceTypeFilter) {
    suggestions.push('Try changing the source type filter');
  }

  if (hasOwnershipFilter) {
    suggestions.push('Try showing all mounts (owned and unowned)');
  }

  // If multiple filters are active, suggest clearing some
  const activeFilterCount = [
    hasExpansionFilter,
    hasCategoryFilter,
    hasFactionFilter,
    hasSourceTypeFilter,
    hasOwnershipFilter
  ].filter(Boolean).length;

  if (activeFilterCount > 2) {
    suggestions.push('Try clearing some filters');
  }

  // If no specific suggestions, provide general ones
  if (suggestions.length === 0) {
    suggestions.push(
      'Try adjusting your search terms',
      'Check if you have any active filters',
      'Browse all mounts by clearing filters'
    );
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
};

export const getActiveFilterSummary = (filters: FilterState): string[] => {
  const active: string[] = [];

  if (filters.expansions.length > 0) {
    if (filters.expansions.length === 1) {
      active.push(`${filters.expansions[0]}`);
    } else {
      active.push(`${filters.expansions.length} expansions`);
    }
  }

  if (filters.category !== 'all') {
    active.push(`${filters.category} mounts`);
  }

  if (filters.faction !== 'all') {
    active.push(`${filters.faction} faction`);
  }

  if (filters.sourceType !== 'all') {
    active.push(`${filters.sourceType} source`);
  }

  if (filters.ownership === 'owned') {
    active.push('Owned only');
  } else if (filters.ownership === 'not-owned') {
    active.push('Not owned only');
  }

  return active;
};