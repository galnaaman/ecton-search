# OpenSearch Integration - Chrome Address Bar Search

This setup allows your team to search your internal Ecton network directly from Chrome's address bar (omnibox).

## 🚀 How It Works

Once configured, users can:
1. Type a short keyword (like `ecton`) in Chrome's address bar
2. Press Tab or Space
3. Type their search query
4. Press Enter to search your internal network directly

## 📋 Setup Instructions

### For System Administrators

1. **Deploy the Application**
   - Ensure your Ecton Search application is running on your internal network
   - Make sure Meilisearch is running and initialized with your internal data

2. **SSL Certificate (Recommended)**
   - For best browser compatibility, serve your application over HTTPS
   - Chrome works better with OpenSearch over secure connections

### For End Users

1. **Visit the Ecton Search Homepage**
   - Open Chrome and navigate to your internal Ecton Search URL
   - Example: `https://search.internal.company.com`

2. **Chrome Will Auto-Detect the Search Engine**
   - Chrome automatically detects the OpenSearch descriptor
   - You may see a notification about adding a search engine

3. **Manual Setup (if needed)**
   - Go to Chrome Settings → Search Engine → Manage search engines
   - Click "Add" next to "Other search engines"
   - Fill in:
     - **Search engine name**: Ecton Search
     - **Keyword**: `ecton` (or any short word)
     - **URL**: `https://your-domain.com/api/opensearch/search?q=%s`

4. **Set as Default (Optional)**
   - In the same settings page, you can set Ecton Search as your default search engine
   - Click the three dots next to "Ecton Search" and select "Make default"

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

## 🎯 Features

- **Real-time Suggestions**: Get autocomplete suggestions as you type
- **Fast Redirects**: Instantly redirected to search results
- **Internal Network Focus**: Searches only your company's internal resources
- **Secure**: Works entirely within your internal network

## 🛠️ Technical Details

### API Endpoints

- **Search**: `/api/opensearch/search?q={query}`
  - Redirects to the search results page
  
- **Suggestions**: `/api/opensearch/suggestions?q={query}`
  - Returns JSON array of search suggestions
  
- **Descriptor**: `/opensearch.xml`
  - Dynamic OpenSearch XML descriptor

### OpenSearch Specification

The implementation follows the [OpenSearch 1.1 specification](https://github.com/dewitt/opensearch):

- **ShortName**: Ecton Search
- **Description**: Internal network search
- **Input/Output Encoding**: UTF-8
- **Search URL Template**: Dynamic based on domain
- **Suggestions URL Template**: JSON-based autocomplete

## 🔍 Troubleshooting

### Search Engine Not Detected
1. Ensure you've visited the homepage
2. Check that the site is served over HTTPS
3. Clear browser cache and revisit the site

### Suggestions Not Working
1. Verify Meilisearch is running on `localhost:7700`
2. Check that the `internal_sites` index is initialized
3. Test the suggestions endpoint directly: `/api/opensearch/suggestions?q=test`

### Cannot Add Search Engine
1. Check Chrome version (should be recent)
2. Ensure OpenSearch XML is accessible at `/opensearch.xml`
3. Verify the XML format is valid

## 📊 Testing the Integration

1. **Test OpenSearch Descriptor**:
   ```bash
   curl https://your-domain.com/opensearch.xml
   ```

2. **Test Search Endpoint**:
   ```bash
   curl "https://your-domain.com/api/opensearch/search?q=portal"
   ```

3. **Test Suggestions**:
   ```bash
   curl "https://your-domain.com/api/opensearch/suggestions?q=emp"
   ```

## 🎯 Benefits for Your Team

- **Faster Access**: No need to visit the search page first
- **Muscle Memory**: Works like any other search engine
- **Productivity**: Search internal resources as easily as Google
- **Context Switching**: Reduces workflow interruption

## 🔒 Security Considerations

- Works entirely within your internal network
- No external data transmission
- Private search index with company resources only
- Respects existing authentication and access controls

---

**Need Help?** Contact your IT team or visit the [Ecton Search Help Desk](https://helpdesk.internal.company.com). 