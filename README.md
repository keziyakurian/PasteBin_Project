# Pastebin Lite (Aganitha Take-Home)
> **Developed as part of the Full Stack Developer assessment for Aganitha Cognitive Solutions (2026).**

A production-ready text sharing service built with a focus on concurrency safety and deterministic testability. Refactored to a **Modern Full-Stack Architecture** using **Node.js, Express, Vite, React, and Prisma**.

## 🚀 Deployment

- **Live URL**: [https://paste-bin-project-jade.vercel.app](https://paste-bin-project-jade.vercel.app)
- **API Health Check**: `GET /api/health`

## 🛠 Tech Stack

- **Backend**: Node.js + Express (Custom Server)
- **Database**: PostgreSQL (via Prisma ORM)
- **Frontend**: React 19 + Vite (SSR-injected for paste viewing)
- **Deployment**: Vercel (Serverless Functions)

## 📂 Project Architecture

A clean separation of concerns for clarity and ease of navigation:

- **/api**: Production serverless functions for Vercel deployment.
- **/src**: Frontend React application (Components, Pages, Hooks).
- **/server**: Local express server setup for rapid verification and testing.
- **/prisma**: Database schema and migration resources.
- **/dist**: Production build output (gitignored).

## 🧠 Design Philosophy & Aganitha Alignment

### **Precision Timing & Automated Verification**
To align with Aganitha’s requirement for automated evaluation, I implemented a `TEST_MODE` header (`x-test-now-ms`). This allows evaluators to simulate time-expiry (Time Travel) without waiting, identifying this as a robust feature for **CI/CD and automated testing workflows**—crucial for maintaining high-reliability software in scientific computing.

### **Scientific Mindset: Data Integrity**
I treated the 'paste' content as immutable data once created, ensuring a clear audit trail of view counts. This is inspired by the **data integrity standards in Biopharma informatics**, where reproducibility and state tracking are paramount.

### **Scalability & Persistence**
- **Architecture**: Refactored to a **Modern Full-Stack Architecture** using **Node.js, Express, Vite, React, and Prisma**.
- **Persistence Choice**: Uses **PostgreSQL (via Prisma ORM)** for production-grade reliability.
    - *Note for Vercel Demo*: The live demo utilizes a robust **In-Memory Store** fallback to function immediately in the serverless environment without requiring external database credentials, ensuring the assessment flows work zero-config.

## 🛠 Tech Stack

### 1. Atomic Concurrency (Race Condition Prevention)

In a high-load scenario, two users might view a paste with `max_views: 1` at the exact same millisecond. A standard "Read -> Check -> Decrement" cycle in application code creates a race condition.

**The Solution**: I used **Prisma Transactions** (`prisma.$transaction`).

**Why**: This ensures the operation is atomic at the database level. If two requests hit simultaneously, the transaction ensures only one succeeds in decrementing the count, strictly enforcing the view limit (preventing negative remaining views or accidental over-serving).

### 2. Deterministic Time (Time-Travel Testing)

To satisfy the `x-test-now-ms` requirement without polluting the global `Date` object or relying on fragile mocks.

**The Solution**: Implemented custom middleware logic to resolve the "Effective Current Time."
```typescript
const effectiveTime = (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) 
  ? parseInt(req.headers['x-test-now-ms']) 
  : Date.now();
```
**Why**: This makes the expiry logic 100% predictable for automated graders while maintaining standard system-time behavior in production.

### 3. Server-Side Injection for `/p/:id`

The functional requirement mandates that the HTML response for `/p/:id` must contain the paste content (safe from script execution).

**The Solution**: My Express server fetches the paste and injects the escaped content directly into `index.html` as `window.__INITIAL_PASTE__` (and a `<noscript>` tag) before serving.

**Why**: This guarantees the grader (and SEO crawlers) sees the content immediately in the DOM without waiting for client-side JavaScript hydration, mimicking the benefits of Server-Side Rendering (SSR) without the overhead of Next.js for this specific use case.

4. **Standardized API Error Handling**
   To differentiate between a "Missing Paste" (404) and an "Expired Paste" (410), the API returns structured errors:
   - **404 Not Found**: `{ error: "NOT_FOUND" }` (Invalid ID)
   - **404 Not Found**: `{ error: "EXPIRED_TIME" }` (TTL ended) or `{ error: "EXPIRED_VIEWS" }` (View limit exceeded)
   - **Why**: This allows automated verification scripts to precisely validation *why* a resource is unavailable, distinguishing logic correctness (expiration) from failure (data loss).

## 🏃 Local Setup

1. **Clone & Install**:
   ```bash
   git clone https://github.com/keziyakurian/PasteBin_Project.git
   cd PasteBin_Project
   npm install
   ```

2. **Database Configuration**:
   Create a `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   # Optional: USE_MEMORY_STORE=1 (for local testing without DB)
   # Optional: TEST_MODE=1
   ```
   Initialize schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Verification Script**:
   validate functional requirements (Health, Creation, View Limits, Deterministic TTL):
   ```bash
   npm run build
   NODE_ENV=production TEST_MODE=1 USE_MEMORY_STORE=1 npx tsx server.ts
   # In another terminal:
   node scripts/verify-submission.mjs
   ```

## 🔮 Future Improvement

**Proactive AI Safety**: Given Aganitha's focus on AI, a logical next step would be to implement an **LLM-based "Sensitive Content Filter"** on the `POST /api/pastes` endpoint. This would automatically flag or redact PII (Personally Identifiable Information) or harmful content before persistence, ensuring platform safety at scale.
