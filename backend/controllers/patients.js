const User = require('../models/User');
const Appointment = require('../models/Appointment');
const moment = require('moment');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient only)
const getPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update patient medical history
// @route   PUT /api/patients/medical-history
// @access  Private (Patient only)
const updateMedicalHistory = async (req, res) => {
  try {
    const { medicalHistory, allergies, medications } = req.body;

    const updateData = {};
    if (medicalHistory) updateData.medicalHistory = medicalHistory;
    if (allergies) updateData.allergies = allergies;
    if (medications) updateData.medications = medications;

    const patient = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      data: patient,
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during medical history update',
    });
  }
};

// @desc    Get patient dashboard stats
// @route   GET /api/patients/stats/dashboard
// @access  Private (Patient only)
const getPatientStats = async (req, res) => {
  try {
    const patientId = req.user.id;
    const thisMonth = moment().startOf('month');

    // Get appointment counts
    const [
      totalAppointments,
      completedAppointments,
      upcomingAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patientId }),
      Appointment.countDocuments({ patient: patientId, status: 'completed' }),
      Appointment.countDocuments({
        patient: patientId,
        appointmentDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] },
      }),
      Appointment.countDocuments({ patient: patientId, status: 'cancelled' }),
    ]);

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      patient: patientId,
    })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: -1 })
      .limit(5);

    // Get next appointment
    const nextAppointment = await Appointment.findOne({
      patient: patientId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] },
    })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1 });

    const stats = {
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        upcoming: upcomingAppointments,
        cancelled: cancelledAppointments,
      },
      recentAppointments,
      nextAppointment,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getPatientProfile,
  updateMedicalHistory,
  getPatientStats,
};
