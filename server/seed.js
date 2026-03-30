/**
 * BloodBridge Seed Script
 * Run: node seed.js
 * Creates demo admin, user, hospitals, slots, bookings, requests
 */
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

const hospitals = [
  { name: 'AIIMS Delhi', address: 'Ansari Nagar East, New Delhi', city: 'Delhi', state: 'Delhi', phone: '011-26588500', email: 'aiims@example.com', bloodGroups: ['A+', 'B+', 'O+', 'AB+'] },
  { name: 'Apollo Hospitals Bangalore', address: '154/11 Bannerghatta Rd', city: 'Bangalore', state: 'Karnataka', phone: '080-26304050', email: 'apollo.blr@example.com', bloodGroups: ['A+', 'A-', 'B+', 'O+'] },
  { name: 'Fortis Mumbai', address: 'Mulund Goregaon Link Rd', city: 'Mumbai', state: 'Maharashtra', phone: '022-67978000', email: 'fortis.mum@example.com', bloodGroups: ['B+', 'B-', 'AB+', 'O-'] },
  { name: 'Manipal Hospital Chennai', address: '1 Old Airport Rd', city: 'Chennai', state: 'Tamil Nadu', phone: '044-25212121', email: 'manipal.chn@example.com', bloodGroups: ['A+', 'O+', 'AB-'] },
  { name: 'Yashoda Hospitals Hyderabad', address: 'Raj Bhavan Rd, Somajiguda', city: 'Hyderabad', state: 'Telangana', phone: '040-45674567', email: 'yashoda@example.com', bloodGroups: ['A-', 'B+', 'O+'] },
  { name: 'Medanta Gurugram', address: 'CH Baktawar Singh Rd, Sector 38', city: 'Delhi', state: 'Haryana', phone: '0124-4141414', email: 'medanta@example.com', bloodGroups: ['A+', 'B-', 'O+', 'AB+'] },
  { name: 'Ruby Hall Pune', address: '40 Sassoon Rd', city: 'Pune', state: 'Maharashtra', phone: '020-66455100', email: 'rubyhall@example.com', bloodGroups: ['A+', 'B+', 'O-'] },
  { name: 'AMRI Kolkata', address: 'JC-16/17 Salt Lake', city: 'Kolkata', state: 'West Bengal', phone: '033-66000000', email: 'amri@example.com', bloodGroups: ['B+', 'O+', 'AB-'] },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Hospital.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    Request.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
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

  // Create demo user
  const demoUser = await User.create({
    name: 'Ravi Kumar',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    bloodGroup: 'B+',
    city: 'Mumbai',
    state: 'Maharashtra',
    phone: '9876543210',
    age: 28,
    gender: 'Male',
    status: 'active',
  });

  // Create extra users
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
      lastDonationDate: i < 4 ? new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000) : null,
      totalDonations: i < 4 ? i + 1 : 0,
      status: i === 9 ? 'suspended' : 'active',
    });
    extraUsers.push(u);
  }

  console.log('👥 Users created');

  // Create hospitals
  const createdHospitals = await Hospital.insertMany(hospitals);
  console.log('🏥 Hospitals created');

  // Create slots (next 14 days)
  const slots = [];
  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  for (let d = 0; d < 14; d++) {
    for (let h = 0; h < createdHospitals.length; h++) {
      for (let t = 0; t < 3; t++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        slots.push({
          hospital: createdHospitals[h]._id,
          date,
          time: times[(t + h) % times.length],
          capacity: 8 + Math.floor(Math.random() * 5),
          bookedCount: Math.floor(Math.random() * 4),
        });
      }
    }
  }
  const createdSlots = await Slot.insertMany(slots);
  console.log(`📅 ${createdSlots.length} slots created`);

  // Create bookings
  const bookingStatuses = ['pending', 'approved', 'completed', 'rejected'];
  const bookings = [];
  for (let i = 0; i < 20; i++) {
    const user = i === 0 ? demoUser : extraUsers[i % extraUsers.length];
    const slot = createdSlots[i * 3];
    bookings.push({
      user: user._id,
      slot: slot._id,
      hospital: slot.hospital,
      bloodGroup: user.bloodGroup,
      status: bookingStatuses[i % bookingStatuses.length],
      notes: 'Ready to donate',
    });
  }
  await Booking.insertMany(bookings);
  console.log('📋 Bookings created');

  // Create blood requests
  const urgencies = ['Normal', 'Urgent', 'Critical'];
  const requestData = [];
  for (let i = 0; i < 15; i++) {
    const user = i === 0 ? demoUser : extraUsers[i % extraUsers.length];
    const reqDate = new Date();
    reqDate.setDate(reqDate.getDate() + i + 1);
    requestData.push({
      requester: user._id,
      patientName: `Patient ${i + 1}`,
      bloodGroup: BLOOD_GROUPS[i % BLOOD_GROUPS.length],
      units: 1 + (i % 3),
      urgency: urgencies[i % urgencies.length],
      city: INDIAN_CITIES[i % INDIAN_CITIES.length],
      hospital: hospitals[i % hospitals.length].name,
      requiredDate: reqDate,
      contactPhone: `98765${43210 + i}`,
      status: i < 10 ? 'open' : 'fulfilled',
      notes: urgencies[i % urgencies.length] === 'Critical' ? 'Immediate need' : '',
    });
  }
  await Request.insertMany(requestData);
  console.log('🩸 Blood requests created');

  // Create notifications for demo user
  await Notification.insertMany([
    { user: demoUser._id, title: 'Welcome to BloodBridge!', message: 'Your account is active. Start saving lives today.', type: 'system', isRead: true },
    { user: demoUser._id, title: 'Booking Approved', message: 'Your donation slot has been approved. See you there!', type: 'approval', isRead: false },
    { user: demoUser._id, title: 'Blood Request Match', message: 'A B+ blood request in Mumbai matches your profile.', type: 'request', isRead: false },
  ]);
  console.log('🔔 Notifications created');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin  →  admin@example.com / password123');
  console.log('User   →  user@example.com  / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
