// Re-export shared types from schemas
export type Expansion =
  | "Classic" | "The Burning Crusade" | "Wrath of the Lich King"
  | "Cataclysm" | "Mists of Pandaria";

export type MountCategory = "Ground" | "Flying" | "Aquatic" | "Multi";

export type Faction = "Alliance" | "Horde" | "Neutral";

export type SourceType =
  | "Drop" | "Vendor" | "Quest" | "Achievement"
  | "Crafting" | "Promotion" | "Other";

export interface Mount {
  /** Stable unique key. Never reuse. */
  id: string;                 // e.g., "onyxian-drake"
  name: string;               // e.g., "Onyxian Drake"
  expansion: Expansion;
  category: MountCategory;
  faction: Faction;           // "Neutral" unless truly restricted
  sourceType: SourceType;
  sourceDetail: string;       // free-form short description
  zone?: string;
  wowheadId?: number;         // numeric Wowhead entity id if available
  requiresRiding?: string;    // e.g., "Artisan Riding"
  professionReq?: string;     // e.g., "Engineering (300)"
  reputationReq?: string;     // e.g., "Exalted with The Tillers"
  cost?: string;              // e.g., "3,000g + 50x Token"
  isLimitedTime?: boolean;
  notes?: string;

  /** Optional structured hints for acquisition UI */
  tags?: string[];            // e.g., ["rare", "raid", "drop"]

  /** Versioning for dataset maintenance */
  dataVersion: number;        // monotonically increasing integer
  lastUpdatedUtc: string;     // ISO8601
}

// User-local collection state (localStorage/import/export)
export interface UserCollectionFile {
  schema: "mop-mounts.user-collection";
  schemaVersion: 1;
  exportedAtUtc: string;         // ISO8601
  datasetDataVersion: number;    // from mounts.json "dataVersion"
  owned: string[];               // array of Mount.id
  notes?: Record<string, string>; // optional user notes keyed by id
}