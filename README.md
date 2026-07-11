# Mrinal-sBNB

A full-stack Airbnb-style marketplace built for the SDE assignment. It uses mocked users and checkout, but listings, availability, wishlists, reviews, and bookings persist in SQLite.

## Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query
- Backend: FastAPI, SQLAlchemy, Pydantic v2
- Database: SQLite

## Run Locally

1. Start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python -m app.seed
   uvicorn app.main:app --reload --port 8000
   ```

2. Start the web app in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev -- --port 3001
   ```

Open `http://127.0.0.1:3001`.

## Deployment

- Frontend: https://mrinal-sbnb.vercel.app
- FastAPI demo API: https://mrinal-sbnb-api.vercel.app
- Source: https://github.com/grizzleyyybear/Mrinal-sBNB

The Vercel API uses SQLite in the serverless function's temporary `/tmp` storage and seeds a demo catalog when that database is empty. This is suitable for the assignment demo; a managed database should replace it for durable production bookings.

## Architecture

```text
frontend/
  app/          Route pages and layouts
  components/   Reusable UI, search, listing, booking, and host views
  hooks/        TanStack Query data hooks and mocked current-user state
  lib/          API client, checkout draft, and UI state
backend/
  app/models/   SQLAlchemy entities and relationships
  app/schemas/  Pydantic request and response contracts
  app/services/ Business rules for bookings, listings, reviews, and saves
  app/routers/  FastAPI endpoints
  app/seed.py   Repeatable demo-data setup
```

## Data Model

| Table | Purpose |
| --- | --- |
| `users` | Mocked guest and host profiles |
| `listings` | Stay details, location, capacity, and nightly rate |
| `listing_photos` | Ordered photos for a listing |
| `amenities` | Reusable amenity catalogue |
| `listing_amenities` | Listing-to-amenity many-to-many join table |
| `bookings` | Confirmed or cancelled stay reservations |
| `reviews` | Ratings and comments, optionally tied to a booking |
| `wishlists` | Unique saved-listing pair for each user |

`users -> listings -> listing_photos`, `listings <-> amenities`, and `users -> bookings -> listings` are enforced through foreign keys. Booking creation checks for overlapping confirmed dates before writing a reservation.

## API Overview

| Endpoint | Description |
| --- | --- |
| `GET /listings` | Search, date availability, filters, and pagination |
| `GET /listings/{id}` | Listing detail, gallery, host, amenities, reviews, and booked dates |
| `POST /listings` | Create a host listing |
| `PUT /listings/{id}` | Update an owned listing |
| `DELETE /listings/{id}` | Delete an owned listing |
| `GET /listings/{id}/availability` | Booked date ranges |
| `POST /bookings` | Create a reservation after overlap validation |
| `GET /bookings/me` | Current user trips |
| `DELETE /bookings/{id}` | Cancel a current user booking |
| `GET /hosts/me/listings` | Host listings and received bookings |
| `POST /reviews` | Review a completed stay |
| `GET/POST/DELETE /wishlist` | List, save, and remove stays |

Mock authentication is selected from the account menu and stored locally. The API receives the selected user through `X-User-Id`; no passwords or real payments are used.
