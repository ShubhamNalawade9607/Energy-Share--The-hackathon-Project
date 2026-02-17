const Charger = require('../models/Charger');

exports.createCharger = async (req, res) => {
  try {
    const { name, description, latitude, longitude, address, chargerType, totalSlots } = req.body;
    
    // Validate input
    if (!name || !latitude || !longitude || !address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const charger = new Charger({
      name,
      description,
      ownerId: req.user.id,
      latitude,
      longitude,
      address,
      chargerType: chargerType || 'Level 2',
      totalSlots: totalSlots || 4,
      availableSlots: totalSlots || 4
    });

    await charger.save();
    res.status(201).json({ message: 'Charger created successfully', charger });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create charger', error: err.message });
  }
};

exports.getAllChargers = async (req, res) => {
  try {
    const chargers = await Charger.find().populate('ownerId', 'name email');
    res.json(chargers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chargers', error: err.message });
  }
};

exports.getChargerById = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id).populate('ownerId', 'name email');
    if (!charger) return res.status(404).json({ message: 'Charger not found' });
    res.json(charger);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charger', error: err.message });
  }
};

exports.getOwnerChargers = async (req, res) => {
  try {
    const chargers = await Charger.find({ ownerId: req.user.id });
    res.json(chargers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chargers', error: err.message });
  }
};

exports.updateCharger = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ message: 'Charger not found' });
    
    // Verify owner
    if (charger.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this charger' });
    }

    // Update allowed fields only
    const allowedUpdates = ['name', 'description', 'address', 'chargerType', 'totalSlots', 'pricePerHour'];
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        charger[key] = req.body[key];
      }
    });

    await charger.save();
    res.json({ message: 'Charger updated successfully', charger });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update charger', error: err.message });
  }
};

exports.deleteCharger = async (req, res) => {
  try {
    const charger = await Charger.findById(req.params.id);
    if (!charger) return res.status(404).json({ message: 'Charger not found' });
    
    // Verify owner
    if (charger.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to delete this charger' });
    }

    // Check for active bookings
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.countDocuments({
      chargerId: req.params.id,
      status: 'active'
    });

    if (activeBookings > 0) {
      return res.status(400).json({ 
        message: `Cannot delete charger with ${activeBookings} active booking(s)` 
      });
    }

    await Charger.findByIdAndDelete(req.params.id);
    res.json({ message: 'Charger deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete charger', error: err.message });
  }
};

