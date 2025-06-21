import { meilisearchClient } from './meilisearch'
import { SearchResult, SearchResponse } from '../app/types'

export class SearchService {
  private static instance: SearchService
  private indexName = 'internal_sites'

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService()
    }
    return SearchService.instance
  }

  async search(query: string, limit: number = 10, offset: number = 0): Promise<SearchResponse> {
    try {
      const index = meilisearchClient.getIndex(this.indexName)
      
      const searchResponse = await index.search(query, {
        limit,
        offset,
        attributesToRetrieve: ['id', 'name', 'url', 'description', 'type'],
        attributesToHighlight: ['name', 'description'],
      })

      return {
        hits: searchResponse.hits as SearchResult[],
        query: searchResponse.query || query,
        processingTimeMs: searchResponse.processingTimeMs,
        limit: searchResponse.limit,
        offset: searchResponse.offset || 0,
        estimatedTotalHits: searchResponse.estimatedTotalHits
      }
    } catch (error) {
      console.error('Meilisearch error:', error)
      throw new Error('Search service unavailable')
    }
  }

  async indexDocuments(documents: SearchResult[]): Promise<void> {
    try {
      const index = meilisearchClient.getIndex(this.indexName)
      
      await index.addDocuments(documents, {
        primaryKey: 'id'
      })
      
      console.log(`Indexed ${documents.length} documents`)
    } catch (error) {
      console.error('Indexing error:', error)
      throw new Error('Failed to index documents')
    }
  }

  async deleteIndex(): Promise<void> {
    try {
      const index = meilisearchClient.getIndex(this.indexName)
      await index.delete()
      console.log('Index deleted successfully')
    } catch (error) {
      console.error('Delete index error:', error)
      throw new Error('Failed to delete index')
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const index = meilisearchClient.getIndex(this.indexName)
      return await index.getStats()
    } catch (error) {
      console.error('Stats error:', error)
      throw new Error('Failed to get index stats')
    }
  }
}

export const searchService = SearchService.getInstance()

export const sampleData: SearchResult[] = [
  {
    id: "portal-001",
    name: "Employee Portal - Main Dashboard",
    url: "https://portal.internal.company.com/dashboard",
    description: "Central hub for employee resources, HR forms, payroll information, and company announcements",
    type: "website"
  },
  {
    id: "finance-001", 
    name: "Financial System - Budget Reports",
    url: "https://finance.internal.company.com/reports",
    description: "Access quarterly budget reports, expense tracking, and financial analytics dashboard",
    type: "system"
  },
  {
    id: "docs-001",
    name: "Document Management System",
    url: "https://docs.internal.company.com",
    description: "Centralized document storage, version control, and collaboration platform for all company files",
    type: "document"
  },
  {
    id: "crm-001",
    name: "Customer Relationship Management",
    url: "https://crm.internal.company.com",
    description: "Customer database, sales pipeline, and client communication tracking system",
    type: "database"
  },
  {
    id: "helpdesk-001",
    name: "IT Support & Help Desk",
    url: "https://helpdesk.internal.company.com",
    description: "Submit IT tickets, access knowledge base, and track support request status",
    type: "website"
  },
  {
    id: "inventory-001",
    name: "Inventory Management System",
    url: "https://inventory.internal.company.com",
    description: "Track office supplies, equipment, and asset management across all locations",
    type: "system"
  },
  {
    id: "wiki-001",
    name: "Company Wiki & Knowledge Base",
    url: "https://wiki.internal.company.com",
    description: "Internal documentation, procedures, policies, and institutional knowledge repository",
    type: "document"
  },
  {
    id: "monitoring-001",
    name: "System Monitoring Dashboard", 
    url: "https://monitoring.internal.company.com",
    description: "Real-time server monitoring, network status, and infrastructure health metrics",
    type: "system"
  }
] 