# Production Database Setup Guide
## ExpatEats Application - OAuth & Email Service Ready

**Last Updated:** 2025-11-15
**Database:** PostgreSQL 15

---

## Overview

Your application supports **two production deployment strategies**:

1. **Docker-based Deployment** - Self-hosted using `docker-compose.prod.yml`
2. **Render Cloud Deployment** - Managed PostgreSQL on Render.com

Both options now include support for:
- ✅ Google OAuth 2.0 authentication
- ✅ Email service (SendGrid integration)
- ✅ Email logging and tracking
- ✅ Newsletter subscription management

---

## Current Database Migrations

Your database has **4 migrations** that need to be applied:

| Migration | File | Description | Status |
|-----------|------|-------------|--------|
| 0000 | `0000_complete_schema.sql` | Initial schema (users, places, reviews, etc.) | ✅ Applied (dev) |
| 0001 | `0001_add_soft_rating_michaeles_notes.sql` | Soft ratings & Michaele's notes | ✅ Applied (dev) |
| 0002 | `0002_add_google_oauth_support.sql` | **Google OAuth columns** | ✅ Applied (dev) |
| 0003 | `0003_add_email_logs.sql` | **Email service tables** | ✅ Applied (dev) |

---

## Production Deployment Option 1: Docker (Self-Hosted)

### Architecture

```
┌─────────────────────────────────────────┐
│         Nginx Reverse Proxy             │
│     (Port 80/443 - SSL Termination)     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         ExpatEats App Container         │
│        (Node.js + Express + React)      │
│              Port 3001                  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      PostgreSQL 15 Container            │
│         (Database Server)               │
│   Volume: postgres_prod_data            │
└─────────────────────────────────────────┘
```

### Prerequisites

- Docker & Docker Compose installed on production server
- SSL certificates for HTTPS (Let's Encrypt recommended)
- Domain name pointing to your server IP
- Minimum 1GB RAM, 1 CPU core

### Configuration Files

Your production setup uses:
- **`docker-compose.prod.yml`** - Production container orchestration
- **`Dockerfile`** - Production build configuration
- **`.env`** - Environment variables (not committed to git)

### Environment Variables Required

Create a **`.env.production`** file with these variables:

```bash
# Database Configuration
POSTGRES_DB=expatdb
POSTGRES_USER=expatuser
POSTGRES_PASSWORD=<STRONG_PASSWORD_HERE>  # Change this!
DATABASE_URL=postgresql://expatuser:<STRONG_PASSWORD_HERE>@postgres:5432/expatdb

# Session Configuration
SESSION_SECRET=<GENERATE_256_BIT_RANDOM_STRING>  # Critical - change this!
NODE_ENV=production
PORT=3001

# Security
BCRYPT_ROUNDS=12

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_CALLBACK_URL=https://expateatsguide.com/api/auth/google/callback

# SendGrid Email Service
SENDGRID_API_KEY=SG.your-production-api-key
SENDGRID_VERIFIED_SENDER=noreply@expateatsguide.com
ADMIN_EMAIL=admin@expateatsguide.com
SUPPORT_EMAIL=hello@expateatsguide.com
NEWSLETTER_EMAIL=newsletter@expateatsguide.com

# Application URLs
FRONTEND_URL=https://expateatsguide.com
UNSUBSCRIBE_URL=https://expateatsguide.com/unsubscribe

# Email Service Settings
EMAIL_ENABLED=true
EMAIL_DEBUG=false  # Set to false in production!
EMAIL_RATE_LIMIT=1000

# Optional Services
MAPBOX_ACCESS_TOKEN=your-mapbox-token
OPENAI_API_KEY=your-openai-key
REDIS_PASSWORD=<STRONG_PASSWORD_HERE>  # If using Redis
SEED_DATA=false  # Never seed data in production!
```

### Deployment Steps

#### 1. **Initial Production Deployment (Fresh Database)**

```bash
# On your production server

# Clone the repository
git clone <your-repo-url>
cd ExpatEats

# Copy environment template
cp .env.example .env.production
# Edit .env.production with your production values
nano .env.production

# Start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**What happens automatically:**
1. PostgreSQL container starts with empty database
2. All migrations in `migrations/` run in order:
   - ✅ 0000_complete_schema.sql
   - ✅ 0001_add_soft_rating_michaeles_notes.sql
   - ✅ 0002_add_google_oauth_support.sql
   - ✅ 0003_add_email_logs.sql
3. Application container builds and starts
4. Nginx reverse proxy starts (if using `--profile proxy`)

#### 2. **Updating Existing Production Deployment**

If you already have a production database running and need to apply new migrations:

```bash
# Step 1: Backup existing database
docker exec expatdb-prod pg_dump -U expatuser expatdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Step 2: Check current database state
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d users" | grep -E "google_id|auth_provider"

# Step 3: Apply OAuth migration (0002)
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0002_add_google_oauth_support.sql

# Step 4: Apply Email service migration (0003)
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0003_add_email_logs.sql

# Step 5: Verify migrations succeeded
docker exec -i expatdb-prod psql -U expatuser -d expatdb << 'EOF'
-- Check OAuth columns
\d users

-- Check Email tables
\d email_logs
\d newsletter_subscribers
EOF

# Step 6: Deploy updated application code
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build app

# Step 7: Monitor logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### 3. **Zero-Downtime Migration Strategy**

```bash
# 1. Apply migrations (these are additive, won't break existing app)
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0002_add_google_oauth_support.sql
docker exec -i expatdb-prod psql -U expatuser -d expatdb < migrations/0003_add_email_logs.sql

# 2. Build new app image (doesn't affect running app)
docker-compose -f docker-compose.prod.yml build app

# 3. Gracefully restart app container
docker-compose -f docker-compose.prod.yml up -d --no-deps app

# The old container continues serving requests until new one is ready
```

### Verification Commands

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check database health
docker exec expatdb-prod pg_isready -U expatuser -d expatdb

# Verify OAuth columns exist
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\d users" | grep -E "google_id|auth_provider|profile_picture|google_email"

# Verify Email tables exist
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "\dt" | grep -E "email_logs|newsletter_subscribers"

# Check app logs
docker logs expatdb-prod-app --tail=100 -f

# Test database connection from app
docker exec expat-app-prod node -e "console.log('DB:', process.env.DATABASE_URL)"
```

---

## Production Deployment Option 2: Render (Cloud Platform)

### Architecture

```
                    Internet
                       │
         ┌─────────────▼──────────────┐
         │   Render.com Load Balancer │
         │      (SSL/TLS Included)     │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   ExpatEats Web Service    │
         │   (Auto-deployed from Git)  │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │  Render PostgreSQL Service │
         │    (Managed Database)       │
         └────────────────────────────┘
```

### Render Setup

#### 1. **Create PostgreSQL Database**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name:** `expatdb-prod`
   - **Database:** `expatdb`
   - **User:** `expatuser`
   - **Region:** Choose closest to your users
   - **Plan:** Starter ($7/month) or higher
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (starts with `postgresql://`)

#### 2. **Create Web Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure service:
   - **Name:** `expat-eats-app`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm run start`
   - **Plan:** Starter ($7/month) or higher

#### 3. **Configure Environment Variables**

In the Render dashboard, add these environment variables to your Web Service:

```bash
# Database (from Render PostgreSQL - use Internal Database URL)
DATABASE_URL=<INTERNAL_DATABASE_URL_FROM_RENDER>

# Session
SESSION_SECRET=<GENERATE_256_BIT_RANDOM_STRING>
NODE_ENV=production
PORT=10000  # Render uses 10000 by default

# Security
BCRYPT_ROUNDS=12

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/api/auth/google/callback

# SendGrid
SENDGRID_API_KEY=SG.your-production-api-key
SENDGRID_VERIFIED_SENDER=noreply@expateatsguide.com
ADMIN_EMAIL=admin@expateatsguide.com
SUPPORT_EMAIL=hello@expateatsguide.com
NEWSLETTER_EMAIL=newsletter@expateatsguide.com

# URLs
FRONTEND_URL=https://your-app.onrender.com
UNSUBSCRIBE_URL=https://your-app.onrender.com/unsubscribe

# Email Settings
EMAIL_ENABLED=true
EMAIL_DEBUG=false
EMAIL_RATE_LIMIT=1000

# Optional
MAPBOX_ACCESS_TOKEN=your-mapbox-token
OPENAI_API_KEY=your-openai-key
SEED_DATA=false
```

#### 4. **Apply Database Migrations on Render**

**Option A: Using Render Shell (Recommended)**

1. Go to your PostgreSQL database in Render dashboard
2. Click **"Connect"** → **"External Connection"**
3. Copy the connection details
4. On your local machine:

```bash
# Connect to Render database
psql <EXTERNAL_DATABASE_URL_FROM_RENDER>

# Once connected, run migrations
\i migrations/0000_complete_schema.sql
\i migrations/0001_add_soft_rating_michaeles_notes.sql
\i migrations/0002_add_google_oauth_support.sql
\i migrations/0003_add_email_logs.sql

# Verify
\d users
\d email_logs
\d newsletter_subscribers

# Exit
\q
```

**Option B: Using Render's psql Shell (If Available)**

1. In Render dashboard, go to your PostgreSQL service
2. Click **"Shell"** tab
3. Run:

```sql
-- Check current tables
\dt

-- Apply migrations (if needed)
-- Note: Render may auto-run migrations from /docker-entrypoint-initdb.d
```

**Option C: Automatic via Build Command**

The `render-build` script in your `package.json` already runs `npm run db:push`:

```json
"render-build": "npm run build && npm run db:push"
```

This uses Drizzle to push schema changes automatically on each deployment.

#### 5. **Deploy and Monitor**

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs
3. Once deployed, test:
   - Visit your app URL
   - Test OAuth login
   - Check application logs in Render dashboard

### Updating Render Deployment

```bash
# On your local machine

# Commit and push migrations
git add migrations/0002_add_google_oauth_support.sql
git add migrations/0003_add_email_logs.sql
git add server/
git commit -m "Add OAuth and Email service support"
git push origin main

# Render will automatically:
# 1. Detect the push
# 2. Run npm run render-build
# 3. Apply migrations via db:push
# 4. Deploy new code
```

---

## Database Connection Details

### Docker Production

**Internal connection (from app container):**
```
Host: postgres
Port: 5432
Database: expatdb
User: expatuser
Password: <from .env>

Connection String:
postgresql://expatuser:password@postgres:5432/expatdb
```

**External connection (for management):**
```bash
# If you expose port 5432 in docker-compose
psql -h localhost -p 5432 -U expatuser -d expatdb
```

### Render Production

**Internal connection (from web service):**
```
Automatically provided via DATABASE_URL environment variable
```

**External connection (for management):**
```
Host: Provided by Render
Port: Provided by Render (usually 5432)
Database: expatdb
User: Provided by Render
Password: Provided by Render

Full URL provided in Render dashboard under "External Database URL"
```

---

## Migration Checklist for Production

Before deploying to production, ensure:

### Database Preparation
- [ ] Backup existing production database
- [ ] Test migrations on staging database first
- [ ] Verify migrations are idempotent (safe to run multiple times)
- [ ] Document rollback procedures

### Environment Variables
- [ ] All OAuth variables set with production Google credentials
- [ ] All SendGrid variables set with production API key
- [ ] EMAIL_DEBUG=false (not true!)
- [ ] SESSION_SECRET is strong random string (256+ bits)
- [ ] POSTGRES_PASSWORD is strong (not the default!)
- [ ] All URLs use HTTPS (not HTTP)

### OAuth Configuration
- [ ] Google OAuth credentials created for production domain
- [ ] Authorized JavaScript origins includes production domain
- [ ] Authorized redirect URIs includes production callback URL
- [ ] Test users added to Google OAuth consent screen (for testing)

### SendGrid Configuration
- [ ] Production API key created
- [ ] Sender email addresses verified
- [ ] Domain authentication completed (optional but recommended)
- [ ] Test email sent successfully

### Application Code
- [ ] Latest code deployed
- [ ] Dependencies installed
- [ ] Build completed successfully
- [ ] No TypeScript errors

### Testing
- [ ] Can connect to database
- [ ] Migrations applied successfully
- [ ] Application starts without errors
- [ ] OAuth login works
- [ ] Email sending works (test with EMAIL_DEBUG=false)
- [ ] All existing features still work

---

## Common Issues and Solutions

### Issue: Migrations don't run automatically on Render

**Cause:** Render may not execute SQL files automatically

**Solution:** Use `npm run db:push` in build command or run migrations manually via psql

### Issue: DATABASE_URL not found

**Cause:** Environment variable not set correctly

**Solution:**
- Docker: Check `.env.production` file
- Render: Check environment variables in dashboard

### Issue: Can't connect to database

**Cause:** Network/firewall issue or wrong credentials

**Solution:**
```bash
# Docker: Check container network
docker network ls
docker network inspect expat-network

# Render: Use internal DATABASE_URL, not external
```

### Issue: OAuth callback URL mismatch

**Cause:** Production callback URL doesn't match Google Console

**Solution:**
1. Check `GOOGLE_CALLBACK_URL` environment variable
2. Verify it matches EXACTLY in Google Cloud Console
3. Must use HTTPS in production

### Issue: Emails not sending in production

**Cause:** EMAIL_DEBUG=true or wrong API key

**Solution:**
1. Set `EMAIL_DEBUG=false`
2. Verify `SENDGRID_API_KEY` is correct
3. Check SendGrid dashboard for delivery status

---

## Monitoring and Maintenance

### Health Checks

```bash
# Docker
docker-compose -f docker-compose.prod.yml ps
docker exec expatdb-prod pg_isready

# Database size
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "SELECT pg_size_pretty(pg_database_size('expatdb'));"

# Connection count
docker exec -i expatdb-prod psql -U expatuser -d expatdb -c "SELECT count(*) FROM pg_stat_activity;"
```

### Backup Procedures

**Docker (Automated):**
```bash
# Add to crontab for daily backups
0 2 * * * docker exec expatdb-prod pg_dump -U expatuser expatdb | gzip > /backups/expatdb_$(date +\%Y\%m\%d).sql.gz
```

**Render:**
- Render provides automatic daily backups
- Can also manually backup via psql:

```bash
pg_dump <EXTERNAL_DATABASE_URL> | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Log Monitoring

```bash
# Docker
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f postgres

# Render
# View logs in Render dashboard under "Logs" tab
```

---

## Security Best Practices

### Database Security
- ✅ Use strong passwords (20+ characters, random)
- ✅ Never commit `.env` files to git
- ✅ Use different credentials for dev/staging/prod
- ✅ Limit database connections (set max_connections)
- ✅ Enable SSL for database connections in production
- ✅ Regular backups (automated daily minimum)
- ✅ Monitor for suspicious activity

### Application Security
- ✅ Use HTTPS only in production
- ✅ Set secure session cookies (`secure: true`)
- ✅ Strong SESSION_SECRET (256+ bits)
- ✅ Enable CSRF protection (already implemented)
- ✅ Rate limiting on auth endpoints (already implemented)
- ✅ Input validation (using Zod schemas)
- ✅ SQL injection protection (using Drizzle ORM)

---

## Summary

Your production database can be deployed in **two ways**:

| Feature | Docker (Self-Hosted) | Render (Cloud) |
|---------|---------------------|----------------|
| **Cost** | Server costs only | $14/month (Starter) |
| **Maintenance** | You manage | Render manages |
| **Scalability** | Manual | Automatic |
| **Backups** | You configure | Automatic |
| **SSL** | You configure | Included |
| **Setup Complexity** | Moderate | Easy |

**Recommended for:**
- **Docker:** If you have DevOps experience and want full control
- **Render:** If you want managed hosting with minimal setup

Both options support all the OAuth and Email features you've implemented!

---

## Next Steps

1. Choose deployment method (Docker or Render)
2. Complete manual setup steps from `OAuth&EmailManualSetup.txt`
3. Set up production Google OAuth credentials
4. Set up production SendGrid account
5. Configure environment variables
6. Apply database migrations
7. Deploy application
8. Test OAuth and Email functionality
9. Monitor logs and performance

---

**Need help?** Refer to:
- `OAuth&EmailManualSetup.txt` - Google & SendGrid setup
- `DATABASE_MIGRATION_GUIDE.md` - Migration procedures
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

Last Updated: 2025-11-15
