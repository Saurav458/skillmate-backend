# Rental Application — Backend API

## Project Overview

Rental is a Node.js REST API built with Express and Sequelize for PostgreSQL. It provides user authentication (signup/login), session management via JWT stored as HTTP cookies, and protected user profile endpoints. The project includes user authentication, OTP verification, logging middleware, and a modular architecture for scalability.

**Primary goals:**

- User registration and login with secure password handling
- JWT-based authentication with HTTP-only cookies
- OTP verification system for enhanced security
- Protected endpoints for authenticated users
- Comprehensive logging and request tracking
- PostgreSQL database persistence via Sequelize

## Sequence Flow (Runtime)

This section describes the key runtime sequence of the application from startup through a typical request lifecycle.

### 1. Startup

- Node runs `src/main.js` (via `npm start` or `npm run dev`)
- `dotenv` loads environment variables from `.env` file
- Express app is created with global middleware attached (body parsers, cookie parser, request logger)
- Routers (`homeRouter`, `authRouter`) are mounted
- Server listens on configured `PORT`
- Sequelize database connection is established

### 2. Incoming HTTP Request

- Client sends an HTTP request to the server
- Global middleware execute in order:
  1. JSON body parser
  2. URL-encoded body parser
  3. Cookie parser
  4. Request logger (`logRequests`)

### 3. Routing & Protection

- Express matches the route to a router and handler
- If the route is protected (e.g., `/profile`), `requireAuth` middleware:
  - Reads `token` from cookies
  - Verifies the JWT using `JWT_SECRET`
  - On success: sets `req.user` with decoded payload
  - On failure: returns 401 Unauthorized

### 4. Controller & Database

- Controller executes business logic (signup, login, profile)
- Uses Sequelize models (`User`, `OTP`) to interact with PostgreSQL:
  - **Signup**: validates input, hashes password with bcrypt, stores user record
  - **Login**: verifies credentials, signs JWT token, sets HTTP-only cookie
  - **OTP**: generates, sends, and verifies OTP for additional security
  - **Profile**: retrieves authenticated user information

### 5. Response & Logging

- Controller sends JSON response and sets/clears cookies as needed
- `Logger` service records info, notice, and error messages
- Response is sent back to client

### Request Flow Diagram

```
Client
  ↓
Express Server (main.js)
  ↓
Global Middleware (parse, cookies, logger)
  ↓
Router (/auth or /)
  ↓
[requireAuth Middleware?]
  ↓
Controller (auth.js, home.js)
  ↓
Sequelize Models → PostgreSQL
  ↓
Response (JSON + Cookies)

## Tech Stack

**Core Framework:**
- Node.js (ES modules)
- Express 5.1.0

**Database:**
- PostgreSQL
- Sequelize 6.37.7 ORM

**Authentication & Security:**
- bcrypt 6.0.0 (password hashing)
- jsonwebtoken 9.0.2 (JWT tokens)
- cookie-parser 1.4.7 (session cookies)

**Configuration & Utilities:**
- dotenv 17.2.3 (environment variables)

**Development:**
- nodemon 3.1.10 (auto-reload)
- sequelize-cli 6.6.3 (migrations)

### Key Project Files

```

src/
├── main.js # Application entry point
├── controllers/
│ ├── auth.js # Auth business logic (signup, login, logout)
│ └── home.js # Home/profile endpoints
├── routers/
│ ├── auth.js # /auth routes
│ └── home.js # / and /profile routes
├── models/
│ ├── user.model.js # User model definition
│ └── otp.model.js # OTP model definition
├── middlewares/
│ ├── auth.middleware.js # JWT verification (requireAuth)
│ └── logger.middleware.js # Request logging
├── utils/
│ ├── auth.helper.js # Auth utilities
│ └── logger.service.js # Centralized logging
└── database/
└── sequelize.js # Sequelize configuration & connection

config/
├── config.json # Database configuration

migrations/ # Database migrations

logs/ # Application logs (production)

Dockerfile # Container configuration

## High-Level Architecture

The application follows a clean, modular architecture:

```
┌─────────────────┐
│ HTTP Client     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Express Server (main.js)           │
│  ├─ Global Middleware               │
│  │  ├─ Body Parser (JSON/URL)      │
│  │  ├─ Cookie Parser               │
│  │  └─ Request Logger              │
│  └─ Route Handlers                  │
└─────────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌──────────┐
│ /auth    │ │ / & /    │
│ Router   │ │ profile  │
└────┬─────┘ │ Router   │
     │       └────┬─────┘
     └───────┬────┘
             ▼
    ┌──────────────────┐
    │ Controllers      │
    │ ├─ auth.js       │
    │ └─ home.js       │
    └────────┬─────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐ ┌──────────────┐
│Middleware│ │ Sequelize    │
│├─ Auth   │ │ Models       │
│└─ Logger │ │ ├─ User      │
└──────────┘ │ └─ OTP       │
             └────────┬─────┘
                      ▼
             ┌──────────────────┐
             │  PostgreSQL DB   │
             └──────────────────┘
```

### Request Flow

1. **Authentication Flow:**

   - Client sends credentials to `/auth/signup` or `/auth/login`
   - Server validates credentials and generates JWT token
   - Token stored in HTTP-only cookie with 3-hour expiry
   - Client automatically sends cookie with subsequent requests

2. **Protected Endpoints:**

   - `requireAuth` middleware intercepts requests to protected routes
   - Verifies JWT token from cookie
   - Attaches decoded user data to `req.user`
   - Allows request to proceed or returns 401 Unauthorized

3. **OTP Verification:**

   - Generated during sensitive operations
   - Sent via email/SMS to user
   - Verified before completing the operation
   - Automatically expires after configurable duration

4. **Logging:**
   - All requests logged with timestamps and metadata
   - Environment-aware: console in development, file in production
   - Error tracking and monitoring for debugging

## Data Models

### User Model

Sequelize model: `User` | Table: `users`

**Fields:**

- `id`: UUID, Primary Key (default UUIDv4)
- `useremail`: STRING, unique, not null (user email address)
- `password`: STRING, not null (bcrypt hashed)
- `role`: STRING, not null (user role: 'customer', 'owner', 'admin')
- `additional_data`: JSONB, nullable (flexible additional fields)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

**Example:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "useremail": "user@example.com",
  "role": "customer",
  "additional_data": {
    "phone": "+1234567890",
    "address": "123 Main St"
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### OTP Model

Sequelize model: `OTP` | Table: `otps`

**Fields:**

- `id`: UUID, Primary Key
- `useremail`: STRING, not null (recipient email)
- `otp_code`: STRING, not null (6-digit code)
- `expires_at`: TIMESTAMP (expiration time)
- `verified`: BOOLEAN (default false)
- `createdAt`: TIMESTAMP

**Example:**

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "useremail": "user@example.com",
  "otp_code": "123456",
  "expires_at": "2025-01-15T10:40:00Z",
  "verified": false
}
```

## API Endpoints

### Authentication Routes (`/auth`)

#### POST /auth/signup

Register a new user account.

**Request:**

```json
{
  "useremail": "user@example.com",
  "password": "securePassword123",
  "role": "customer"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "useremail": "user@example.com",
    "role": "customer"
  }
}
```

#### POST /auth/login

Authenticate user and establish session.

**Request:**

```json
{
  "useremail": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "useremail": "user@example.com",
    "role": "customer"
  }
}
```

**Cookies:** Sets `token` (JWT, 3-hour expiry, HTTP-only)

#### POST /auth/logout

Terminate user session.

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookies:** Clears `token`

### Home Routes (`/`)

#### GET /

Public homepage endpoint.

**Response (200):**

```json
{
  "message": "Welcome to Rental API"
}
```

#### GET /profile

Retrieve authenticated user profile (protected).

**Headers:**

```
Cookie: token=<JWT_TOKEN>
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "useremail": "user@example.com",
    "role": "customer",
    "additional_data": {},
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Response (401):** If not authenticated

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Error Responses

**400 Bad Request:**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["useremail is required", "password must be at least 8 characters"]
}
```

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "An error occurred",
  "error": "error details"
}
```

## Authentication & Security

### JWT Token Flow

1. **Signup:** User creates account with email and password

   - Password hashed with bcrypt (10 salt rounds)
   - User record stored in database

2. **Login:** User submits credentials

   - Server verifies email exists
   - Password compared with bcrypt
   - On success, JWT created with payload: `{ id, useremail, role }`
   - Token signed with `JWT_SECRET` environment variable
   - Token set as HTTP-only cookie with 3-hour expiry

3. **Protected Requests:** Client sends subsequent requests
   - Cookie automatically included in request
   - `requireAuth` middleware verifies JWT signature
   - Decoded user data attached to `req.user`
   - Request proceeds to handler or returns 401

### Security Considerations

- **HTTP-only Cookies:** Protects against XSS token theft
- **CSRF Protection:** Consider adding SameSite cookie flag and CSRF tokens
- **HTTPS:** Use `secure: true` cookie flag in production with HTTPS
- **Password Hashing:** bcrypt with 10 rounds provides strong security
- **JWT Secret:** Must be strong, random, and kept in environment variables

### Recommended Enhancements

- Add rate limiting on `/auth/login` endpoint
- Implement refresh tokens for extended sessions
- Add brute-force protection
- Implement password reset via secure tokens
- Add email verification for new accounts

## Logging System

The `Logger` service provides structured logging throughout the application.

### Logger Methods

- `logger.info(message)` — Information level logs
- `logger.debug(message)` — Detailed debug information
- `logger.notice(message)` — Important notices
- `logger.error(message, error)` — Error tracking

### Environment-Based Behavior

- **Development:** Logs to console only
- **Production/Staging:** Logs to both console and `logs/app.log` (JSON format)

### Request Logging

All HTTP requests are automatically logged by the `logRequests` middleware with:

- HTTP method
- Original URL
- Timestamp
- Request metadata

## Database Configuration

### Connection Setup

Database configuration defined in [config/config.json](config/config.json) and environment variables:

**Environment Variables:**

```
DB_NAME=rental_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

**Connection Details:**

- Dialect: PostgreSQL
- ORM: Sequelize
- Host: `localhost` (development) or via `DB_HOST`
- Port: 5432 (development) or via `DB_PORT`

### Migrations

Sequelize-CLI manages database schema updates:

```bash
# Run all pending migrations
npm run migrate

# Generate a new migration file
npm run migration:generate -- --name create_table_name
```

All migrations stored in `migrations/` directory.

### Models

Located in `src/models/`:

- [user.model.js](src/models/user.model.js) — User table schema
- [otp.model.js](src/models/otp.model.js) — OTP table schema

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=3000
ENVIRONMENT=development

# Database Configuration
DB_NAME=rental_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application
APP_URL=http://localhost:3000
```

**Important Notes:**

- Never commit `.env` to version control
- Change all secrets in production environment
- Use strong, random JWT_SECRET (min 32 characters)
- Email credentials should be app-specific passwords, not main account password

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Rental
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Create database**

   ```bash
   createdb rental_db
   ```

5. **Run migrations**
   ```bash
   npm run migrate
   ```

### Development

Start development server with hot-reload:

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production

Start production server:

```bash
npm start
```

### Testing with cURL

**Signup:**

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"useremail":"user@example.com","password":"password123","role":"customer"}'
```

**Login:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"useremail":"user@example.com","password":"password123"}'
```

**Get Profile (authenticated):**

```bash
curl -X GET http://localhost:3000/profile \
  -H "Cookie: token=<your-jwt-token>"
```

**Logout:**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Cookie: token=<your-jwt-token>"
```

## Project Structure

```
Rental/
├── src/
│   ├── main.js                         # Application entry point
│   ├── controllers/
│   │   ├── auth.js                     # Authentication logic (signup, login, logout)
│   │   └── home.js                     # Home and profile endpoints
│   ├── routers/
│   │   ├── auth.js                     # /auth routes
│   │   └── home.js                     # / and /profile routes
│   ├── models/
│   │   ├── user.model.js               # User model definition
│   │   └── otp.model.js                # OTP model definition
│   ├── middlewares/
│   │   ├── auth.middleware.js          # JWT verification middleware
│   │   └── logger.middleware.js        # Request logging middleware
│   ├── utils/
│   │   ├── auth.helper.js              # Authentication helper functions
│   │   └── logger.service.js           # Centralized logging service
│   └── database/
│       └── sequelize.js                # Sequelize connection & configuration
├── config/
│   └── config.json                     # Database configuration
├── migrations/                          # Database migration files
├── logs/                                # Application logs (production)
├── .env                                 # Environment variables (not in repo)
├── .env.example                         # Example environment template
├── package.json                         # Project dependencies & scripts
├── Dockerfile                           # Docker container configuration
├── docker-compose.yml                   # Docker compose (if applicable)
└── README.md                            # This file
```

## Roadmap & Future Enhancements

### Current Features

- ✅ User authentication (signup/login/logout)
- ✅ JWT token-based sessions
- ✅ Password hashing with bcrypt
- ✅ OTP support model
- ✅ Request logging
- ✅ PostgreSQL integration

### Planned Features

- 🔲 Email verification for new accounts
- 🔲 Password reset via email
- 🔲 Rate limiting and brute-force protection
- 🔲 Refresh token rotation
- 🔲 Two-factor authentication (2FA)
- 🔲 Role-based access control (RBAC)
- 🔲 API documentation with Swagger
- 🔲 Unit and integration tests
- 🔲 Docker containerization
- 🔲 Health check and monitoring endpoints
- 🔲 CORS configuration
- 🔲 Request validation with Joi/Express-validator

### Known Limitations

- No input validation library currently integrated
- No global error handling middleware
- CSRF protection not implemented
- No refresh token mechanism
- Limited rate limiting

## Troubleshooting

### Database Connection Errors

**Error:** `connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**

1. Ensure PostgreSQL is running
2. Check `DB_HOST` and `DB_PORT` in `.env`
3. Verify database exists: `psql -l`
4. Create database if missing: `createdb rental_db`

### JWT Token Errors

**Error:** `JsonWebTokenError: invalid signature`

**Solution:**

1. Ensure `JWT_SECRET` is set in `.env`
2. Token may be corrupted or signed with different secret
3. Check cookie value in browser

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**

1. Kill process on port 3000: `lsof -ti :3000 | xargs kill -9` (Linux/Mac)
2. Change `PORT` in `.env` to unused port
3. Use `netstat -ano | findstr :3000` (Windows) to find PID

### Environment Variables Not Loading

**Error:** Variables like `JWT_SECRET` are undefined

**Solution:**

1. Ensure `.env` file exists in project root
2. Verify variables are set correctly
3. Restart server after `.env` changes
4. Check for typos in variable names

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with meaningful messages: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

## Support

For issues, questions, or contributions:

- Create an issue in the repository
- Contact the development team
- Check existing documentation

## License

This project is licensed under ISC License. See package.json for details.
