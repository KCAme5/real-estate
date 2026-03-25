# Dashboard Routing Configuration

## Automatic User Type Routing

The application now automatically routes users to the correct dashboard based on their `user_type` (client or agent).

### How It Works

#### 1. **Login/Register Pages** (`/auth/login` and `/auth/register`)
- After successful authentication, users are redirected based on their user_type
- **Agents** → `/dashboard/agent`
- **Clients** → `/dashboard`

#### 2. **Dashboard Pages**
- **Client Dashboard** (`/dashboard`)
  - Accessible only by users with `user_type: 'client'`
  - Agents attempting to access are redirected to `/dashboard/agent`
  
- **Agent Dashboard** (`/dashboard/agent`)
  - Accessible only by users with `user_type: 'agent'`
  - Clients attempting to access are redirected to `/dashboard`

#### 3. **Shared Routes**
These routes adapt based on user type:
- `/dashboard/bookings` - Show client bookings or agent appointments
- `/dashboard/messages` - Chat interface for both
- `/dashboard/settings` - Profile settings for both

#### 4. **Agent-Only Routes**
These are nested under `/dashboard/agent/`:
- `/dashboard/agent/properties` - Manage listings
- `/dashboard/agent/leads` - Manage leads
- `/dashboard/agent/analytics` - View analytics

#### 5. **Client-Only Routes**
These are at the dashboard root:
- `/dashboard/saved` - Saved properties
- `/dashboard/bookings` - View bookings

### Technical Implementation

#### Login Page (`app/(auth)/login/page.tsx`)
```tsx
const handleSubmit = async (e: React.FormEvent) => {
    await login(formData.email, formData.password);
    
    setTimeout(() => {
        if (user?.user_type === 'agent') {
            router.push('/dashboard/agent');
        } else {
            router.push('/dashboard');
        }
    }, 100);
};
```

#### Register Page (`app/(auth)/register/page.tsx`)
Already had the correct redirect logic:
```tsx
if (formData.user_type === 'agent') {
    router.push('/dashboard/agent');
} else {
    router.push('/dashboard');
}
```

#### Dashboard Pages
Both client and agent dashboards have route protection:
```tsx
// Client dashboard redirects agents
useEffect(() => {
    if (user && user.user_type === 'agent') {
        router.push('/dashboard/agent');
    }
}, [user, router]);

// Agent dashboard redirects clients
useEffect(() => {
    if (user && user.user_type !== 'agent') {
        router.push('/dashboard');
    }
}, [user, router]);
```

#### Middleware (`middleware.ts`)
- Protects dashboard routes (requires authentication)
- Redirects authenticated users away from auth pages
- Prevents unauthorized access

### User Flow

**New Client Registration:**
1. Visit `/auth/register`
2. Select "Client" user type
3. Fill registration form
4. Submit
5. **Automatically redirected to** `/dashboard` ✅

**New Agent Registration:**
1. Visit `/auth/register`
2. Select "Agent" user type
3. Fill registration form with license info
4. Submit
5. **Automatically redirected to** `/dashboard/agent` ✅

**Client Login:**
1. Visit `/auth/login`
2. Enter credentials (client user)
3. Click login
4. **Automatically redirected to** `/dashboard` ✅

**Agent Login:**
1. Visit `/auth/login`
2. Enter credentials (agent user)
3. Click login
4. **Automatically redirected to** `/dashboard/agent` ✅

**Trying to Access Wrong Dashboard:**
- Client goes to `/dashboard/agent` → **Redirected to** `/dashboard`
- Agent goes to `/dashboard` → **Redirected to** `/dashboard/agent`

### Security Features

✅ **Authentication Required** - Cannot access dashboards without login
✅ **Role-Based Access** - Cannot access wrong dashboard
✅ **Auto Redirect** - Seamless user experience
✅ **Protected Shared Routes** - Requires authentication
✅ **Logout Clears Session** - All tokens and cookies cleared

### Testing the Routing

1. **Test Client Login:**
   ```
   Email: client@example.com
   Password: clientpass123
   Expected: Redirect to /dashboard
   ```

2. **Test Agent Login:**
   ```
   Email: agent@example.com
   Password: agentpass123
   Expected: Redirect to /dashboard/agent
   ```

3. **Test Role Redirect:**
   - Login as agent, visit `/dashboard` → should redirect to `/dashboard/agent`
   - Login as client, visit `/dashboard/agent` → should redirect to `/dashboard`

4. **Test Auth Redirect:**
   - Login as user, visit `/auth/login` → should redirect to appropriate dashboard

### Configuration Files

- **Login:** `app/(auth)/login/page.tsx`
- **Register:** `app/(auth)/register/page.tsx`
- **Client Dashboard:** `app/(dashboard)/page.tsx`
- **Agent Dashboard:** `app/(dashboard)/agent/page.tsx`
- **Middleware:** `middleware.ts`
- **Auth Context:** `contexts/AuthContext.tsx`
- **Sidebar Navigation:** `components/dashboard/DashboardSidebarClient.tsx`

---

**Status:** ✅ Complete - All routing properly configured
