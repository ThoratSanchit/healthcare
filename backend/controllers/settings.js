const Setting = require('../models/Setting');

// @desc Get settings
// @route GET /api/settings
// @access Private (Admin)
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

// @desc Update settings
// @route PUT /api/settings
// @access Private (Admin)
const updateSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    const updatable = ['maintenanceMode', 'bookingEnabled', 'autoConfirmAppointments'];
    updatable.forEach((key) => {
      if (typeof req.body[key] !== 'undefined') settings[key] = req.body[key];
    });
    await settings.save();
    res.status(200).json({ success: true, data: settings });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

module.exports = { getSettings, updateSettings };


