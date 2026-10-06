# SCIM College Portal

A full-stack college management portal for SCIM College, Patna. Built with React (Vite) frontend and Express.js + MongoDB backend.

## Project Structure

```
project/
├── backend/          # Express.js API server (MongoDB)
│   ├── models/       # Mongoose models
│   ├── routes/       # API route handlers
│   ├── middleware/   # Auth & permission middleware
│   ├── scripts/      # Database seed script
│   └── server.js     # Entry point
├── frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── components/   # Layouts & shared UI
│   │   ├── pages/        # Admin, student, and public pages
│   │   └── lib/          # API client, auth, theme
│   └── index.html
└── README.md
```

## Setup

### Backend

Configure `backend/.env` with `MONGODB_URI`, `JWT_SECRET`, `SMTP_EMAIL`, and `SMTP_PASS` before starting the server (`SMTP_PASSWORD` is also accepted). Gmail SMTP requires an app password for the configured account; spaces in the displayed app password are ignored.

```bash
cd backend
npm install
npm run seed    # Creates admin account and sample data
npm start       # Starts server on port 5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Starts dev server on port 5173
```

## Admin Login

- **Email:**
- **Password:**

## Features

- Admin dashboard with student/team management, study materials, test builder, notices, calendar, doubt board, feedback
- Student portal with study materials, tests, doubt board, calendar, saved bookmarks, AI tutor
- Role-based access control (admin, co_member, student)
- JWT authentication with password reset via OTP email
- Light/dark theme toggle
