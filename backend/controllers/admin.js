const User = require('../models/User');
const Appointment = require('../models/Appointment');
const moment = require('moment');
const { validationResult } = require('express-validator');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    // Get user counts
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      activeUsers,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({
        createdAt: { $gte: thisMonth.toDate() },
      }),
    ]);

    // Get appointment counts
    const [
      totalAppointments,
      todayAppointments,
      thisWeekAppointments,
      thisMonthAppointments,
      completedAppointments,
      cancelledAppointments,
      totalRevenueAgg,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: thisWeek.toDate() },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: thisMonth.toDate() },
      }),
      Appointment.countDocuments({ status: 'completed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Appointment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$consultationFee' } } },
      ]),
    ]);

    // Get revenue data
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
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

    // Get top doctors by appointments
    const topDoctors = await Appointment.aggregate([
      {
        $match: {
          status: 'completed',
          appointmentDate: { $gte: thisMonth.toDate() },
        },
      },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 },
          revenue: { $sum: '$consultationFee' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      {
        $unwind: '$doctor',
      },
      {
        $project: {
          name: '$doctor.name',
          specialization: '$doctor.specialization',
          appointmentCount: 1,
          revenue: 1,
        },
      },
      {
        $sort: { appointmentCount: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const completionRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

    const stats = {
      users: {
        total: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
      },
      appointments: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: thisWeekAppointments,
        thisMonth: thisMonthAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        completionRate,
      },
      revenue: {
        thisMonth: monthlyRevenue[0]?.total || 0,
        total: totalRevenueAgg[0]?.total || 0,
      },
      topDoctors,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = moment().subtract(parseInt(period), 'days').startOf('day');

    // Get daily appointment counts
    const dailyAppointments = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate.toDate() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$appointmentDate',
            },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get daily user registrations
    const dailyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate.toDate() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
            },
          },
          patients: {
            $sum: { $cond: [{ $eq: ['$role', 'patient'] }, 1, 0] },
          },
          doctors: {
            $sum: { $cond: [{ $eq: ['$role', 'doctor'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get specialization distribution
    const specializationStats = await User.aggregate([
      {
        $match: { role: 'doctor', isActive: true },
      },
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Recent system activity (appointments + new users)
    const [recentAppointments, recentRegistrations] = await Promise.all([
      Appointment.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('doctor', 'name specialization')
        .populate('patient', 'name')
        .lean(),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email role createdAt')
        .lean(),
    ]);

    const recentActivities = [
      ...recentAppointments.map((a) => ({
        type: 'appointment',
        action: a.status === 'completed' ? 'Appointment completed' : a.status === 'cancelled' ? 'Appointment cancelled' : 'Appointment booked',
        user: `${a.patient?.name || 'Patient'} with Dr. ${a.doctor?.name || 'Unknown'}`,
        time: a.createdAt,
        status: a.status,
      })),
      ...recentRegistrations.map((u) => ({
        type: 'registration',
        action: 'New user registration',
        user: `${u.name} (${u.role})`,
        time: u.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    const analytics = {
      dailyAppointments,
      dailyRegistrations,
      specializationStats,
      recentActivities,
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemAnalytics,
  // createDoctor will be added to exports below
};

// @desc    Create a new doctor (admin only)
// @route   POST /api/admin/doctors
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      licenseNumber,
      experience,
      consultationFee,
      education = [],
      languages = [],
      address = {},
      bio,
    } = req.body;

    if (!name || !email || !password || !specialization || !licenseNumber ||
        typeof experience === 'undefined' || typeof consultationFee === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for doctor creation',
      });
    }

    const existingUser = await User.findOne({ $or: [ { email }, { licenseNumber } ] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email or license number already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'doctor',
      specialization,
      licenseNumber,
      experience,
      consultationFee,
      education,
      languages,
      address,
      bio,
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during doctor creation',
    });
  }
};

module.exports.createDoctor = createDoctor;

// @desc    Create a new patient (admin only)
// @route   POST /api/admin/patients
// @access  Private (Admin only)
const createPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      address = {},
    } = req.body;

    if (!name || !email || !password || !dateOfBirth || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for patient creation',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'patient',
      dateOfBirth,
      gender,
      address,
      isActive: true,
    });

    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during patient creation',
    });
  }
};

module.exports.createPatient = createPatient;
