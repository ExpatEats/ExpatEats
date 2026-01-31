# Location Edit Feature Implementation

## Overview
Implementing comprehensive location editing capabilities for administrators to edit all fields of approved/pending locations.

## Current State

### Backend
- **Endpoint**: `PATCH /api/admin/update-place/:id`
- **Current Fields**: Only `address`, `city`, `region`, `country`
- **Limitation**: Cannot edit name, description, category, tags, contact info, or feature flags
- **Storage Method**: `updatePlaceData()` - already supports all fields via `Partial<Place>`

### Frontend
- **Component**: `EditLocationModal.tsx`
- **Current Fields**: Only `address`, `city`, `region`, `country`
- **Limitation**: Only accessible during geocoding failures, not for general editing
- **No Edit Button**: Cannot edit approved locations from admin panel

## Implementation Plan

### Phase 1: Backend Enhancements ✅

#### 1.1 Expand API Endpoint ✅
- [x] Update `PATCH /api/admin/update-place/:id` route in `routes.ts`
- [x] Accept all editable fields:
  - Basic: `name`, `description`, `category`
  - Contact: `phone`, `email`, `website`, `instagram`
  - Tags: `tags` (array)
  - Boolean features: `glutenFree`, `dairyFree`, `nutFree`, `vegan`, `organic`, `localFarms`, `freshVegetables`, `farmRaisedMeat`, `noProcessed`, `kidFriendly`, `bulkBuying`, `zeroWaste`
  - Location: `address`, `city`, `region`, `country`
  - Admin: `status`, `softRating`, `michaelesNotes`, `adminNotes`
- [x] Exclude from editing: `id`, `coordinates` (latitude/longitude), `createdAt`, `reviewedAt`, `averageRating`, `userId`, `imageUrl`, `submittedBy`, `uniqueId`
- [x] Add validation for required fields
- [x] Add validation for enum values (category, status, softRating)

#### 1.2 Automatic Re-geocoding ✅
- [x] Detect if location fields changed (`address`, `city`, `region`, `country`)
- [x] If changed, trigger geocoding service
- [x] Update coordinates if geocoding succeeds
- [x] Log geocoding failures but don't block the update
- [x] Return geocoding results in response

#### 1.3 Storage Layer ✅
- [x] Verify `updatePlaceData()` supports all fields (already does via `Partial<Place>`)
- [x] No changes needed to storage.ts

### Phase 2: Frontend Enhancements ✅

#### 2.1 Expand EditLocationModal Component ✅
- [x] Add form fields for all editable properties:
  - **Basic Info Section**
    - `name` (Input) ✅
    - `description` (Textarea) ✅
    - `category` (Select dropdown) ✅
  - **Contact Info Section**
    - `phone` (Input) ✅
    - `email` (Input) ✅
    - `website` (Input) ✅
    - `instagram` (Input) ✅
  - **Location Section** (existing)
    - `address` (Input) ✅
    - `city` (Input) ✅
    - `region` (Input) ✅
    - `country` (Input) ✅
  - **Tags Section**
    - `tags` (Comma-separated input) ✅
  - **Dietary & Features Section**
    - Checkboxes for all boolean flags ✅
  - **Admin Notes Section** (optional, only for admins)
    - `status` (Select: pending/approved/rejected) ✅
    - `softRating` (Select) ✅
    - `michaelesNotes` (Textarea) ✅
    - `adminNotes` (Textarea) ✅

- [x] Organized into collapsible accordion sections for better UX
- [x] Added validation matching backend schema
- [x] Show geocoding info/alert when location section is open
- [x] Handle loading states during save

#### 2.2 Add Edit Functionality to Admin Panel ✅
- [x] Add "Edit" button to pending locations view
- [x] Wire up button to open `EditLocationModal` with selected place
- [x] Handle successful edit (refresh data, show notification)
- [x] Handle edit errors (show error notification)
- [x] Show geocoding results in notifications
- [ ] Add "Edit" button to approved locations (need to add approved locations view - future enhancement)

#### 2.3 Admin Panel Structure Updates
- [ ] Add new section for "Approved Locations" (future enhancement)
- [ ] Add search/filter for approved locations (future enhancement)
- [ ] Add pagination if needed (future enhancement)
- [ ] Show edit button on each location card (future enhancement)

### Phase 3: Integration & Testing ✅ / ⏳ / ❌

#### 3.1 Backend Testing
- [ ] Test updating individual fields
- [ ] Test updating multiple fields at once
- [ ] Test re-geocoding when location changes
- [ ] Test validation errors
- [ ] Test with invalid data
- [ ] Test permissions (admin-only)

#### 3.2 Frontend Testing
- [ ] Test opening edit modal from pending locations
- [ ] Test opening edit modal from approved locations (once implemented)
- [ ] Test editing all field types (text, select, checkboxes, arrays)
- [ ] Test form validation
- [ ] Test successful save
- [ ] Test error handling
- [ ] Test geocoding feedback when location changes

#### 3.3 End-to-End Testing
- [ ] Edit a pending location and approve it
- [ ] Edit an approved location
- [ ] Change address and verify re-geocoding works
- [ ] Edit tags and feature flags
- [ ] Edit admin notes and ratings
- [ ] Verify changes persist in database

## Technical Details

### Backend Schema (from shared/schema.ts)

```typescript
// Fields that CAN be edited:
- name: string
- description: string
- address: string
- city: string
- region: string | null
- country: string
- category: string (enum: market, restaurant, grocery, community)
- tags: string[] | null
- phone: string | null
- email: string | null
- instagram: string | null
- website: string | null
- glutenFree, dairyFree, nutFree, vegan, organic, localFarms,
  freshVegetables, farmRaisedMeat, noProcessed, kidFriendly,
  bulkBuying, zeroWaste: boolean | null
- status: string (enum: pending, approved, rejected)
- softRating: string | null (enum: Gold Standard, Great Choice, This Will Do in a Pinch)
- michaelesNotes: string | null
- adminNotes: string | null

// Fields that CANNOT be edited (managed by system):
- id: number (primary key)
- uniqueId: string | null (from import)
- latitude, longitude: string | null (only via geocoding)
- userId: number | null (foreign key)
- imageUrl: string | null (separate upload flow)
- averageRating: number | null (calculated from reviews)
- submittedBy: string | null (original submitter)
- createdAt: Date
- reviewedAt: Date | null
```

### API Request/Response Format

**Request:**
```typescript
PATCH /api/admin/update-place/:id
{
  name?: string,
  description?: string,
  category?: string,
  address?: string,
  city?: string,
  region?: string,
  country?: string,
  phone?: string,
  email?: string,
  website?: string,
  instagram?: string,
  tags?: string[],
  glutenFree?: boolean,
  // ... other boolean flags
  status?: string,
  softRating?: string,
  michaelesNotes?: string,
  adminNotes?: string
}
```

**Response (Success):**
```typescript
{
  success: true,
  message: "Place updated successfully",
  place: Place, // Updated place object
  geocoding?: {
    triggered: boolean,
    success: boolean,
    coordinates?: { latitude: string, longitude: string },
    error?: string
  }
}
```

**Response (Error):**
```typescript
{
  message: "Validation error message"
}
```

## Files to Modify

### Backend
- `/server/routes.ts` - Expand PATCH `/api/admin/update-place/:id` endpoint
- `/server/storage.ts` - No changes needed (already supports Partial<Place>)

### Frontend
- `/client/src/components/EditLocationModal.tsx` - Expand to include all fields
- `/client/src/pages/Admin.tsx` - Add edit buttons and approved locations view

## Progress Tracking

- [x] Planning & Documentation
- [x] Backend Implementation
- [x] Frontend Implementation
- [ ] Integration Testing
- [ ] Deployment

## Notes

### Design Decisions

1. **Coordinates Protection**: Coordinates (latitude/longitude) cannot be directly edited. They are only updated through automatic geocoding when location fields change.

2. **Automatic Geocoding**: When `address`, `city`, `region`, or `country` fields are modified, the system automatically attempts to geocode the new location. If geocoding fails, the update still succeeds but without new coordinates.

3. **Partial Updates**: The endpoint accepts partial updates - only send fields that changed. This prevents accidental data loss.

4. **Validation**: Both frontend and backend validate data to ensure data integrity.

5. **Admin Only**: This functionality is restricted to admin users only.

### Future Enhancements

- [ ] Image upload capability in edit modal
- [ ] Audit trail to track who edited what and when
- [ ] Bulk edit functionality for multiple locations
- [ ] Compare view to see before/after changes
- [ ] Revert changes functionality

## Issues & Blockers

None currently identified.

## Completed Date

_To be filled when implementation is complete_
