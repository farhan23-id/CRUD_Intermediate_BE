# Mission BE Intermediate

## Note

```
On this repo, I only create a basic CRUD without role and rate limiting, but you can follow this guide if you want to build those features.
```

A backend-only REST API built with **Express 5**, **Knex** and **MySQL**. It implements user CRUD with **JWT authentication**, **role-based access control**, input validation, pagination/search and basic security hardening. There is no frontend; the API is meant to be tested with Postman.

## Features

- User registration and login with hashed passwords (`bcryptjs`)
- JWT authentication (`jsonwebtoken`) via `Authorization: Bearer <token>`
- Role-based authorization (`user` and `admin`) plus owner-only access to a user's own data
- Full CRUD for users
- Input validation with `zod`
- Pagination and search on the user list
- Database migrations and seeds with Knex
- Security basics: `helmet`, login rate limiting, no password hashes in responses
- Health check endpoint that also verifies the database connection

## Tech Stack

| Purpose                          | Package                        |
| -------------------------------- | ------------------------------ |
| HTTP server                      | `express`                      |
| Database                         | MySQL via `mysql2`             |
| Query builder, migrations, seeds | `knex`                         |
| Password hashing                 | `bcryptjs`                     |
| Authentication                   | `jsonwebtoken`                 |
| Environment variables            | `dotenv`                       |
| CORS                             | `cors`                         |
| Validation                       | `zod`                          |
| Security headers / rate limiting | `helmet`, `express-rate-limit` |
| Dev server                       | `nodemon`                      |

## Prerequisites

- Node.js (current LTS)
- MySQL server running locally or remotely
- Postman (or any HTTP client) for testing
- Optional: MySQL Workbench or DBeaver to inspect the database

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

| Variable         | Description                             | Example      |
| ---------------- | --------------------------------------- | ------------ |
| `PORT`           | Port the server listens on              | `3000`       |
| `DB_HOST`        | MySQL host                              | `localhost`  |
| `DB_PORT`        | MySQL port (optional, defaults to 3306) | `3306`       |
| `DB_USER`        | MySQL user                              | `root`       |
| `DB_PASSWORD`    | MySQL password                          |              |
| `DB_NAME`        | Database name                           | `mission_be` |
| `JWT_SECRET`     | Long random string used to sign tokens  |              |
| `JWT_EXPIRES_IN` | Token lifetime                          | `1d`         |

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Create the database

Knex does not create the database itself. Create an empty one that matches `DB_NAME`:

```sql
CREATE DATABASE mission_be;
```

### 4. Run migrations and seeds

```bash
npx knex migrate:latest
npx knex seed:run
```

Useful migration commands:

```bash
npx knex migrate:status             # see which migrations have run
npx knex migrate:rollback           # undo the last batch
npx knex migrate:rollback --all     # undo everything
npx knex migrate:make <name>        # create a new migration
npx knex seed:make <name>           # create a new seed
```

### 5. Start the server

```bash
npm run dev     # development, auto-restarts with nodemon
npm start       # production
```

Check that everything works:

```
GET http://localhost:3000/health
```

Expected response:

```json
{ "status": "ok", "database": "connected" }
```

## Project Structure

```
Mission BE intermediate/
├── src/
│   ├── config/
│   │   └── database.js          # shared Knex instance
│   ├── controllers/
│   │   ├── auth.controller.js   # register, login
│   │   └── user.controller.js   # user CRUD handlers
│   ├── database/
│   │   ├── migrations/          # table structure
│   │   └── seeds/               # initial data
│   ├── middlewares/
│   │   ├── auth.middleware.js   # authenticate, authorizeSelf, authorizeRoles
│   │   └── validate.middleware.js
│   ├── models/
│   │   └── user.model.js        # database queries for users
│   ├── routers/
│   │   ├── index.js             # combines all routers
│   │   ├── auth.router.js
│   │   └── user.router.js
│   ├── validators/
│   │   └── user.validator.js    # zod schemas
│   └── index.js                 # app entry point
├── knexfile.js                  # Knex CLI configuration
├── .env
├── .env.example
├── .gitignore
└── package.json
```

### Request flow

```
Request → Router → Middleware (auth / validation) → Controller → Model → MySQL
```

- **Router** maps a method and path to a controller.
- **Middleware** handles authentication, authorization and validation.
- **Controller** handles the request and response (status codes, messages).
- **Model** contains only the database queries.

## Authentication

1. Register with `POST /api/auth/register`.
2. Log in with `POST /api/auth/login` and copy the `token` from the response.
3. Send the token on protected routes as a header:

```
Authorization: Bearer <token>
```

In Postman: **Authorization** tab → **Bearer Token** → paste the token (do not type `Bearer` again).

Tip: save the token automatically by adding this to the login request's **Scripts** tab, then use `{{token}}` in other requests:

```javascript
pm.environment.set("token", pm.response.json().token);
```

## API Endpoints

Base URL: `http://localhost:3000`

### Health

| Method | Path      | Auth | Description                |
| ------ | --------- | ---- | -------------------------- |
| GET    | `/health` | No   | Server and database status |

### Auth

| Method | Path                 | Auth | Description                             |
| ------ | -------------------- | ---- | --------------------------------------- |
| POST   | `/api/auth/register` | No   | Create a new account                    |
| POST   | `/api/auth/login`    | No   | Log in and receive a JWT (rate limited) |

### Users

All user routes require a valid token.

| Method | Path             | Access         | Description                                 |
| ------ | ---------------- | -------------- | ------------------------------------------- |
| GET    | `/api/users`     | Admin          | List users (supports pagination and search) |
| GET    | `/api/users/:id` | Owner or admin | Get one user                                |
| PUT    | `/api/users/:id` | Owner or admin | Update a user                               |
| DELETE | `/api/users/:id` | Owner or admin | Delete a user                               |

### Request and response examples

**Register**

```
POST /api/auth/register
```

```json
{
  "name": "Siti Aminah",
  "email": "siti@example.com",
  "password": "supersecret123"
}
```

Response `201`:

```json
{
  "message": "Registrasi berhasil",
  "data": {
    "id": 4,
    "name": "Siti Aminah",
    "email": "siti@example.com",
    "role": "user"
  }
}
```

**Login**

```
POST /api/auth/login
```

```json
{ "email": "budi@example.com", "password": "budi123" }
```

Response `200`:

```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "name": "Budi Santoso", "email": "budi@example.com" }
}
```

**List users with pagination and search**

```
GET /api/users?page=1&limit=10&search=budi
```

Response `200`:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "role": "admin"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

| Query param | Default | Notes                 |
| ----------- | ------- | --------------------- |
| `page`      | `1`     | Page number           |
| `limit`     | `10`    | Maximum `100`         |
| `search`    | empty   | Matches name or email |

**Update a user**

```
PUT /api/users/1
```

```json
{ "name": "New Name" }
```

All fields (`name`, `email`, `password`) are optional, but at least one is required.

**Validation error example**

Response `400`:

```json
{
  "message": "Validasi gagal",
  "errors": [
    { "field": "email", "message": "Format email tidak valid" },
    { "field": "password", "message": "Password minimal 8 karakter" }
  ]
}
```

## Status Codes

| Code | Meaning                                                 |
| ---- | ------------------------------------------------------- |
| 200  | Success                                                 |
| 201  | Resource created                                        |
| 400  | Invalid input                                           |
| 401  | Missing, invalid or expired token, or wrong credentials |
| 403  | Authenticated but not allowed                           |
| 404  | Resource or route not found                             |
| 409  | Conflict (email already registered)                     |
| 429  | Too many requests (login rate limit)                    |
| 500  | Server error                                            |

## Seed Data

Running `npx knex seed:run` replaces all users with these accounts (passwords are stored as bcrypt hashes):

| Name         | Email            | Password | Role  |
| ------------ | ---------------- | -------- | ----- |
| Budi Santoso | budi@example.com | budi123  | admin |
| Siti Aminah  | siti@example.com | siti123  | user  |
| Joko Widodo  | joko@example.com | joko123  | user  |

These are for development only. Never use them in production.

## Testing Checklist (Postman)

1. `GET /health` returns `200` with `database: connected`.
2. Register a new user (`201`); repeat with the same email (`409`).
3. Log in and copy the token; use a wrong password (`401`).
4. `GET /api/users` without a token (`401`), with a normal user's token (`403`), with an admin token (`200`).
5. `PUT` / `DELETE` your own id (success) and another user's id as a normal user (`403`).
6. `GET /api/users/9999` returns `404`.
7. Send invalid input to register or update and confirm `400` with error details.

## Conventions

- **File names**: lowercase with a role suffix, e.g. `user.model.js`, `auth.controller.js`.
- **Migrations**: `snake_case` with a verb, e.g. `create_users`, `add_role_to_users`. Never edit a migration that has already run; create a new one.
- **Tables and columns**: `snake_case`, plural table names.
- **Environment variables**: uppercase, grouped by prefix (`DB_`, `JWT_`).

## Security Notes

- Passwords are hashed with bcrypt and never returned in responses.
- `role` can never be set from request bodies; validation strips unknown fields.
- Login responses use the same message for unknown email and wrong password.
- `helmet` sets secure headers and the login route is rate limited.
- Keep `.env` out of version control. Only `.env.example` (names without real values) should be committed.
- Behind a proxy or hosting platform, set `app.set("trust proxy", 1)` so rate limiting sees the real client IP.

## Possible Next Steps

- Add the main resource of the app (e.g. products, posts or tasks) with a `user_id` foreign key and ownership checks.
- Add automated tests.
- Add a refresh-token flow.
- Add API documentation (e.g. OpenAPI / Swagger).

## License

ISC
