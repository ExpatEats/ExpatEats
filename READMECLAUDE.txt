# ExpatEats - Food Discovery Platform for Expats in Portugal

## Project Overview

ExpatEats is a full-stack web application designed to help expatriates in Portugal find sustainable food sources, connect with the local food community, and access nutrition services. The platform provides comprehensive guides for grocery stores, markets, restaurants, and specialty food retailers while supporting various dietary preferences and lifestyle choices.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express.js + TypeScript  
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui components
- **Maps**: Mapbox GL JS for location visualization
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Project Structure
```
ExpatEats/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and configurations
│   │   └── main.tsx           # Application entry point
│   └── index.html             # HTML template
├── server/                    # Backend Express.js application
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── db.ts                  # Database connection
│   ├── storage.ts             # Database operations
│   └── import*.ts             # Data import utilities
├── shared/                    # Shared types and schemas
│   └── schema.ts              # Database schema definitions
├── migrations/                # Database migration files
├── attached_assets/           # Data files and documentation
└── package.json               # Project dependencies
```

## Database Schema

The application uses PostgreSQL with the following main tables:

### Users Table (`users`)
- User authentication and profile information
- Fields: id, username, password, email, name, city, country, bio

### Places Table (`places`) 
- Food sources (stores, markets, restaurants) with detailed information
- Fields: id, name, description, address, city, region, country, category
- Location data: latitude, longitude
- Contact info: phone, email, instagram, website
- Dietary filters: glutenFree, dairyFree, nutFree, vegan, organic, etc.
- Review system: averageRating, status (pending/approved/rejected)

### Reviews Table (`reviews`)
- User ratings and comments for places
- Fields: id, placeId, userId, rating, comment, createdAt

### Nutrition Table (`nutrition`)
- Nutrition consultation requests
- Fields: id, name, email, goals, userId, status, createdAt

### Business Locations Table (`business_locations`)
- Additional business listings (supplements, lifestyle services)
- Fields: id, name, description, category, subcategory, location, tags

## Features

### User Authentication & Onboarding
- Simple registration with email and basic profile information
- Dietary preferences selection during onboarding
- localStorage-based session management for preferences

### Food Discovery
- Comprehensive database of food sources in Portuguese cities (primarily Lisbon area)
- Advanced filtering by location, category, and dietary requirements
- Interactive map view with custom markers
- Detailed store pages with contact information and user reviews

### Community Features
- Event listings for food-related community gatherings
- User submission system for new locations and events
- WhatsApp integration for direct founder communication
- Review and rating system for locations

### Admin Panel
- Location approval workflow for user submissions
- Bulk data import system for food sources
- Analytics and user management

### Services Integration
- Nutrition consultation booking
- Email notifications via SendGrid
- Feedback collection system

## Environment Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Required Environment Variables
Create a `.env` file in the root directory:
```
DATABASE_URL=postgresql://username:password@host:port/database
ADMIN_PASSWORD=your_admin_password
SENDGRID_API_KEY=your_sendgrid_api_key (optional)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token (optional)
```

### Installation & Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Ensure PostgreSQL is running
   - Create a database for the project
   - Run database migrations:
   ```bash
   npm run db:push
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:5000

4. **Type Checking**
   ```bash
   npm run check
   ```

5. **Production Build**
   ```bash
   npm run build
   npm start
   ```

### Database Migration
The project uses Drizzle Kit for database migrations:
- Schema definitions are in `shared/schema.ts`
- Migration files are generated in `migrations/` directory  
- Run `npm run db:push` to apply schema changes

## Data Import System

The application includes several data import utilities:

- `importLisbonFoodSources.ts` - Imports main Lisbon food source data
- `importAdditionalFoodSources.ts` - Imports specialized dietary food sources  
- `importLocationGuides.ts` - Imports data for Cascais, Oeiras, Sintra regions
- `importSupplementsData.ts` - Imports supplement store data
- `importEnhancedStores.ts` - Imports stores with detailed contact information

These can be triggered via API endpoints or run directly during development.

## API Endpoints

### Public Endpoints
- `GET /api/places` - Get all places with optional filters
- `GET /api/places/:id` - Get specific place details
- `POST /api/places` - Submit new place (pending approval)
- `GET /api/categories` - Get food categories
- `GET /api/cities` - Get featured cities
- `GET /api/testimonials` - Get user testimonials

### Admin Endpoints  
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/pending-places` - Get places awaiting approval
- `POST /api/admin/approve-place/:id` - Approve submitted place
- `POST /api/admin/reject-place/:id` - Reject submitted place

### User Endpoints
- `POST /api/users` - User registration
- `POST /api/reviews` - Submit place review
- `POST /api/nutrition` - Submit nutrition consultation request
- `POST /api/feedback` - Send feedback email

## Replit-Specific Files to Remove

The following files and configurations are specific to Replit and can be removed for local development:

### Files to Delete:
- `replit.md` - Replit project documentation

### Package.json Dependencies to Remove:
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-runtime-error-modal`

### Code References to Clean:
- In `vite.config.ts`: Remove the replit plugin imports and conditional loading
- In `client/index.html`: Remove the replit banner script tag:
  ```html
  <script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
  ```

### Environment Variables to Update:
- Remove any REPL_ID checks in the codebase
- Update port configuration if needed (currently hardcoded to 5000)

## Key Dependencies

### Production Dependencies
- `@neondatabase/serverless` - PostgreSQL serverless driver
- `drizzle-orm` - TypeScript ORM
- `express` - Web framework
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives
- `mapbox-gl` - Interactive maps
- `@sendgrid/mail` - Email service
- `wouter` - Lightweight router

### Development Dependencies  
- `vite` - Build tool and dev server
- `typescript` - Type checking
- `tailwindcss` - Utility-first CSS
- `drizzle-kit` - Database migrations
- `esbuild` - JavaScript bundler

## Security Considerations

- Admin authentication uses simple password check (consider upgrading to JWT/OAuth)
- Database credentials should be properly secured
- SendGrid API key should be stored securely
- Input validation is handled via Zod schemas
- SQL injection protection via Drizzle ORM parameterized queries

## Performance Optimization

- Images are optimized and served via CDN when possible
- Database queries are optimized with proper indexing
- Frontend uses code splitting via dynamic imports
- TanStack Query provides caching and background updates
- Mapbox integration is lazy-loaded

## Deployment Notes

- The application is designed to run on a single port (5000)
- Static files are served by Express in production
- Database connection uses connection pooling for performance
- Environment variables must be configured for external services

## Development Workflow

1. Make schema changes in `shared/schema.ts`
2. Run `npm run db:push` to apply database changes
3. Update API endpoints in `server/routes.ts` if needed
4. Add/modify frontend components in `client/src/`
5. Test locally with `npm run dev`
6. Run type checking with `npm run check`
7. Build for production with `npm run build`

This application provides a solid foundation for food discovery and community building for expatriates, with room for expansion into additional Portuguese cities and enhanced features.