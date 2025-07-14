# Ecton Search - OpenSearch Integration Documentation

Welcome to the Ecton Search documentation! This guide covers everything you need to know about setting up and using Chrome address bar search integration for your internal network.

## 📚 Documentation Index

- **[OpenSearch Integration Guide](./opensearch-integration.md)** - Complete setup and usage guide
- **[API Reference](./api-reference.md)** - Technical API documentation
- **[Developer Portal Guide](./developer-portal.md)** - Admin interface for content management
- **[Deployment Guide](./deployment.md)** - Production deployment instructions
- **[Troubleshooting](./troubleshooting.md)** - Common issues and solutions
- **[Architecture Overview](./architecture.md)** - System design and components

## 🚀 Quick Start

1. **For End Users**: See [OpenSearch Integration Guide](./opensearch-integration.md#for-end-users)
2. **For Administrators**: See [Developer Portal Guide](./developer-portal.md) for content management
3. **For IT/DevOps**: See [Deployment Guide](./deployment.md)
4. **For Developers**: See [API Reference](./api-reference.md)

## 🎯 What is OpenSearch Integration?

The OpenSearch integration allows your team to search your internal Ecton network directly from Chrome's address bar, just like searching Google. Once configured, users can:

- Type a keyword (like `ecton`) in Chrome's address bar
- Press Tab and enter their search query
- Get instant results from your internal systems

## 🏗️ System Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Chrome        │───▶│   Next.js App    │───▶│   Meilisearch   │
│   Address Bar   │    │   OpenSearch API │    │   Search Index  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── opensearch/
│   │   │   ├── search/route.ts      # Search redirect endpoint
│   │   │   └── suggestions/route.ts # Autocomplete suggestions
│   │   └── meilisearch/             # Meilisearch API endpoints
│   └── opensearch.xml/route.ts      # Dynamic XML descriptor
docs/
├── README.md                        # This file
├── opensearch-integration.md        # Complete integration guide
├── api-reference.md                 # API documentation
├── deployment.md                    # Deployment instructions
├── troubleshooting.md               # Common issues
└── architecture.md                  # Technical architecture
scripts/
└── test-opensearch.sh               # Integration testing script
```

## 🔧 Key Features

- **Chrome Integration**: Native browser search engine support
- **Real-time Suggestions**: Autocomplete powered by Meilisearch
- **Developer Portal**: Secure admin interface for content management
- **Search Analytics**: Track and analyze search patterns
- **Internal Network Focus**: Searches only company resources
- **Production Ready**: Proper error handling and fallbacks
- **Docker Support**: Easy deployment with containers
- **PostgreSQL Database**: Persistent storage for sites and analytics

## 🎓 Getting Help

- **Issues**: Check [Troubleshooting Guide](./troubleshooting.md)
- **API Questions**: See [API Reference](./api-reference.md)
- **Deployment**: Follow [Deployment Guide](./deployment.md)
- **Contact**: Reach out to the Ecton Internal Team

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Ecton Internal Team 