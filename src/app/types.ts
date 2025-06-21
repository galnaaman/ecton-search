export interface SearchResult {
  id: string
  url: string
  name: string
  description?: string
  type?: 'website' | 'document' | 'system' | 'database'
}

export interface SearchResponse {
  hits: SearchResult[]
  query: string
  processingTimeMs: number
  limit: number
  offset: number
  estimatedTotalHits: number
} 