const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must belong to a patient'],
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must be with a doctor'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date'],
  },
  timeSlot: {
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation',
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for appointment'],
    maxlength: [500, 'Reason cannot be more than 500 characters'],
  },
  symptoms: [String],
  notes: {
    patient: String,
    doctor: String,
  },
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  }],
  diagnosis: String,
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,
  consultationFee: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'insurance'],
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
    ratedAt: Date,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
  },
  cancellationReason: String,
  cancelledAt: Date,
}, {
  timestamps: true,
});

// Index for efficient queries
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1 });

// Virtual for appointment duration
AppointmentSchema.virtual('duration').get(function() {
  if (this.timeSlot.startTime && this.timeSlot.endTime) {
    const start = new Date(`2000-01-01 ${this.timeSlot.startTime}`);
    const end = new Date(`2000-01-01 ${this.timeSlot.endTime}`);
    return (end - start) / (1000 * 60); // duration in minutes
  }
  return null;
});

// Pre-save middleware to set consultation fee
AppointmentSchema.pre('save', async function(next) {
  if (this.isNew && !this.consultationFee) {
    const doctor = await mongoose.model('User').findById(this.doctor);
    if (doctor && doctor.consultationFee) {
      this.consultationFee = doctor.consultationFee;
    }
  }
  next();
});

// Static method to check slot availability
AppointmentSchema.statics.isSlotAvailable = async function(doctorId, date, startTime, endTime) {
  const existingAppointment = await this.findOne({
    doctor: doctorId,
    appointmentDate: date,
    $or: [
      {
        'timeSlot.startTime': { $lt: endTime },
        'timeSlot.endTime': { $gt: startTime }
      }
    ],
    status: { $in: ['scheduled', 'confirmed'] }
  });
  
  return !existingAppointment;
};

// Instance method to cancel appointment
AppointmentSchema.methods.cancelAppointment = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Instance method to complete appointment
AppointmentSchema.methods.completeAppointment = function(diagnosis, prescription, notes) {
  this.status = 'completed';
  this.diagnosis = diagnosis;
  this.prescription = prescription;
  this.notes.doctor = notes;
  return this.save();
};

module.exports = mongoose.model('Appointment', AppointmentSchema);
