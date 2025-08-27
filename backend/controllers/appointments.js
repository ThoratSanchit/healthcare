const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const moment = require('moment');

// Helper functions for time conversion
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    
    // Build query based on user role
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    
    // Add filters
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = moment(date).startOf('day');
      const endDate = moment(date).endOf('day');
      query.appointmentDate = {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get appointments with population
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization consultationFee')
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: appointments,
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone dateOfBirth gender address medicalHistory')
      .populate('doctor', 'name specialization consultationFee experience education');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment',
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { doctor, appointmentDate, timeSlot, reason, type, symptoms } = req.body;

    // Verify doctor exists and is active
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor' || !doctorUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive doctor',
      });
    }

    // Check if appointment date is in the future
    if (moment(appointmentDate).isBefore(moment(), 'day')) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be in the future',
      });
    }

    // Check if slot is available
    const isAvailable = await Appointment.isSlotAvailable(
      doctor,
      appointmentDate,
      timeSlot.startTime,
      timeSlot.endTime
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is not available',
      });
    }

    // Read settings to determine auto-confirm
    const Setting = require('../models/Setting');
    const settings = await Setting.getSettings();
    const initialStatus = settings.autoConfirmAppointments ? 'confirmed' : 'scheduled';

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      appointmentDate,
      timeSlot,
      reason,
      type: type || 'consultation',
      symptoms: symptoms || [],
      consultationFee: doctorUser.consultationFee,
      status: initialStatus,
    });

    // Populate the created appointment
    await appointment.populate('patient', 'name email phone');
    await appointment.populate('doctor', 'name specialization consultationFee');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during appointment booking',
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment',
      });
    }

    // Restrict what patients can update
    if (req.user.role === 'patient') {
      const allowedFields = ['notes.patient', 'symptoms'];
      const updateData = {};
      
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          updateData[key] = req.body[key];
        }
      });
      
      req.body = updateData;
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('patient', 'name email phone')
     .populate('doctor', 'name specialization consultationFee');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during appointment update',
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check authorization
    const isPatient = req.user.role === 'patient' && appointment.patient.toString() === req.user.id;
    const isDoctor = req.user.role === 'doctor' && appointment.doctor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this appointment',
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment',
      });
    }

    // Cancel appointment
    await appointment.cancelAppointment(req.user.role, reason);

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during appointment cancellation',
    });
  }
};

// @desc    Get available slots for a doctor
// @route   GET /api/appointments/slots/available
// @access  Private
const getAvailableSlots = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { doctor, date } = req.query;

    // Get doctor's availability for the day
    const doctorUser = await User.findById(doctor);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    const dayAvailability = doctorUser.availability.find(avail => avail.day === dayOfWeek);

    if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Doctor is not available on this day',
      });
    }

    // Get booked appointments for the day
    const startDate = moment(date).startOf('day');
    const endDate = moment(date).endOf('day');
    
    const bookedAppointments = await Appointment.find({
      doctor,
      appointmentDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
      status: { $in: ['scheduled', 'confirmed'] },
    });

    // Break down large slots into 30-minute intervals and filter available slots
    const availableSlots = [];

    dayAvailability.slots.forEach(slot => {
      if (!slot.isAvailable) return;

      // Convert time strings to minutes for easier calculation
      const startMinutes = timeToMinutes(slot.startTime);
      const endMinutes = timeToMinutes(slot.endTime);

      // Create 30-minute intervals
      for (let time = startMinutes; time < endMinutes; time += 30) {
        const slotStart = minutesToTime(time);
        const slotEnd = minutesToTime(time + 30);

        // Check if this 30-minute slot conflicts with any booked appointment
        const hasConflict = bookedAppointments.some(appointment => {
          const appointmentStart = appointment.timeSlot.startTime;
          const appointmentEnd = appointment.timeSlot.endTime;

          return (
            (slotStart < appointmentEnd && slotEnd > appointmentStart)
          );
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            isAvailable: true
          });
        }
      }
    });

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Rate appointment
// @route   PUT /api/appointments/:id/rate
// @access  Private (Patient only)
const rateAppointment = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { score, review } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is the patient
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this appointment',
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed appointments',
      });
    }

    // Check if already rated
    if (appointment.rating.score) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already rated',
      });
    }

    // Update appointment rating
    appointment.rating = {
      score,
      review: review || '',
      ratedAt: new Date(),
    };

    await appointment.save();

    // Update doctor's overall rating
    const doctor = await User.findById(appointment.doctor);
    const doctorAppointments = await Appointment.find({
      doctor: appointment.doctor,
      'rating.score': { $exists: true },
    });

    const totalRatings = doctorAppointments.length;
    const totalScore = doctorAppointments.reduce((sum, app) => sum + app.rating.score, 0);
    
    doctor.rating = {
      average: totalScore / totalRatings,
      count: totalRatings,
    };

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rated successfully',
      data: appointment,
    });
  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during rating',
    });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
  rateAppointment,
};
