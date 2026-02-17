# FlowversalAI Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Git repository access
- Domain name configured with SSL certificate
- Environment variables prepared
- Database services configured (MongoDB Atlas, Neon PostgreSQL)

---

## Step 1: Prepare Environment

### 1.1 Clone Repository
```bash
git clone https://github.com/your-org/FlowversalAI.git
cd FlowversalAI
```

### 1.2 Configure Environment Variables

Create production environment file:
```bash
cd Backend
cp .env.production .env.production.local
```

Fill in all required values:
- `JWT_SECRET` - Generate with: `openssl rand -base64 64`
- `ENCRYPTION_SECRET` - Generate with: `openssl rand -base64 32`
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NEON_DATABASE_URL` - Your Neon PostgreSQL connection string
- All API keys (OpenAI, Pinecone, Supabase, etc.)

---

## Step 2: Database Setup

### 2.1 MongoDB Indexes
```bash
cd Backend
npx ts-node src/scripts/create-indexes.ts
```

**Expected output**: "✅ All indexes created successfully"

### 2.2 Verify Database Connections
```bash
# Set environment variables
export MONGODB_URI="your-mongodb-uri"
export NEON_DATABASE_URL="your-neon-url"

# Test connection
npm run dev
# Check logs for: "✅ Connected to MongoDB" and "✅ Connected to PostgreSQL"
```

---

## Step 3: Build Docker Images

### 3.1 Build Backend
```bash
docker build -t flowversal-backend:latest ./Backend
```

### 3.2 Build Frontend
```bash
docker build -t flowversal-frontend:latest ./Frontend
```

### 3.3 Verify Builds
```bash
# Check images exist
docker images | grep flowversal

# Test backend
docker run --rm flowversal-backend:latest whoami
# Should output: nodejs
```

---

## Step 4: Deploy with Docker Compose

### 4.1 Configure docker-compose
```bash
# Create production env file
cp Backend/.env.production docker.env
# Edit docker.env with production values
```

### 4.2 Start Services
```bash
docker-compose up -d
```

### 4.3 Verify Health
```bash
# Check all services running
docker-compose ps

# Check backend health
curl http://localhost:4000/health

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

---

## Step 5: Configure Reverse Proxy (Nginx)

### 5.1 Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Test Nginx Configuration
```bash
nginx -t
systemctl reload nginx
```

---

## Step 6: Post-Deployment Verification

### 6.1 Health Checks
```bash
# Backend
curl https://your-domain.com/api/v1/health

# Healthcheck endpoint
curl https://your-domain.com/health
```

### 6.2 Test Authentication
```bash
# Signup
curl -X POST https://your-domain.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 6.3 Monitor Logs
```bash
# Real-time logs
docker-compose logs -f backend

# Check for errors
docker-compose logs backend | grep ERROR
```

---

## Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
docker-compose down

# Pull previous version
git checkout <previous-commit-hash>

# Rebuild and deploy
docker-compose up -d --build
```

### Database Rollback
```bash
# MongoDB: Restore from backup
mongorestore --uri="your-mongodb-uri" --archive=backup.archive

# PostgreSQL: Point-in-time recovery
# Contact Neon support or use dashboard
```

---

## Monitoring Setup

### 1. Configure UptimeRobot
- Monitor: `https://your-domain.com/health`
- Interval: 5 minutes
- Alert: Email + Slack

### 2. Configure Sentry
Add to environment:
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

### 3. Enable Application Logs
```bash
# View logs
docker-compose logs -f

# Export logs
docker-compose logs > deployment.log
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing environment variables
# - Database connection failed
# - Port already in use
```

### Database Connection Errors
```bash
# Verify MongoDB
mongosh "your-mongodb-uri"

# Verify PostgreSQL
psql "your-neon-url"

# Check firewall/security groups
```

### High Memory Usage
```bash
# Check container stats
docker stats

# Restart services
docker-compose restart backend
```

---

## Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild images
docker-compose build

# Deploy with zero-downtime
docker-compose up -d --no-deps --build backend
```

### Database Backups
**MongoDB Atlas**: Auto-backups enabled (verify in dashboard)  
**Neon PostgreSQL**: Auto-backups enabled (retention: 7 days)

### Log Rotation
```bash
# Configure in docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

---

## Emergency Contacts

- **Database Issues**: MongoDB Atlas Support / Neon Support
- **SSL/Domain**: Your DNS provider support
- **Application Errors**: Check Sentry dashboard
- **Infrastructure**: Your hosting provider

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database indexes created
- [ ] Docker images built successfully
- [ ] Services started and healthy
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificates valid
- [ ] Health endpoints responding
- [ ] Authentication tested
- [ ] Monitoring configured (UptimeRobot, Sentry)
- [ ] Backups verified
- [ ] Team notified of deployment
- [ ] Documentation updated

**Deployment Time**: 1-2 hours  
**Team Required**: 1 DevOps + 1 Developer (recommended)
