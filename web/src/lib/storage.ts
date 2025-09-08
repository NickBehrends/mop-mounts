// Local storage utilities for mount ownership tracking
const STORAGE_KEY = "mop-mounts.v2.owned";

export interface UserCollection {
  ownedMountIds: string[];
  lastUpdated: string;
  dataVersion?: number;
}

// Export format for portable collection files
export interface UserCollectionFile {
  schema: "mop-mounts.user-collection";
  schemaVersion: 1;
  exportedAtUtc: string;         // ISO8601
  datasetDataVersion: number;    // from mounts.json "dataVersion"
  owned: string[];               // array of Mount.id
  notes?: Record<string, string>; // optional user notes keyed by id
}

// Load owned mount IDs from localStorage
export const loadOwnedMounts = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    // Handle both old array format and new object format
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      // Legacy format - just array of IDs
      return parsed;
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.ownedMountIds)) {
      // New format - object with metadata
      return parsed.ownedMountIds;
    }
    return [];
  } catch (error) {
    console.warn('Failed to load owned mounts from localStorage:', error);
    return [];
  }
};

// Save owned mount IDs to localStorage
export const saveOwnedMounts = (ownedMountIds: string[]): void => {
  try {
    const collection: UserCollection = {
      ownedMountIds,
      lastUpdated: new Date().toISOString(),
      dataVersion: 1
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch (error) {
    console.error('Failed to save owned mounts to localStorage:', error);
  }
};

// Toggle ownership of a specific mount
export const toggleMountOwnership = (mountId: string): boolean => {
  const ownedMounts = loadOwnedMounts();
  const isOwned = ownedMounts.includes(mountId);
  
  let newOwnedMounts: string[];
  if (isOwned) {
    // Remove from owned
    newOwnedMounts = ownedMounts.filter(id => id !== mountId);
  } else {
    // Add to owned
    newOwnedMounts = [...ownedMounts, mountId];
  }
  
  saveOwnedMounts(newOwnedMounts);
  return !isOwned; // Return new ownership state
};

// Check if a mount is owned
export const isMountOwned = (mountId: string): boolean => {
  const ownedMounts = loadOwnedMounts();
  return ownedMounts.includes(mountId);
};

// Migrate owned mounts when dataset changes (remove unknown mount IDs)
export const migrateOwnedMounts = (validMountIds: string[]): void => {
  const ownedMounts = loadOwnedMounts();
  const validOwnedMounts = ownedMounts.filter(id => validMountIds.includes(id));
  
  // Only save if there were changes
  if (validOwnedMounts.length !== ownedMounts.length) {
    console.log(`Migrated owned mounts: removed ${ownedMounts.length - validOwnedMounts.length} invalid IDs`);
    saveOwnedMounts(validOwnedMounts);
  }
};

// Get ownership statistics
export const getOwnershipStats = (allMounts: import('./types').Mount[]) => {
  const ownedMounts = loadOwnedMounts();
  const totalMounts = allMounts.length;
  const totalOwned = ownedMounts.length;
  
  // Stats by expansion
  const expansionStats: Record<string, { total: number; owned: number; percentage: number }> = {};
  
  for (const mount of allMounts) {
    if (!expansionStats[mount.expansion]) {
      expansionStats[mount.expansion] = { total: 0, owned: 0, percentage: 0 };
    }
    expansionStats[mount.expansion].total++;
    
    if (ownedMounts.includes(mount.id)) {
      expansionStats[mount.expansion].owned++;
    }
  }
  
  // Calculate percentages
  for (const expansion in expansionStats) {
    const stats = expansionStats[expansion];
    stats.percentage = stats.total > 0 ? Math.round((stats.owned / stats.total) * 100) : 0;
  }
  
  return {
    global: {
      total: totalMounts,
      owned: totalOwned,
      percentage: totalMounts > 0 ? Math.round((totalOwned / totalMounts) * 100) : 0
    },
    byExpansion: expansionStats
  };
};

// Export collection as downloadable JSON file
export const exportCollection = (): void => {
  const ownedMounts = loadOwnedMounts();
  
  const collection: UserCollectionFile = {
    schema: "mop-mounts.user-collection",
    schemaVersion: 1,
    exportedAtUtc: new Date().toISOString(),
    datasetDataVersion: 1, // TODO: Get from actual dataset
    owned: ownedMounts,
    notes: {} // TODO: Add notes support if needed
  };

  // Create blob and download
  const blob = new Blob([JSON.stringify(collection, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mop-mounts.collection.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import collection from JSON file
export const importCollection = async (file: File, validMountIds: string[]): Promise<{
  success: boolean;
  droppedIds?: string[];
  error?: string;
}> => {
  try {
    const text = await file.text();
    const collection: UserCollectionFile = JSON.parse(text);

    // Validate schema
    if (collection.schema !== "mop-mounts.user-collection") {
      return {
        success: false,
        error: "Invalid file format. Expected mop-mounts collection file."
      };
    }

    // Check schema version
    if (collection.schemaVersion !== 1) {
      return {
        success: false,
        error: `Unsupported schema version ${collection.schemaVersion}. Expected version 1.`
      };
    }

    // Validate and filter owned IDs
    const validOwned = collection.owned.filter(id => validMountIds.includes(id));
    const droppedIds = collection.owned.filter(id => !validMountIds.includes(id));

    // Replace current owned list
    saveOwnedMounts(validOwned);

    return {
      success: true,
      droppedIds: droppedIds.length > 0 ? droppedIds : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse collection file'
    };
  }
};