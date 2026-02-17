const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chargerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Charger', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  durationHours: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'session_active', 'session_ended', 'session_cancelled'],
    default: 'pending'
  },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  sessionStartTime: Date,
  sessionEndTime: Date,
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date,
  sessionStartedAt: Date,
  sessionEndedAt: Date
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
