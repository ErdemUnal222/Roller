# Roller Derby Platform

A full-stack web application built for the roller derby community. The platform allows users to create accounts, register for events, exchange messages, browse products, and manage content through an admin dashboard.

This project was originally developed as part of a full-stack JavaScript training program and was later migrated from a school environment to a fully local setup using React, Node.js, Express, JWT, and MySQL.

---

## Overview

The goal of this project is to provide a centralized platform for the roller derby community, where users can interact through features such as authentication, event participation, messaging, product browsing, and admin management.

The application is composed of two main parts:

- **Frontend:** React application built with Vite
- **Backend:** Node.js API built with Express and connected to a MySQL database

---

## Main Features

- User registration and login
- JWT-based authentication
- Protected routes based on user role
- Event listing and event registration
- Messaging system between users
- Product browsing and purchase flow
- Admin dashboard for managing users, events, products, orders, and messages
- Image upload for selected content

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Redux
- Axios
- SCSS

### Backend
- Node.js
- Express
- MySQL
- JWT
- bcrypt
- Stripe

---

## Architecture Overview

The project follows a classic client-server architecture:

User Browser  
→ React Frontend (Vite)  
→ Axios HTTP requests  
→ Express Backend API  
→ Controllers  
→ Models / SQL queries  
→ MySQL Database

### Backend Responsibilities

| Layer | Responsibility |
|------|------|
| Routes | Define API endpoints |
| Controllers | Handle request logic and business logic |
| Models | Execute SQL queries and interact with the database |
| Middleware | Authentication, authorization, and shared request handling |

---

## Project Structure

```bash
badass-roller/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── public/
│   │   └── uploads/
│   ├── routes/
│   ├── database/
│   │   └── schema.sql
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── redux/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   ├── Architecture.md
│   └── relations table.png
│
└── README.md
```

---

## Documentation

Additional technical documentation is available in the `docs/` folder:

- `Architecture.md` — overview of backend layers, authentication flow, error handling, and technical structure
- `relations table.png` — database relationship diagram for the main entities

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ErdemUnal222/Roller.git
cd Roller
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend` folder based on the example file:

```bash
cp .env.example .env
```

Example backend configuration:

```env
PORT=9500
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=roller_user
DB_PASSWORD=your_password
DB_DATABASE=roller_derby

JWT_SECRET=your_jwt_secret

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

CORS_ORIGINS=http://localhost:5173
```

If your frontend also uses environment variables, create a separate `.env` file in the `frontend` folder and add the required values there.

---

## Database Setup

The application uses MySQL in local development.

### 1. Create the database

```sql
CREATE DATABASE roller_derby;
```

### 2. Create a dedicated MySQL user

```sql
CREATE USER 'roller_user'@'localhost'
IDENTIFIED WITH mysql_native_password BY 'your_password';

GRANT ALL PRIVILEGES ON roller_derby.* TO 'roller_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Import the schema

The SQL schema file is available here:

```text
backend/database/schema.sql
```

Import it with:

```bash
mysql -u roller_user -p roller_derby < backend/database/schema.sql
```

Then update your backend `.env` file with the correct database credentials.

---

## Run the Project Locally

### Start the backend

```bash
cd backend
npm run dev
```

Backend default URL:

```text
http://localhost:9500
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

---

## Frontend Routes

These routes are handled by React Router on the frontend.

| Route | Description |
|------|------|
| `/` | Homepage |
| `/shop` | Product shop |
| `/events` | Events listing |
| `/events/:id` | Event details |
| `/messages` | Messaging interface |
| `/dashboard` | Admin dashboard |

Example frontend page:

```text
http://localhost:5173/shop
```

---

## Backend API

All backend API endpoints are prefixed with:

```text
/api/v1
```

### Example endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/v1/register` | Create a new user |
| POST | `/api/v1/login` | Authenticate a user |
| GET | `/api/v1/events` | List events |
| GET | `/api/v1/shop` | List products |
| POST | `/api/v1/orders/checkout` | Create an order and Stripe checkout |
| POST | `/api/v1/webhook/stripe` | Stripe webhook endpoint |

Admin routes allow management of:

- users
- products
- events
- orders
- messages

These routes require a valid JWT token with admin privileges.

---

## Authentication

Authentication is handled with JSON Web Tokens (JWT).

### Login Flow

1. The user sends credentials to:

```http
POST /api/v1/login
```

2. The server verifies the password using `bcrypt`
3. If the credentials are valid, the server returns a JWT token
4. The client stores the token and includes it in protected requests

Example response:

```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

Protected requests use the following header:

```http
Authorization: Bearer <token>
```

Middleware verifies the token before granting access to protected resources.

---

## Core Flows Tested

The following flows have been tested locally:

- User registration
- User login and JWT authentication
- Access to protected routes
- Event listing and event registration
- Messaging between users
- Product listing and order flow
- Admin access to protected management features

---

## Main Features in Practice

The platform currently includes:

- User registration and authentication
- JWT-based session handling
- Event creation and registration
- Messaging system between users
- Product shop with Stripe payment integration
- Order management
- Role-based access control
- Image upload for events and products
- Admin dashboard functionality

---

## Known Limitations / Planned Improvements

- The project is currently configured mainly for local development
- Automated tests are still limited and most validation has been done manually
- Error handling and form validation can still be improved in some areas
- Deployment configuration is not finalized yet
- Some admin and upload flows could be hardened further
- The project can still benefit from additional cleanup and documentation

---

## Screenshots

Screenshots and technical documents are available in the `docs/` folder.

Suggested views to add if needed:

- Login page
- Register page
- Events page
- Messaging page
- Shop page
- Admin dashboard

---

## Author

Developed by **Erdem Ünal** as part of a full-stack JavaScript training project, then improved and reorganized for local development, portfolio presentation, and job applications.
