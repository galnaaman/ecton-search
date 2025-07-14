# Developer Portal Documentation

## Overview

The Developer Portal is a secure administrative interface for managing the Ecton search engine content. It provides authentication, site management, automatic Meilisearch synchronization, and comprehensive search analytics.

## Features

### 1. Authentication System
- JWT-based authentication with secure token management
- Default admin user for initial setup
- Role-based access control (admin/developer)
- Session management with automatic redirect

### 2. Site Management
- Full CRUD operations for search content
- Real-time Meilisearch synchronization
- Audit logging for all changes
- Pagination and search functionality

### 3. Search Analytics
- Automatic tracking of all searches
- Visual analytics dashboard
- Export functionality (CSV/JSON)
- Insights into popular queries and content gaps

## Architecture Flow

### Authentication Flow

```
User Login → /developer
     ↓
Login Form → POST /api/auth/login
     ↓
Validate Credentials (bcrypt)
     ↓
Generate JWT Token
     ↓
Store in LocalStorage
     ↓
Redirect to Dashboard
```

### Site Management Flow

```
Dashboard → /developer/dashboard
     ↓
Fetch Sites → GET /api/developer/sites
     ↓
CRUD Operations:
- Create → POST /api/developer/sites
- Update → PUT /api/developer/sites/[id]
- Delete → DELETE /api/developer/sites/[id]
     ↓
Audit Log Created
     ↓
Manual Sync → POST /api/developer/sync
     ↓
Meilisearch Updated
```

### Analytics Flow

```
User Search → /api/meilisearch/search
     ↓
Search Meilisearch Index
     ↓
Track Analytics (async)
     ↓
Store in PostgreSQL
     ↓
Analytics Dashboard → GET /api/developer/analytics
     ↓
Aggregate Data
     ↓
Display Charts/Metrics
```

## Database Schema

### Users Table
```sql
- id: UUID (Primary Key)
- username: String (Unique)
- password_hash: String
- role: String (admin/developer)
- created_at: Timestamp
```

### Sites Table
```sql
- id: UUID (Primary Key)
- name: String
- url: String
- description: String (Optional)
- type: String (website/document/system/database)
- created_by: UUID (Foreign Key → Users)
- created_at: Timestamp
- updated_at: Timestamp
```

### Search Analytics Table
```sql
- id: UUID (Primary Key)
- query: String
- results_count: Integer
- clicked_result_id: String (Optional)
- user_ip: String (Optional)
- user_agent: String (Optional)
- created_at: Timestamp
```

### Audit Log Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → Users)
- action: String (create/update/delete)
- site_id: UUID (Foreign Key → Sites)
- changes: JSON
- created_at: Timestamp
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/init` - Initialize database and create admin

### Site Management
- `GET /api/developer/sites` - List sites (paginated)
- `POST /api/developer/sites` - Create new site
- `GET /api/developer/sites/[id]` - Get site details
- `PUT /api/developer/sites/[id]` - Update site
- `DELETE /api/developer/sites/[id]` - Delete site
- `POST /api/developer/sync` - Sync to Meilisearch

### Analytics
- `GET /api/developer/analytics` - Get analytics data
- `POST /api/developer/analytics` - Export analytics (CSV/JSON)

## Security Features

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with 24-hour expiration
- Bearer token authentication for API requests
- Automatic session validation

### Authorization
- All developer endpoints require authentication
- Role-based access control ready for expansion
- Audit logging for compliance

### Data Protection
- Input validation on all endpoints
- SQL injection prevention with Prisma
- XSS protection with React
- CORS headers configured

## Usage Guide

### Initial Setup

1. Start PostgreSQL database:
```bash
docker compose up -d postgres
```

2. Run database migrations:
```bash
npx prisma migrate dev
```

3. Start the application:
```bash
npm run dev
```

4. Access the developer portal:
- Navigate to http://localhost:3000
- Click "Developer Portal" in the footer
- Login with default credentials:
  - Username: `admin`
  - Password: `admin123`

### Managing Sites

1. **Add a Site**:
   - Click "Add Site" button
   - Fill in the form (name, URL, description, type)
   - Click "Create Site"
   - Site is automatically synced to Meilisearch

2. **Edit a Site**:
   - Click the edit icon next to a site
   - Update the information
   - Click "Update Site"
   - Changes are logged and synced

3. **Delete a Site**:
   - Click the delete icon
   - Confirm the deletion
   - Site is removed from both database and Meilisearch

4. **Manual Sync**:
   - Click "Sync to Meilisearch" to force synchronization
   - Useful if Meilisearch was offline during changes

### Viewing Analytics

1. **Access Analytics**:
   - From the dashboard, click "Analytics" button
   - Select time range (7, 14, 30, or 90 days)

2. **Metrics Available**:
   - Total searches
   - Unique queries
   - Average results per query
   - Search volume trend chart
   - Top queries with search count
   - Queries returning no results

3. **Export Data**:
   - Click "Export CSV" for spreadsheet format
   - Click "Export JSON" for programmatic use
   - Data includes all searches for selected period

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecton

# JWT Authentication
JWT_SECRET=your-secret-key

# Default Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Meilisearch
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your-api-key
```

### Customization

1. **Change Admin Password**:
   - Update `ADMIN_PASSWORD` in `.env`
   - Delete existing admin from database
   - Restart application to recreate admin

2. **Add Site Types**:
   - Update type options in `site-form.tsx`
   - Update database schema if needed
   - Run migrations

3. **Customize Analytics**:
   - Modify tracking in `/api/meilisearch/search`
   - Add new metrics in `/api/developer/analytics`
   - Update dashboard visualization

## Troubleshooting

### Common Issues

1. **"Failed to fetch analytics"**
   - Ensure PostgreSQL is running
   - Check database connection string
   - Verify user has proper permissions

2. **"Unauthorized" errors**
   - Token may have expired (24-hour limit)
   - Log out and log in again
   - Check JWT_SECRET matches

3. **Sites not appearing in search**
   - Ensure Meilisearch is running
   - Click "Sync to Meilisearch"
   - Check Meilisearch logs for errors

4. **BigInt serialization error**
   - Already fixed in latest version
   - Ensure analytics API converts BigInt to Number

### Debug Mode

Enable debug logging by setting:
```javascript
console.log('Debug:', data)  // Add to API endpoints
```

Check browser console and terminal for errors.

## Future Enhancements

### Planned Features
1. User management interface
2. Bulk import/export of sites
3. Real-time analytics dashboard
4. Search performance metrics
5. A/B testing for search algorithms
6. API rate limiting per user
7. Webhook notifications for changes

### Integration Points
1. External authentication (LDAP/OAuth)
2. CI/CD pipeline integration
3. Backup and restore functionality
4. Multi-tenancy support
5. Advanced analytics with Grafana

## Code Examples

### Adding Custom Analytics

```typescript
// Track click events
await prisma.searchAnalytics.update({
  where: { id: searchId },
  data: { clickedResultId: resultId }
})
```

### Custom Site Types

```typescript
// Add new type to schema
type: String @default("website") // "website", "document", "system", "database", "api"

// Update form options
<option value="api">API Documentation</option>
```

### Extending Authentication

```typescript
// Add user preferences
interface AuthUser {
  id: string
  username: string
  role: string
  preferences?: {
    theme: 'light' | 'dark'
    pageSize: number
  }
}
```