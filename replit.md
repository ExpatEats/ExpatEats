# Expat Eats - Food Source Guide for Expats

## Overview

Expat Eats is a full-stack web application designed to help expatriates in Portugal find sustainable food sources, connect with the community, and access nutrition services. The platform provides comprehensive guides for grocery stores, markets, supplements, and specialty food retailers while supporting various dietary preferences and lifestyle choices.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state and React hooks for local state
- **Styling**: Tailwind CSS with custom color palette inspired by natural/sustainable themes
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (using Neon Database serverless)
- **Session Management**: Connect-pg-simple for session storage
- **Email Service**: SendGrid for transactional emails

### Database Schema
The application uses a PostgreSQL database with the following main tables:
- **users**: User profiles and authentication data
- **places**: Food sources (stores, markets, restaurants) with location data
- **reviews**: User reviews and ratings for places
- **nutrition**: Nutrition consultation requests

## Key Components

### 1. User Registration and Onboarding
- Simple registration with email and name
- Dietary preference selection (gluten-free, vegan, organic, etc.)
- Terms and conditions acceptance
- Preferences stored in localStorage for immediate access

### 2. Food Source Discovery
- Comprehensive database of food sources in Portuguese cities (primarily Lisbon area)
- Filtering by location, category, and dietary tags
- Map view integration using Mapbox GL JS
- Detailed store pages with contact information and directions

### 3. Community Features
- Event listings for food-related community events
- User submission system for new locations and events
- WhatsApp integration for direct communication with the founder

### 4. Content Management
- Admin panel for reviewing submitted locations
- Bulk import system for food source data
- Image management and categorization

## Data Flow

1. **User Registration**: User provides basic information → stored in localStorage → preferences guide content filtering
2. **Food Source Search**: User selects preferences → API query with filters → results displayed in list or map view
3. **Content Submission**: Users submit new locations/events → stored with pending status → admin review → approval/rejection
4. **Nutrition Services**: Contact form submissions → email notifications → follow-up via WhatsApp

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL serverless)
- **Maps**: Mapbox GL JS for interactive maps
- **Email**: SendGrid for transactional emails
- **UI Components**: Radix UI primitives via shadcn/ui

### Development Dependencies
- **Build**: Vite with React plugin
- **TypeScript**: Full type safety across frontend and backend
- **Database Migrations**: Drizzle Kit for schema management

## Deployment Strategy

### Development Environment
- **Runtime**: Replit with Node.js 20 module
- **Database**: PostgreSQL 16 module provisioned via Replit
- **Development Server**: Runs on port 5000 with hot reload

### Production Build
- **Frontend**: Vite build generates static assets
- **Backend**: ESBuild bundles Node.js server
- **Deployment**: Autoscale deployment target on Replit
- **Port Configuration**: External port 80 mapping to local port 5000

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment flag for production/development

## Changelog

- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.