# BloodBridge API Documentation

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 🔐 Auth Routes

### POST /auth/register
Register a new user.
```json
{ "name": "Ravi Kumar", "email": "ravi@example.com", "password": "password123",
  "bloodGroup": "B+", "phone": "9876543210", "city": "Mumbai", "state": "Maharashtra",
  "age": 28, "gender": "Male" }
```
Response: `{ success, token, user }`

### POST /auth/login
```json
{ "email": "admin@example.com", "password": "password123" }
```
Response: `{ success, token, user: { _id, name, email, role, bloodGroup, city, canDonate } }`

### GET /auth/me [protected]
Returns current user profile.

---

## 👤 User Routes [protected]

### GET /users/profile
Returns authenticated user's profile.

### PUT /users/profile
Update personal details.
```json
{ "name", "phone", "city", "state", "bloodGroup", "age", "gender" }
```

### GET /users/donors?city=Mumbai&bloodGroup=B+
Search donors by city and blood group (public within app).

---

## 👑 Admin Routes [admin only]

### GET /admin/dashboard
Returns full analytics: stats, monthlyDonations, bloodGroupStats, urgencyStats.

### GET /admin/users?search=&status=&page=&limit=
List all users with filters.

### PATCH /admin/users/:id/status
```json
{ "status": "active" | "suspended" | "blocked" }
```

### DELETE /admin/users/:id
Permanently delete a user.

---

## 🏥 Hospital Routes

### GET /hospitals?city=Delhi&page=1 [protected]
List active hospitals, optional city filter.

### GET /hospitals/:id [protected]
Single hospital details.

### POST /hospitals [admin]
```json
{ "name", "address", "city", "state", "phone", "email", "bloodGroups": ["A+","B+"], "pincode", "description" }
```

### PUT /hospitals/:id [admin]
Update hospital.

### DELETE /hospitals/:id [admin]
Remove hospital.

---

## 📅 Slot Routes

### GET /slots?hospitalId=&date=YYYY-MM-DD&city= [protected]
Get available slots. Filters: hospitalId, date, city.

### POST /slots [admin]
```json
{ "hospital": "<id>", "date": "2024-12-25", "time": "10:00 AM", "capacity": 10 }
```

### PUT /slots/:id [admin]
Update slot details.

### DELETE /slots/:id [admin]
Delete slot.

---

## 📋 Booking Routes

### POST /bookings [user]
Create booking. Enforces 3-month donation restriction.
```json
{ "slotId": "<id>", "bloodGroup": "B+", "notes": "optional" }
```

### GET /bookings/my [user]
User's own bookings (populated with slot + hospital).

### GET /bookings?status=pending&page=1 [admin]
All bookings with filter.

### PATCH /bookings/:id/status [admin]
```json
{ "status": "approved" | "completed" | "rejected", "adminNote": "optional" }
```
Setting `completed` auto-updates user's `lastDonationDate` and increments `totalDonations`.

### DELETE /bookings/:id [user]
Cancel own pending/approved booking.

---

## 🆘 Request Routes

### POST /requests [user]
```json
{ "patientName", "bloodGroup", "units", "urgency": "Normal|Urgent|Critical",
  "city", "hospital", "requiredDate", "contactPhone", "notes" }
```

### GET /requests/my [user]
User's own blood requests.

### GET /requests/search?city=&bloodGroup= [user]
Search open blood requests.

### GET /requests?status=open&urgency=Critical [admin]
All requests with filters.

### PATCH /requests/:id/status [admin]
```json
{ "status": "open" | "fulfilled" | "cancelled", "adminNote": "optional" }
```

---

## 🔔 Notification Routes

### GET /notifications [user]
Returns last 30 notifications + unreadCount.

### PATCH /notifications/read-all [user]
Mark all as read.

---

## 🏗️ Data Models

### User
```
name, email, password(hashed), role(admin|user), bloodGroup, phone, city, state,
age, gender, lastDonationDate, status(active|suspended|blocked), totalDonations
virtual: canDonate (true if lastDonationDate > 3 months ago)
```

### Hospital
```
name, address, city, state, phone, email, bloodBankAvailable, bloodGroups[], isActive, pincode, description
```

### Slot
```
hospital(ref), date, time, capacity, bookedCount
virtual: availableSpots = capacity - bookedCount
```

### Booking
```
user(ref), slot(ref), hospital(ref), status(pending|approved|rejected|completed|cancelled),
bloodGroup, notes, adminNote
```

### Request
```
requester(ref), patientName, bloodGroup, units, urgency(Normal|Urgent|Critical),
city, hospital, requiredDate, contactPhone, status(open|fulfilled|cancelled), notes, adminNote
```

### Notification
```
user(ref), title, message, type(booking|request|system|approval|rejection), isRead
```

---

## 🔒 Business Rules

1. **3-Month Donation Restriction**: Users with `lastDonationDate` within 3 months cannot create bookings.
2. **Slot Capacity**: `bookedCount` increments on booking creation, decrements on rejection/cancellation.
3. **Completion Flow**: Admin marks booking → `completed` → user's `lastDonationDate` + `totalDonations` updated.
4. **Role-based Access**: JWT middleware enforces admin vs user route separation.
5. **Account Status**: `suspended` or `blocked` users are rejected at middleware level.
