# Pastebin Lite

A secure, minimalist pastebin application with Time-to-Live (TTL) and View Count constraints.
Built with Next.js 14, Tailwind CSS, and Redis.

## Features

- **Create Pastes**: Securely share text.
- **Expiry Constraints**: Set pastes to expire after a duration or a number of views.
- **Deterministic Testing**: Supports ensuring expiry logic via `x-test-now-ms` header.
- **Responsive UI**: Glassmorphism design with Dark Mode by default.

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (Local or Vercel KV)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd pastebin-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment:
   Create `.env.local`:
   ```bash
   REDIS_URL=redis://localhost:6379
   # TEST_MODE=1  # Enable for deterministic testing
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Persistence Layer

**Choice**: Redis (via `ioredis`).
**Why**: Redis is ideal for ephemeral data with TTL support. It offers atomic operations (needed for accurate view counting concurrency) and is highly performant.

> [!NOTE]
> **Local Development Fallback**: If Redis is not running locally, the application will automatically switch to an **In-Memory Store** to allow development and testing. This is controlled by `USE_MEMORY_STORE=1` in `.env.local`. Ensure to use a real Redis instance for production.

## Design Decisions

- **Architecture**: Next.js App Router.
- **Atomicity**: Used Lua scripts for `GET` operations to ensure that checking expiry/views and decrementing counts happens atomically.
- **UI**: "Glassmorphism" aesthetic.

## Testing

To run the verification script:

1. Start the server with `TEST_MODE=1`:
   ```bash
   TEST_MODE=1 npm run dev
   ```
2. In another terminal run:
   ```bash
   node scripts/verify.mjs
   ```
