# Simplified Banking System

A REST API banking system built with **Node.js**, **Express**, **PostgreSQL**, and **Docker**.

---

## Tech Stack

| Layer       | Choice              | Reason                                      |
|-------------|---------------------|---------------------------------------------|
| Runtime     | Node.js + Express   | Lightweight, fast to set up                 |
| Database    | PostgreSQL          | ACID-compliant, strong for financial data   |
| Auth        | JWT (access token)  | Stateless, standard for REST APIs           |
| Validation  | Zod                 | Schema-first, great error messages          |
| Security    | bcrypt              | Industry standard for hashing PINs          |
| Container   | Docker + Compose    | Reproducible local setup                    |

---

## Project Structure

```
banking-system/
├── migrations/
│   ├── migrate.js       # Creates tables
│   └── seed.js          # Seeds Alice and Bob
├── src/
│   ├── config/
│   │   └── db.js        # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   └── accountController.js
│   ├── middlewares/
│   │   ├── auth.js          # JWT verification
│   │   ├── validate.js      # Zod schema validation
│   │   └── errorHandler.js  # Global error handler
│   ├── models/
│   │   ├── userModel.js
│   │   └── accountModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── accountRoutes.js
│   ├── validations/
│   │   └── schemas.js       # Zod schemas
│   └── app.js
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Setup & Run (Docker — Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed

### Steps

```bash
# 1. Clone / unzip the project
cd banking-system

# 2. Start everything (Postgres + app + migrations + seed)
docker compose up --build
```

The API will be available at `http://localhost:3000`.

> The app container automatically runs migrations and seeds the DB on startup.

### Stop

```bash
docker compose down          # keep data
docker compose down -v       # also wipe the database volume
```

---

## Setup & Run (Local — Without Docker)

### Prerequisites
- Node.js 20+
- A running PostgreSQL instance

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your local Postgres credentials

# 3. Run migrations
npm run migrate

# 4. Seed the database
npm run seed

# 5. Start the server
npm start
```

---

## Environment Variables

| Variable        | Default                  | Description                     |
|-----------------|--------------------------|---------------------------------|
| `PORT`          | `3000`                   | Server port                     |
| `DB_HOST`       | `postgres`               | Postgres host                   |
| `DB_PORT`       | `5432`                   | Postgres port                   |
| `DB_NAME`       | `banking_db`             | Database name                   |
| `DB_USER`       | `banking_user`           | Database user                   |
| `DB_PASSWORD`   | `banking_pass`           | Database password               |
| `JWT_SECRET`    | *(required)*             | Secret for signing JWTs         |
| `JWT_EXPIRES_IN`| `1h`                     | Token expiry duration           |

---

## API Reference

### Health Check

```
GET /health
```
```json
{ "success": true, "status": "ok", "timestamp": "..." }
```

---

### 1. Login

```
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "alice@example.com",
  "pin": "1234"
}
```

**Success (200):**
```json
{
  "success": true,
  "token": "<jwt>",
  "expiresIn": "1h"
}
```

**Errors:**
| Status | Reason                         |
|--------|--------------------------------|
| 400    | Missing/invalid email or PIN format |
| 401    | Wrong email or PIN             |
| 429    | Too many attempts (5 per 15 min) |

---

### 2. Get Balance

```
GET /api/account/balance
Authorization: Bearer <token>
```

**Success (200):**
```json
{
  "success": true,
  "balance": 1000.00
}
```

**Errors:**
| Status | Reason               |
|--------|----------------------|
| 401    | Missing/invalid token |
| 404    | Account not found    |

---

### 3. Deposit

```
POST /api/account/deposit
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 250.00
}
```

**Success (200):**
```json
{
  "success": true,
  "deposited": 250.00,
  "balance": 1250.00
}
```

**Errors:**
| Status | Reason                          |
|--------|---------------------------------|
| 400    | Amount missing, zero, or negative |
| 401    | Missing/invalid token           |

---

## Test with curl

```bash
# Login as Alice
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","pin":"1234"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Get balance
curl http://localhost:3000/api/account/balance \
  -H "Authorization: Bearer $TOKEN"

# Deposit
curl -X POST http://localhost:3000/api/account/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 250}'

# Test invalid PIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","pin":"9999"}'

# Test negative deposit
curl -X POST http://localhost:3000/api/account/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": -100}'
```

---

## Assumptions

- One account per user (as per the spec)
- PINs are exactly 4 digits
- Amounts are in a single unnamed currency
- No withdrawal endpoint was required by the spec

---

## What I'd Add with More Time

- **Refresh tokens + token blacklist** (Redis) for proper logout
- **Withdrawal endpoint** with overdraft protection
- **Structured logging** (Winston / Pino) with request IDs
- **Integration tests** (Jest + Supertest)
- **Pagination** on a transaction history endpoint
- **HTTPS** termination at the reverse proxy layer
