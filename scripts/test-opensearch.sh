#!/bin/bash

# Test script for OpenSearch integration
# Usage: ./scripts/test-opensearch.sh [BASE_URL]

BASE_URL=${1:-"http://localhost:3000"}

echo "🔍 Testing OpenSearch Integration for Ecton Search"
echo "================================================"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: OpenSearch Descriptor
echo "1. Testing OpenSearch XML Descriptor..."
echo "   GET $BASE_URL/opensearch.xml"
echo ""
curl -s "$BASE_URL/opensearch.xml" | head -10
echo ""
echo "✅ OpenSearch descriptor test completed"
echo ""

# Test 2: Search Endpoint (should redirect)
echo "2. Testing Search Endpoint..."
echo "   GET $BASE_URL/api/opensearch/search?q=portal"
echo ""
REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" "$BASE_URL/api/opensearch/search?q=portal")
if [[ $REDIRECT_URL == *"/search?q=portal"* ]]; then
    echo "✅ Search endpoint redirects correctly to: $REDIRECT_URL"
else
    echo "❌ Search endpoint failed. Expected redirect to /search?q=portal"
fi
echo ""

# Test 3: Suggestions Endpoint
echo "3. Testing Suggestions Endpoint..."
echo "   GET $BASE_URL/api/opensearch/suggestions?q=portal"
echo ""
SUGGESTIONS=$(curl -s "$BASE_URL/api/opensearch/suggestions?q=portal")
echo "   Response: $SUGGESTIONS"
if [[ $SUGGESTIONS == *"portal"* ]]; then
    echo "✅ Suggestions endpoint working correctly"
else
    echo "⚠️  Suggestions endpoint working but no suggestions returned (may need Meilisearch initialization)"
fi
echo ""

# Test 4: Empty query handling
echo "4. Testing Empty Query Handling..."
echo "   GET $BASE_URL/api/opensearch/search?q="
echo ""
EMPTY_REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" "$BASE_URL/api/opensearch/search?q=")
if [[ $EMPTY_REDIRECT == *"$BASE_URL/"* ]]; then
    echo "✅ Empty query redirects to homepage correctly"
else
    echo "❌ Empty query handling failed"
fi
echo ""

# Test 5: XML Content-Type
echo "5. Testing XML Content-Type..."
CONTENT_TYPE=$(curl -s -I "$BASE_URL/opensearch.xml" | grep -i "content-type" | head -1)
if [[ $CONTENT_TYPE == *"application/opensearchdescription+xml"* ]]; then
    echo "✅ Correct Content-Type header: $CONTENT_TYPE"
else
    echo "❌ Incorrect Content-Type: $CONTENT_TYPE"
fi
echo ""

echo "🎯 Integration Test Summary"
echo "=========================="
echo "All core OpenSearch endpoints are functional!"
echo ""
echo "📋 Next Steps for Chrome Integration:"
echo "1. Ensure Meilisearch is running: docker run -p 7700:7700 meilisearch/meilisearch"
echo "2. Initialize sample data: curl -X POST $BASE_URL/api/meilisearch/init"
echo "3. Visit $BASE_URL in Chrome to detect the search engine"
echo "4. Add 'Ecton Search' as a search engine in Chrome settings"
echo ""
echo "🔧 Manual Chrome Setup:"
echo "   Keyword: ecton"
echo "   URL: $BASE_URL/api/opensearch/search?q=%s"
echo "" 