const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Slot = require('./models/Slot');
const Booking = require('./models/Booking');
const Request = require('./models/Request');
const Notification = require('./models/Notification');

const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Amritsar'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // 🔥 Delete ONLY non-demo users
  await Promise.all([
    User.deleteMany({ isDemo: { $ne: true } }),
    Hospital.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    Request.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️ Cleared old data (demo user preserved)');

  // 🔥 Create Admin (safe)
  let admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    admin = await User.create({
      name: 'BloodBridge Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      city: 'Delhi',
      state: 'Delhi',
      phone: '9999999999',
      status: 'active',
    });
    console.log('👑 Admin created');
  } else {
    console.log('ℹ️ Admin already exists');
  }

  // 🔥 Create Demo User (safe + protected)
  let demoUser = await User.findOne({ email: 'user@example.com' });

  if (!demoUser) {
    demoUser = await User.create({
      name: 'Ravi Kumar',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
      isDemo: true,   // 🔐 PROTECTED USER
      bloodGroup: 'B+',
      city: 'Mumbai',
      state: 'Maharashtra',
      phone: '9876543210',
      age: 28,
      gender: 'Male',
      status: 'active',
    });
    console.log('👤 Demo user created');
  } else {
    console.log('ℹ️ Demo user already exists');
  }

  // 🔥 Create extra users
  const extraUsers = [];
  const names = ['Priya Sharma', 'Amit Patel', 'Sunita Rao', 'Deepak Singh', 'Meena Gupta', 'Arjun Nair', 'Kavitha Menon', 'Rohit Verma', 'Anjali Joshi', 'Vikram Chaudhary'];

  for (let i = 0; i < names.length; i++) {
    const u = await User.create({
      name: names[i],
      email: `user${i + 2}@example.com`,
      password: 'password123',
      role: 'user',
      bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
      city: INDIAN_CITIES[i % INDIAN_CITIES.length],
      state: 'Various',
      phone: `98765432${10 + i}`,
      age: 22 + i,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      status: i === 9 ? 'suspended' : 'active',
    });
    extraUsers.push(u);
  }

  console.log('👥 Users created');

const hospitals = await Hospital.insertMany([
  {
    name: 'AIIMS Delhi',
    address: 'Ansari Nagar East, New Delhi',
    city: 'Delhi',
    state: 'Delhi',
    phone: '011-26588500',
    email: 'aiims@example.com',
    bloodGroups: ['A+', 'B+', 'O+', 'AB+']
  },
  {
    name: 'Apollo Bangalore',
    address: '154/11 Bannerghatta Rd',
    city: 'Bangalore',
    state: 'Karnataka',
    phone: '080-26304050',
    email: 'apollo@example.com',
    bloodGroups: ['A+', 'A-', 'B+', 'O+']
  }
]);

  // 🔥 Slots
  const slots = [];
  for (let i = 0; i < 10; i++) {
    slots.push({
      hospital: hospitals[0]._id,
      date: new Date(),
      time: '10:00 AM',
      capacity: 10,
      bookedCount: 2,
    });
  }

  const createdSlots = await Slot.insertMany(slots);

  // 🔥 Bookings
  await Booking.insertMany([
    {
      user: demoUser._id,
      slot: createdSlots[0]._id,
      hospital: hospitals[0]._id,
      bloodGroup: demoUser.bloodGroup,
      status: 'approved',
    }
  ]);

  // 🔥 Notifications
  await Notification.insertMany([
    {
      user: demoUser._id,
      title: 'Welcome!',
      message: 'Demo account ready 🚀',
      type: 'system',
      isRead: false
    }
  ]);

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin → admin@example.com / password123');
  console.log('User  → user@example.com  / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});