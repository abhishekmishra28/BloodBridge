# 🩸 BloodBridge : A Blood Donation Management System (MERN)

A full-stack Blood Donation Management System designed using the MERN stack.
This system connects donors, recipients, and hospitals efficiently with role-based access.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT-based login system
* Role-based access:

  * Admin
  * User
* Protected routes

---

## 👨‍💼 Admin Panel

* 📊 Dashboard Analytics

  * Total Users
  * Total Donations
  * Blood Requests
  * Completed Donations

* 👥 User Management

  * View users
  * Delete users
  * Suspend / Block access

* 🏥 Hospital Management

  * Add hospital
  * Update hospital details
  * View partnered hospitals

* ⏰ Slot Management

  * Create slots (date + time)
  * Update/Delete slots

* 📅 Booking Management

  * View all bookings
  * Approve/Reject bookings

* 🩸 Requests Management

  * Handle blood requests (Urgent/Normal/Critical)

---

## 👤 User Panel

* 🌍 City Selection (for filtering)

### Features:

* ❤️ Donate Blood

  * Book slot (date & time)
  * Contact admin for urgent donation

* 🆘 Request Blood

  * Select urgency level
  * Choose city
  * Specify required date

* 🔍 Search Donors

  * Filter by city

* 🏥 Hospitals

  * View nearby hospitals
  * Book donation slots

* 👤 Profile

  * Update personal details

* 🔔 Notifications

  * Booking updates
  * Request updates

---

## ⚙️ Business Logic

* 🚫 Donation Restriction:

  * A user cannot donate blood again for **3 months** after last donation.

---

## 🛠️ Tech Stack

### Frontend:

* React.js
* React Router
* Axios
* Context API / Redux
* Tailwind CSS / Bootstrap

### Backend:

* Node.js
* Express.js

### Database:

* MongoDB (Mongoose)

---

## 📂 Project Structure

```
/client      → React frontend
/server      → Express backend
  /models
  /routes
  /controllers
  /middleware
```

---

## 🔑 API Modules

* Auth APIs
* User APIs
* Admin APIs
* Hospital APIs
* Slot APIs
* Booking APIs
* Request APIs

---

## 🧪 Demo Credentials

```
Admin:
Email: admin@example.com
Password: password123

User:
Email: user@example.com
Password: password123
```

---

## ⚡ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/blood-donation-system.git
cd blood-donation-system
```

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

Run backend:

```
npm run dev
```

---

### 3️⃣ Frontend Setup

```
cd client
npm install
npm start
```

---

## 📊 Future Enhancements

* Real-time notifications (Socket.io)
* AI-based donor matching
* Mobile app version
* OTP verification

---

## 🤝 Contribution

Contributions are welcome! Feel free to fork and submit a PR.

---

## 📜 License

This project is for educational purposes (college project).

---

## 👨‍💻 Author

Abhishek Kumar Mishra
