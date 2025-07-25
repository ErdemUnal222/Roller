# Roller Derby Backend

This project provides the backend API for the Roller Derby platform. It uses **Node.js**, **Express**, and **MySQL** with JWT based authentication and Stripe for payments.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the provided `.env.example` to `.env` and update the values for your environment.
3. Start the development server with nodemon or run in production:
   ```bash
   npm run dev   # start with nodemon
   npm start     # start with node
   ```

The API listens on the port defined by `PORT` (defaults to `9500`).

## Basic Usage

All endpoints are prefixed with `/api/v1`. Authentication is done via a JWT sent in the `Authorization` header using the `Bearer <token>` format.

Example endpoints:

- `POST /api/v1/register` – create a new user
- `POST /api/v1/login` – authenticate and receive a JWT
- `GET  /api/v1/events` – list public events
- `GET  /api/v1/shop` – list available products
- `POST /api/v1/orders/checkout` – create an order and start Stripe checkout
- `POST /api/v1/webhook/stripe` – Stripe webhook endpoint

More routes are available for managing products, events, comments, messages and orders. Admin‑only routes require a valid JWT belonging to an admin user.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values for your setup.
See `.env.example` for all required variables. At a minimum you need MySQL credentials, JWT and Stripe secrets, and the frontend URL allowed for CORS.

Key variables include:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – MySQL connection
- `JWT_SECRET` – secret used to sign tokens
- `STRIPE_SECRET` – Stripe API key
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret
- `FRONTEND_URL` – origin allowed for CORS
- `PORT` *(optional)* – API server port