# Pastebin Lite

A secure, minimalist pastebin application with Time-to-Live (TTL) and View Count constraints.
Refactored to a **Modern Full-Stack Architecture** using **Vite, React, Express, and Prisma**.

## Features

- **Create Pastes**: Securely share text with syntax highlighting support.
- **Expiry Constraints**: Set pastes to expire after a specific duration or a maximum number of views.
- **Responsive UI**: Beautiful "Glassmorphism" design with Dark Mode support.
- **Full Stack**: robust React frontend served by Vite, backed by a scalable Express API and Prisma ORM.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **Tooling**: TypeScript, ESLint, Concurrently

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database (recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/keziyakurian/PasteBin_Project.git
   cd PasteBin_Project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
   PORT=3000
   ```
   *Replace the `DATABASE_URL` with your actual PostgreSQL connection string.*

4. **Initialize Database:**
   Generate the Prisma client and push the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server:**
   Start both the frontend and backend concurrently:
   ```bash
   npm run dev
   ```
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3000](http://localhost:3000)

## Persistence Layer

**Choice**: PostgreSQL (via Prisma ORM).
**Why**: PostgreSQL offers robust reliability, relational integrity, and scalability. It is the industry standard for production-grade applications.
**Local Development Fallback**: If a database is not available, you can set `USE_MEMORY_STORE=1` in your `.env` file to use an **In-Memory Store** for testing purposes.

## Design Decisions

- **Architecture**: Vite (React) + Express Backend. Separation of concerns allows for independent scaling and modern frontend development experience.
- **Server-Side Injection**: For `GET /p/:id`, the server injects the paste data directly into the HTML. This ensures fast First Contentful Paint (FCP) and meets the requirement to return HTML containing content, while preventing double-counting of views.
- **Atomic Operations**: View limits are enforced using database transactions (or atomic checks) to prevent race conditions.

## Deterministic Testing

The application supports deterministic time testing for strict TTL verification.

1. Set `TEST_MODE=1` in your `.env` or environment variables.
2. Send the `x-test-now-ms` header with the desired timestamp (milliseconds since epoch).
3. The server will use this timestamp for all expiry logic instead of system time.

## Automated Verification

A verification script is included to test all functional requirements locally.

```bash
npm run build
NODE_ENV=production TEST_MODE=1 USE_MEMORY_STORE=1 npx tsx server.ts
# In a separate terminal:
node scripts/verify-submission.mjs
```
## Scripts

- `npm run dev`: Starts both Vite (Frontend) and Nodemon (Backend) concurrently.
- `npm run build`: Builds the React frontend for production.
- `npm start`: Starts the production backend server.
- `npm run lint`: Lints the codebase using ESLint.

## Project Structure

- `src/`: React frontend application (Pages, Components, Styles).
- `server/`: Express backend routes and controllers.
- `prisma/`: Database schema definitions.
- `api/`: Backend entry point (Vercel serverless compatible).
