import type { Mount } from './types';

export interface DatasetState {
  mounts: Mount[];
  loading: boolean;
  error: string | null;
}

let datasetCache: Mount[] | null = null;

export const loadMounts = async (): Promise<Mount[]> => {
  if (datasetCache) {
    return datasetCache;
  }

  try {
    const response = await fetch('/data/mounts.json');
    if (!response.ok) {
      throw new Error(`Failed to load mounts data: ${response.status}`);
    }
    const mounts: Mount[] = await response.json();
    datasetCache = mounts;
    return mounts;
  } catch (error) {
    console.error('Error loading mounts:', error);
    throw error;
  }
};

export const searchMounts = (mounts: Mount[], query: string): Mount[] => {
  if (!query.trim()) return mounts;
  
  const lowercaseQuery = query.toLowerCase();
  return mounts.filter(mount => 
    mount.name.toLowerCase().includes(lowercaseQuery) ||
    mount.sourceDetail.toLowerCase().includes(lowercaseQuery) ||
    mount.zone?.toLowerCase().includes(lowercaseQuery) ||
    mount.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const filterByExpansion = (mounts: Mount[], expansion: string): Mount[] => {
  if (!expansion || expansion === 'all') return mounts;
  return mounts.filter(mount => mount.expansion === expansion);
};