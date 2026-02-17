const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chargerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charger', required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  durationHours: Number,
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  greenPointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
