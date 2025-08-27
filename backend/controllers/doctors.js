const { validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const moment = require('moment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { specialization, city, page = 1, limit = 10, search } = req.query;
    
    // Build query
    let query = { role: 'doctor', isActive: true };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get doctors
    const doctors = await User.find(query)
      .select('-password -medicalHistory -allergies -medications')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      data: doctors,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
const getDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      isActive: true,
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    if (!availability || !Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid availability data',
      });
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { availability },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: doctor,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during availability update',
    });
  }
};

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/stats/dashboard
// @access  Private (Doctor only)
const getDoctorStats = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    // Get appointment counts
    const [
      todayAppointments,
      weekAppointments,
      monthAppointments,
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() },
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: thisWeek.toDate() },
      }),
      Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: thisMonth.toDate() },
      }),
      Appointment.countDocuments({ doctor: doctorId }),
      Appointment.countDocuments({ doctor: doctorId, status: 'completed' }),
      Appointment.countDocuments({ doctor: doctorId, status: 'cancelled' }),
    ]);

    // Get recent appointments
    const recentAppointments = await Appointment.find({
      doctor: doctorId,
    })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: -1 })
      .limit(5);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] },
    })
      .populate('patient', 'name email phone')
      .sort({ appointmentDate: 1 })
      .limit(5);

    // Calculate revenue (if needed)
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          doctor: req.user._id,
          status: 'completed',
          appointmentDate: { $gte: thisMonth.toDate() },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$consultationFee' },
        },
      },
    ]);

    const stats = {
      appointments: {
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
      revenue: {
        thisMonth: monthlyRevenue[0]?.total || 0,
      },
      recentAppointments,
      upcomingAppointments,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  updateAvailability,
  getDoctorStats,
};
