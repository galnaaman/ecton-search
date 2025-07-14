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

## 🔐 Developer Portal API Endpoints

### Authentication Endpoints

#### POST /api/auth/login

Authenticates a user and returns a JWT token.

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "clxx123...",
    "username": "admin",
    "role": "admin"
  }
}
```

**Status Codes**:
- `200`: Successful login
- `401`: Invalid credentials
- `400`: Missing username or password

#### POST /api/auth/logout

Logs out the current user (client-side token removal).

**Response**:
```json
{
  "message": "Logout successful"
}
```

#### POST /api/auth/init

Initializes the database and creates default admin user.

**Response**:
```json
{
  "message": "Database initialized successfully",
  "hasDefaultAdmin": true,
  "siteCount": 0
}
```

### Site Management Endpoints

All site management endpoints require authentication via Bearer token:

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### GET /api/developer/sites

Lists all sites with pagination and search.

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search query

**Response**:
```json
{
  "sites": [
    {
      "id": "clxx123...",
      "name": "Company Portal",
      "url": "https://portal.company.com",
      "description": "Main company portal",
      "type": "website",
      "createdAt": "2025-01-14T12:00:00Z",
      "updatedAt": "2025-01-14T12:00:00Z",
      "createdByUser": {
        "username": "admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### POST /api/developer/sites

Creates a new site.

**Request Body**:
```json
{
  "name": "HR Portal",
  "url": "https://hr.company.com",
  "description": "Human Resources portal",
  "type": "website"
}
```

**Response**:
```json
{
  "message": "Site created successfully",
  "site": {
    "id": "clxx456...",
    "name": "HR Portal",
    // ... full site object
  }
}
```

#### PUT /api/developer/sites/[id]

Updates an existing site.

**Request Body**: Same as POST

**Response**: Same as POST

#### DELETE /api/developer/sites/[id]

Deletes a site.

**Response**:
```json
{
  "message": "Site deleted successfully"
}
```

#### POST /api/developer/sync

Synchronizes all sites from PostgreSQL to Meilisearch.

**Response**:
```json
{
  "message": "Meilisearch synchronized successfully",
  "syncedCount": 42
}
```

### Analytics Endpoints

#### GET /api/developer/analytics

Retrieves search analytics data.

**Query Parameters**:
- `days` (number): Number of days to look back (default: 7)
- `limit` (number): Limit for top queries (default: 10)

**Response**:
```json
{
  "overview": {
    "totalSearches": 1234,
    "uniqueQueries": 456,
    "avgResultsPerQuery": 12.5,
    "dateRange": {
      "start": "2025-01-07T00:00:00Z",
      "end": "2025-01-14T00:00:00Z",
      "days": 7
    }
  },
  "searchVolume": [
    {
      "date": "2025-01-14",
      "count": 234
    }
  ],
  "topQueries": [
    {
      "query": "employee handbook",
      "count": 45,
      "avg_results": 8.5
    }
  ],
  "noResultQueries": [
    {
      "query": "vacation policy 2025",
      "count": 12
    }
  ]
}
```

#### POST /api/developer/analytics

Exports analytics data.

**Request Body**:
```json
{
  "format": "csv", // or "json"
  "days": 30
}
```

**Response**:
- For CSV: Returns CSV file with appropriate headers
- For JSON: Returns full analytics data in JSON format

## 🔒 Authentication & Security

### Environment Variables

Required environment variables:

```bash
# Meilisearch
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=optional_search_key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecton

# Authentication
JWT_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Security Considerations

- **JWT Authentication**: Developer portal requires JWT tokens
- **Password Hashing**: Passwords hashed with bcrypt (12 rounds)
- **Internal Network Only**: All APIs designed for internal use
- **Input Validation**: All inputs validated and sanitized
- **Audit Logging**: All changes tracked in audit log

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