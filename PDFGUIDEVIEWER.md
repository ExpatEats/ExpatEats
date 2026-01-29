# PDF Guide Viewer Implementation

## Overview
Implementation of a purchaseable PDF guide system where users can view guides on the website without being able to download them directly.

## Design Decisions

### 1. PDF Rendering Solution
- **Choice**: react-pdf (built on Mozilla's PDF.js)
- **Reasoning**:
  - Native React integration
  - Good performance with canvas rendering
  - Customizable UI
  - Can disable download buttons in UI
  - Battle-tested library with active maintenance

### 2. Security Approach (Multi-Layer)
**Important**: No client-side solution can truly prevent downloading. Strategy is deterrence + legal protection.

#### Server-Side Protection (Primary)
- Authenticate users before serving PDFs
- Use signed, temporary URLs that expire
- Check purchase status on Express backend
- Serve PDFs through API endpoint, not static hosting
- One-page-at-a-time delivery (don't send entire PDF at once)

#### Client-Side Deterrents
- Disable right-click context menu
- Remove download buttons from viewer UI
- Add watermarks with user email/ID
- Render pages individually (lazy loading)

#### Legal Protection
- Terms of service prohibiting redistribution
- Copyright notices on each page/guide
- Track access in database for audit trail

### 3. Database Schema

#### guides Table (Simplified)
**Columns:**
- `id` (serial, primary key)
- `slug` (text, unique) - URL-friendly identifier (e.g., 'lisbon-food-guide')
- `url` (text) - Full path to PDF file (e.g., '/guides/full/lisbon-food-guide.pdf')

**Reasoning:**
- Minimal schema - all guide metadata (title, description, price) will be managed externally or hardcoded
- `slug` for clean routing
- `url` points to actual PDF file location
- Keeps database lean and simple

#### guide_purchases Table (Linking Table)
**Columns:**
- `id` (serial, primary key)
- `userId` (integer, foreign key → users.id)
- `guideId` (integer, foreign key → guides.id)
- `paymentProvider` (text) - e.g., 'stripe', 'paypal', 'manual'
- `purchasedAt` (timestamp, default now)

**Constraints:**
- Unique constraint on `(userId, guideId)` - prevents duplicate purchases

**Reasoning:**
- Simple many-to-many relationship between users and guides
- `paymentProvider` tracks how the purchase was made
- Unique constraint ensures each user can only purchase each guide once

### 4. File Storage Structure
```
/guides
  /full           # Full PDF files (secured, auth required)
```

**Reasoning**:
- Simple directory structure for now
- All PDFs stored in `/guides/full/`
- Can expand to include covers/previews later if needed

### 5. PDF Delivery Method
- **Stream pages individually**: Don't send entire PDF at once
- **Temporary signed URLs**: Expire after 5-15 minutes
- **User-specific URLs**: Include userId hash in signature
- **Rate limiting**: Prevent bulk page scraping

### 6. Frontend Navigation & Access Control
**User Menu Integration:**
- Add "Purchases" option to user menu (same location where "Admin Panel" appears for admins)
- Under "Purchases", add "Guides" section showing all purchased guides
- **Admin Override**: If user is admin, show ALL guides in the system (regardless of purchase status)
- Regular users only see guides they have purchased

**Reasoning:**
- Centralized location for all user purchases (guides, future products)
- Admin convenience - no need to purchase guides to view/test them
- Consistent UI pattern with existing admin panel menu structure

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Add `guides` table to `shared/schema.ts` (id, slug, url)
- [ ] Add `guide_purchases` table to `shared/schema.ts` (id, userId, guideId, paymentProvider, purchasedAt)
- [ ] Add unique constraint on `(userId, guideId)` for guide_purchases
- [ ] Add insert schemas for both tables
- [ ] Add TypeScript types for both tables
- [ ] Run database migration (`npm run db:push`)
- [ ] Add seed data for testing (1-2 sample guides)

### Phase 2: File Structure
- [ ] Create `/guides` directory in project root
- [ ] Create `/guides/full` subdirectory
- [ ] Add `.gitkeep` file to preserve empty directory
- [ ] Add sample PDF file for testing (e.g., `test-guide.pdf`)
- [ ] Update `.gitignore` if needed (decide: commit PDFs or not?)

### Phase 3: Backend API Routes
- [ ] **GET /api/user/guides** - Get guides for current user (purchased + all if admin) (authenticated)
- [ ] **GET /api/guides/:slug/access** - Check if user has access to specific guide (authenticated)
- [ ] **GET /api/guides/:slug/view** - Serve PDF with authentication (authenticated)
- [ ] **POST /api/guides/:id/purchase** - Purchase a guide (authenticated) - for future use
- [ ] Add middleware to verify guide purchase before serving PDF (admins bypass check)
- [ ] Add rate limiting to PDF viewing endpoints
- [ ] Admin check: if user.role === 'admin', grant access to all guides

### Phase 4: Frontend - User Menu Integration
- [ ] Locate existing user menu component (where admin panel link appears)
- [ ] Add "Purchases" menu item to user dropdown/menu
- [ ] Create `/client/src/pages/Purchases.tsx` page
- [ ] Add routing for `/purchases` route
- [ ] Create "Guides" section within Purchases page
- [ ] Fetch user's purchased guides from `/api/user/guides`
- [ ] Display guide cards (slug, link to viewer)
- [ ] If user is admin, display ALL guides from database
- [ ] Add visual indicator if viewing as admin (e.g., "Admin View - All Guides")

### Phase 5: Frontend - PDF Viewer
- [ ] Install dependencies: `npm install react-pdf pdfjs-dist`
- [ ] Create `/client/src/components/PdfViewer.tsx`
- [ ] Configure PDF.js worker
- [ ] Implement page navigation (prev/next)
- [ ] Add page number indicator
- [ ] Add zoom controls
- [ ] Disable right-click context menu
- [ ] Hide/remove download buttons
- [ ] Add loading states
- [ ] Add error handling
- [ ] Implement responsive layout (mobile-friendly)

### Phase 6: Security Implementation
- [ ] Implement signed URL generation (server-side)
- [ ] Add URL signature verification middleware
- [ ] Set URL expiration time (15 minutes recommended)
- [ ] Add user watermark to PDF pages (optional but recommended)
- [ ] Add rate limiting to prevent scraping
- [ ] Test authentication flow (redirect to login if not authenticated)
- [ ] Test authorization flow (verify purchase before viewing)

### Phase 7: Guide Purchase Flow (Future)
- [ ] Create public guide catalog/store page
- [ ] Add guide detail pages with pricing info
- [ ] Implement "Purchase" button functionality
- [ ] Integrate with payment provider
- [ ] Create purchase confirmation page
- [ ] Send purchase confirmation email
- [ ] Update guide_purchases table on successful payment

### Phase 8: Admin Panel
- [ ] Create admin page to manage guides
- [ ] Add guide creation form
- [ ] Add guide editing form
- [ ] Upload PDF file functionality
- [ ] Upload cover image functionality
- [ ] Toggle `isPublished` / `isActive` status
- [ ] View purchase analytics (total sales, revenue per guide)
- [ ] Revoke user access (refunds, abuse)

### Phase 9: Testing & Polish
- [ ] Test PDF viewer on desktop browsers (Chrome, Firefox, Safari)
- [ ] Test PDF viewer on mobile devices
- [ ] Test authentication flow (unauthenticated users redirected)
- [ ] Test authorization flow (users without purchase blocked)
- [ ] Test edge cases (large PDFs, slow connections)
- [ ] Performance testing (page load times)
- [ ] Accessibility testing (keyboard navigation, screen readers)
- [ ] Add loading skeletons
- [ ] Add error messages (network errors, access denied, etc.)
- [ ] Test expired URL handling

### Phase 10: Payment Integration (Future)
- [ ] Choose payment provider (Stripe recommended)
- [ ] Set up payment provider account
- [ ] Install payment SDK (e.g., `npm install stripe`)
- [ ] Create checkout endpoint
- [ ] Handle payment webhooks
- [ ] Update `guide_purchases` on successful payment
- [ ] Add receipt email functionality
- [ ] Test payment flow in sandbox mode
- [ ] Test refund flow

## Technical Notes

### react-pdf Configuration
```typescript
// Worker configuration needed
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
```

### Signed URL Example (Conceptual)
```typescript
// Server-side
const signedUrl = generateSignedUrl({
  guideId: guide.id,
  userId: user.id,
  expiresIn: 900 // 15 minutes in seconds
});

// URL format: /api/guides/123/view?token=abc123&expires=1234567890&signature=xyz789
```

### Rate Limiting Strategy
- Max 100 page requests per hour per user
- Max 5 full guide accesses per day per guide
- Block IP if excessive requests detected

## Future Enhancements
- [ ] PDF annotation tools (highlighting, notes)
- [ ] Offline viewing (PWA with encrypted local storage)
- [ ] Guide bundles (buy multiple guides at discount)
- [ ] Gift guide functionality
- [ ] Guide updates notification system
- [ ] Mobile app (React Native)
- [ ] Print-friendly version (limited pages)
- [ ] Multiple language support

## Security Considerations
**Known vulnerabilities** (accept as trade-offs):
1. Users can screenshot pages
2. Users can use browser dev tools to access network requests
3. Users can use print-to-PDF
4. Determined users can reconstruct PDF from canvas data

**Mitigation strategy**: Focus on making it inconvenient, not impossible. Most users won't go through the effort. Legal terms and watermarks provide recourse for abuse.

## Questions to Resolve
- [ ] Should PDFs be committed to git or stored separately? (S3, etc.)
- [ ] What's the refund policy? (affects `accessRevoked` logic)
- [ ] Time-limited access or lifetime? (affects `expiresAt` usage)
- [ ] Do guide updates require repurchase or free for existing owners?
- [ ] Watermark on every page or just first/last?
- [ ] Allow printing? (can be disabled in CSS but not enforced)
