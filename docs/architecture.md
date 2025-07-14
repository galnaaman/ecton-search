# Architecture Overview

This document provides a comprehensive technical overview of the Ecton Search OpenSearch integration architecture.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Chrome Browser  │  Firefox Browser  │  Safari Browser  │  Edge  │
│  ┌─────────────┐ │  ┌─────────────┐  │  ┌─────────────┐ │  ┌───┐ │
│  │ Address Bar │ │  │ Address Bar │  │  │ Address Bar │ │  │...│ │
│  │ OpenSearch  │ │  │ OpenSearch  │  │  │ OpenSearch  │ │  │   │ │
│  └─────────────┘ │  └─────────────┘  │  └─────────────┘ │  └───┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Load Balancer / Proxy                      │
├─────────────────────────────────────────────────────────────────┤
│              Nginx / Apache / AWS ALB / Cloudflare             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ SSL/TLS     │ │ Rate Limit  │ │ Compression │ │ Caching   │ │
│  │ Termination │ │ Protection  │ │ (gzip/br)   │ │ (Static)  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                          │
├─────────────────────────────────────────────────────────────────┤
│                        Next.js App                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ OpenSearch  │ │ Meilisearch │ │ Search Results  │   │   │
│  │  │ Endpoints   │ │ API Proxy   │ │ Pages           │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Frontend Components                   │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ Search UI   │ │ Autocomplete│ │ Results Display │   │   │
│  │  │ Components  │ │ Suggestions │ │ Components      │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ TCP/HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Search Engine Layer                       │
├─────────────────────────────────────────────────────────────────┤
│                        Meilisearch                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Search Index                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ Documents   │ │ Inverted    │ │ Faceted Search  │   │   │
│  │  │ Storage     │ │ Index       │ │ Filters         │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Configuration                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │   │
│  │  │ Searchable  │ │ Filterable  │ │ Ranking Rules   │   │   │
│  │  │ Attributes  │ │ Attributes  │ │ & Stop Words    │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ File System
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Storage Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │ Index Data  │ │ Logs        │ │ Configuration Files     │   │
│  │ (LMDB)      │ │ (JSON/Text) │ │ (.env, docker-compose)  │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Component Details

### OpenSearch Integration Layer

The OpenSearch integration consists of three main API endpoints:

#### 1. OpenSearch Descriptor (`/opensearch.xml`)

**Purpose**: Provides browser-discoverable search engine metadata

**Technical Details**:
- **Protocol**: HTTP/HTTPS
- **Content-Type**: `application/opensearchdescription+xml`
- **Caching**: 24-hour cache control
- **Dynamic Generation**: URLs auto-generated based on request domain

**Implementation**:
```typescript
// src/app/opensearch.xml/route.ts
export async function GET(request: NextRequest) {
  const { protocol, host } = new URL(request.url)
  const baseUrl = `${protocol}//${host}`
  
  const opensearchXml = `<?xml version="1.0" encoding="UTF-8"?>
  <OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
    <ShortName>Ecton Search</ShortName>
    <Url type="text/html" template="${baseUrl}/api/opensearch/search?q={searchTerms}"/>
    <Url type="application/x-suggestions+json" template="${baseUrl}/api/opensearch/suggestions?q={searchTerms}"/>
  </OpenSearchDescription>`
  
  return new NextResponse(opensearchXml, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
```

#### 2. Search Handler (`/api/opensearch/search`)

**Purpose**: Processes browser search queries and redirects to results

**Technical Details**:
- **Method**: GET
- **Parameters**: `q` (search query)
- **Response**: HTTP 307 Temporary Redirect
- **Error Handling**: Graceful fallback to homepage

**Flow**:
```
Browser Search → OpenSearch API → Validation → Redirect → Search Results Page
```

#### 3. Suggestions API (`/api/opensearch/suggestions`)

**Purpose**: Provides real-time autocomplete suggestions

**Technical Details**:
- **Method**: GET
- **Parameters**: `q` (query, minimum 2 characters)
- **Response Format**: OpenSearch Suggestions JSON
- **Debouncing**: Client-side 150ms debounce
- **Caching**: No caching (real-time results)

**Response Format**:
```json
[
  "query_string",
  ["suggestion1", "suggestion2", "suggestion3"],
  ["description1", "description2", "description3"],
  ["url1", "url2", "url3"]
]
```

### Next.js Application Layer

#### API Architecture

**Routing Structure**:
```
src/app/api/
├── opensearch/
│   ├── search/route.ts          # Browser search handler
│   └── suggestions/route.ts     # Autocomplete suggestions
├── meilisearch/
│   ├── search/route.ts          # Direct search API
│   ├── init/route.ts            # Index initialization
│   ├── documents/route.ts       # Document management
│   ├── index/route.ts           # Index management
│   └── indexes/route.ts         # List all indexes
└── opensearch.xml/route.ts      # OpenSearch descriptor
```

#### Frontend Architecture

**Component Hierarchy**:
```
Page Components
├── HomePage (/)
│   ├── SearchInput (with autocomplete)
│   ├── FloatingDock (navigation)
│   └── SparklesCore (visual effects)
└── SearchPage (/search)
    ├── SearchInput (header variant)
    ├── SearchResults (list display)
    └── Pagination (result navigation)

Shared Components
├── SearchInput
│   ├── PlaceholdersAndVanishInput (animated input)
│   ├── Autocomplete dropdown
│   └── Keyboard navigation
├── UI Components
│   ├── Button, Badge, Input
│   ├── Table, Dropdown
│   └── FloatingDock, DockBar
└── Effects
    ├── SparklesCore (particle system)
    └── Spotlight (lighting effect)
```

#### State Management

**Client State**:
```typescript
// Search Input Component State
interface SearchInputState {
  searchQuery: string
  suggestions: SearchSuggestion[]
  showSuggestions: boolean
  selectedIndex: number
  isLoading: boolean
}

// Search Results Page State
interface SearchPageState {
  searchResults: SearchResult[]
  isLoading: boolean
  searchStats: {
    totalHits: number
    processingTime: number
  }
}
```

### Meilisearch Integration

#### Index Configuration

**Primary Index**: `internal_sites`

**Schema**:
```typescript
interface SearchDocument {
  id: string              // Primary key
  name: string           // Searchable
  url: string            // Displayed
  description?: string   // Searchable
  type: DocumentType     // Filterable
}

type DocumentType = 'website' | 'document' | 'system' | 'database'
```

**Index Settings**:
```json
{
  "searchableAttributes": ["name", "description"],
  "filterableAttributes": ["type"],
  "sortableAttributes": ["name"],
  "rankingRules": [
    "words",
    "typo", 
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ],
  "stopWords": ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]
}
```

#### Search Performance

**Optimization Strategies**:

1. **Attribute Optimization**:
   - Limited searchable attributes (name, description only)
   - Specific filterable attributes (type only)
   - No unnecessary sortable attributes

2. **Query Optimization**:
   - Client-side debouncing (150ms)
   - Minimum query length (2 characters)
   - Limited result sets (8 suggestions, 20 search results)

3. **Caching Strategy**:
   - OpenSearch XML: 24 hours
   - Search results: No caching (real-time)
   - Static assets: 1 year

## 🔄 Data Flow

### Search Request Flow

```
1. User Input
   ├── Homepage Search Input
   └── Browser Address Bar
          │
          ▼
2. Client Processing
   ├── Input Validation
   ├── Debouncing (150ms)
   └── Query Formatting
          │
          ▼
3. API Request
   ├── /api/opensearch/search (redirect)
   ├── /api/opensearch/suggestions (autocomplete)
   └── /api/meilisearch/search (direct)
          │
          ▼
4. Meilisearch Processing
   ├── Query Parsing
   ├── Index Search
   ├── Ranking & Scoring
   └── Result Formatting
          │
          ▼
5. Response Processing
   ├── Result Transformation
   ├── Error Handling
   └── Response Caching
          │
          ▼
6. Client Rendering
   ├── Results Display
   ├── Suggestion Dropdown
   └── State Updates
```

### Autocomplete Flow

```
User Types → Debounce (150ms) → API Call → Meilisearch Query → 
Results Transform → Dropdown Display → Selection → Search Redirect
```

## 🔒 Security Architecture

### Network Security

**Security Layers**:
1. **Reverse Proxy** (Nginx/ALB)
   - SSL/TLS termination
   - Rate limiting
   - DDoS protection
   - Request filtering

2. **Application Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF tokens (if needed)

3. **Internal Network**
   - Firewall rules
   - VPN access
   - Network segmentation

### Data Security

**Protection Mechanisms**:
- **Encryption at Rest**: Meilisearch data encryption
- **Encryption in Transit**: HTTPS/TLS
- **Access Control**: Internal network only
- **Input Sanitization**: All user inputs validated
- **Output Encoding**: XSS prevention

## 📊 Performance Architecture

### Scalability Design

**Horizontal Scaling**:
```
Load Balancer
├── Next.js Instance 1 ──┐
├── Next.js Instance 2 ──┼── Meilisearch Cluster
└── Next.js Instance N ──┘   ├── Master Node
                             ├── Replica Node 1
                             └── Replica Node N
```

**Vertical Scaling**:
- **CPU**: Multi-core processing for concurrent requests
- **Memory**: Adequate RAM for index caching
- **Storage**: SSD for fast index access
- **Network**: High bandwidth for API responses

### Performance Metrics

**Target Performance**:
| Component | Metric | Target | Monitoring |
|-----------|--------|---------|------------|
| OpenSearch XML | Response Time | < 100ms | Nginx logs |
| Search API | Response Time | < 500ms | Application metrics |
| Suggestions API | Response Time | < 300ms | Application metrics |
| Meilisearch | Query Time | < 200ms | Meilisearch metrics |
| Frontend | Time to Interactive | < 2s | Web Vitals |

### Caching Strategy

**Multi-Layer Caching**:
```
Browser Cache (Static Assets)
        ↓
CDN/Proxy Cache (OpenSearch XML)
        ↓
Application Cache (API Responses)
        ↓
Meilisearch Internal Cache (Index Data)
```

## 🛠️ Development Architecture

### Build & Deployment Pipeline

```
Development
├── Local Development (npm run dev)
├── Testing (Jest, Playwright)
└── Code Quality (ESLint, TypeScript)
        │
        ▼
Staging
├── Docker Build
├── Integration Testing
└── Performance Testing
        │
        ▼
Production
├── Container Deployment
├── Health Checks
└── Monitoring Setup
```

### Environment Configuration

**Environment Separation**:
```typescript
// Development
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NODE_ENV=development
DEBUG=true

// Staging  
NEXT_PUBLIC_MEILISEARCH_URL=http://staging-search:7700
NODE_ENV=staging
LOG_LEVEL=info

// Production
NEXT_PUBLIC_MEILISEARCH_URL=http://prod-search:7700
NODE_ENV=production
LOG_LEVEL=warn
```

## 🔍 Monitoring Architecture

### Observability Stack

**Metrics Collection**:
```
Application Metrics (Custom)
        ↓
Prometheus (Metrics Storage)
        ↓
Grafana (Visualization)
        ↓
AlertManager (Alerting)
```

**Logging Pipeline**:
```
Application Logs
        ↓
Log Aggregation (Fluentd/Logstash)
        ↓
Log Storage (Elasticsearch/Loki)
        ↓
Log Analysis (Kibana/Grafana)
```

**Health Checks**:
- **Application**: `/api/health`
- **Meilisearch**: `/health`
- **OpenSearch**: `/opensearch.xml`
- **End-to-End**: Search functionality test

## 🚀 Future Architecture Considerations

### Planned Enhancements

1. **Microservices Architecture**
   - Separate search service
   - Dedicated suggestion service
   - Independent scaling

2. **Advanced Search Features**
   - Federated search across multiple indexes
   - Machine learning relevance scoring
   - Personalized search results

3. **Enhanced Security**
   - OAuth2/OIDC integration
   - Role-based access control
   - Audit logging

4. **Performance Improvements**
   - Redis caching layer
   - CDN integration
   - Search result pre-loading

### Migration Path

**Phase 1**: Current monolithic Next.js app
**Phase 2**: Extract search service
**Phase 3**: Implement microservices
**Phase 4**: Add advanced features

---

**Last Updated**: January 2025  
**Architecture Version**: 1.0.0  
**Architect**: Ecton Technical Team 