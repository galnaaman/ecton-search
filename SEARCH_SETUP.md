# Internal Network Search Engine Setup

## Overview
This is a Google-like search interface for your internal company network. It uses Next.js with Meilisearch as the search engine backend.

## Data Structure

### Basic Search Result Model
Each search result should have this structure:

```typescript
interface SearchResult {
  id: string           // Unique identifier
  url: string          // URL to the internal resource
  name: string         // Display name/title
  description?: string // Optional description
  type?: 'website' | 'document' | 'system' | 'database' // Optional type
}
```

### Sample JSON Data
See `sample-data.json` for example data structure. This is what you'll index in Meilisearch.

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_search_key_here
```

## Meilisearch Setup

1. **Install Meilisearch**:
   ```bash
   # macOS
   brew install meilisearch
   
   # Linux
   curl -L https://install.meilisearch.com | sh
   
   # Docker
   docker run -it --rm -p 7700:7700 getmeili/meilisearch:latest
   ```

2. **Start Meilisearch**:
   ```bash
   meilisearch --master-key="your_master_key_here"
   ```

3. **Index Your Data**:
   ```bash
   # Using curl to add documents to the 'internal_sites' index
   curl -X POST 'http://localhost:7700/indexes/internal_sites/documents' \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer your_master_key_here' \
     --data-binary @sample-data.json
   ```

## Using the Search Service

### Mock Data (Current Implementation)
The search currently uses mock data from `src/lib/search-service.ts`. This allows you to test the interface without setting up Meilisearch.

### Real Meilisearch Integration
To switch to real Meilisearch:

1. Set up your environment variables
2. Start Meilisearch server
3. Index your data
4. Update the search results page to use the real search service:

```typescript
// In src/app/search/page.tsx, replace the mock search with:
const searchResponse = await searchService.search(query)
setSearchResults(searchResponse.hits)
```

## Features

### Current Features
- ✅ Google-like homepage interface
- ✅ Search results page with proper styling
- ✅ Navigation between pages
- ✅ Mock data filtering
- ✅ Loading states and empty states
- ✅ Result type badges
- ✅ Responsive design

### Next Steps
- [ ] Connect to real Meilisearch instance
- [ ] Add pagination for results
- [ ] Implement faceted search (filter by type)
- [ ] Add search suggestions/autocomplete
- [ ] Implement "I'm Feeling Lucky" functionality
- [ ] Add search analytics

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage (Google-like interface)
│   ├── search/
│   │   └── page.tsx          # Search results page
│   └── types.ts              # TypeScript interfaces
├── lib/
│   ├── meilisearch.ts        # Meilisearch client setup
│   └── search-service.ts     # Search service with mock data
└── components/ui/            # UI components (shadcn/ui)
```

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the search**:
   - Go to `http://localhost:3000`
   - Enter a search query and press Enter
   - View results on the search page

3. **Customize the data**:
   - Edit `sampleData` in `src/lib/search-service.ts`
   - Or replace with your real data structure

## Production Deployment

1. Set up Meilisearch on your server
2. Index your internal sites data
3. Configure environment variables
4. Deploy your Next.js application
5. Update search service to use real Meilisearch calls

## Tips for Data Collection

To build your search index, consider crawling:
- Internal websites and portals
- Document repositories
- System dashboards
- Database interfaces
- Wiki pages
- Help desk systems

Each entry should follow the `SearchResult` interface structure for consistency. 