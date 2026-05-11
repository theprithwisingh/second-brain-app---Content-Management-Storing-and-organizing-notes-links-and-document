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
