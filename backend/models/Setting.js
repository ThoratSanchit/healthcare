const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  bookingEnabled: { type: Boolean, default: true },
  autoConfirmAppointments: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure only one document
SettingSchema.statics.getSettings = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('Setting', SettingSchema);


