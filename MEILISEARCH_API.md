# Meilisearch API Endpoints

This document describes all the available API endpoints for managing your Meilisearch instance through the Next.js application.

## Prerequisites

Make sure your environment variables are set:
```env
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_search_key_here
```

## Quick Start

To initialize Meilisearch with sample data:
```bash
curl -X POST http://localhost:3000/api/meilisearch/init
```

## API Endpoints

### 1. Initialize Sample Data

**Initialize with sample data**
```http
POST /api/meilisearch/init
```

**Delete sample data**
```http
DELETE /api/meilisearch/init
```

Response:
```json
{
  "message": "Successfully initialized Meilisearch with sample data",
  "indexName": "internal_sites",
  "documentsAdded": 8,
  "tasks": {
    "createIndex": {
      "taskUid": 1,
      "status": "enqueued"
    },
    "addDocuments": {
      "taskUid": 2,
      "status": "enqueued"
    }
  }
}
```

### 2. Index Management

**Create an index**
```http
POST /api/meilisearch/index
Content-Type: application/json

{
  "indexName": "my_index",
  "primaryKey": "id"
}
```

**Get index statistics**
```http
GET /api/meilisearch/index?name=internal_sites
```

**Delete an index**
```http
DELETE /api/meilisearch/index?name=my_index
```

**List all indexes**
```http
GET /api/meilisearch/indexes
```

Response:
```json
{
  "indexes": [
    {
      "uid": "internal_sites",
      "primaryKey": "id",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 3. Document Management

**Add documents to an index**
```http
POST /api/meilisearch/documents
Content-Type: application/json

{
  "indexName": "internal_sites",
  "documents": [
    {
      "id": "doc-1",
      "name": "My Document",
      "url": "https://example.com",
      "description": "A sample document",
      "type": "document"
    }
  ]
}
```

**Get documents from an index**
```http
GET /api/meilisearch/documents?index=internal_sites&limit=20&offset=0
```

**Delete documents**
```http
DELETE /api/meilisearch/documents
Content-Type: application/json

{
  "indexName": "internal_sites",
  "documentIds": ["doc-1", "doc-2"]
}
```

Or delete a single document:
```json
{
  "indexName": "internal_sites",
  "documentIds": "doc-1"
}
```

### 4. Search

**Simple search (GET)**
```http
GET /api/meilisearch/search?q=portal&index=internal_sites&limit=10&offset=0
```

**Advanced search (POST)**
```http
POST /api/meilisearch/search
Content-Type: application/json

{
  "query": "portal",
  "indexName": "internal_sites",
  "limit": 10,
  "offset": 0,
  "filter": "type = website",
  "attributesToHighlight": ["name", "description"],
  "attributesToRetrieve": ["id", "name", "url", "description", "type"]
}
```

Search response:
```json
{
  "query": "portal",
  "indexName": "internal_sites",
  "hits": [
    {
      "id": "portal-001",
      "name": "Employee Portal - Main Dashboard",
      "url": "https://portal.internal.company.com/dashboard",
      "description": "Central hub for employee resources...",
      "type": "website",
      "_formatted": {
        "name": "<em>Portal</em> - Main Dashboard",
        "description": "Central hub for employee resources..."
      }
    }
  ],
  "processingTimeMs": 1,
  "limit": 10,
  "offset": 0,
  "estimatedTotalHits": 1
}
```

## Example Usage

### Using curl

**1. Initialize the system:**
```bash
curl -X POST http://localhost:3000/api/meilisearch/init
```

**2. Search for documents:**
```bash
curl "http://localhost:3000/api/meilisearch/search?q=finance&limit=5"
```

**3. Add a new document:**
```bash
curl -X POST http://localhost:3000/api/meilisearch/documents \
  -H "Content-Type: application/json" \
  -d '{
    "indexName": "internal_sites",
    "documents": [{
      "id": "new-doc-1",
      "name": "New Internal Tool",
      "url": "https://new-tool.company.com",
      "description": "A new internal tool for productivity",
      "type": "website"
    }]
  }'
```

**4. Get index statistics:**
```bash
curl "http://localhost:3000/api/meilisearch/index?name=internal_sites"
```

### Using JavaScript/fetch

```javascript
// Initialize Meilisearch
const initResponse = await fetch('/api/meilisearch/init', {
  method: 'POST'
});

// Search for documents
const searchResponse = await fetch('/api/meilisearch/search?q=portal');
const searchResults = await searchResponse.json();

// Add new documents
const addResponse = await fetch('/api/meilisearch/documents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    indexName: 'internal_sites',
    documents: [{
      id: 'new-doc',
      name: 'New Document',
      url: 'https://example.com',
      description: 'A new document',
      type: 'document'
    }]
  })
});
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created successfully  
- `400` - Bad request (missing required parameters)
- `404` - Resource not found
- `409` - Conflict (resource already exists)
- `500` - Server error

Error response format:
```json
{
  "error": "Failed to create index",
  "details": "Index with uid `my_index` already exists."
}
```

## Document Structure

The recommended document structure for internal sites:

```json
{
  "id": "unique-identifier",
  "name": "Display Name",
  "url": "https://internal.company.com/path",
  "description": "Brief description of the resource",
  "type": "website" | "document" | "system" | "database"
}
```

## Tips

1. **Initialize first**: Always run `POST /api/meilisearch/init` to set up the index with sample data
2. **Use proper types**: Use the `type` field to categorize your documents for better filtering
3. **Batch operations**: Add multiple documents in a single request for better performance
4. **Search incrementally**: Use pagination with `limit` and `offset` for large result sets
5. **Monitor tasks**: Meilisearch operations are asynchronous; use the returned task IDs to monitor progress 