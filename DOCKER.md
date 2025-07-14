# Docker Setup for Ecton Search Engine

This guide will help you run the Ecton search engine using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start with Docker Compose

### 1. Clone and navigate to the project
```bash
git clone <your-repo-url>
cd nextjs-starter-meilisearch-table
```

### 2. Update environment variables
Edit the `docker-compose.yml` file and replace `your-secret-master-key-here` with a secure master key:

```yaml
environment:
  - MEILI_MASTER_KEY=my-super-secret-key-123
  - NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=my-super-secret-key-123
```

### 3. Build and run the complete stack
```bash
# Build and start both Meilisearch and the Next.js app
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### 4. Access the application
- **Ecton Search Engine**: http://localhost:3000
- **Meilisearch Dashboard**: http://localhost:7700

### 5. Initialize search data
Once the application is running, visit http://localhost:3000/search and click "Initialize Search Data" to populate the Meilisearch index with sample data.

## Docker Commands

### Build the Next.js application only
```bash
docker build -t ecton-search .
```

### Run the Next.js application only
```bash
docker run -p 3000:3000 ecton-search
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ This will delete all Meilisearch data)
```bash
docker-compose down -v
```

### View logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs ecton-app
docker-compose logs meilisearch
```

### Restart services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart ecton-app
```

## Production Deployment

### Environment Variables
For production deployment, make sure to set these environment variables:

```bash
# Meilisearch Configuration
MEILI_MASTER_KEY=your-production-master-key
MEILI_ENV=production

# Next.js Configuration
NODE_ENV=production
NEXT_PUBLIC_MEILISEARCH_URL=http://your-meilisearch-host:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=your-production-master-key
```

### Security Considerations
1. **Change the default master key** in production
2. **Use HTTPS** for both services in production
3. **Set up proper firewall rules**
4. **Use secrets management** for sensitive data

## Troubleshooting

### Application won't start
```bash
# Check if ports are available
lsof -i :3000
lsof -i :7700

# Check Docker logs
docker-compose logs ecton-app
```

### Meilisearch connection issues
```bash
# Verify Meilisearch is running
curl http://localhost:7700/health

# Check network connectivity
docker-compose exec ecton-app ping meilisearch
```

### Reset everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v
docker system prune -f

# Rebuild and restart
docker-compose up --build
```

## File Structure

```
.
├── Dockerfile              # Multi-stage build for Next.js
├── docker-compose.yml      # Complete stack configuration
├── .dockerignore           # Excludes unnecessary files
├── next.config.js          # Next.js config with standalone output
└── DOCKER.md               # This guide
```

## Performance Tips

1. **Use .dockerignore** to exclude unnecessary files
2. **Multi-stage builds** reduce final image size
3. **Node Alpine images** are smaller and faster
4. **Volume mounting** for persistent Meilisearch data

## Support

If you encounter any issues with the Docker setup, please check:
1. Docker and Docker Compose versions
2. Available system resources (RAM, disk space)
3. Port conflicts with other services
4. Network connectivity between containers 