# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 13.4.11 application called "Ecton" - an internal company search engine powered by Meilisearch. It provides a Google-like search interface for internal company resources, documents, and systems.

## Essential Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server (http://localhost:3000)
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Docker Development
```bash
docker-compose up --build    # Start both Meilisearch and Next.js app
docker build -t ecton .      # Build Docker image only
docker run -p 3000:3000 ecton # Run Docker container
```

### Initialize Search Data
After starting the application, initialize Meilisearch with sample data:
```bash
curl -X POST http://localhost:3000/api/meilisearch/init
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 13.4.11 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Radix UI + Framer Motion
- **Search Engine**: Meilisearch v0.33.0
- **Database**: PostgreSQL 15 with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Docker with standalone output

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/meilisearch/` - RESTful API for all Meilisearch operations
- `src/app/api/auth/` - Authentication endpoints (login, logout, init)
- `src/app/api/developer/` - Developer portal APIs (sites, analytics, sync)
- `src/app/developer/` - Developer portal UI pages
- `src/components/` - Reusable React components
- `src/components/ui/` - UI component library (buttons, tables, animations)
- `src/components/developer/` - Developer portal specific components
- `src/lib/` - Utilities and service singletons
- `prisma/` - Database schema and migrations

### Core Components Architecture

1. **Search Flow**:
   - `HomePage` (src/app/page.tsx) → Google-like search interface
   - `SearchInput` component → Handles user input and autocomplete
   - `SearchPage` (src/app/search/page.tsx) → Displays results in DataTable
   - `meilisearch.ts` → Singleton client for Meilisearch connection

2. **Developer Portal Flow**:
   - `DeveloperPortal` (src/app/developer/page.tsx) → Login interface
   - `DeveloperDashboard` (src/app/developer/dashboard/page.tsx) → Site management
   - `AnalyticsDashboard` (src/app/developer/dashboard/analytics/page.tsx) → Search analytics
   - Authentication via JWT tokens with 24-hour expiry

3. **API Architecture**:
   - Meilisearch APIs: Search and index management
   - Authentication APIs: Login, logout, initialization
   - Developer APIs: Site CRUD, analytics, synchronization
   - All endpoints follow RESTful patterns with proper error handling

4. **Database Architecture**:
   - PostgreSQL with Prisma ORM
   - Models: Users, Sites, SearchAnalytics, AuditLog
   - Automatic migrations and type-safe queries
   - Audit logging for all site changes

5. **UI Component System**:
   - All UI components use `cn()` utility for className merging
   - Components follow compound pattern (e.g., Table.Root, Table.Header)
   - Animation components use Framer Motion
   - Developer portal components for forms, tables, and charts

### Environment Configuration

Required environment variables:
```bash
# Meilisearch Configuration
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_api_key_here

# Database Configuration
DATABASE_URL=postgresql://ecton_user:ecton_password@localhost:5432/ecton

# Authentication Configuration
JWT_SECRET=your-jwt-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Docker Architecture

The project uses a multi-stage Dockerfile optimized for production:
- Stage 1: Dependencies installation
- Stage 2: Build with standalone output
- Stage 3: Minimal runtime with non-root user

Docker Compose orchestrates:
- Meilisearch on port 7700 with persistent volume
- Next.js app on port 3000
- Internal network for service communication

### Data Structure

Meilisearch documents follow this schema:
```typescript
{
  id: string;
  name: string;
  url: string;
  description: string;
  type: "website" | "document" | "system" | "database";
}
```

### Key Patterns

1. **Singleton Pattern**: Meilisearch client (src/lib/meilisearch.ts)
2. **Server Components**: Pages use async/await for data fetching
3. **API Route Handlers**: Consistent error handling and response format
4. **Component Composition**: UI components built with Radix UI primitives
5. **Type Safety**: Strict TypeScript with defined interfaces for all data

### Testing Approach

Currently no test framework is configured. When adding tests:
1. Consider using Jest + React Testing Library for component tests
2. Use MSW for mocking Meilisearch API calls
3. Add API route tests with Next.js built-in testing utils