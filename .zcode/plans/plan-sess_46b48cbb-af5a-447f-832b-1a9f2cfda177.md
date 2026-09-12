
## Plan: Full Migration to Supabase (Remove Express Backend)

### What we're doing
Replace the entire Express + Prisma + SQLite + Socket.io backend with **Supabase** — using Supabase Auth, Supabase PostgreSQL, and Supabase Realtime, all accessed directly from the React frontend.

### Phase 1: Supabase Database Setup
**Create SQL schema** (`supabase/schema.sql`) matching the current 10 Prisma models:
- `restaurants` — restaurant info
- `profiles` — replaces both `User` (staff) and `Customer` models, linked to `auth.users`. Role field (`owner`/`chef`/`waiter`/`customer`) distinguishes user types. Customer-specific fields (points, total_spent, visit_count) included with defaults.
- `categories` — with unique constraint on (restaurant_id, slug)
- `menu_items` — linked to restaurant + category
- `tables` — with unique constraint on (restaurant_id, number)
- `orders` — linked to restaurant, staff (claimed_by), customer (customer_id)
- `order_items` — linked to order + menu_item
- `payments` — linked to order
- `reservations` — linked to restaurant + customer

**Create PostgreSQL function** for order status state machine validation.

**Create Row Level Security (RLS) policies**:
- Public read: categories, menu_items, tables, restaurant info
- Authenticated read/write: orders, payments, reservations
- Role-based: staff management only for owners

**Seed script** (`supabase/seed.sql`) with the same Hotel Siraj demo data (owner, chef, 2 waiters, 8 categories, 40 menu items, 15 tables, 1 demo customer).

### Phase 2: Frontend Supabase Client Setup
- Install `@supabase/supabase-js` (replace `socket.io-client`)
- Create `src/lib/supabase.js` — initialize Supabase client with the provided URL and anon key
- Create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Remove unused `src/services/api.js` and `src/services/socket.js`

### Phase 3: Authentication Migration
**`src/context/AuthContext.jsx`** (Staff: owner/chef/waiter):
- Replace custom fetch login/register with `supabase.auth.signInWithPassword()` / `supabase.auth.signUp()`
- After signup, insert a row into `profiles` table with role='owner' (or appropriate role)
- Use `supabase.auth.onAuthStateChange()` for session management
- Remove localStorage-based token management (Supabase handles JWT automatically)

**`src/context/CustomerAuthContext.jsx`** (Customers):
- Same Supabase Auth approach, but create profile with role='customer'
- Load customer-specific data (points, loyalty) from `profiles` table

**`src/components/ProtectedRoute.jsx`**:
- Update auth check to use Supabase session state instead of localStorage

**Auth triggers**: Create a PostgreSQL trigger that auto-creates a profile row on user signup (as a safety net).

### Phase 4: Data Layer Migration
**`src/context/RestaurantContext.jsx`**:
- Replace 4 fetch calls with Supabase queries: `supabase.from('restaurants').select()`, `.from('categories')`, `.from('menu_items')`, `.from('tables')`
- Remove mock data fallback (or keep as last resort)

**`src/context/OrderContext.jsx`**:
- Replace fetch calls with Supabase queries for orders
- Replace socket.io event listeners with `supabase.channel()` Realtime subscriptions on the `orders` table
- Order status updates via `supabase.from('orders').update()` (with state machine validation)

**`src/context/ReservationContext.jsx`**:
- Same pattern — Supabase queries + Realtime subscriptions on `reservations` table

**All pages with direct fetch calls** (OrderTracking, Staff pages, WaiterSetup, onboarding pages, etc.):
- Update to use Supabase client via context or direct imports

### Phase 5: Cleanup
- Remove `socket.io-client` from `package.json`
- Remove backend dependency scripts
- Update `package.json` scripts (no more `backend:dev` or similar)
- Remove `backend/` directory references from `.gitignore` and docs

### Files Created (New)
| File | Purpose |
|------|---------|
| `supabase/schema.sql` | Full database schema + RLS policies |
| `supabase/seed.sql` | Demo data (Hotel Siraj) |
| `src/lib/supabase.js` | Supabase client initialization |
| `.env` | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |

### Files Modified (Major Changes)
| File | Change |
|------|--------|
| `src/context/AuthContext.jsx` | Supabase Auth for staff |
| `src/context/CustomerAuthContext.jsx` | Supabase Auth for customers |
| `src/context/OrderContext.jsx` | Supabase queries + Realtime |
| `src/context/RestaurantContext.jsx` | Supabase queries |
| `src/context/ReservationContext.jsx` | Supabase queries + Realtime |
| `src/main.jsx` | Remove socket.io init |
| `src/components/ProtectedRoute.jsx` | Supabase session check |
| All pages with direct `fetch()` calls | Switch to Supabase client |
| `package.json` | Swap socket.io-client → @supabase/supabase-js |

### Files Removed / Deprecated
| File | Reason |
|------|--------|
| `src/services/api.js` | Replaced by Supabase client |
| `src/services/socket.js` | Replaced by Supabase Realtime |
| `backend/` (entire directory) | No longer needed |

### Important Notes for the User
1. **The SQL schema and seed script must be run manually** in the Supabase SQL Editor (Dashboard → SQL Editor) to create tables and seed data
2. **Supabase Auth email confirmation** may need to be disabled for development (Dashboard → Auth → Settings → uncheck "Enable email confirmations") — otherwise sign-up emails are required
3. **Supabase Realtime** needs to be enabled for the `orders` and `reservations` tables (Dashboard → Realtime → enable those tables)
4. The `sb_publishable_` key you provided is the anon key — it's safe for frontend use when RLS is configured properly
