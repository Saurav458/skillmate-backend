# Skillmate-backend — Design Document

## Project Overview

Skillmate-backend is a small Node.js REST API built with Express and Sequelize for PostgreSQL. It provides user (student) registration and login, simple session management via JWT stored as an HTTP cookie, and a protected user profile endpoint. The project contains a single model (Student), basic logging, and middleware for authentication and request logging.

Primary goals:

- Allow users to sign up and log in.
- Issue JWT tokens for authenticated sessions (stored in cookies).
- Provide a protected profile endpoint.
- Persist users in a PostgreSQL database via Sequelize.

## Sequence flow (runtime)

This short section describes the key runtime sequence of the application from startup through a typical request lifecycle.

1. Startup

   - Node runs `src/main.js` (via `npm start` or `npm run dev`).
   - `dotenv` loads environment variables.
   - Express app is created, global middleware attached (body parsers, cookie parser, `logRequests`).
   - Routers (`homeRouter`, `authRouter`) are mounted and the server listens on `PORT`.

2. Incoming HTTP request

   - Client sends an HTTP request to the server.
   - Global middleware run in order: JSON/urlencoded body parsers -> cookie parser -> `logRequests`.

3. Routing & protection

   - Express matches the route to a router and handler.
   - If route is protected (e.g., `/profile`), `requireAuth` reads `token` from cookies and verifies the JWT using `JWT_SECRET`. On success `req.user` is set; otherwise a 401 is returned.

4. Controller & DB

   - Controller executes business logic (signup, login, profile) and uses the `Student` Sequelize model to interact with Postgres.
   - Examples: signup hashes & stores password; login verifies password, signs JWT and sets cookie; profile fetches user by `req.user.id`.

5. Response & logging
   - Controller sends JSON response, sets/clears cookies as needed, and the `Logger` records info/notice/error messages.

Small ASCII flow:

Client --> Express(main.js)
--> Middleware (parse, cookies, logger)
--> Router (/auth or /)
--> [requireAuth?] --> Controller --> Sequelize (Postgres)
--> Response (JSON, cookies)

## Tech Stack

- Node.js (ES modules) + Express
- Sequelize ORM (Postgres dialect)
- PostgreSQL
- bcrypt for password hashing
- jsonwebtoken for JWT
- dotenv for environment configuration
- nodemon for development

Key files:

- `package.json` — scripts & dependencies
- `src/main.js` — app entrypoint and routing
- `src/controllers/*` — business logic (auth, home)
- `src/routers/*` — Express routers
- `src/models/student.model.js` — Sequelize model
- `src/database/sequelize.js` — Sequelize connection
- `src/middlewares/*` — auth and logging middleware
- `src/utils/logger.service.js` — logging helper
- `migrations/20230928-create-students-tbl.js` — migration to create `students_tbl`
- `config/config.json` — DB config (development)
- `Dockerfile` — present but currently empty (placeholder)

## High-level Architecture

1. Client (browser / mobile app) sends HTTP requests to the Express server.
2. `src/main.js` sets up middleware (JSON body parser, urlencoded parser, cookie parser, and a request logger), mounts routers, and starts the server.
3. Routers delegate requests to controllers:
   - `homeRouter` handles `/` and `/profile` (profile is protected).
   - `authRouter` handles `/auth/signup`, `/auth/login`, `/auth/logout`.
4. Controllers use the Sequelize `Student` model to read/write user data in Postgres.
5. Authentication: on successful login, the server signs a JWT (with id, useremail, role), sets it as an HTTP-only cookie named `token` (3-hour expiry). `requireAuth` middleware reads and verifies the cookie and attaches decoded payload to `req.user`.
6. Logging: `Logger` class logs to console in non-production and to `logs/app.log` (append) in production/staging.

## Data Model

Student (Sequelize model `Student`, table `students_tbl`)

- id: UUID PK (default UUIDv4)
- useremail: STRING, unique, not null
- password: STRING, not null (hashed with bcrypt)
- role: STRING, not null
- additional_data: JSONB, nullable, default {}
- timestamps: createdAt, updatedAt

Migration `migrations/20230928-create-students-tbl.js` creates this table with appropriate defaults.

## API Endpoints

1. GET /

   - Public. Returns a simple JSON welcome message.
   - Handler: `homePage` in `src/controllers/home.js`.

2. GET /profile

   - Protected. Requires `requireAuth` middleware.
   - Returns the authenticated user's profile (id, useremail).
   - Handler: `profile` in `src/controllers/home.js`.

3. POST /auth/signup

   - Public. Body: { useremail, password, role }
   - Validates required fields. Returns 400 if missing or user already exists.
   - Hashes password with bcrypt (10 rounds) and creates Student.
   - Handler: `signup` in `src/controllers/auth.js`.

4. POST /auth/login

   - Public. Body: { useremail, password }
   - Finds user by email, compares password with bcrypt.compare.
   - On success, signs JWT with secret from env `JWT_SECRET`, sets cookie `token` with httpOnly, secure: false (should be true in production), maxAge ~3h.
   - Handler: `login` in `src/controllers/auth.js`.

5. POST /auth/logout
   - Clears the `token` cookie and returns success message.
   - Handler: `logout` in `src/controllers/auth.js`.

## Authentication Flow

- Signup: client POSTs credentials to `/auth/signup`. Server hashes password and stores the user.
- Login: client POSTs credentials to `/auth/login`. Server verifies credentials and signs a JWT:
  - Payload: { id, useremail, role }
  - Secret: `JWT_SECRET` env var
  - Expiry: 3 hours
  - Cookie: `res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 3h })`
- Protected endpoints use `requireAuth`, which reads `req.cookies.token`, verifies the JWT, and sets `req.user`.

Security notes:

- JWT stored in an HTTP-only cookie reduces XSS risk for token theft but is still subject to CSRF; consider CSRF protections (Double Submit Cookie or SameSite cookie flag).
- `secure` is currently `false`. Change to `true` in production when using HTTPS.
- Password hashing uses bcrypt with salt rounds = 10 (reasonable default).
- JWT_SECRET must be strong and kept out of source control.

## Logging

- `src/utils/logger.service.js` implements a `Logger` class with methods `info`, `debug`, `notice`, `error`.
- Behavior depends on `ENV` environment variable: in `production` or `staging` it writes JSON lines to `logs/app.log` and console; otherwise logs to console.
- `logRequests` middleware logs method and originalUrl for every request.

## Database & Migrations

- Database connection is defined in `src/database/sequelize.js` using `Sequelize(DB_NAME, DB_USER, DB_PASS, { host, port, dialect: 'postgres' })`.
- `config/config.json` includes a development configuration (username `postgres`, password `skillmate`, database `postgres`, host `localhost`). The project also reads env variables via `dotenv`.
- Migrations are done with `sequelize-cli` (dev dependency). `package.json` includes a `migrate` script: `npx sequelize-cli db:migrate`.

## Environment Variables (observed / expected)

- PORT — server port
- DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT — DB connection
- JWT_SECRET — JWT signing secret
- ENV or ENVIRONMENT — determines logger behaviour

## How to run (local / dev)

1. Install deps

   npm install

2. Create `.env` with at least:

   PORT=3000
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=skillmate
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your-secret
   ENVIRONMENT=development

3. Run migrations (if using database):

   npm run migrate

   (Requires sequelize-cli and a reachable Postgres instance.)

4. Start server (dev):

   npm run dev

5. Test endpoints with Postman / curl.

## Files Map (quick)

- `src/main.js` — bootstraps Express, middlewares, mounts routers, starts server.
- `src/routers/auth.js` — routes: /auth/signup, /auth/login, /auth/logout
- `src/routers/home.js` — routes: /, /profile
- `src/controllers/auth.js` — login, logout, signup logic
- `src/controllers/home.js` — home page, profile fetch
- `src/models/student.model.js` — Student Sequelize model
- `src/database/sequelize.js` — DB connection and testConnection helper
- `src/middlewares/auth.middleware.js` — requireAuth (verifies JWT cookie)
- `src/middlewares/logger.middleware.js` — logs each request
- `src/utils/logger.service.js` — simple logging abstraction
- `migrations/` — creates `students_tbl`

## Limitations & Recommendations / Next steps

1. Dockerfile is empty. Add a proper Dockerfile for containerized deployment.
2. CSRF protection: currently using JWT in cookie—add SameSite, enable secure flag, and add CSRF protection.
3. Error handling: add a global error handler middleware to standardize responses.
4. Input validation: use a validation library (Joi, express-validator) to validate request bodies.
5. Rate limiting & brute-force protections on /auth/login.
6. Tests: add unit and integration tests (Jest + supertest).
7. Add a health check endpoint and readiness/liveness probes for k8s.
8. Consider refresh tokens or rotating tokens for longer sessions.

## Quick design diagram (text)

Client --> Express app (main.js)
--> middlewares: parse JSON, cookie parser, logRequests
--> routers
/auth --> authController --> Student model --> Postgres
/profile --> requireAuth (verify cookie JWT) --> Student.findByPk

---

Generated from code in this repository. File references used while drafting:

- `package.json`, `src/main.js`, `src/controllers/*.js`, `src/routers/*.js`, `src/models/student.model.js`, `src/database/sequelize.js`, `src/middlewares/*.js`, `src/utils/logger.service.js`, `config/config.json`, `migrations/20230928-create-students-tbl.js`.

If you'd like, I can:

- Add a README with run commands and environment variable template.
- Fill in a production-ready `Dockerfile` and a sample `docker-compose.yml` for Postgres + app.
- Add quick curl/Postman examples for each endpoint.

```
Design doc created by analysis on project files.
```
