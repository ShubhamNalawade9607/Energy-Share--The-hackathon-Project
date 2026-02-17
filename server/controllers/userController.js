const User = require('../models/User');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Get leaderboard (top 10 users by green score)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaders = await User.find({ role: 'user' })
      .sort({ greenScore: -1 })
      .limit(10)
      .select('name greenScore totalChargingTime -_id');
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

// Get user impact: green score, total sessions, estimated CO2 saved
exports.getImpact = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('greenScore totalSessions estimatedCO2Saved totalChargingTime name email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      name: user.name,
      email: user.email,
      greenScore: user.greenScore,
      totalSessions: user.totalSessions || 0,
      estimatedCO2Saved: user.estimatedCO2Saved || 0,
      totalChargingTime: user.totalChargingTime || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user impact', error: err.message });
  }
};

// Update user green score (internal use)
exports.updateGreenScore = async (userId, points) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { greenScore: points } },
      { new: true }
    );
    return user;
  } catch (err) {
    console.error('Error updating green score:', err);
    return null;
  }
};

// Update charging time (internal use)
exports.updateChargingTime = async (userId, hours) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { totalChargingTime: hours } },
      { new: true }
    );
    return user;
  } catch (err) {
    console.error('Error updating charging time:', err);
    return null;
  }
};

// List all users (admin - temporary for testing)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role greenScore totalChargingTime createdAt -password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Delete user account (self-service)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Prevent deletion if user has active bookings
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      userId,
      status: 'active'
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account with active bookings. Complete or cancel them first.' 
      });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account', error: err.message });
  }
};
