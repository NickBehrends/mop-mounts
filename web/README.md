# MoP Mounts Web App

A zero-backend React/TypeScript SPA for browsing World of Warcraft mounts through Mists of Pandaria, hosted on GitHub Pages.

## Features

- **Advanced Search**: Full-text fuzzy search with Fuse.js across mount names, sources, zones, and tags
- **Debounced Search**: 150ms debouncing prevents excessive searches for optimal performance
- **Filter by Expansion**: View mounts from specific expansions or all at once
- **Ownership Tracking**: Mark mounts as owned with persistent local storage
- **Progress Tracking**: View collection progress per expansion and globally with "X/Y Owned (Z%)" badges
- **Visual Indicators**: Clear ownership status with checkmarks and progress bars
- **Detailed Mount Pages**: Complete mount information including requirements, costs, and external links
- **Client-Side Routing**: Deep links work for expansions and individual mounts
- **Data Migration**: Automatic cleanup of invalid mount IDs when dataset changes
- **Error Handling**: Graceful fallbacks with retry functionality when data fails to load
- **Responsive Design**: Works across different screen sizes

## Architecture

### Tech Stack
- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Fuse.js** - Advanced full-text search with fuzzy matching
- **localStorage** - Local data persistence for ownership tracking
- **GitHub Pages** - Static hosting

### Project Structure
```
web/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── SearchBox.tsx     # Search input component
│   │   ├── ExpansionFilter.tsx # Expansion dropdown filter
│   │   ├── MountCard.tsx     # Mount display card with ownership toggle
│   │   └── ProgressBadge.tsx # Progress tracking component
│   ├── routes/              # Page components
│   │   ├── HomePage.tsx     # Main listing with filters and global progress
│   │   ├── ExpansionPage.tsx # Expansion-specific view with progress
│   │   └── MountPage.tsx    # Individual mount details with ownership
│   ├── lib/                 # Core utilities
│   │   ├── types.ts         # TypeScript type definitions
│   │   ├── dataset.ts       # Data loading, indexing, and fuzzy search
│   │   ├── storage.ts       # localStorage utilities for ownership
│   │   └── debounce.ts      # Search performance optimization
│   ├── App.tsx              # Router configuration
│   └── main.tsx             # App entry point
├── public/
│   └── _redirects           # SPA fallback for GitHub Pages
└── vite.config.ts           # Vite configuration with GitHub Pages base path
```

### Data Loading & Search
- Fetches `/data/mounts.json` at runtime with environment-aware base paths
- Client-side caching to avoid repeated requests
- **Search Indexing**: Builds Fuse.js indexes for expansion, ID, and full-text search
- **Performance**: 150ms debounced search with weighted field matching
- **Data Migration**: Automatic cleanup of invalid mount IDs from localStorage
- Error boundaries with user-friendly retry options
- TypeScript interfaces matching the data contract

### Routing
- **`/`** - Home page with search and filters
- **`/expansion/:name`** - Mounts filtered by expansion
- **`/mount/:id`** - Individual mount details
- **SPA Fallback** - All routes redirect to `/index.html` for client-side routing

## Development

### Getting Started
```bash
cd web
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

### GitHub Pages Configuration
- **Base path**: `/mop-mounts/` (configured in `vite.config.ts` and `main.tsx`)
- **SPA fallback**: `_redirects` file handles client-side routing
- **Deployment**: Builds from `/web` directory only (admin UI never ships)

## Data Contract

The app expects mount data at `/data/mounts.json` following this structure:

```typescript
interface Mount {
  id: string;                 // Unique identifier
  name: string;               // Display name
  expansion: Expansion;       // WoW expansion
  category: MountCategory;    // Ground/Flying/Aquatic/Multi  
  faction: Faction;           // Alliance/Horde/Neutral
  sourceType: SourceType;     // How to obtain
  sourceDetail: string;       // Specific acquisition details
  zone?: string;              // Optional location
  wowheadId?: number;         // Optional Wowhead link
  // ... additional optional fields
}
```

## Deployment

The app is configured for GitHub Pages deployment:

1. **Build**: `npm run build` creates optimized production files
2. **Base Path**: Configured for `/mop-mounts/` repository path
3. **SPA Support**: `_redirects` file ensures deep links work
4. **Asset Paths**: All assets use relative paths from the configured base

## Error Handling

- **Network Failures**: Shows error message with retry button
- **Missing Data**: Graceful fallback with user feedback  
- **Invalid Routes**: 404 handling via React Router
- **Data Validation**: TypeScript ensures type safety

## Performance

- **Data Caching**: Mounts loaded once and cached in memory
- **Search Optimization**: Pre-built indexes for expansion, ID, and full-text search
- **Debounced Input**: 150ms debouncing prevents excessive search operations
- **Weighted Search**: Fuse.js weighted fields (name 40%, source 30%, zone 20%, tags 10%)
- **Client-Side Operations**: No server requests for search/filter/ownership
- **Code Splitting**: Vite handles optimal bundle splitting
- **Lazy Loading**: Routes loaded on-demand

## Local Data Persistence

- **Ownership Tracking**: Mark mounts as owned with toggle buttons on cards and detail pages
- **Progress Tracking**: View collection progress with "X/Y Owned (Z%)" badges per expansion and globally
- **Data Storage**: Uses `localStorage["mop-mounts.v2.owned"]` to persist owned mount IDs
- **Data Migration**: Automatic cleanup when mount dataset changes (removes invalid IDs)
- **Visual Indicators**: Clear owned/unowned status with checkmarks and progress bars

## Dependencies

Install the required dependencies:
```bash
npm install fuse.js
npm install --save-dev @types/node
```

## Future Enhancements

- Import/export functionality for personal collection data
- Progressive Web App (PWA) features
- Advanced filtering options (faction, source type, etc.)
- Collection statistics and analytics
- Achievement tracking integration
