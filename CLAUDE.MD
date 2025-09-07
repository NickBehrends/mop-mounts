
## Sessions System Behaviors

@CLAUDE.sessions.md

## Role & Capabilities
You are a senior software engineer with an eye for UI/UX design. You have extensive experience in modern web development, clean code practices, and creating intuitive user interfaces.

## Git Restrictions
**IMPORTANT**: You are NOT allowed to push to the remote git branch in any capacity. You may only work with local changes and commits. Any git operations should be limited to local repository management only.

## Project Brief

A zero-backend React/TypeScript app, hosted on GitHub Pages, to browse/search all WoW mounts up through Mists of Pandaria, track which a user owns, and persist locally.

A separate local-only Admin UI edits the master mounts JSON and exports an updated file for PRs (never active on Pages).

### Roles:
- **Viewer** (any site visitor): browse/search, mark owned, import/export personal collection.
- **Contributor** (running Admin UI locally): propose changes to master data via JSON export + PR.

### Data Contract (authoritative)

TypeScript types (runtime mirrors via JSON Schema below):

```typescript
// /schemas/types.ts
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
```

### JSON Schema (for CI validation)

```json
{
  "$id": "https://goodjava.github.io/mop-mounts/schemas/mount.schema.json",
  "type": "object",
  "required": ["id","name","expansion","category","faction","sourceType","sourceDetail","dataVersion","lastUpdatedUtc"],
  "properties": {
    "id":        {"type":"string","pattern":"^[a-z0-9-]+$"},
    "name":      {"type":"string","minLength":1},
    "expansion": {"enum":["Classic","The Burning Crusade","Wrath of the Lich King","Cataclysm","Mists of Pandaria"]},
    "category":  {"enum":["Ground","Flying","Aquatic","Multi"]},
    "faction":   {"enum":["Alliance","Horde","Neutral"]},
    "sourceType":{"enum":["Drop","Vendor","Quest","Achievement","Crafting","Promotion","Other"]},
    "sourceDetail":{"type":"string","minLength":1},
    "zone":      {"type":"string"},
    "wowheadId": {"type":"number"},
    "requiresRiding": {"type":"string"},
    "professionReq":  {"type":"string"},
    "reputationReq":  {"type":"string"},
    "cost":      {"type":"string"},
    "isLimitedTime":{"type":"boolean"},
    "notes":     {"type":"string"},
    "tags":      {"type":"array","items":{"type":"string"}},
    "dataVersion":{"type":"integer","minimum":1},
    "lastUpdatedUtc":{"type":"string","format":"date-time"}
  },
  "additionalProperties": false
}
```

### Repository Layout

```
mop-mounts/
  /data/
    mounts.json                # master dataset (array<Mount>)
    dataset.meta.json          # { dataVersion, generatedAtUtc }
  /schemas/
    mount.schema.json          # JSON schema above
    user-collection.schema.json
    types.ts
  /web/                        # public app (GitHub Pages)
    src/
      app.tsx
      routes/
        index.tsx              # All Mounts
        expansion.$name.tsx    # Expansion view
        mount.$id.tsx          # Mount details
        settings.tsx           # Import/Export
      components/
        MountCard.tsx
        ExpansionFilter.tsx
        SearchBox.tsx
        ProgressBadge.tsx
      lib/
        storage.ts             # localStorage layer + migrations
        dataset.ts             # data loading, indexing, fuse
        types.ts               # re-export shared types
    vite.config.ts
    index.html
  /admin/                      # local-only UI to edit data
    src/
      AdminApp.tsx
      EditorGrid.tsx
      MountForm.tsx
      ValidationPanel.tsx
      Changelog.tsx
      lib/fileIo.ts            # in-browser file open/save (download)
      lib/validate.ts          # ajv validation
      lib/id.ts                # slug generator
    vite.config.ts
    index.html
  /scripts/
    sort-and-normalize.mjs     # canonicalize mounts.json (stable sort, fields)
    check-duplicates.mjs       # fail CI on duplicate ids/names
  .github/
    workflows/
      build-deploy.yml         # pages deploy for /web only
      validate-data.yml        # schema & lints for /data
  README.md
  CONTRIBUTING.md
```

**Design guardrail**: `/admin` never ships to Pages. CI deploys only `/web` build output.
