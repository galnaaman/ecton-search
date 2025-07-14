# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Ecton Search OpenSearch integration.

## 🚨 Quick Diagnostics

### System Health Check

Run this quick diagnostic to check overall system health:

```bash
#!/bin/bash
echo "🔍 Ecton Search Health Check"
echo "=========================="

# 1. Check Next.js application
echo "1. Testing Next.js application..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "❌ Next.js not responding"

# 2. Check Meilisearch
echo "2. Testing Meilisearch..."
curl -s http://localhost:7700/health || echo "❌ Meilisearch not responding"

# 3. Check OpenSearch XML
echo "3. Testing OpenSearch descriptor..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/opensearch.xml || echo "❌ OpenSearch XML not accessible"

# 4. Check search functionality
echo "4. Testing search API..."
curl -s "http://localhost:3000/api/meilisearch/search?q=test" | grep -q "hits" || echo "❌ Search API not working"

echo "✅ Health check complete"
```

## 🔧 Common Issues & Solutions

### 1. Chrome Not Detecting Search Engine

#### Symptoms
- OpenSearch integration not appearing in Chrome
- No option to add search engine
- Chrome doesn't show search engine notification

#### Diagnosis
```bash
# Check if OpenSearch XML is accessible
curl -v http://localhost:3000/opensearch.xml

# Verify content type
curl -I http://localhost:3000/opensearch.xml | grep "content-type"
```

#### Solutions

**Solution 1: Clear Browser Cache**
```bash
# Chrome settings
chrome://settings/clearBrowserData
# Select "Cached images and files"
# Clear data and revisit the site
```

**Solution 2: Verify XML Format**
```bash
# Check XML syntax
curl http://localhost:3000/opensearch.xml | xmllint --format -
```

**Solution 3: Check HTTPS**
- OpenSearch works better with HTTPS
- Ensure SSL certificate is valid
- Check for mixed content warnings

**Solution 4: Manual Addition**
1. Go to `chrome://settings/searchEngines`
2. Click "Add" next to "Other search engines"
3. Fill in:
   - Name: `Ecton Search`
   - Keyword: `ecton`
   - URL: `http://your-domain.com/api/opensearch/search?q=%s`

### 2. Search Results Not Loading

#### Symptoms
- Empty search results
- API returns 500 errors
- "Index not found" errors

#### Diagnosis
```bash
# Check Meilisearch status
curl http://localhost:7700/health

# Check if index exists
curl "http://localhost:7700/indexes/internal_sites"

# Test search directly
curl "http://localhost:7700/indexes/internal_sites/search" \
  -X POST \
  -H 'Content-Type: application/json' \
  --data-binary '{"q": "test"}'
```

#### Solutions

**Solution 1: Initialize Search Index**
```bash
# Initialize with sample data
curl -X POST http://localhost:3000/api/meilisearch/init

# Verify initialization
curl "http://localhost:3000/api/meilisearch/index?name=internal_sites"
```

**Solution 2: Check Environment Variables**
```bash
# Verify environment variables
echo $NEXT_PUBLIC_MEILISEARCH_URL
echo $NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY

# Check .env file
cat .env.local | grep MEILISEARCH
```

**Solution 3: Restart Services**
```bash
# Docker Compose
docker-compose restart

# PM2
pm2 restart ecton-search

# Manual restart
pkill -f meilisearch
meilisearch --master-key=your_key
```

### 3. Autocomplete Suggestions Not Working

#### Symptoms
- No suggestions appear while typing
- Suggestions endpoint returns empty results
- JavaScript console errors

#### Diagnosis
```bash
# Test suggestions endpoint
curl "http://localhost:3000/api/opensearch/suggestions?q=emp"

# Check browser network tab
# Look for failed requests to /api/opensearch/suggestions

# Check browser console
# Look for JavaScript errors
```

#### Solutions

**Solution 1: Check Minimum Query Length**
- Suggestions only appear for queries ≥ 2 characters
- Verify query parameter is being sent correctly

**Solution 2: Verify Meilisearch Data**
```bash
# Check if documents exist
curl "http://localhost:7700/indexes/internal_sites/documents" | head

# Check searchable attributes
curl "http://localhost:7700/indexes/internal_sites/settings/searchable-attributes"
```

**Solution 3: Check CORS Settings**
```javascript
// In your Next.js API route, add CORS headers if needed
export async function GET(request) {
  const response = NextResponse.json(data)
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}
```

### 4. Meilisearch Connection Issues

#### Symptoms
- "Connection refused" errors
- Timeout errors
- 500 internal server errors

#### Diagnosis
```bash
# Check if Meilisearch is running
ps aux | grep meilisearch

# Check port availability
netstat -tulpn | grep 7700

# Test direct connection
telnet localhost 7700
```

#### Solutions

**Solution 1: Start Meilisearch**
```bash
# Using Docker
docker run -p 7700:7700 meilisearch/meilisearch

# Using binary
./meilisearch --master-key=your_key

# Using systemd
sudo systemctl start meilisearch
```

**Solution 2: Check Firewall**
```bash
# Ubuntu/Debian
sudo ufw allow 7700

# CentOS/RHEL
sudo firewall-cmd --add-port=7700/tcp --permanent
sudo firewall-cmd --reload
```

**Solution 3: Verify Configuration**
```bash
# Check Meilisearch config
cat /etc/meilisearch.toml

# Check environment variables
env | grep MEILI
```

### 5. SSL/HTTPS Issues

#### Symptoms
- "Not secure" warnings in browser
- Mixed content errors
- Certificate errors

#### Diagnosis
```bash
# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate expiry
echo | openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -dates -noout
```

#### Solutions

**Solution 1: Install Valid Certificate**
```bash
# Using Let's Encrypt
certbot --nginx -d search.internal.company.com

# Using custom certificate
sudo cp your-cert.crt /etc/ssl/certs/
sudo cp your-key.key /etc/ssl/private/
```

**Solution 2: Update Nginx Configuration**
```nginx
server {
    listen 443 ssl http2;
    server_name search.internal.company.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

**Solution 3: Fix Mixed Content**
- Ensure all API calls use HTTPS
- Update environment variables to use HTTPS URLs
- Check for hardcoded HTTP URLs in code

## 🐛 Error Messages & Solutions

### "Index `internal_sites` not found"

**Cause**: Meilisearch index hasn't been created

**Solution**:
```bash
# Initialize the index
curl -X POST http://localhost:3000/api/meilisearch/init

# Or create manually
curl -X POST 'http://localhost:7700/indexes' \
  -H 'Content-Type: application/json' \
  --data-binary '{"uid": "internal_sites", "primaryKey": "id"}'
```

### "Failed to connect to Meilisearch"

**Cause**: Meilisearch service is not running or not accessible

**Solution**:
```bash
# Check if service is running
systemctl status meilisearch

# Start the service
systemctl start meilisearch

# Or start manually
meilisearch --master-key=your_key --http-addr=0.0.0.0:7700
```

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause**: Browser blocking cross-origin requests

**Solution**:
```javascript
// Add CORS headers to API responses
export async function GET(request) {
  const response = NextResponse.json(data)
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}
```

### "Cannot resolve module 'encoding'"

**Cause**: Missing Node.js dependency for Meilisearch client

**Solution**:
```bash
# Install missing dependency
npm install encoding

# Or add to package.json
npm install --save-optional encoding
```

## 🔍 Debug Mode

### Enable Debug Logging

**Next.js Application**:
```bash
# Set debug environment
DEBUG=* npm run dev

# Or specific modules
DEBUG=meilisearch:* npm run dev
```

**Meilisearch**:
```bash
# Start with verbose logging
meilisearch --log-level=DEBUG
```

### Debug API Endpoints

**Test OpenSearch endpoints**:
```bash
# Test XML descriptor
curl -v http://localhost:3000/opensearch.xml

# Test search redirect
curl -v "http://localhost:3000/api/opensearch/search?q=test"

# Test suggestions
curl -v "http://localhost:3000/api/opensearch/suggestions?q=emp"
```

**Test Meilisearch endpoints**:
```bash
# Test search
curl -v "http://localhost:3000/api/meilisearch/search?q=portal"

# Test initialization
curl -v -X POST http://localhost:3000/api/meilisearch/init
```

## 📊 Performance Issues

### Slow Search Response

#### Symptoms
- Search takes > 2 seconds
- Browser timeout errors
- High CPU usage

#### Diagnosis
```bash
# Check response times
time curl "http://localhost:3000/api/meilisearch/search?q=test"

# Monitor system resources
top -p $(pgrep meilisearch)

# Check Meilisearch stats
curl "http://localhost:7700/stats"
```

#### Solutions

**Solution 1: Optimize Index**
```bash
# Reduce searchable attributes
curl -X PUT 'http://localhost:7700/indexes/internal_sites/settings/searchable-attributes' \
  -H 'Content-Type: application/json' \
  --data-binary '["name", "description"]'

# Add filterable attributes
curl -X PUT 'http://localhost:7700/indexes/internal_sites/settings/filterable-attributes' \
  -H 'Content-Type: application/json' \
  --data-binary '["type"]'
```

**Solution 2: Increase Resources**
```bash
# Increase memory limit (Docker)
docker run -m 2g meilisearch/meilisearch

# Increase heap size
MEILI_MAX_INDEXING_MEMORY=2048MB meilisearch
```

**Solution 3: Add Caching**
```javascript
// Add response caching
export async function GET(request) {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 'public, max-age=300')
  return response
}
```

### High Memory Usage

#### Symptoms
- System running out of memory
- Meilisearch crashes
- Slow performance

#### Diagnosis
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Check Meilisearch memory
curl "http://localhost:7700/stats" | jq '.databaseSize'
```

#### Solutions

**Solution 1: Limit Memory Usage**
```bash
# Set memory limits
MEILI_MAX_INDEXING_MEMORY=1024MB meilisearch

# Docker memory limit
docker run -m 2g meilisearch/meilisearch
```

**Solution 2: Optimize Data**
```bash
# Remove unused fields
curl -X PUT 'http://localhost:7700/indexes/internal_sites/settings/displayed-attributes' \
  -H 'Content-Type: application/json' \
  --data-binary '["id", "name", "url", "description", "type"]'
```

## 🛠️ Development Tools

### Browser Developer Tools

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "opensearch" or "meilisearch"
4. Monitor API calls and responses

**Console Commands**:
```javascript
// Test search from browser console
fetch('/api/meilisearch/search?q=portal')
  .then(r => r.json())
  .then(console.log)

// Test suggestions
fetch('/api/opensearch/suggestions?q=emp')
  .then(r => r.json())
  .then(console.log)
```

### Command Line Tools

**HTTPie** (alternative to curl):
```bash
# Install HTTPie
pip install httpie

# Test endpoints
http GET localhost:3000/opensearch.xml
http GET localhost:3000/api/opensearch/search q==portal
http GET localhost:3000/api/opensearch/suggestions q==emp
```

**jq** (JSON processor):
```bash
# Pretty print JSON responses
curl "http://localhost:3000/api/meilisearch/search?q=portal" | jq '.'

# Extract specific fields
curl "http://localhost:7700/stats" | jq '.indexes'
```

## 📋 Maintenance & Prevention

### Regular Health Checks

Create a monitoring script:

```bash
#!/bin/bash
# health-check.sh

LOG_FILE="/var/log/ecton-search-health.log"

echo "$(date): Starting health check" >> $LOG_FILE

# Check application
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "$(date): ✅ Application healthy" >> $LOG_FILE
else
    echo "$(date): ❌ Application unhealthy" >> $LOG_FILE
    # Send alert
fi

# Check Meilisearch
if curl -s http://localhost:7700/health > /dev/null; then
    echo "$(date): ✅ Meilisearch healthy" >> $LOG_FILE
else
    echo "$(date): ❌ Meilisearch unhealthy" >> $LOG_FILE
    # Send alert
fi

echo "$(date): Health check complete" >> $LOG_FILE
```

### Log Rotation

Setup log rotation to prevent disk space issues:

```bash
# /etc/logrotate.d/ecton-search
/var/log/ecton-search/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    postrotate
        systemctl reload nginx
    endscript
}
```

### Backup Verification

Regular backup testing:

```bash
#!/bin/bash
# test-backup.sh

# Create test backup
curl -X POST http://localhost:7700/dumps

# Wait for completion
sleep 30

# Verify backup file exists
if [ -f "/path/to/backup/dump.dump" ]; then
    echo "✅ Backup created successfully"
else
    echo "❌ Backup failed"
    exit 1
fi
```

## 🆘 Emergency Procedures

### Service Recovery

**Quick Recovery Steps**:
1. Stop all services
2. Check logs for errors
3. Fix configuration issues
4. Restart services
5. Verify functionality

```bash
#!/bin/bash
# emergency-recovery.sh

echo "🚨 Starting emergency recovery..."

# Stop services
docker-compose down
# or
pm2 stop all

# Check disk space
df -h

# Check logs
tail -100 /var/log/ecton-search/error.log

# Restart with clean state
docker-compose up -d
# or
pm2 start ecosystem.config.js

# Verify recovery
./scripts/test-opensearch.sh

echo "✅ Recovery complete"
```

### Rollback Procedure

If issues persist, rollback to previous version:

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Starting rollback..."

# Stop current version
docker-compose down

# Restore previous configuration
cp docker-compose.backup.yml docker-compose.yml
cp .env.backup .env.local

# Start previous version
docker-compose up -d

# Verify rollback
./scripts/test-opensearch.sh

echo "✅ Rollback complete"
```

---

**Need Help?** If you can't resolve the issue:
1. Check the [API Reference](./api-reference.md) for detailed endpoint documentation
2. Review the [Deployment Guide](./deployment.md) for configuration issues
3. Contact the Ecton Internal Team with error logs and system information 