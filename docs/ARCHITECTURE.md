# Lootly - Architecture & Development Guidelines

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
├─────────────────────┬─────────────────────┬─────────────────────┤
│   Customer App      │     Staff App       │   Admin Dashboard   │
│   (React PWA)       │    (React PWA)      │   (React - Future)  │
│   Mobile-first      │   Tablet-optimized  │   Desktop           │
│   Port 5173         │   Port 5174         │   Port 5175         │
└─────────┬───────────┴──────────┬──────────┴─────────┬───────────┘
          │                      │                    │
          │              HTTPS / REST API             │
          │                      │                    │
          └──────────────────────┼────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                 │
│                   (Node.js + Express)                           │
│                      Port 3001                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Auth        │  │ Customers   │  │ Transactions            │  │
│  │ Middleware  │  │ Service     │  │ Service                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Business    │  │ Rewards     │  │ Rules Engine            │  │
│  │ Service     │  │ Service     │  │ (Evaluation Logic)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                    │
│                  (SQLite - lootly.db)                           │
│                                                                  │
│   Single file, portable, no server needed                       │
│   Location: backend/db/lootly.db                                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Check-in Flow
```
Customer shows QR → Staff scans → Staff enters spend → Backend processes
     │                  │               │                    │
     │                  │               │                    ├─ Calculate points
     │                  │               │                    ├─ Record visit
     │                  │               │                    ├─ Evaluate all rules
     │                  │               │                    ├─ Trigger awards
     │                  │               │                    └─ Return result
     │                  │               │                           │
     │                  │               └─── Staff sees confirmation ◄─┘
     │                  │                           │
     └── Customer sees points update ◄──────────────┘ (via refresh or push)
```

### Redemption Flow
```
Customer selects reward → Shows redemption QR → Staff scans → Staff confirms
        │                        │                  │              │
        │                        │                  │              ├─ Verify code
        │                        │                  │              ├─ Mark redeemed
        │                        │                  │              └─ Return success
        │                        │                  │                     │
        │                        │                  └─ Staff sees reward ◄─┘
        │                        │                     details
        └── Customer sees reward marked as used ◄────────────────────────┘
```

## Authentication

### Customer Auth
```
Phone Number → Request Code → (Mock: always "1234") → Verify → JWT Token
                                                                   │
                                                    Stored in localStorage
                                                    Sent as Bearer token
```

### Staff Auth
```
Location + PIN → Verify PIN → JWT Token (includes location_id)
                                   │
                    Stored in sessionStorage (not persistent)
                    Sent as Bearer token
```

### JWT Payload
```javascript
// Customer token
{
  type: "customer",
  customer_id: "cust_xxx",
  phone: "+15551234567",
  exp: <timestamp>
}

// Staff token
{
  type: "staff",
  staff_id: "staff_xxx",
  location_id: "loc_xxx",
  business_id: "biz_xxx",
  exp: <timestamp>
}
```

---

## Development Guidelines

### DO ✅

1. **Keep it simple**
   - MVP means minimum viable — cut scope, not corners
   - If unsure between two approaches, pick the simpler one
   - Working > Perfect

2. **Test as you go**
   - Test each API endpoint with curl before moving on
   - Test each UI component in the browser before building the next
   - Don't build everything then test at the end

3. **Commit often**
   - Commit after each working feature
   - Use clear commit messages: "Add customer QR code generation"
   - Don't commit broken code

4. **Handle errors gracefully**
   - API should return proper error messages and status codes
   - UI should show user-friendly error messages
   - Log errors to console for debugging

5. **Use consistent patterns**
   - Same folder structure in both apps
   - Same API response format everywhere
   - Same error handling approach

6. **Mobile-first for customer app**
   - Design for phone screens first
   - Touch-friendly buttons (min 44px tap targets)
   - Fast loading, minimal dependencies

7. **Security basics**
   - Hash staff PINs (bcrypt)
   - Validate all inputs
   - Use parameterized queries (SQLite)
   - Don't expose sensitive data in responses

### DON'T ❌

1. **Don't over-engineer**
   - No microservices — it's one Express server
   - No complex state management — React useState/useContext is enough
   - No GraphQL — REST is fine
   - No TypeScript for MVP — plain JavaScript

2. **Don't add features not in spec**
   - No "nice to have" features
   - No premature optimization
   - No complex caching layers
   - Stick to the technical spec

3. **Don't use heavy frameworks**
   - No Redux (useContext is enough)
   - No Styled Components (Tailwind is enough)
   - No ORM (raw SQL is fine for MVP)
   - No complex testing frameworks (manual testing for MVP)

4. **Don't create deep nesting**
   - Max 2-3 levels of folder nesting
   - Flatten when possible
   - Avoid callback hell — use async/await

5. **Don't ignore errors**
   - Always try/catch async operations
   - Always check API response status
   - Always show user feedback on failure

6. **Don't hardcode**
   - Use environment variables for URLs, secrets
   - Use constants file for magic numbers
   - Use seed data for test data, not inline

---

## Code Style

### JavaScript/React

```javascript
// Use async/await, not callbacks or .then chains
async function fetchCustomer(id) {
  try {
    const response = await fetch(`/api/customers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

// Use functional components with hooks
function CustomerCard({ customer }) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="p-4 bg-white rounded-lg">
      <h2>{customer.name}</h2>
    </div>
  );
}

// Use destructuring
const { name, phone, points_balance } = customer;

// Use template literals
const message = `Welcome back, ${name}!`;
```

### File Naming
```
components/CustomerCard.jsx    // PascalCase for components
pages/Home.jsx                 // PascalCase for pages
api/client.js                  // camelCase for utilities
routes/customers.js            // camelCase for backend
```

### API Response Format

```javascript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "The verification code is incorrect"
  }
}

// List response
{
  "success": true,
  "data": {
    "items": [...],
    "total": 42,
    "page": 1,
    "per_page": 20
  }
}
```

### HTTP Status Codes
```
200 - Success
201 - Created
400 - Bad Request (validation error)
401 - Unauthorized (not logged in)
403 - Forbidden (logged in but not allowed)
404 - Not Found
500 - Server Error
```

---

## Folder Structure Rules

### Backend
```
backend/
├── server.js           # Entry point — keep it small, just setup
├── db/
│   ├── database.js     # Connection and helpers
│   ├── schema.sql      # All CREATE TABLE statements
│   └── seed.js         # Seed data script
├── routes/
│   ├── auth.js         # One file per resource
│   ├── customers.js
│   └── ...
├── middleware/
│   └── auth.js         # JWT verification
├── services/           # Business logic (optional, can be in routes for MVP)
│   └── rules-engine.js
└── .env                # Environment variables (not committed)
```

### Frontend Apps
```
customer-app/
├── src/
│   ├── main.jsx        # Entry point
│   ├── App.jsx         # Router setup
│   ├── index.css       # Tailwind imports
│   ├── api/
│   │   └── client.js   # Single file for all API calls
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/          # One file per page/screen
│   │   ├── Home.jsx
│   │   └── ...
│   └── components/     # Reusable components only
│       ├── Button.jsx
│       └── ...
└── public/
    ├── manifest.json
    └── icons/
```

---

## Database Guidelines

### IDs
- Use prefixed string IDs: `cust_`, `biz_`, `loc_`, `txn_`, `reward_`
- Generate with: `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`

### Timestamps
- Always use `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- Store in UTC, format on client

### JSON Fields
- Use for flexible data (rule conditions)
- Always validate before storing
- Always parse safely when reading

### Queries
```javascript
// Always use parameterized queries
const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);

// Never do this
const customer = db.prepare(`SELECT * FROM customers WHERE id = '${id}'`).get();
```

---

## Environment Variables

### Backend (.env)
```
PORT=3001
JWT_SECRET=change-this-in-production-use-long-random-string
DATABASE_PATH=./db/lootly.db
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Production
- Never commit .env files
- Use platform secrets (Replit Secrets, Vercel Environment Variables)
- Use different JWT_SECRET in production

---

## Testing Checklist

### Before calling a feature "done":

**API Endpoint:**
- [ ] Returns correct data for valid input
- [ ] Returns proper error for invalid input
- [ ] Returns 401 when auth required but not provided
- [ ] Doesn't expose sensitive data

**UI Component:**
- [ ] Renders correctly on mobile screen size
- [ ] Shows loading state while fetching
- [ ] Shows error state on failure
- [ ] Buttons/links are tappable

**Flow:**
- [ ] Happy path works end-to-end
- [ ] Errors are handled gracefully
- [ ] User feedback is clear

---

## Deployment Notes

### Development Workflow

```
Local Development → Push to GitHub → Auto-deploy to hosting
       │                  │                    │
       │                  │         ┌──────────┼──────────┐
       │                  │         ▼          ▼          ▼
       │                  └──→  Replit    Vercel    Railway
       │
       └── Test everything locally first!
```

### Local Development (Primary)
```bash
# Backend
cd backend
npm install
npm run seed    # First time only
npm run dev     # Runs on localhost:3001

# Customer App (separate terminal)
cd customer-app
npm install
npm run dev     # Runs on localhost:5173

# Staff App (separate terminal)
cd staff-app
npm install
npm run dev     # Runs on localhost:5174
```

**Testing on phone locally:**
1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Phone must be on same WiFi network
3. Open `http://YOUR_IP:5173` on phone
4. Note: Camera/QR scanning requires HTTPS in production, but works on localhost

### GitHub (Source of Truth)
- All code lives in GitHub repo
- Push working code only
- All deployments pull from GitHub
- Never edit code directly in deployment platforms

```bash
git add .
git commit -m "Add customer QR code screen"
git push origin main
```

### Replit (Full Stack Option)
- Connect to GitHub repo (Import from GitHub)
- Set environment variables in Secrets tab
- Can run backend + both frontends
- Good for demos and sharing
- Auto-deploys on GitHub push (if configured)

### Vercel (Frontend Only)
- Connect to GitHub repo
- Set `VITE_API_URL` in environment variables
- Build command: `npm run build`
- Output directory: `dist`
- Auto-deploys on GitHub push
- Note: Backend needs separate hosting

### Railway (Backend Only)
- Connect to GitHub repo
- Set all environment variables
- Auto-detects Node.js
- SQLite file persists with volume
- Auto-deploys on GitHub push
- Good for production backend

---

## Questions to Ask Before Starting

If anything in the technical spec is unclear, ask before building:

1. Is this the simplest way to do this?
2. Is this in scope for MVP?
3. Will this work on mobile?
4. What happens if this fails?

---

## Summary

**Mindset:** Build a working product fast. Polish later.

**Priority:** Working > Clean > Fast > Pretty

**When stuck:** Pick the simpler option and move on.
