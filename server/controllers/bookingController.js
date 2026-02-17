const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { chargerId, startTime, durationHours } = req.body;

    // Validate input
    if (!chargerId || !startTime || !durationHours) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Allow 30-90 minutes (0.5-1.5 hours)
    if (durationHours < 0.5 || durationHours > 1.5) {
      return res.status(400).json({ message: 'Duration must be between 30 and 90 minutes' });
    }

    const charger = await Charger.findById(chargerId);
    if (!charger) return res.status(404).json({ message: 'Charger not found' });

    if (charger.availableSlots <= 0) {
      return res.status(400).json({ message: 'No available slots at this charger' });
    }

    const endTime = new Date(new Date(startTime).getTime() + durationHours * 60 * 60 * 1000);
    // Business rule: +10 points per successful booking (capped at 100)
    const greenPoints = 10;

    const booking = new Booking({
      userId: req.user.id,
      chargerId,
      startTime,
      endTime,
      durationHours,
      greenPointsEarned: greenPoints,
      status: 'active'
    });

    // Decrease available slots
    charger.availableSlots -= 1;
    await charger.save();

    // Update user stats: increment sessions, add CO2 saved, add green points (cap at 100)
    const user = await User.findById(req.user.id);
    user.totalChargingTime += durationHours;
    user.totalSessions = (user.totalSessions || 0) + 1;
    user.estimatedCO2Saved = (user.estimatedCO2Saved || 0) + 1.2; // 1 session = 1.2 kg CO2 saved (mock)
    user.greenScore = Math.min(100, (user.greenScore || 50) + greenPoints);
    await user.save();

    await booking.save();
    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking,
      greenPointsEarned: greenPoints
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking', error: err.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('chargerId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

exports.getChargerBookings = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.chargerId);
    if (!charger) return res.status(404).json({ message: 'Charger not found' });

    // Verify ownership
    if (charger.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to view these bookings' });
    }

    const bookings = await Booking.find({ chargerId: req.params.chargerId })
      .populate('userId', 'name email')
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify ownership
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this booking' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: `Cannot complete a ${booking.status} booking` });
    }

    booking.status = 'completed';
    await booking.save();

    // Free up slot
    const charger = await Charger.findById(booking.chargerId);
    charger.availableSlots += 1;
    await charger.save();

    res.json({ message: 'Booking completed successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete booking', error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify ownership
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to modify this booking' });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up slot
    const charger = await Charger.findById(booking.chargerId);
    charger.availableSlots += 1;
    await charger.save();

    // Deduct green points from user
    const user = await User.findById(req.user.id);
    user.greenScore = Math.max(0, user.greenScore - booking.greenPointsEarned);
    await user.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message });
  }
};

