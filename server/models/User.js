const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isDemo: { type: Boolean, default: false },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], default: null },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    age: { type: Number, default: null },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    lastDonationDate: { type: Date, default: null },
    status: { type: String, enum: ['active', 'suspended', 'blocked'], default: 'active' },
    totalDonations: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Virtual: canDonate — 3-month restriction
userSchema.virtual('canDonate').get(function () {
  if (!this.lastDonationDate) return true;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return this.lastDonationDate <= threeMonthsAgo;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
