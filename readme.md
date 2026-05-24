# Ticketing Platform Core API — Documentation (v1.0.0)

## 📖 Project Description

The **Ticketing Platform Core API** is a high-performance backend solution engineered to manage real-time event seating allocations. In high-traffic ticketing environments (such as concert sales or sporting events), thousands of users frequently attempt to purchase the exact same seat at the exact same millisecond. This system is designed specifically to handle those high-concurrency race conditions gracefully, eliminating double-bookings while ensuring zero data corruption.

### Core Business Logic & Use-Cases

- **The 10-Minute Reservation Window:** When a user selects a seat, the system grants them a temporary **10-minute pessimistic hold**. This ensures the seat is securely locked while they fill out payment details, without allowing other concurrent requests to hijack the process.
- **Automated Expiration & Recovery:** If the user abandons their checkout or fails to confirm the purchase within 10 minutes, a background system worker automatically releases the seat hold, instantly returning the status to open for other buyers.
- **Email-Based Tracking (V1 Baseline):** To keep the baseline version lightweight and focused purely on core concurrency mechanics, explicit user registration has been deferred. Seat ownership and release authorizations are mapped directly using the customer's email address passed in the request payload.

---

## 🏗️ Technical Architecture & Design Philosophy

This project adopts a **Layered Architecture (Data-Mapper / Repository Pattern)** instead of a standard Active-Record ORM configuration. By splitting data mechanics cleanly from business operations, the application remains highly scalable, predictable, and easy to unit test.

- **API Routing Layer:** Defines clean RESTful endpoints, explicitly establishing the execution pipelines (Data Transfer Object Syntax Validators $\rightarrow$ Fast-Fail Business Validation Middlewares $\rightarrow$ Controllers).
- **Controller Layer:** Orchestrates the request-response lifecycle. By utilizing custom async error wrappers, controllers remain completely free of cluttered, repetitive exception handling logic.
- **Business Service Layer:** Houses core business rules, evaluation constants, and data transformations. It remains entirely agnostic of HTTP protocols, Express routing parameters, or request contexts.
- **Repository Layer:** Encapsulates raw database queries. Exposes a robust transaction abstraction helper to strictly manage connection check-outs from the pool during pessimistic row-level database locks.
- **Database Config Layer:** Manages connection pooling with **Lazy-Initialization**. The pool is instantiated only when the first query executes, ensuring infrastructure tasks (like automated database creation) finish safely without startup connection crashes.

---

## 🛠️ Technologies & Ecosystem

- **Runtime Environment:** Node.js (v18+)
- **Language Workspace:** TypeScript (Strict Type-Safety Configuration)
- **Web Framework:** Express.js
- **Database Driver:** Native PostgreSQL Client Connection Pool
- **Validation Engines:** Class-Validator & Class-Transformer (Metadata decorator-driven parameter assertions)
- **Testing Suite:** Jest & Supertest (Automated isolation unit and integration testing frameworks)
- **System Event Scheduling:** Native Node.js Interval-based Sweep Worker (Cron-equivalent)
- **API Specification:** Swagger / OpenAPI 3.0.3

---

## 📂 Project Directory Structure

```text
ticketing-platform/
├── dist/                          # Compiled JavaScript production distributions
├── src/
│   ├── config/
│   │   └── database.ts            # Lazy-initialized PostgreSQL connection pool wrapper
│   ├── database/
│   │   ├── bootstrap.ts           # Admin script to check & create database instance if missing
│   │   ├── init.sql               # Structural raw SQL definitions (Tables, Types, Constraints)
│   │   ├── migrate.ts             # Migration runner executing raw SQL schemas on startup
│   │   └── seed.ts                # Seeder script populating rich mock events and seats
│   ├── dtos/
│   │   └── seat.dto.ts            # Type-safe URL path parameter schemas
│   ├── middlewares/
│   │   ├── error.middleware.ts    # Centralized API error interceptor catching application exceptions
│   │   └── seat-validation.middleware.ts # Fast-fail guard verifying real-time seat availability
│   ├── controllers/
│   │   └── seat.controller.ts     # Request-response lifecycle handlers for seating actions
│   │   └── seat.controller.test.ts # Integration test suites matching routing pipelines
│   ├── services/
│   │   └── seat.service.ts        # Core seating business constraint execution layer
│   │   └── seat.service.test.ts   # Unit tests with isolated dependency mocking
│   ├── repositories/
│   │   └── seat.repository.ts     # Pessimistic locking queries and raw SQL transactions
│   ├── utils/
│   │   ├── api-error.ts           # Specialized operational ApiError utility class
│   │   └── catch-async.ts         # Uncaught handler forwarding exceptions to the global error interceptor
│   ├── workers/
│   │   └── expiration.worker.ts   # Background database sweeper clearing stale 10-min holding locks
│   ├── app.ts                     # Declarative Express application assembly layout
│   └── server.ts                  # Absolute bootstrap entry point (Initializes DB, runs schema, binds port)
├── .env                           # Environment configuration keys
├── jest.config.js                 # Global configurations for automated test assertions
├── package.json                   # Project dependency manifest and lifecycle scripts
├── swagger.json                   # Complete interactive OpenAPI doc specification
└── tsconfig.json                  # TypeScript workspace compiler rules

```

---

## 📦 Lifecycle Setup, Installation & Execution Scripts

### 1. Environment Variable Pre-requisites

Before initialization, populate a `.env` file in your root folder with your environment constraints. You must provide values for `PORT`, `NODE_ENV`, your master cluster administrative credentials (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`), the desired database namespace (`DB_NAME`), and the combined application `DATABASE_URL`.

### 2. Dependency Installation

To install the necessary framework, language workspace, and environmental dependencies mapping, execute:

```bash
npm install

```

### 3. Running Database Infrastructures

The application features isolated infrastructure commands to initialize or reset your data backend without needing to start the web server:

- **Initialize the Database Cluster Environment:** Runs the administrative script to verify whether the target database exists on your PostgreSQL server, and creates it from scratch if it is missing:

```bash
npx ts-node src/database/bootstrap.ts

```

- **Run Structural Schema Migrations:** Executes the relational schemas to safely build your tables, constraints, unique keys, and custom enum types inside the target database:

```bash
npx ts-node src/database/migrate.ts

```

- **Seed Mock Testing Records:** Truncates existing schemas and populates the database with multiple test events and a pre-configured matrix of seats for immediate evaluation:

```bash
npm run db:seed

```

### 4. Running the Application Server

Depending on your operational target, use one of the following script configurations:

- **Run Local Development Engine:** Compiles TypeScript on-the-fly and monitors file changes, automatically reloading the server upon savings:

```bash
npm run dev

```

- **Compile for Production:** Translates your TypeScript source structure into a clean, optimized JavaScript distribution inside a build directory:

```bash
npm run build

```

- **Execute Production Build:** Boots up the server from the compiled, native JavaScript build file:

```bash
npm start

```

### 5. Running Automated Testing Suites

To trigger all unit and integration assertions sequentially to verify route pipelines, input validations, and transaction isolation limits, run:

```bash
npm run test

```

---

## 🧪 Interactive Testing Manual (cURL Requests)

### 🚀 Automatic Startup Sequence

Whenever the main application is started via `npm run dev` or `npm start`, it runs through a sequential automated lifecycle chain: It builds the database if missing, runs tables schema migrations, seeds mock configurations, and launches the application engine and background cleanup cron in one smooth flow.

You can instantly interact with and evaluate your endpoints using the following terminal commands:

#### 1. Fetch Seating Configuration Map

Retrieves the real-time seating inventory layout mapping for a specific event. Stale or expired reservations are masked automatically into an open availability state during retrieval.

```bash
curl -X GET http://localhost:3000/events/1/seats

```

#### 2. Claim a 10-Minute Pessimistic Seat Hold

Acquires an immediate row-level database lock over an individual seat configuration, linking its ownership status securely to the customer's email address.

```bash
curl -X POST http://localhost:3000/events/1/seats/1/reserve \
     -H "Content-Type: application/json" \
     -d '{"email": "developer@domain.com"}'

```

#### 3. Cancel/Release an Active Hold Manually

Drops a user's temporary holding lock instantly, verifying that the submission email matches the record holder, and shifts the seat state back into the public availability pool.

```bash
curl -X POST http://localhost:3000/events/1/seats/1/release \
     -H "Content-Type: application/json" \
     -d '{"email": "developer@domain.com"}'

```

---

## 🛡️ Test Suite Implementation Strategy

The repository contains two distinct automated testing architectures designed to validate system behaviors without code conflicts:

### Isolated Domain Unit Tests

Focuses entirely on the core business logic layer. Using dependency mock frameworks, the system completely isolates business logic from live database connectivity. Test suites evaluate exact logic thresholds, confirming that missing configurations trigger appropriate missing status responses, confirmed resources throw duplication conflicts, and clear resources successfully dispatch update values to the lower layers.

### Pipeline Integration Tests

Validates the network pipeline end-to-end. Because the application assembly logic is fully separated from network binding files, the test suites mount the Express application directly into memory. Tests programmatically fire simulated HTTP requests down the routing pipeline, confirming route parameter validations, error interception responses, and data integrity transformations.

---

## 📈 Long-Term Engineering Roadmap

### 🚀 Upcoming Feature Releases

```text
[v1.0.0: Core Engine] ──> [v2.0.0: IAM Layer] ──> [v3.0.0: Redis Cache] ──> [v4.0.0: Containerized]

```

#### 🔐 Version 2.0.0 — Identity & Access Management (IAM) Layer

- **User Registration & Secure Hashing:** Introduce a dedicated user database table with unique constraint indexing. Implement passwords protected with cryptographic salted hashes.
- **JWT Session Authentication:** Transition out of request body email identifiers. Secure access using signed JSON Web Tokens (JWT) distributed via standard HTTP authorization header schemes.
- **RBAC (Role-Based Access Control):** Introduce explicit permission levels (Standard User vs. Administrator). Secure administrative routes by evaluating role claims embedded within verified token payloads.

#### ⚡ Version 3.0.0 — Redis Distributed Cache & High-Concurrency Architecture

- **Distributed High-Speed Locking:** Shift the temporary 10-minute hold management out of relational tables and offload it to a dedicated distributed caching cluster using Time-To-Live (TTL) key structures.
- **Database Write Offloading:** Incoming requests will query the high-speed cache first. If a seat reservation key is active in memory, the system fast-fail instantly without making costly database disk queries.
- **Automated Expired Cleanup:** Leverage event-driven cache expiration notifications to run reactive database reconciliation tasks instead of relying on interval-based background table sweeps.

#### 🐳 Version 4.0.0 — Containerized Orchestration & Deployment

- **Dockerization:** Build production-optimized, multi-stage container images, separating compilation layers to minimize the overall deployment footprint.
- **Multi-Container Orchestration:** Provide a unified orchestration file that provisions the Node.js API layer, an isolated relational database container, and the high-speed caching engine within an isolated virtual network with persistent storage management.

---
