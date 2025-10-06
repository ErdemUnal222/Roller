# Roller

Roller Derby is a full-stack platform built for the roller derby community.  
It helps **players, clubs, and organizers** manage events, track availability, exchange messages, and even run a small e-commerce shop for products and memorabilia.

The project is split into two main parts:

- **`backend/`** – Node.js + Express API with MySQL, JWT authentication, and Stripe payments.
- **`frontend/`** – React application bootstrapped with Vite and styled with SCSS.

---

## 🚀 Quickstart

```bash
git clone <repo-url>
cd roller

# Start backend
cd backend
npm install
npm run dev   # nodemon for development
# or
npm start     # production mode

# Start frontend (in another terminal)
cd ../frontend
npm install
npm run dev
