const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
    units: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ['Normal', 'Urgent', 'Critical'], default: 'Normal' },
    city: { type: String, required: true },
    hospital: { type: String, default: '' },
    requiredDate: { type: Date, required: true },
    status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
    contactPhone: { type: String, required: true },
    notes: { type: String, default: '' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
