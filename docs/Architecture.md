

## Layers
- **Routes**: define HTTP endpoints and minimal request wiring.
- **Controllers**: validate inputs, enforce business rules, call models, return uniform responses.
- **Models**: database access using parameterized SQL queries.
- **Middleware**: auth (JWT), error handler, file upload, CORS.

## Error Shape
All errors bubble to a global handler and respond as JSON:
```json
{ "status": "error", "message": "Reason", "details": {} }
```

## Auth Flow
1. `POST /api/v1/auth/register` → create user (password hashed with bcrypt).
2. `POST /api/v1/auth/login` → returns JWT.
3. Use `Authorization: Bearer <token>` for protected endpoints (orders, messages, comments, event registration).

## Database Integrity
- PK/FK constraints enforce 1:N, N:1 and N:N relationships.
- See the ERD in `docs/` (PNG/PDF).

## How to Demo Quickly
- Import the provided Postman **collection** and **environment**.
- Set `{{base_url}}` to your server (default `http://localhost:3000/api/v1`).
- Run **Register → Login → Me**, then **List products** and **List events**.
- Use **Register to event** or **Create order** to show protected flows.
