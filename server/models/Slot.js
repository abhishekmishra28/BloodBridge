const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "10:00 AM"
    capacity: { type: Number, required: true, default: 10 },
    bookedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: available spots
slotSchema.virtual('availableSpots').get(function () {
  return this.capacity - this.bookedCount;
});

slotSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
