# Database Docker Setup

## Overview

This document outlines the implementation of automatic seed data loading for the ExpatEats application when running in Docker containers.

## What was implemented

### 1. Unified Seed Data Runner

Created `server/seedData.ts` that imports all seed data files:
- **Food sources** (16 items) - General food stores and markets
- **Supplements data** (23 items) - Health food stores and supplement retailers
- **Enhanced stores** (3 items) - Detailed store information with full metadata
- **Lisbon food sources** (26 items) - Lisbon-specific food sources and farms
- **Location guides** (29 items) - Food sources across different Portuguese regions
- **Additional food sources** (13 items) - Additional Lisbon area food sources

### 2. Server Integration

Updated `server/index.ts` to automatically run seed data on startup when:
- `SEED_DATA=true` environment variable is set
- OR when `NODE_ENV=development`

### 3. Docker Configuration

**Development (`docker-compose.yml`)**:
- Always runs seed data with `SEED_DATA=true`
- Uses local PostgreSQL database

**Production (`docker-compose.prod.yml`)**:
- Configurable via environment variable `SEED_DATA=${SEED_DATA:-false}`
- Defaults to `false` for production safety

### 4. Database Configuration

- **Development**: Uses local PostgreSQL with `drizzle-orm/node-postgres`
- **Production**: Neon database code commented out for future deployment
- Added `pg` and `@types/pg` dependencies for local PostgreSQL support

### 5. Additional Features

- **Manual seed script**: `npm run seed` to manually run seed data
- **Schema synchronization**: Database schema updated to match seed data requirements
- **Duplicate prevention**: Data only imported if it doesn't already exist
- **Comprehensive logging**: All imports logged with success/failure status

## How it works

1. **Container Startup**: When you run `docker-compose up`, the application detects development mode
2. **Automatic Import**: All seed data import functions run automatically before the server starts
3. **Data Validation**: Each import checks for existing data to prevent duplicates
4. **Logging**: Detailed logs show import progress and results
5. **Server Start**: Application serves on port 3001 after successful seed data import

## Seed Data Content

The imported data includes:
- **Restaurants and cafes** with dietary-specific options
- **Health food stores** and supplement retailers
- **Markets and farmers markets** across Portugal
- **Organic stores** and bulk buying options
- **Location-specific guides** for Lisbon, Sintra, Cascais, and Oeiras
- **Online retailers** for supplements and health products

## Commands

```bash
# Start containers with automatic seed data loading
docker-compose up -d

# Manually run seed data (requires DATABASE_URL)
npm run seed

# Push database schema changes
npm run db:push

# Check application logs
docker-compose logs app
```

## Environment Variables

- `SEED_DATA`: Set to `true` to enable seed data loading
- `NODE_ENV`: When set to `development`, seed data loads automatically
- `DATABASE_URL`: PostgreSQL connection string

## Notes

- Seed data runs only once per container startup
- Data is deduplicated to prevent conflicts
- Production deployments should set `SEED_DATA=false` unless initial setup is needed
- Database schema must be synchronized before seed data import