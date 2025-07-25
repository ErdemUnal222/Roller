# Roller

This repository contains the full stack code for the **Roller Derby** platform. The project is split into two main parts:

- **`backend/`** – an Express + MySQL API with JWT authentication and Stripe payments.
- **`frontend/`** – a React application bootstrapped with Vite.

## Requirements

- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- A **MySQL** instance for the backend

Environment variables are required for both applications:

- The backend expects an `.env` file inside `backend/` (see [`backend/README.md`](backend/README.md)).
- The frontend expects a `.env` file inside `frontend/` defining `VITE_API_BASE_URL` (see [`frontend/README.md`](frontend/README.md)).

## Installation

Install dependencies for each part separately:

```bash
# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

## Running the applications

### Backend

```bash
cd backend
npm run dev   # start with nodemon for development
# or
npm start     # run with Node in production
```

The API listens on the port specified by `PORT` in your `.env` (defaults to `9500`).

### Frontend

```bash
cd frontend
npm run dev
```

The Vite dev server will start (typically on <http://localhost:5173>).
Set `VITE_API_BASE_URL` in `frontend/.env` so the frontend can reach the API.

## More information

Refer to the dedicated READMEs for details on each part:

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)