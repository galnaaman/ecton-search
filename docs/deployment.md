# Deployment Guide

This guide covers deploying the Ecton Search OpenSearch integration in production environments.

## 🎯 Deployment Overview

The Ecton Search system consists of three main components:
1. **Next.js Application** - Web interface and API endpoints
2. **Meilisearch Instance** - Search engine and indexing
3. **OpenSearch Integration** - Browser search engine integration

## 🏗️ Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│   Next.js App    │───▶│   Meilisearch   │
│   (nginx/ALB)   │    │   (Port 3000)    │    │   (Port 7700)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────────┐        ┌─────────────┐
    │ SSL/TLS │            │ Docker      │        │ Data Volume │
    │ Cert    │            │ Container   │        │ Persistence │
    └─────────┘            └─────────────┘        └─────────────┘
```

## 🚀 Quick Deployment (Docker)

### Prerequisites

- Docker and Docker Compose installed
- SSL certificate (recommended)
- Internal network access

### 1. Clone and Setup

```bash
git clone <your-repo>
cd nextjs-starter-meilisearch-table
```

### 2. Environment Configuration

Create `.env.production`:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://search.internal.company.com

# Meilisearch
NEXT_PUBLIC_MEILISEARCH_URL=http://meilisearch:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your_production_search_key
MEILISEARCH_MASTER_KEY=your_production_master_key
```

### 3. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# Initialize search data
curl -X POST https://search.internal.company.com/api/meilisearch/init

# Verify deployment
./scripts/test-opensearch.sh https://search.internal.company.com
```

## 🏢 Production Deployment Options

### Option 1: Docker Compose (Recommended)

**Best for**: Small to medium teams, simple setup

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_MEILISEARCH_URL=http://meilisearch:7700
    depends_on:
      - meilisearch
    restart: unless-stopped

  meilisearch:
    image: getmeili/meilisearch:v1.5
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILI_ENV=production
    volumes:
      - meilisearch_data:/meili_data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
    restart: unless-stopped

volumes:
  meilisearch_data:
```

### Option 2: Kubernetes

**Best for**: Large organizations, scalable deployments

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ecton-search
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ecton-search
  template:
    metadata:
      labels:
        app: ecton-search
    spec:
      containers:
      - name: app
        image: ecton-search:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_MEILISEARCH_URL
          value: "http://meilisearch-service:7700"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: ecton-search-service
spec:
  selector:
    app: ecton-search
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### Option 3: Traditional VMs

**Best for**: Existing infrastructure, specific compliance requirements

1. **Setup VM Requirements**:
   - Ubuntu 20.04+ or CentOS 8+
   - 4GB RAM minimum (8GB recommended)
   - 50GB disk space
   - Node.js 18+, Docker

2. **Install Dependencies**:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

3. **Deploy Application**:
   ```bash
   # Build application
   npm ci
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## 🔧 Configuration

### Environment Variables

#### Required Variables

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=https://search.internal.company.com

# Meilisearch Configuration
NEXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=optional_search_key
MEILISEARCH_MASTER_KEY=secure_master_key_here

# Security (Production)
NODE_ENV=production
```

#### Optional Variables

```bash
# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
NEXT_CACHE_TTL=3600
MEILISEARCH_TIMEOUT=5000

# Features
ENABLE_ANALYTICS=true
ENABLE_MONITORING=true
```

### SSL/TLS Configuration

#### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name search.internal.company.com;
    
    ssl_certificate /etc/ssl/certs/search.internal.company.com.crt;
    ssl_certificate_key /etc/ssl/private/search.internal.company.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name search.internal.company.com;
    return 301 https://$server_name$request_uri;
}
```

## 📊 Monitoring & Logging

### Health Checks

Create health check endpoints:

```bash
# Application health
curl https://search.internal.company.com/api/health

# Meilisearch health
curl https://search.internal.company.com:7700/health

# OpenSearch integration test
./scripts/test-opensearch.sh https://search.internal.company.com
```

### Monitoring Setup

#### Prometheus Metrics

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ecton-search'
    static_configs:
      - targets: ['search.internal.company.com:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'meilisearch'
    static_configs:
      - targets: ['search.internal.company.com:7700']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

#### Grafana Dashboard

Key metrics to monitor:
- API response times
- Search query volume
- Error rates
- Meilisearch index size
- User adoption metrics

### Logging Configuration

```javascript
// ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'ecton-search',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    log_file: '/var/log/ecton-search/combined.log',
    out_file: '/var/log/ecton-search/out.log',
    error_file: '/var/log/ecton-search/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
}
```

## 🔒 Security Considerations

### Network Security

1. **Internal Network Only**
   - Deploy behind corporate firewall
   - Use VPN for remote access
   - Restrict external access

2. **SSL/TLS**
   - Use valid SSL certificates
   - Enable HTTPS redirect
   - Configure security headers

3. **API Security**
   - Implement rate limiting
   - Add request validation
   - Log security events

### Data Security

1. **Search Index**
   - Regular backups
   - Access control
   - Data encryption at rest

2. **Environment Variables**
   - Secure secret management
   - Rotate keys regularly
   - Audit access logs

## 🔄 Backup & Recovery

### Meilisearch Backup

```bash
# Create backup
docker exec meilisearch-container \
  meilisearch --import-dump /meili_data/backup.dump

# Restore backup
docker exec meilisearch-container \
  meilisearch --import-dump /meili_data/backup.dump
```

### Application Backup

```bash
# Backup configuration
tar -czf ecton-search-config-$(date +%Y%m%d).tar.gz \
  .env.production docker-compose.yml nginx.conf

# Backup application data
docker exec app-container \
  tar -czf /backup/app-data-$(date +%Y%m%d).tar.gz /app/data
```

## 📈 Performance Optimization

### Application Optimization

1. **Next.js Optimization**
   ```javascript
   // next.config.js
   module.exports = {
     output: 'standalone',
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
     httpAgentOptions: {
       keepAlive: true,
     }
   }
   ```

2. **Caching Strategy**
   - Static assets: 1 year
   - API responses: 5 minutes
   - OpenSearch XML: 24 hours

### Meilisearch Optimization

1. **Index Settings**
   ```bash
   # Optimize for search speed
   curl -X PATCH 'http://localhost:7700/indexes/internal_sites/settings' \
     -H 'Content-Type: application/json' \
     --data-binary '{
       "searchableAttributes": ["name", "description"],
       "filterableAttributes": ["type"],
       "sortableAttributes": ["name"]
     }'
   ```

2. **Resource Allocation**
   - Memory: 2GB minimum for production
   - CPU: 2 cores minimum
   - Disk: SSD recommended

## 🧪 Testing Deployment

### Pre-deployment Tests

```bash
# 1. Build test
npm run build

# 2. Security scan
npm audit

# 3. Integration test
./scripts/test-opensearch.sh

# 4. Load test
ab -n 1000 -c 10 https://search.internal.company.com/api/opensearch/suggestions?q=test
```

### Post-deployment Verification

```bash
# 1. Health checks
curl https://search.internal.company.com/api/health

# 2. OpenSearch integration
curl https://search.internal.company.com/opensearch.xml

# 3. Search functionality
curl "https://search.internal.company.com/api/opensearch/search?q=portal"

# 4. SSL certificate
openssl s_client -connect search.internal.company.com:443 -servername search.internal.company.com
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Application Won't Start

**Symptoms**: Container exits immediately
**Solutions**:
1. Check environment variables
2. Verify port availability
3. Review application logs
4. Check dependencies

#### Meilisearch Connection Failed

**Symptoms**: Search API returns 500 errors
**Solutions**:
1. Verify Meilisearch is running
2. Check network connectivity
3. Validate environment variables
4. Review firewall settings

#### SSL Certificate Issues

**Symptoms**: Browser security warnings
**Solutions**:
1. Verify certificate validity
2. Check certificate chain
3. Validate domain name match
4. Review nginx configuration

### Rollback Procedures

#### Quick Rollback

```bash
# Docker Compose
docker-compose down
docker-compose -f docker-compose.backup.yml up -d

# Kubernetes
kubectl rollout undo deployment/ecton-search

# PM2
pm2 stop ecton-search
pm2 start ecosystem.backup.config.js
```

## 📋 Maintenance

### Regular Maintenance Tasks

#### Weekly
- Review application logs
- Check system resources
- Verify backup integrity
- Monitor search performance

#### Monthly
- Update dependencies
- Rotate SSL certificates
- Review security logs
- Optimize search index

#### Quarterly
- Security audit
- Performance review
- Capacity planning
- User feedback analysis

---

**Last Updated**: January 2025  
**Deployment Version**: 1.0.0  
**Maintainer**: Ecton DevOps Team 