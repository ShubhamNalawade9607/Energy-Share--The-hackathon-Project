const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
  chargerType: { type: String, enum: ['DC Fast', 'Level 2', 'Level 1'], default: 'Level 2' },
  pricePerHour: { type: Number, default: 0 },
  totalSlots: { type: Number, default: 4 },
  availableSlots: { type: Number, default: 4 },
  rating: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Charger', chargerSchema);
