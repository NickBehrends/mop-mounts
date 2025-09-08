import type { Mount } from './types';
import Fuse from 'fuse.js';

export interface DatasetState {
  mounts: Mount[];
  loading: boolean;
  error: string | null;
}

// Caches and indexes
let datasetCache: Mount[] | null = null;
let fuseIndex: Fuse<Mount> | null = null;
let expansionIndex: Map<string, Mount[]> | null = null;
let idIndex: Map<string, Mount> | null = null;

// Build indexes after data is loaded
const buildIndexes = (mounts: Mount[]): void => {
  // Build Fuse.js full-text search index
  fuseIndex = new Fuse(mounts, {
    keys: [
      { name: 'name', weight: 0.4 },
      { name: 'sourceDetail', weight: 0.3 },
      { name: 'zone', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ],
    threshold: 0.3, // Lower = more strict matching
    includeScore: true,
    ignoreLocation: true
  });

  // Build expansion index
  expansionIndex = new Map();
  for (const mount of mounts) {
    const expansion = mount.expansion;
    if (!expansionIndex.has(expansion)) {
      expansionIndex.set(expansion, []);
    }
    expansionIndex.get(expansion)!.push(mount);
  }

  // Build ID index
  idIndex = new Map();
  for (const mount of mounts) {
    idIndex.set(mount.id, mount);
  }
};

export const loadMounts = async (): Promise<Mount[]> => {
  if (datasetCache) {
    return datasetCache;
  }

  try {
    // Use environment-aware base path for data fetch
    const basePath = import.meta.env.PROD ? '/mop-mounts' : '';
    const response = await fetch(`${basePath}/data/mounts.json`);
    if (!response.ok) {
      throw new Error(`Failed to load mounts data: ${response.status}`);
    }
    const mounts: Mount[] = await response.json();
    datasetCache = mounts;
    buildIndexes(mounts);
    return mounts;
  } catch (error) {
    console.error('Error loading mounts:', error);
    throw error;
  }
};

// Pure function selector API
export const searchMounts = (query: string): Mount[] => {
  if (!query.trim()) return datasetCache || [];
  if (!fuseIndex) return datasetCache || [];
  
  const results = fuseIndex.search(query);
  return results.map(result => result.item);
};

export const filterByExpansion = (expansion: string): Mount[] => {
  if (!expansion || expansion === 'all') return datasetCache || [];
  if (!expansionIndex) return datasetCache || [];
  
  return expansionIndex.get(expansion) || [];
};

export const getMountById = (id: string): Mount | undefined => {
  if (!idIndex) return undefined;
  return idIndex.get(id);
};

export const searchAndFilter = (query: string, expansion: string): Mount[] => {
  // Get base dataset
  let results: Mount[];
  
  // Apply expansion filter first if specified
  if (expansion && expansion !== 'all') {
    results = filterByExpansion(expansion);
  } else {
    results = datasetCache || [];
  }
  
  // Apply search if specified
  if (query.trim()) {
    if (!fuseIndex) return results;
    
    // Search within the filtered results
    const searchIndex = new Fuse(results, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'sourceDetail', weight: 0.3 },
        { name: 'zone', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true
    });
    
    const searchResults = searchIndex.search(query);
    results = searchResults.map(result => result.item);
  }
  
  return results;
};

// Legacy functions for backwards compatibility
export const searchMountsLegacy = (mounts: Mount[], query: string): Mount[] => {
  if (!query.trim()) return mounts;
  return searchMounts(query);
};

export const filterByExpansionLegacy = (mounts: Mount[], expansion: string): Mount[] => {
  if (!expansion || expansion === 'all') return mounts;
  return filterByExpansion(expansion);
};

// Sorting functionality
export type SortOption = 'name' | 'sourceType' | 'category';

export const sortMounts = (mounts: Mount[], sortBy: SortOption): Mount[] => {
  const sorted = [...mounts];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'sourceType':
      return sorted.sort((a, b) => {
        const sourceCompare = a.sourceType.localeCompare(b.sourceType);
        return sourceCompare !== 0 ? sourceCompare : a.name.localeCompare(b.name);
      });
    case 'category':
      return sorted.sort((a, b) => {
        const categoryCompare = a.category.localeCompare(b.category);
        return categoryCompare !== 0 ? categoryCompare : a.name.localeCompare(b.name);
      });
    default:
      return sorted;
  }
};