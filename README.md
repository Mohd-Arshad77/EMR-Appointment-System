# EMR Appointment System

A full-stack EMR (Electronic Medical Records) Appointment Management System built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **Authentication** — JWT access tokens (15min) + refresh tokens (7-day httpOnly cookie), bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Three roles: Super Admin, Doctor, Receptionist
- **Doctor Management** — Super Admin can create, edit, and delete doctor profiles with department, working hours, and slot duration
- **Receptionist Management** — Super Admin can create, edit, and delete receptionist accounts
- **Appointment Booking** — Receptionists (and Super Admin) can book appointments by selecting department, doctor, date, and available time slot
- **Dynamic Slot Generation** — Time slots are auto-generated from each doctor's working hours and slot duration
- **Past Time Prevention** — Past dates cannot be selected; today's past time slots are grayed out
- **Doctor Dashboard** — Doctors see only their own appointments
- **All Appointments View** — Super Admin can view all appointments across the system

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6  |
| Backend    | Node.js, Express, Mongoose                      |
| Database   | MongoDB                                         |
| Auth       | JWT (jsonwebtoken), bcrypt, httpOnly cookies     |

## Project Structure

```
erm-antigravity/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── generateToken.js       # JWT token generation
│   ├── controllers/
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── receptionistController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect, superAdmin, receptionistOrAdmin
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Doctor.js
│   │   └── User.js
│   ├── routes/
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── receptionistRoutes.js
│   ├── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminAppointments.jsx
    │   │   ├── DoctorDashboard.jsx
    │   │   ├── Login.jsx
    │   │   ├── ReceptionistBooking.jsx
    │   │   └── SuperAdminDashboard.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── package.json
    └── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd erm-antigravity
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5005
MONGO_URI=mongodb://localhost:27017/emr-system
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
```

Seed the database with initial users:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## Default Login Credentials

| Role         | Email                  | Password      |
|-------------|------------------------|---------------|
| Super Admin | superadmin@gmail.com   | password123   |
| Receptionist| reception@emr.com      | password123   |

## API Endpoints

### Authentication
| Method | Endpoint             | Access  |
|--------|---------------------|---------|
| POST   | /api/auth/login      | Public  |
| POST   | /api/auth/register   | Public  |
| GET    | /api/auth/refresh    | Public  |
| POST   | /api/auth/logout     | Public  |

### Doctors
| Method | Endpoint           | Access      |
|--------|--------------------|-------------|
| GET    | /api/doctors       | Receptionist, Super Admin |
| POST   | /api/doctors       | Super Admin |
| PUT    | /api/doctors/:id   | Super Admin |
| DELETE | /api/doctors/:id   | Super Admin |

### Appointments
| Method | Endpoint                  | Access      |
|--------|--------------------------|-------------|
| GET    | /api/appointments/slots  | Receptionist, Super Admin |
| POST   | /api/appointments/book   | Receptionist, Super Admin |
| GET    | /api/appointments/doctor | Doctor      |
| GET    | /api/appointments        | Super Admin |

### Receptionists
| Method | Endpoint              | Access      |
|--------|----------------------|-------------|
| GET    | /api/receptionists    | Super Admin |
| POST   | /api/receptionists    | Super Admin |
| PUT    | /api/receptionists/:id| Super Admin |
| DELETE | /api/receptionists/:id| Super Admin |
