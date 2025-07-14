# OpenSearch Integration Guide

This guide explains how to set up and use Chrome address bar search integration for your internal Ecton network.

## 🎯 Overview

OpenSearch is a web standard that allows websites to describe their search functionality to browsers. Once configured, users can search your internal network directly from Chrome's address bar, providing a seamless search experience similar to Google.

## 🚀 How It Works

1. **Discovery**: Chrome automatically detects the OpenSearch descriptor when visiting your site
2. **Integration**: Users can add Ecton Search as a search engine in Chrome
3. **Usage**: Type a keyword in the address bar, press Tab, enter query, press Enter
4. **Results**: Instantly redirected to search results from your internal systems

## 📋 Setup Instructions

### For System Administrators

#### 1. Prerequisites

- Next.js application running on your internal network
- Meilisearch instance running (localhost:7700 or custom host)
- SSL certificate (recommended for production)

#### 2. Environment Configuration

Create or update your `.env.local` file:

```bash
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_search_key_here
```

#### 3. Initialize Search Data

Run the initialization endpoint to set up sample data:

```bash
curl -X POST http://your-domain.com/api/meilisearch/init
```

#### 4. Verify Installation

Test the OpenSearch endpoints:

```bash
# Test XML descriptor
curl http://your-domain.com/opensearch.xml

# Test search endpoint
curl "http://your-domain.com/api/opensearch/search?q=portal"

# Test suggestions
curl "http://your-domain.com/api/opensearch/suggestions?q=emp"
```

### For End Users

#### Method 1: Automatic Detection (Recommended)

1. **Visit the Ecton Search Homepage**
   - Open Chrome and navigate to your internal Ecton Search URL
   - Example: `https://search.internal.company.com`

2. **Chrome Auto-Detection**
   - Chrome will automatically detect the OpenSearch descriptor
   - You may see a notification about adding a search engine
   - Click "Add" when prompted

#### Method 2: Manual Setup

1. **Open Chrome Settings**
   - Go to `chrome://settings/`
   - Navigate to "Search engine" → "Manage search engines"

2. **Add Search Engine**
   - Click "Add" next to "Other search engines"
   - Fill in the details:
     - **Search engine name**: `Ecton Search`
     - **Keyword**: `ecton` (or any short word you prefer)
     - **URL**: `https://your-domain.com/api/opensearch/search?q=%s`

3. **Set as Default (Optional)**
   - Click the three dots next to "Ecton Search"
   - Select "Make default" if you want it as your primary search engine

## 🔧 Usage Examples

### Quick Search from Address Bar

```
1. Type: ecton
2. Press: Tab (you'll see "Search Ecton Search")
3. Type: employee portal
4. Press: Enter
```

### Alternative Method

```
1. Type: ecton employee portal
2. Press: Enter
```

### Common Search Queries

- `ecton portal` - Find the employee portal
- `ecton finance reports` - Search financial documents
- `ecton help desk` - Find IT support
- `ecton calendar` - Access company calendar
- `ecton documents` - Find document management system

## 🎯 Features

### Real-time Suggestions

As you type in the address bar, you'll see autocomplete suggestions from your internal systems:

- **Instant Results**: Suggestions appear as you type
- **Relevant Content**: Powered by Meilisearch's intelligent search
- **Quick Access**: Click suggestions to jump directly to results

### Smart Redirects

The system intelligently redirects you to the most relevant results:

- **Direct Links**: For exact matches, redirects to the specific page
- **Search Results**: For general queries, shows comprehensive results
- **Fallback**: If no results found, provides helpful suggestions

### Security & Privacy

- **Internal Only**: All searches stay within your company network
- **No External Data**: No information sent to external services
- **Access Control**: Respects existing authentication and permissions

## 🛠️ Advanced Configuration

### Custom Keywords

You can set up multiple keywords for different search contexts:

1. **General Search**: `ecton` - searches everything
2. **Documents**: `docs` - searches only documents
3. **People**: `people` - searches employee directory
4. **Systems**: `sys` - searches internal systems

### Browser Bookmarks Integration

Create bookmarks for quick access:

- `ecton %s` - Quick search bookmark
- Drag to bookmarks bar for one-click access

### Mobile Support

The OpenSearch integration also works on mobile Chrome:

1. Add the search engine on desktop
2. Sign in to Chrome on mobile
3. Search engines sync automatically

## 📊 Monitoring & Analytics

### Usage Statistics

Monitor search usage through:

- **Server Logs**: Track API endpoint usage
- **Meilisearch Analytics**: View search patterns and popular queries
- **User Feedback**: Collect feedback on search relevance

### Performance Metrics

Key metrics to monitor:

- **Response Time**: API endpoint performance
- **Search Accuracy**: Relevance of results
- **User Adoption**: Number of users using address bar search

## 🔍 Troubleshooting

### Common Issues

#### Search Engine Not Detected

**Problem**: Chrome doesn't automatically detect the search engine

**Solutions**:
1. Ensure you've visited the homepage
2. Check that the site is served over HTTPS
3. Clear browser cache and revisit the site
4. Manually add the search engine

#### No Suggestions Appearing

**Problem**: Autocomplete suggestions don't show

**Solutions**:
1. Verify Meilisearch is running on localhost:7700
2. Check that the `internal_sites` index is initialized
3. Test the suggestions endpoint: `/api/opensearch/suggestions?q=test`

#### Search Results Not Loading

**Problem**: Searches don't return results

**Solutions**:
1. Initialize the search index: `POST /api/meilisearch/init`
2. Check Meilisearch connection
3. Verify environment variables are set correctly

#### Cannot Add Search Engine

**Problem**: Unable to add to Chrome search engines

**Solutions**:
1. Check Chrome version (should be recent)
2. Ensure OpenSearch XML is accessible at `/opensearch.xml`
3. Verify the XML format is valid

### Debug Commands

Test the integration with these commands:

```bash
# Test OpenSearch descriptor
curl -v https://your-domain.com/opensearch.xml

# Test search redirect
curl -v "https://your-domain.com/api/opensearch/search?q=portal"

# Test suggestions API
curl -v "https://your-domain.com/api/opensearch/suggestions?q=emp"

# Check Meilisearch status
curl http://localhost:7700/health
```

## 🎓 Best Practices

### For Users

1. **Use Descriptive Keywords**: Instead of "doc", try "financial documents"
2. **Learn Common Terms**: Familiarize yourself with system names and types
3. **Use Suggestions**: Pay attention to autocomplete suggestions for better results
4. **Bookmark Frequently Used**: Save common searches as bookmarks

### For Administrators

1. **Regular Updates**: Keep search index updated with new content
2. **Monitor Performance**: Watch API response times and user feedback
3. **Security Reviews**: Regularly review access controls and data exposure
4. **User Training**: Provide training sessions for new users

## 📈 Benefits

### For Individual Users

- **Faster Access**: No need to visit the search page first
- **Muscle Memory**: Works like any other search engine
- **Reduced Context Switching**: Stay in the address bar workflow
- **Intelligent Suggestions**: Get help finding the right resources

### For the Organization

- **Increased Productivity**: Faster access to internal resources
- **Better Resource Discovery**: Users find relevant content more easily
- **Reduced Support Tickets**: Self-service search capabilities
- **Standardized Access**: Consistent search experience across the company

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

1. **Index Updates**: Refresh search index monthly or as needed
2. **Performance Monitoring**: Check response times weekly
3. **User Feedback**: Collect and act on user suggestions
4. **Security Updates**: Keep all components updated

### Version Updates

When updating the system:

1. **Test in Staging**: Verify all endpoints work correctly
2. **Backup Data**: Export search index before updates
3. **Gradual Rollout**: Deploy to small groups first
4. **Monitor Metrics**: Watch for any performance degradation

---

**Need Help?** Contact your IT team or visit the [Ecton Search Help Desk](https://helpdesk.internal.company.com) 