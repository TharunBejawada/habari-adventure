# Habari Adventure — Backend API Documentation

> **Base URL:** `http://localhost:8000/api/v1`  
> All endpoints are prefixed with `/api/v1`. The frontend env var `NEXT_PUBLIC_API_URL` must already include this prefix (e.g. `http://localhost:8000/api/v1`). **Do not append `/api/v1` again in fetch calls.**

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [Security & Middleware](#4-security--middleware)
5. [Authentication](#5-authentication)
6. [Rate Limiting](#6-rate-limiting)
7. [File Uploads](#7-file-uploads)
8. [Multi-Language Support](#8-multi-language-support)
9. [Response Format](#9-response-format)
10. [Endpoints — Auth](#10-endpoints--auth)
11. [Endpoints — Users](#11-endpoints--users)
12. [Endpoints — Blogs](#12-endpoints--blogs)
13. [Endpoints — Packages](#13-endpoints--packages)
14. [Endpoints — Locations](#14-endpoints--locations)
15. [Endpoints — Navigation](#15-endpoints--navigation)
16. [Endpoints — Settings](#16-endpoints--settings)
17. [Endpoints — Bookings](#17-endpoints--bookings)
18. [Endpoints — Crew](#18-endpoints--crew)
19. [Endpoints — Upcoming Dates](#19-endpoints--upcoming-dates)
20. [Endpoints — Pricing](#20-endpoints--pricing)
21. [Endpoints — Upload](#21-endpoints--upload)
22. [Database Schema Overview](#22-database-schema-overview)
23. [Known Issues & Frontend Notes](#23-known-issues--frontend-notes)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ES2022) |
| Framework | Express.js v5 |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JSON Web Tokens (JWT) via `jsonwebtoken` |
| Password Hashing | Argon2 |
| File Uploads | Multer (disk storage) |
| Security Headers | Helmet |
| CORS | `cors` package |
| Rate Limiting | `express-rate-limit` |

---

## 2. Project Structure

```
apps/api/
├── src/
│   ├── index.ts                      # App entry point, middleware setup
│   ├── prisma.ts                     # Prisma client singleton
│   ├── controllers/
│   │   ├── authController.ts         # Login logic
│   │   ├── userController.ts         # User CRUD
│   │   ├── blogController.ts         # Blog CRUD + translations
│   │   ├── packageController.ts      # Package CRUD + translations
│   │   ├── bookingController.ts      # Quote / booking requests
│   │   ├── crewController.ts         # Crew page settings, teams, members
│   │   ├── locationController.ts     # Location CRUD + translations
│   │   ├── upcomingDateController.ts # Trip departure dates
│   │   ├── pricingController.ts      # Package pricing tiers
│   │   ├── settingsController.ts     # Global header/footer settings
│   │   ├── navigationController.ts   # Nav data (locations grouped by category)
│   │   └── uploadController.ts       # File upload handler
│   ├── routes/
│   │   ├── index.ts                  # Master router (mounts all sub-routers)
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── blogRoutes.ts
│   │   ├── packageRoutes.ts
│   │   ├── bookingRoutes.ts
│   │   ├── crewRoutes.ts
│   │   ├── locationRoutes.ts
│   │   ├── upcomingDateRoutes.ts
│   │   └── pricingRoutes.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts         # JWT verification + role guard
│   │   └── rateLimiter.ts            # Global + auth-specific limiters
│   └── utils/
│       ├── auth.ts                   # hashPassword, verifyPassword, generateToken
│       └── upload.ts                 # Multer config (MIME whitelist, path, size)
```

---

## 3. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs (min 32 chars recommended) |
| `PORT` | No | Server port (default: `8000`) |
| `NODE_ENV` | No | `development` or `production` |

**Example `.env`:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/habari
JWT_SECRET=your_super_secret_key_here
PORT=8000
NODE_ENV=development
```

---

## 4. Security & Middleware

The following middleware is applied globally in `src/index.ts`:

| Middleware | Configuration |
|---|---|
| Helmet | Enabled; `crossOriginResourcePolicy: "cross-origin"` |
| CORS | Origin: `*`, Methods: GET/POST/PUT/DELETE, Credentials: true |
| Body Parser (JSON) | Max size: 5 MB |
| Body Parser (URL-encoded) | Max size: 5 MB |
| Static Files | `/uploads` → `./uploads/` directory |
| Global Rate Limiter | Applied to all routes (see §6) |

---

## 5. Authentication

### How It Works

1. Client calls `POST /api/v1/auth/login` with email + password.
2. Server verifies credentials via Argon2, returns a signed JWT.
3. Client includes the token in subsequent requests:
   ```
   Authorization: Bearer <token>
   ```
4. `requireAuth` middleware verifies the token and attaches `req.user = { id, role }`.
5. `requireAdmin` middleware further checks `req.user.role === "ADMIN"`.

### Token Details

- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiry:** 1 day
- **Payload:** `{ id: string, role: string }`

### Protected Route Pattern

Routes requiring auth are marked below as:

- `🔒 Auth` — requires valid JWT
- `🔒 Admin` — requires valid JWT **and** `role === "ADMIN"`

---

## 6. Rate Limiting

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| Global | 15 minutes | 100 per IP | All routes |
| Auth | 15 minutes | 5 per IP | `POST /api/v1/auth/login` only |

Exceeding a limit returns `429 Too Many Requests`.

---

## 7. File Uploads

**Endpoint:** `POST /api/v1/upload`  
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `asset` | File | Yes | The file to upload |
| `folder` | String | No | Subdirectory under `uploads/` (e.g. `blogs`, `packages`) |

**Allowed MIME types:**

| Type | Formats |
|---|---|
| Images | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Video | `video/mp4` |
| Documents | `application/pdf`, `.docx`, `.doc` |

**Max file size:** 10 MB

**Success response:**
```json
{
  "status": "success",
  "data": {
    "url": "http://localhost:8000/uploads/blogs/my-image-1715000000000-abc123.jpg",
    "filename": "my-image-1715000000000-abc123.jpg",
    "mimetype": "image/jpeg",
    "size": 48210
  }
}
```

Uploaded files are served statically at `http://localhost:8000/uploads/<folder>/<filename>`.

---

## 8. Multi-Language Support

All translatable resources (Blogs, Packages, Locations) support a `?lang=` query parameter.

| Scenario | Behaviour |
|---|---|
| No `lang` param or `lang=en` | English content returned |
| `lang=fr` and translation exists | French fields merged over English |
| `lang=fr` but no translation | English content returned as fallback |

**Admin creates/updates a translation** by including `languageCode` in the PUT request body:

```json
{
  "languageCode": "fr",
  "title": "Titre en français",
  "slug": "titre-en-francais",
  "content": "<p>Contenu traduit...</p>"
}
```

When `languageCode` is omitted or `"en"`, the English record itself is updated.

Deleting a parent record cascades to all its translations.

---

## 9. Response Format

### Success

```json
{
  "status": "success",
  "data": { }
}
```

### Error

```json
{
  "status": "error",
  "message": "Human-readable description"
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | OK — successful GET / PUT |
| 201 | Created — successful POST |
| 400 | Bad Request — validation failure |
| 401 | Unauthorized — token missing or invalid |
| 403 | Forbidden — role insufficient |
| 404 | Not Found — resource does not exist |
| 429 | Too Many Requests — rate limit hit |
| 500 | Internal Server Error |

---

## 10. Endpoints — Auth

### `POST /api/v1/auth/login`

🔓 Public · 🛑 Rate limited (5 / 15 min)

Creates a session token for an admin user.

**Request body:**
```json
{
  "email": "admin@habari.com",
  "password": "your_password"
}
```

**Success (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@habari.com",
      "role": "ADMIN",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Errors:**

| Status | Condition |
|---|---|
| 400 | `email` or `password` missing |
| 401 | Invalid credentials |
| 403 | User exists but role is not ADMIN |

On success, `lastLoginAt` and `loginCount` are updated automatically.

---

## 11. Endpoints — Users

All user routes require `🔒 Admin`.

### `GET /api/v1/users`

Returns all users. Passwords are never included.

**Success (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@habari.com",
      "role": "ADMIN",
      "isActive": true,
      "loginCount": 12,
      "lastLoginAt": "2024-05-05T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-05-05T10:30:00Z"
    }
  ]
}
```

---

### `POST /api/v1/users`

Creates a new admin user.

**Request body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@habari.com",
  "password": "secure_password_123",
  "role": "ADMIN"
}
```

- `role` defaults to `"ADMIN"` if omitted.
- Password is hashed with Argon2 before storage.
- Returns the created user (201), password excluded.

---

### `PUT /api/v1/users/:id`

Updates an existing user. All body fields are optional.

```json
{
  "firstName": "Jane",
  "lastName": "Updated",
  "email": "jane.new@habari.com",
  "role": "ADMIN",
  "isActive": false,
  "password": "new_password"
}
```

If `password` is provided it is re-hashed before saving.

---

### `DELETE /api/v1/users/:id`

Hard-deletes the user.

**Success (200):**
```json
{ "status": "success", "message": "User deleted successfully" }
```

---

## 12. Endpoints — Blogs

### `GET /api/v1/blogs`

🔓 Public

**Query parameters:**

| Param | Type | Description |
|---|---|---|
| `publishedOnly` | `"true"` | Return only published blogs |
| `lang` | string | Language code (default: `en`) |

**Success (200):** Array of blog summary objects.

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "title": "10 Tips for Kilimanjaro",
      "slug": "10-tips-kilimanjaro",
      "excerpt": "Planning your climb?...",
      "featuredImage": "http://localhost:8000/uploads/blogs/cover.jpg",
      "authorName": "Jane Smith",
      "category": "Travel",
      "tags": ["kilimanjaro", "tips"],
      "isPublished": true,
      "publishedAt": "2024-05-01T00:00:00Z",
      "readingTime": 5
    }
  ]
}
```

---

### `GET /api/v1/blogs/:idOrSlug`

🔓 Public · `?lang=en`

Returns a single blog by ID or slug. Translations are merged when `lang` is provided.

**404** if not found.

---

### `GET /api/v1/blogs/search`

🔓 Public

**Query parameters:**

| Param | Required | Description |
|---|---|---|
| `q` | Yes | Search keyword |
| `lang` | No | Language code |

Searches `title`, `excerpt`, and `category` of published blogs.

---

### `GET /api/v1/blogs/category/:category`

🔓 Public · `?lang=en`

Published blogs in the given category.

---

### `GET /api/v1/blogs/tag/:tag`

🔓 Public · `?lang=en`

Published blogs with the given tag.

---

### `GET /api/v1/blogs/stats/top-categories`

🔓 Public

```json
{
  "status": "success",
  "data": [
    { "category": "Travel", "count": 12 },
    { "category": "Tips", "count": 8 }
  ]
}
```

---

### `GET /api/v1/blogs/stats/top-tags`

🔓 Public

```json
{
  "status": "success",
  "data": [
    { "tag": "kilimanjaro", "count": 15 }
  ]
}
```

---

### `POST /api/v1/blogs`

🔒 Admin

**Request body:**
```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "<p>Full RTE HTML...</p>",
  "excerpt": "Brief summary",
  "authorName": "Jane Smith",
  "featuredImage": "url",
  "imageAltText": "Alt text",
  "category": "Travel",
  "tags": ["tag1", "tag2"],
  "isPublished": true,
  "publishedAt": "2024-05-01T00:00:00Z",
  "readingTime": 5,
  "metaTitle": "SEO Title",
  "metaDescription": "SEO description",
  "metaKeywords": "seo, keywords",
  "faqs": [{ "question": "...", "answer": "..." }],
  "schemaMarkup": {}
}
```

`createdBy` and `modifiedBy` are set automatically from the JWT user.

Returns created blog (201).

---

### `PUT /api/v1/blogs/:id`

🔒 Admin

Same fields as POST. Include `languageCode` to create/update a translation:

```json
{
  "languageCode": "fr",
  "title": "Titre français",
  "slug": "titre-francais",
  "content": "<p>Contenu...</p>"
}
```

---

### `DELETE /api/v1/blogs/:id`

🔒 Admin — deletes blog and all translations.

---

### `DELETE /api/v1/blogs/:id/translations/:lang`

🔒 Admin — deletes only the specified translation.

---

## 13. Endpoints — Packages

### `GET /api/v1/packages`

🔓 Public

**Query parameters:**

| Param | Description |
|---|---|
| `publishedOnly=true` | Only published packages |
| `category` | Filter by category (e.g. `Climbing`, `Safari`, `Day Trips`) |
| `lang` | Language code |

---

### `GET /api/v1/packages/:slug`

🔓 Public · `?lang=en`

Full package detail including:
- `quickFacts`, `whyChoose`, `itineraryMeta`, `itineraries` (all JSON)
- Nested `upcomingDates[]` and `pricing`
- SEO fields

---

### `GET /api/v1/packages/location/:location`

🔓 Public · `?lang=en`

Published packages for a specific location string.

---

### `POST /api/v1/packages`

🔒 Admin

**Request body:**
```json
{
  "slug": "lemosho-route-8-days",
  "title": "Lemosho Route — 8 Days",
  "badgeText": "Most Popular",
  "description": "<p>Overview...</p>",
  "location": "Kilimanjaro",
  "category": "Climbing",
  "bannerImage": "url",
  "tripPlanPdf": "url",
  "quickFacts": {
    "image": "url",
    "heading": "Quick Facts",
    "items": [{ "label": "Duration", "value": "8 Days" }]
  },
  "whyChoose": {
    "image": "url",
    "heading": "Why Choose This Route",
    "items": ["Reason 1"],
    "table": []
  },
  "itineraryMeta": {
    "heading": "What's Included",
    "included": ["Accommodation"],
    "notIncluded": ["Flights"]
  },
  "itineraries": [
    {
      "tabName": "8-Day",
      "days": [{ "day": 1, "title": "Arrival", "description": "..." }]
    }
  ],
  "metaTitle": "SEO Title",
  "metaDescription": "SEO description",
  "metaKeywords": "keywords",
  "isPublished": true
}
```

---

### `PUT /api/v1/packages/:id`

🔒 Admin — same fields as POST, plus optional `languageCode` for translations.

---

### `DELETE /api/v1/packages/:id`

🔒 Admin — cascades to translations, upcoming dates, and pricing.

---

### `DELETE /api/v1/packages/:id/translations/:lang`

🔒 Admin — deletes specific translation.

---

## 14. Endpoints — Locations

### `GET /api/v1/locations`

🔓 Public · `?lang=en`

All locations (published and unpublished depending on implementation).

---

### `GET /api/v1/locations/:slug`

🔓 Public · `?lang=en`

**Success (200):**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "slug": "mount-kilimanjaro",
    "title": "Mount Kilimanjaro",
    "category": "Mountains",
    "heroImage": "url",
    "bannerImage": "url",
    "overviewText": "<p>Rich text...</p>",
    "youtubeVideoUrl": "https://youtube.com/watch?v=...",
    "isPublished": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### `GET /api/v1/locations/category/:category`

🔓 Public · `?lang=en`

---

### `POST /api/v1/locations`

🔒 Admin

**Request body:**
```json
{
  "slug": "serengeti",
  "title": "Serengeti",
  "category": "Safaris",
  "bannerImage": "url",
  "heroImage": "url",
  "overviewText": "<p>Description...</p>",
  "youtubeVideoUrl": "https://youtube.com/...",
  "isPublished": true
}
```

---

### `PUT /api/v1/locations/:id`

🔒 Admin — same fields + optional `languageCode`.

---

### `DELETE /api/v1/locations/:id`

🔒 Admin — cascades to translations.

---

### `DELETE /api/v1/locations/:id/translations/:lang`

🔒 Admin — deletes specific translation.

---

## 15. Endpoints — Navigation

### `GET /api/v1/navigation`

🔓 Public · `?lang=en`

Returns all **published** locations grouped by category. Used by:
- The admin menu builder to list available categories and items.
- The public site Header to auto-populate category dropdowns.

**Success (200):**
```json
{
  "status": "success",
  "data": [
    {
      "category": "Mountains",
      "slug": "mountains",
      "items": [
        { "title": "Mount Kilimanjaro", "slug": "mount-kilimanjaro" },
        { "title": "Mount Mawenzi",     "slug": "mount-mawenzi" }
      ]
    },
    {
      "category": "Safaris",
      "slug": "safaris",
      "items": [
        { "title": "Serengeti", "slug": "serengeti" }
      ]
    }
  ]
}
```

Categories appear in first-encountered order; items within each category are sorted alphabetically by title.

---

## 16. Endpoints — Settings

### `GET /api/v1/settings`

🔓 Public

Returns the singleton global settings record used by header and footer.

**Success (200):**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "headerMenu": [...],
    "websiteInfo": "We are Habari Adventure...",
    "phoneNumber": "+255 123 456 789",
    "email": "info@habariadventure.com",
    "address": "Moshi, Tanzania",
    "socialLinks": [
      { "name": "Instagram", "url": "https://instagram.com/..." }
    ],
    "footerColumns": [
      {
        "title": "Quick Links",
        "links": [
          { "name": "About Us", "url": "/about" }
        ]
      }
    ]
  }
}
```

`headerMenu` is a JSON array of `NavConfigItem` objects (see frontend `Header.tsx` for the full shape).

---

### `PUT /api/v1/settings`

🔒 Admin

All fields are optional; only provided fields are updated.

**Request body:**
```json
{
  "headerMenu": [...],
  "websiteInfo": "Updated info",
  "phoneNumber": "+255 000 000 000",
  "email": "new@habariadventure.com",
  "address": "New Address",
  "socialLinks": [...],
  "footerColumns": [...]
}
```

---

## 17. Endpoints — Bookings

### `POST /api/v1/bookings`

🔓 Public

Submits a quote / booking inquiry.

**Request body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 555 000 0000",
  "monthYear": "July 2024",
  "length": "8",
  "groupSize": "3",
  "include": "Accommodation,Meals,Park Fees",
  "message": "I'd love more details about the Lemosho Route."
}
```

**Success (201):** The created booking object. Default `status` is `"New"`.

---

### `GET /api/v1/bookings`

🔒 Admin

Returns all bookings ordered newest first.

---

## 18. Endpoints — Crew

### `GET /api/v1/crew`

🔓 Public

Returns crew page settings plus all teams and their members.

**Success (200):**
```json
{
  "status": "success",
  "data": {
    "settings": {
      "id": "singleton",
      "heroBannerImage": "url",
      "porterBannerImage": "url",
      "porterDescription": "<p>RTE content...</p>",
      "modifiedBy": "admin@habari.com"
    },
    "teams": [
      {
        "id": "uuid",
        "name": "Guides",
        "priorityOrder": 1,
        "members": [
          {
            "id": "uuid",
            "teamId": "uuid",
            "image": "url",
            "name": "John Smith",
            "designation": "Lead Guide",
            "description": "Bio...",
            "priorityOrder": 1
          }
        ]
      }
    ]
  }
}
```

---

### `POST /api/v1/crew/settings`

🔒 Admin — create or update crew page settings.

```json
{
  "heroBannerImage": "url",
  "porterBannerImage": "url",
  "porterDescription": "<p>RTE HTML...</p>"
}
```

---

### `POST /api/v1/crew/team`

🔒 Admin — create or update a team. Omit `id` to create.

```json
{
  "id": "uuid",
  "name": "Porters",
  "priorityOrder": 2
}
```

---

### `POST /api/v1/crew/member`

🔒 Admin — create or update a member. Omit `id` to create.

```json
{
  "id": "uuid",
  "teamId": "uuid",
  "name": "Ali Hassan",
  "designation": "Senior Porter",
  "description": "Bio...",
  "priorityOrder": 1,
  "image": "url"
}
```

---

### `DELETE /api/v1/crew/team/:id`

🔒 Admin — deletes team and cascades to all members.

---

### `DELETE /api/v1/crew/member/:id`

🔒 Admin — deletes single member.

---

## 19. Endpoints — Upcoming Dates

### `GET /api/v1/upcoming-dates`

🔓 Public

Returns all upcoming trip dates with nested package info.

**Success (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "packageId": "uuid",
      "package": {
        "title": "Lemosho Route — 8 Days",
        "slug": "lemosho-route-8-days",
        "location": "Kilimanjaro"
      },
      "title": "July Full-Moon Departure",
      "startDate": "2024-07-15T00:00:00Z",
      "endDate":   "2024-07-22T00:00:00Z",
      "price": 1850,
      "isFullMoon": true,
      "isChristmas": false,
      "isNewYear": false,
      "totalSeats": 12,
      "availableSeats": 7,
      "status": "Scheduled"
    }
  ]
}
```

---

### `POST /api/v1/upcoming-dates`

🔒 Admin

```json
{
  "packageId": "uuid",
  "title": "Optional label",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate":   "2024-07-22T00:00:00Z",
  "price": 1850,
  "isFullMoon": true,
  "isChristmas": false,
  "isNewYear": false,
  "totalSeats": 12,
  "availableSeats": 10,
  "status": "Scheduled"
}
```

---

### `PUT /api/v1/upcoming-dates/:id`

🔒 Admin — same fields as POST.

---

### `DELETE /api/v1/upcoming-dates/:id`

🔒 Admin.

---

## 20. Endpoints — Pricing

### `GET /api/v1/pricing`

🔓 Public

Returns pricing tiers for all packages.

**Success (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "packageId": "uuid",
      "package": {
        "title": "Lemosho Route — 8 Days",
        "slug": "lemosho-route-8-days",
        "location": "Kilimanjaro"
      },
      "tier1": 2200,
      "tier2": 1950,
      "tier3": 1750,
      "tier4": 1600
    }
  ]
}
```

Tiers represent group size:

| Tier | Group Size |
|---|---|
| `tier1` | 1 person |
| `tier2` | 2–4 people |
| `tier3` | 5–9 people |
| `tier4` | 10+ people |

---

### `POST /api/v1/pricing`

🔒 Admin — upserts pricing by `packageId`.

```json
{
  "packageId": "uuid",
  "tier1": 2200,
  "tier2": 1950,
  "tier3": 1750,
  "tier4": 1600
}
```

---

### `DELETE /api/v1/pricing/:id`

🔒 Admin.

---

## 21. Endpoints — Upload

### `POST /api/v1/upload`

🔓 Public · `multipart/form-data`

See [§7 File Uploads](#7-file-uploads) for full details.

---

## 22. Database Schema Overview

| Model | Description |
|---|---|
| `User` | Admin accounts (Argon2-hashed password, role) |
| `Package` | Adventure packages (Climbing, Safari, Day Trips) |
| `PackageTranslation` | Localized Package fields |
| `PackagePricing` | 1-to-1 pricing tiers per Package |
| `UpcomingDate` | Scheduled departure dates per Package |
| `Blog` | Blog posts with RTE content and SEO fields |
| `BlogTranslation` | Localized Blog fields |
| `Location` | Destinations grouped by category |
| `LocationTranslation` | Localized Location fields |
| `Booking` | Quote request form submissions |
| `GlobalSettings` | Singleton: header menu, footer, contact info |
| `CrewSettings` | Singleton: crew page banners and porter description |
| `CrewTeam` | Named groups of crew members |
| `CrewMember` | Individual crew members with role and bio |

All primary keys are UUIDs. All models include `createdAt` / `updatedAt` timestamps.

---

## 23. Known Issues & Frontend Notes

### 1. Do not double-prefix the API version

`NEXT_PUBLIC_API_URL` already includes `/api/v1`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Fetch calls must **not** append `/api/v1` again:

```ts
// ✅ Correct
fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`)

// ❌ Wrong — results in /api/v1/api/v1/settings → 404
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/settings`)
```

Use the `apiUrl()` helper in `apps/web/lib/api.ts` which strips double prefixes automatically.

---

### 2. `headerMenu` format

The `headerMenu` field in `/api/v1/settings` is a JSON column that stores typed `NavConfigItem[]`. Two item types exist:

**Category item** (drives a dropdown from Location records):
```json
{
  "id": "abc123",
  "type": "category",
  "order": 0,
  "reference": "Mountains",
  "label": "Destinations",
  "autoPopulate": true,
  "subItemOverrides": [
    { "slug": "mount-kilimanjaro", "title": "", "url": "", "hidden": false }
  ]
}
```

**Custom item** (fully manual link):
```json
{
  "id": "def456",
  "type": "custom",
  "order": 1,
  "name": "About Us",
  "url": "/about",
  "subItems": []
}
```

Category items have **no `name` or `url`** fields. The frontend Header merges them with live `/navigation` data to produce the final dropdown. Never pass a category item's raw object directly to `<Link href={...}>`.

---

### 3. Uploads are not CDN-backed

Uploaded files are served directly from the Express server's `./uploads/` directory. In production, serve them via a CDN or object storage (S3, Cloudflare R2) rather than the API server.

---

### 4. CORS is open in development

`origin: "*"` is configured for development convenience. Restrict this to your frontend domain(s) in production.

---

### 5. JWT fallback secret

If `JWT_SECRET` is not set, the code falls back to `"fallback_secret"`. This is insecure. Always set a strong `JWT_SECRET` in production.

---

*Last updated: 2026-05-06*
