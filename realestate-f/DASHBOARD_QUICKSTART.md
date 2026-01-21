# Dashboard Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:8000`

### Running the Application

```bash
cd c:\Users\Chan\Desktop\RealEstate\realestate-f

# Install dependencies if needed
npm install

# Run the development server
npm run dev
```

The app should be accessible at `http://localhost:3000`

---

## 📱 Testing the Dashboards

### Client Dashboard
1. **Login as a Client:**
   - Navigate to `/auth/login` or click Sign In
   - Use credentials for a user with `user_type: "client"`
   - You'll be redirected to `/dashboard`

2. **Explore Client Features:**
   - View overview stats (Saved, Messages, Bookings, Notifications)
   - Browse recommended properties
   - Check recent activity feed
   - View upcoming bookings in table
   - Use quick action buttons

3. **Navigate Client Pages:**
   - **Saved Properties** (`/dashboard/saved`) - Filter and search properties
   - **My Bookings** (`/dashboard/bookings`) - View and manage viewings
   - **Messages** (`/dashboard/messages`) - Chat with agents
   - **Settings** (`/dashboard/settings`) - Update profile and preferences

### Agent Dashboard
1. **Login as an Agent:**
   - Navigate to `/auth/login`
   - Use credentials for a user with `user_type: "agent"`
   - You'll be redirected to `/dashboard/agent`

2. **Explore Agent Features:**
   - View performance metrics (Properties, Leads, Messages, Views, Conversion Rate)
   - View lead conversion and property performance charts
   - Review recent leads
   - Check today's schedule
   - Browse active listings

3. **Navigate Agent Pages:**
   - **Properties** (`/dashboard/properties`) - Manage your listings
   - **Leads** (`/dashboard/leads`) - Track and manage leads
   - **Bookings** (`/dashboard/bookings`) - Manage client appointments
   - **Analytics** (`/dashboard/analytics`) - View detailed performance reports
   - **Messages** (`/dashboard/messages`) - Communicate with clients
   - **Settings** (`/dashboard/settings`) - Update profile and preferences

---

## 🎨 UI Features to Test

### Header
- [x] Logo click (should stay on page or go home)
- [x] Notifications bell (badge shows count, click opens dropdown)
- [x] Messages indicator (agent only)
- [x] User menu (click avatar to open dropdown)
- [x] Profile, Settings, Logout buttons work

### Sidebar
- [x] All navigation links are clickable
- [x] Current page is highlighted
- [x] Pro tip section displays
- [x] Mobile: Menu button collapses/expands sidebar
- [x] Mobile: Sidebar closes when link is clicked

### Overview Cards
- [x] Stats display correctly
- [x] Icons show properly
- [x] Colors are distinct (primary, success, warning, error)
- [x] Responsive on mobile (stack vertically)

### Property Cards
- [x] Cards render in grid (4 columns on desktop, responsive)
- [x] Image placeholders display
- [x] Title and location show
- [x] Price, beds, baths, rating display
- [x] Cards are clickable (navigate to property detail)
- [x] Hover effects work

### Booking/Lead Items
- [x] Status badges show correct color
- [x] Date and time display
- [x] Agent/client names show
- [x] Action buttons are clickable
- [x] Responsive layout on mobile

### Tables
- [x] All columns visible on desktop
- [x] Horizontally scrollable on mobile
- [x] Status badges display correctly
- [x] Data is properly formatted

### Charts
- [x] Bar chart renders for conversion rate
- [x] Progress bars show for property performance
- [x] Percentages display correctly
- [x] Responsive sizing

### Forms (Settings)
- [x] Tab switching works
- [x] Profile tab: Update name, phone
- [x] Preferences tab: Location and price range selection
- [x] Notifications tab: Toggle switches
- [x] Security tab: Password fields
- [x] All buttons functional

### Messages
- [x] Conversation list shows correctly
- [x] Selecting a conversation shows chat
- [x] Messages display with sender/receiver styles
- [x] Input field works
- [x] Send button is clickable

---

## 🔍 Common Test Cases

### Navigation Flow
```
Login → Dashboard → Each Page → Settings → Messages → Back to Dashboard
```

### Mobile Experience
1. Open DevTools (F12)
2. Toggle Device Toolbar
3. Select iPhone 12 or similar
4. Test all pages in mobile view:
   - Sidebar toggle works
   - Buttons are touch-friendly
   - Cards stack vertically
   - Tables are scrollable
   - No horizontal overflow

### Dark Mode (if implemented)
1. Look for theme toggle
2. Switch between light/dark
3. Verify colors are readable
4. Check contrast ratios

---

## 🧪 Data You Should See

### Client Dashboard
- Welcome message with your first name
- Current date displayed
- Stats: 12 saved, 4 active conversations, 3 bookings, 7 unread
- 4 recommended properties
- Recent activity with timestamps
- 3 upcoming appointments

### Agent Dashboard
- Welcome message with your first name
- Performance stats: 24 props, 18 leads, 12 msgs, 8 bookings, 1,245 views, 68% conversion
- Conversion rate chart showing trend
- Property performance with bars
- 2 recent leads
- 3 today's schedule items
- 4 active listings

---

## ⚙️ Integration Checklist

To fully integrate with your backend:

- [ ] Connect PropertyCard to `/api/properties/` endpoint
- [ ] Connect BookingsList to `/api/bookings/` endpoint
- [ ] Connect LeadItem to `/api/leads/` endpoint
- [ ] Connect Charts to `/api/analytics/` endpoint
- [ ] Connect RecentActivity to activity logs
- [ ] Connect Settings to user profile API
- [ ] Connect Messages to chat/messaging API
- [ ] Add loading states and error handling
- [ ] Add real image loading from media endpoints
- [ ] Implement pagination for lists

---

## 🐛 Troubleshooting

### Dashboard Not Loading
- Check if user is authenticated (`useAuth()` should return user)
- Check browser console for errors
- Verify all imports are correct
- Check that AuthContext is properly set up

### Styling Issues
- Make sure DaisyUI is included in `tailwind.config.ts`
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

### Icons Not Showing
- Verify `lucide-react` is installed
- Check icon names are correct
- Browser console should show if icons fail to load

### Sidebar Not Responsive
- Check viewport width in DevTools
- Mobile breakpoint is set at `md:` (768px)
- Verify sidebar toggle button is visible on mobile

### Links Not Working
- Verify Next.js `Link` component is used
- Check route paths match actual file structure
- Watch for typos in `href` attributes

---

## 📋 Feature Completeness

✅ **Implemented:**
- Dashboard layouts (client & agent)
- Header with notifications and user menu
- Responsive sidebar with role-based navigation
- Overview stat cards
- Property card grid
- Booking/appointment display
- Lead management
- Activity feed
- Analytics charts
- Settings with tabs
- Messages interface
- Mobile responsive design
- DaisyUI styling

⏳ **Ready for Backend Integration:**
- Real data loading
- API calls for metrics
- Image uploads
- Message sending
- Form submissions
- Error handling
- Loading states
- Pagination

---

## 📞 Support

For issues or questions:
1. Check the DASHBOARD_GUIDE.md for component documentation
2. Review MIGRATION_NOTES.md for structure changes
3. Look at component source files for implementation details
4. Check console for error messages

---

**Happy Testing!** 🎉
