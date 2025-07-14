# API Reference

This document provides detailed information about all OpenSearch and Meilisearch API endpoints in the Ecton Search system.

## 🔗 OpenSearch API Endpoints

### GET /opensearch.xml

Returns the OpenSearch descriptor XML that browsers use to discover and integrate the search engine.

**Description**: Dynamic OpenSearch XML descriptor with proper domain URLs

**Response**: XML document with OpenSearch specification

**Headers**:
- `Content-Type: application/opensearchdescription+xml`
- `Cache-Control: public, max-age=86400`

**Example Request**:
```bash
curl https://search.internal.company.com/opensearch.xml
```

**Example Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Ecton Search</ShortName>
  <Description>Ecton Internal Network Search Engine</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">https://search.internal.company.com/favicon.ico</Image>
  <Url type="text/html" method="get" template="https://search.internal.company.com/api/opensearch/search?q={searchTerms}"/>
  <Url type="application/x-suggestions+json" method="get" template="https://search.internal.company.com/api/opensearch/suggestions?q={searchTerms}"/>
</OpenSearchDescription>
```

### GET /api/opensearch/search

Handles search queries from browsers and redirects to the search results page.

**Parameters**:
- `q` (string, required): Search query

**Response**: HTTP 307 redirect to `/search?q={query}`

**Error Handling**:
- Empty query: Redirects to homepage (`/`)
- Invalid query: Redirects to homepage (`/`)

**Example Request**:
```bash
curl -v "https://search.internal.company.com/api/opensearch/search?q=employee%20portal"
```

**Example Response**:
```http
HTTP/1.1 307 Temporary Redirect
Location: https://search.internal.company.com/search?q=employee%20portal
```

### GET /api/opensearch/suggestions

Provides autocomplete suggestions for browser search as you type.

**Parameters**:
- `q` (string, required): Search query (minimum 2 characters)

**Response**: JSON array in OpenSearch suggestions format

**Format**: `[query, [suggestions], [descriptions], [urls]]`

**Example Request**:
```bash
curl "https://search.internal.company.com/api/opensearch/suggestions?q=emp"
```

**Example Response**:
```json
[
  "emp",
  [
    "Employee Portal - Main Dashboard",
    "Employee Directory",
    "Employee Handbook"
  ],
  [],
  []
]
```

**Error Handling**:
- Query too short (< 2 chars): Returns empty suggestions
- Meilisearch unavailable: Returns empty suggestions with fallback
- Invalid query: Returns empty suggestions

## 🔍 Meilisearch API Endpoints

### GET /api/meilisearch/search

Performs search queries against the Meilisearch index.

**Parameters**:
- `q` (string): Search query
- `index` (string, optional): Index name (default: "internal_sites")
- `limit` (number, optional): Number of results (default: 10)
- `offset` (number, optional): Pagination offset (default: 0)
- `filter` (string, optional): Meilisearch filter expression

**Response**: JSON object with search results

**Example Request**:
```bash
curl "https://search.internal.company.com/api/meilisearch/search?q=portal&limit=5"
```

**Example Response**:
```json
{
  "query": "portal",
  "indexName": "internal_sites",
  "hits": [
    {
      "id": "portal-001",
      "name": "Employee Portal - Main Dashboard",
      "url": "https://portal.internal.company.com/dashboard",
      "description": "Central hub for employee resources",
      "type": "website"
    }
  ],
  "processingTimeMs": 12,
  "limit": 5,
  "offset": 0,
  "estimatedTotalHits": 1
}
```

### POST /api/meilisearch/search

Advanced search with more options via POST request.

**Request Body**:
```json
{
  "query": "string",
  "indexName": "string",
  "limit": 10,
  "offset": 0,
  "filter": "string",
  "sort": ["field:asc"],
  "facets": ["field1", "field2"],
  "attributesToHighlight": ["name", "description"],
  "attributesToRetrieve": ["id", "name", "url", "description", "type"]
}
```

**Response**: Same format as GET request

### POST /api/meilisearch/init

Initializes the Meilisearch index with sample data.

**Request Body**: None

**Response**: JSON object with initialization status

**Example Request**:
```bash
curl -X POST https://search.internal.company.com/api/meilisearch/init
```

**Example Response**:
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

**Error Responses**:
- `409 Conflict`: Index already exists
- `500 Internal Server Error`: Meilisearch connection failed

### DELETE /api/meilisearch/init

Deletes the search index.

**Response**: JSON confirmation message

**Example Request**:
```bash
curl -X DELETE https://search.internal.company.com/api/meilisearch/init
```

### GET /api/meilisearch/indexes

Lists all available Meilisearch indexes.

**Response**: JSON array of index information

**Example Response**:
```json
{
  "indexes": [
    {
      "uid": "internal_sites",
      "primaryKey": "id",
      "createdAt": "2025-01-14T10:30:00Z",
      "updatedAt": "2025-01-14T11:00:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/meilisearch/index

Gets information about a specific index.

**Parameters**:
- `name` (string, required): Index name

**Response**: JSON object with index statistics

**Example Request**:
```bash
curl "https://search.internal.company.com/api/meilisearch/index?name=internal_sites"
```

### POST /api/meilisearch/index

Creates a new Meilisearch index.

**Request Body**:
```json
{
  "indexName": "string",
  "primaryKey": "string"
}
```

### DELETE /api/meilisearch/index

Deletes a specific index.

**Parameters**:
- `name` (string, required): Index name to delete

### GET /api/meilisearch/documents

Retrieves documents from an index.

**Parameters**:
- `index` (string, required): Index name
- `limit` (number, optional): Number of documents (default: 20)
- `offset` (number, optional): Pagination offset (default: 0)

**Response**: JSON object with documents and pagination info

### POST /api/meilisearch/documents

Adds documents to an index.

**Request Body**:
```json
{
  "indexName": "string",
  "documents": [
    {
      "id": "unique-id",
      "name": "Document Name",
      "url": "https://example.com",
      "description": "Document description",
      "type": "document"
    }
  ]
}
```

### DELETE /api/meilisearch/documents

Deletes documents from an index.

**Request Body**:
```json
{
  "indexName": "string",
  "documentIds": ["id1", "id2"] // or single string "id1"
}
```

## 📊 Data Models

### SearchResult

```typescript
interface SearchResult {
  id: string
  url: string
  name: string
  description?: string
  type?: 'website' | 'document' | 'system' | 'database'
}
```

### SearchResponse

```typescript
interface SearchResponse {
  hits: SearchResult[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
}
```

## 🔒 Authentication & Security

### Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=optional_search_key
```

### Security Considerations

- **Internal Network Only**: All APIs are designed for internal network use
- **No Authentication Required**: Assumes internal network security
- **Rate Limiting**: Consider implementing rate limiting for production
- **Input Validation**: All inputs are validated and sanitized

## 🚨 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "error": "Invalid parameter",
  "details": "Query parameter 'q' is required"
}
```

#### 404 Not Found
```json
{
  "error": "Index not found",
  "details": "Index 'internal_sites' not found"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Failed to connect to Meilisearch"
}
```

### Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Missing parameters, invalid input |
| 404 | Not Found | Index doesn't exist, document not found |
| 409 | Conflict | Index already exists |
| 500 | Server Error | Meilisearch connection failed |

## 🧪 Testing

### Testing Script

Use the provided test script to verify all endpoints:

```bash
./scripts/test-opensearch.sh [BASE_URL]
```

### Manual Testing

#### Test OpenSearch Integration

```bash
# 1. Test XML descriptor
curl -H "Accept: application/opensearchdescription+xml" \
  https://search.internal.company.com/opensearch.xml

# 2. Test search redirect
curl -v "https://search.internal.company.com/api/opensearch/search?q=test"

# 3. Test suggestions
curl "https://search.internal.company.com/api/opensearch/suggestions?q=emp"
```

#### Test Meilisearch API

```bash
# 1. Initialize index
curl -X POST https://search.internal.company.com/api/meilisearch/init

# 2. Test search
curl "https://search.internal.company.com/api/meilisearch/search?q=portal"

# 3. Check index status
curl "https://search.internal.company.com/api/meilisearch/index?name=internal_sites"
```

## 📈 Performance

### Response Time Targets

| Endpoint | Target | Typical |
|----------|--------|---------|
| `/opensearch.xml` | < 100ms | ~50ms |
| `/api/opensearch/search` | < 200ms | ~100ms |
| `/api/opensearch/suggestions` | < 300ms | ~150ms |
| `/api/meilisearch/search` | < 500ms | ~200ms |

### Optimization Tips

1. **Caching**: OpenSearch XML is cached for 24 hours
2. **Indexing**: Keep search index optimized and updated
3. **Pagination**: Use limit/offset for large result sets
4. **Filtering**: Use Meilisearch filters to narrow results

## 🔄 Versioning

### API Versioning

Currently using v1 (implicit). Future versions will be explicitly versioned:

- `v1`: Current implementation
- `v2`: Future enhancements (planned)

### Backward Compatibility

- OpenSearch endpoints maintain backward compatibility
- Meilisearch endpoints follow semantic versioning
- Breaking changes will be announced with migration guides

---

**Last Updated**: January 2025  
**API Version**: 1.0.0 