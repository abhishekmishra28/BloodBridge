# 🩸 BloodBridge — Blood Donation Management System

A full-stack MERN application connecting blood donors, recipients, and hospitals across India.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm

### 1. Clone & Setup

```bash
git clone <repo-url>
cd bloodbridge
```

### 2. Backend

```bash
cd server
npm install

# Create .env (already included with defaults)
# Edit MONGO_URI if using Atlas

npm run seed    # Seed demo data (run once)
npm run dev     # Start on http://localhost:5000
```

### 3. Frontend

```bash
cd client
npm install
npm start       # Start on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | admin@example.com    | password123 |
| User  | user@example.com     | password123 |

---

## 🗂️ Project Structure

```
bloodbridge/
├── server/
│   ├── index.js              ← Express app entry
│   ├── seed.js               ← DB seed script
│   ├── .env                  ← Environment variables
│   ├── models/
│   │   ├── User.js
│   │   ├── Hospital.js
│   │   ├── Slot.js
│   │   ├── Booking.js
│   │   ├── Request.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   ├── hospitalController.js
│   │   ├── slotController.js
│   │   ├── bookingController.js
│   │   ├── requestController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── users.js
│   │   ├── hospitals.js
│   │   ├── slots.js
│   │   ├── bookings.js
│   │   ├── requests.js
│   │   └── notifications.js
│   └── middleware/
│       └── auth.js           ← JWT protect + adminOnly
│
├── client/
│   ├── public/index.html
│   └── src/
│       ├── App.js            ← Router + protected routes
│       ├── index.js
│       ├── context/
│       │   └── AuthContext.js
│       ├── utils/
│       │   ├── api.js        ← Axios instance
│       │   └── helpers.js    ← Formatters, constants
│       ├── styles/
│       │   └── global.css    ← Full design system
│       └── pages/
│           ├── Landing.js
│           ├── auth/
│           │   └── AuthPage.js
│           ├── admin/
│           │   ├── AdminLayout.js
│           │   ├── AdminDashboard.js  ← Charts + analytics
│           │   ├── AdminUsers.js
│           │   ├── AdminHospitals.js
│           │   ├── AdminSlots.js
│           │   ├── AdminBookings.js
│           │   └── AdminRequests.js
│           └── user/
│               ├── UserLayout.js
│               ├── UserDashboard.js
│               ├── DonatePage.js      ← Slot booking flow
│               ├── RequestPage.js
│               ├── SearchDonors.js
│               ├── HospitalsPage.js
│               ├── ProfilePage.js
│               └── NotificationsPage.js
│
├── API_DOCS.md
└── README.md
```

---

## ✨ Features

### Admin Panel
- 📊 Dashboard with Recharts (bar + pie charts)
- 👥 User management — view, suspend, block, delete
- 🏥 Hospital CRUD — add/edit/delete with blood group selection
- 📅 Slot management — create slots per hospital + time
- 📋 Booking management — approve/reject with admin notes
- 🆘 Blood requests — urgency-filtered view, status management

### User Panel
- 🩸 Donate — city search → slot selection → booking confirmation
- 🆘 Request — blood request form with urgency selector
- 🔍 Search Donors — filter by city + blood group
- 🏥 Hospitals — browse + book slots inline
- 👤 Profile — edit personal details
- 🔔 Notifications — real-time updates (30s polling)

### Business Logic
- 🚫 3-Month Donation Restriction enforced at API + UI level
- 🔐 JWT auth with role-based protected routes
- 📧 Notifications auto-created on booking/request events
- 💊 Slot capacity management with atomic counters

---

## 🛠 Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, React Router v6, Recharts, react-hot-toast |
| Backend   | Node.js, Express.js |
| Database  | MongoDB, Mongoose |
| Auth      | JWT (jsonwebtoken, bcryptjs) |
| Styling   | Pure CSS (design system in global.css) |
| Fonts     | Sora + DM Sans (Google Fonts) |

---

## 🌐 API Endpoints Summary

See `API_DOCS.md` for full documentation.

| Method | Route | Access |
|--------|-------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | User |
| GET | /api/admin/dashboard | Admin |
| GET | /api/admin/users | Admin |
| PATCH | /api/admin/users/:id/status | Admin |
| DELETE | /api/admin/users/:id | Admin |
| GET/POST | /api/hospitals | User/Admin |
| PUT/DELETE | /api/hospitals/:id | Admin |
| GET/POST | /api/slots | User/Admin |
| GET | /api/bookings/my | User |
| POST | /api/bookings | User |
| GET | /api/bookings | Admin |
| PATCH | /api/bookings/:id/status | Admin |
| GET/POST | /api/requests | User/Admin |
| PATCH | /api/requests/:id/status | Admin |
| GET/PATCH | /api/notifications | User |

---

## 👨‍💻 Author

**Abhishek Kumar Mishra**

---

## 📜 License

Educational/College Project — BloodBridge 2024
