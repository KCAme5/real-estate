# Implementation Plan: Map Improvements

## Requirements Restatement
1. Verify OpenStreetMap tiles are being used (not Google Maps) - Check current implementation
2. Ensure property markers plot from /api/properties/?search=... - Confirm API integration
3. Add click marker → popup with property details - Already implemented, verify functionality

## Current State Analysis
- MapView component (`realestate-f\components\map\MapView.tsx`) already exists and uses OpenStreetMap tiles
- Properties page (`realestate-f\app\(main)\properties\page.tsx`) shows static Google Maps image instead of interactive map
- MapView component already has click-to-popup with property details functionality
- MapView fetches properties from `/properties/` endpoint (line 113 in MapView.tsx)

## Implementation Phases

### Phase 1: Replace Static Map with Interactive MapView
- Modify properties page to conditionally render MapView component when viewMode === 'map'
- Remove the static Google Maps image placeholder (lines 102-117 in properties page)
- Import and use the MapView component in the properties page

### Phase 2: Ensure Proper API Integration
- Verify MapView uses correct API endpoint with search parameters
- Ensure searchQuery and filterType from MapView are synchronized with properties page filters
- Test that /api/properties/?search=... returns correct data for markers

### Phase 3: Verify Popup Functionality
- Confirm click marker opens popup with property details
- Verify "View Details" button navigates to property detail page
- Check that all property information displays correctly in popup

## Dependencies
- Leaflet library (already installed)
- MapView component (already implemented)
- Properties API endpoint (already exists)

## Risks
- LOW: MapView component already implements core functionality
- MEDIUM: Ensuring proper state synchronization between properties page filters and map filters
- LOW: CSS/styling conflicts when embedding MapView in properties page

## Estimated Complexity: LOW
- Backend: 0 hours (API already exists)
- Frontend: 2-3 hours
- Testing: 1-2 hours
- Total: 3-5 hours

## Files to Modify
1. `realestate-f\app\(main)\properties\page.tsx` - Replace static map with MapView
2. Potentially `realestate-f\components\map\MapView.tsx` - Minor adjustments if needed for integration

## Testing Approach
- Verify OpenStreetMap tiles load (not Google Maps)
- Test that markers appear for properties returned from API
- Test search/filter functionality updates markers correctly
- Test click marker opens popup with correct property details
- Test "View Details" button navigation
- Responsive design testing on different screen sizes

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)