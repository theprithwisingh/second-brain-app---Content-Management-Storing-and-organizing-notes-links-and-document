# second-brain-app : Content Management Storing and organizing notes links and document

````md
# Express + Node.js API — Notes

## Step 1 — Setup

```bash
npm init -y
npm install typescript
npx tsc --init
````

---

## Step 2 — Backend Structure (Concept)

1. Express application instance
2. Global middlewares (security, parsing, logging)
3. Route mounting (feature modules attach)
4. 404 handler
5. Central error handler
6. Export `app` (testable unit)

---

## Step 3 — Middleware Mechanics

* `app.use(fn)` → middleware stack me register hota hai (order matters)
* Har middleware signature: `(req, res, next)`
* `next()` → next middleware
* `next(err)` → directly error handlers pe jump
* Response send hone ke baad chain stop ho jati hai

---

## Request Flow (Pipeline Model)

```
req → m1 → m2 → m3 → route → controller → (res)
                         ↓
                     error(next(err))
                         ↓
                   error middleware → res
```

---

## Step 4 — App Composition Example

```js
const app = express();

// 1. security / infra
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// 2. body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. routing (mount points)
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);

// 4. 404 (no route matched)
app.use(notFound);

// 5. error (terminal)
app.use(errorHandler);
```

---

## Core Principle

* `app.js` = middleware graph builder
* Order defines behavior
* No business logic inside
* No `listen()` here
* Pure composition for testability

```
```

# 🧪 Postman API Testing Guide

> **Base URL:** `http://localhost:3000`
> 
> Make sure your backend is running first: `npm run dev` in the `backend/` folder.

---

## Step 1 — Signup

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/v1/signup` |
| **Headers** | `Content-Type: application/json` |

**Body** → raw → JSON:
```json
{
    "username": "deepak",
    "password": "Test@1234"
}
```

**Expected Response** (200):
```json
{
    "message": "Signed up"
}
```

> [!IMPORTANT]
> Password must be 8–20 chars with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (`@$!%*?&`).

---

## Step 2 — Signin (get your JWT token)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/v1/signin` |
| **Headers** | `Content-Type: application/json` |

**Body** → raw → JSON:
```json
{
    "username": "deepak",
    "password": "Test@1234"
}
```

**Expected Response** (200):
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

> [!TIP]
> **Copy the token value!** You'll need it for all the next requests.

---

## Step 3 — Save Content (authenticated)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/v1/content` |
| **Headers** | `Content-Type: application/json` |
| **Headers** | `Authorization: Bearer <YOUR_TOKEN>` |

**Body** → raw → JSON:
```json
{
    "title": "My First Note",
    "type": "document",
    "link": "https://example.com/note",
    "tags": ["productivity", "learning"]
}
```

**Expected Response** (200):
```json
{
    "message": "Content added"
}
```

> [!NOTE]
> Valid `type` values are: `"document"`, `"tweet"`, `"youtube"`, `"link"`

Try adding more content items with different types:

```json
{
    "title": "Useful YouTube Video",
    "type": "youtube",
    "link": "https://youtube.com/watch?v=abc123",
    "tags": ["tutorial"]
}
```

```json
{
    "title": "Cool Tweet",
    "type": "tweet",
    "link": "https://twitter.com/user/status/123",
    "tags": ["inspiration", "learning"]
}
```

---

## Step 4 — Read All Content (authenticated)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3000/api/v1/content` |
| **Headers** | `Authorization: Bearer <YOUR_TOKEN>` |

**Body:** *none*

**Expected Response** (200):
```json
{
    "content": [
        {
            "id": "6820...",
            "type": "document",
            "link": "https://example.com/note",
            "title": "My First Note",
            "tags": ["productivity", "learning"]
        },
        {
            "id": "6820...",
            "type": "youtube",
            "link": "https://youtube.com/watch?v=abc123",
            "title": "Useful YouTube Video",
            "tags": ["tutorial"]
        }
    ]
}
```

> [!TIP]
> Copy one of the `id` values — you'll need it for the delete step.

---

## Step 5 — Delete Content (authenticated)

| Field | Value |
|-------|-------|
| **Method** | `DELETE` |
| **URL** | `http://localhost:3000/api/v1/content` |
| **Headers** | `Content-Type: application/json` |
| **Headers** | `Authorization: Bearer <YOUR_TOKEN>` |

**Body** → raw → JSON:
```json
{
    "contentId": "<PASTE_CONTENT_ID_HERE>"
}
```

**Expected Response** (200):
```json
{
    "message": "Delete succeeded"
}
```

---

## Step 6 — Enable Share Link (authenticated)

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URL** | `http://localhost:3000/api/v1/brain/share` |
| **Headers** | `Content-Type: application/json` |
| **Headers** | `Authorization: Bearer <YOUR_TOKEN>` |

**Body** → raw → JSON (enable sharing):
```json
{
    "share": true
}
```

**Expected Response** (200):
```json
{
    "link": "a1b2c3d4e5f6..."
}
```

To **disable** sharing later:
```json
{
    "share": false
}
```

> [!TIP]
> Copy the `link` value — you'll use it in the next step.

---

## Step 7 — View Shared Brain (public — no token needed)

| Field | Value |
|-------|-------|
| **Method** | `GET` |
| **URL** | `http://localhost:3000/api/v1/brain/<PASTE_SHARE_LINK_HERE>` |

**Headers:** *none needed*
**Body:** *none*

**Expected Response** (200):
```json
{
    "username": "deepak",
    "content": [
        {
            "id": "6820...",
            "type": "document",
            "link": "https://example.com/note",
            "title": "My First Note",
            "tags": ["productivity", "learning"]
        }
    ]
}
```

---

## Quick Reference

| # | Action | Method | URL | Auth? |
|---|--------|--------|-----|-------|
| 1 | Signup | POST | `/api/v1/signup` | ❌ |
| 2 | Signin | POST | `/api/v1/signin` | ❌ |
| 3 | Save content | POST | `/api/v1/content` | ✅ Token |
| 4 | Read content | GET | `/api/v1/content` | ✅ Token |
| 5 | Delete content | DELETE | `/api/v1/content` | ✅ Token |
| 6 | Toggle share | POST | `/api/v1/brain/share` | ✅ Token |
| 7 | View shared | GET | `/api/v1/brain/:shareLink` | ❌ |

> [!IMPORTANT]
> For all **authenticated** routes, add this header in Postman:
> ```
> Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
> ```
> Go to the **Headers** tab → add key `Authorization` → value `Bearer <token>`
