import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiUsers,
  FiClock,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiStar,
  FiArrowRight
} from 'react-icons/fi';
import { getDoctorStats } from '../../redux/slices/doctorSlice';
import { getAppointments } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, loading: statsLoading } = useSelector((state) => state.doctors);
  const { loading: appointmentsLoading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(getDoctorStats());
    dispatch(getAppointments({ limit: 5 }));
  }, [dispatch]);

  const quickActions = [
    {
      title: 'View Appointments',
      description: 'Manage your scheduled appointments',
      icon: FiCalendar,
      link: '/dashboard/doctor/appointments',
      color: 'bg-primary-600',
    },
    {
      title: 'Update Availability',
      description: 'Set your available time slots',
      icon: FiClock,
      link: '/dashboard/doctor/availability',
      color: 'bg-secondary-600',
    },
    {
      title: 'Patient Records',
      description: 'Access patient medical records',
      icon: FiUsers,
      link: '/dashboard/doctor/patients',
      color: 'bg-accent-600',
    },
    {
      title: 'Profile Settings',
      description: 'Update your professional profile',
      icon: FiActivity,
      link: '/dashboard/doctor/profile',
      color: 'bg-gray-600',
    },
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, Dr. {user?.name}!
        </h1>
        <p className="text-primary-100">
          Manage your appointments and provide excellent care to your patients.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Today's Appointments</p>
                <p className="text-2xl font-bold">{stats.appointments.today}</p>
              </div>
              <FiCalendar className="h-8 w-8 text-primary-200" />
            </div>
          </div>

          <div className="stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm">This Week</p>
                <p className="text-2xl font-bold">{stats.appointments.thisWeek}</p>
              </div>
              <FiTrendingUp className="h-8 w-8 text-secondary-200" />
            </div>
          </div>

          <div className="stats-card-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-100 text-sm">Total Patients</p>
                <p className="text-2xl font-bold">{stats.appointments.completed}</p>
              </div>
              <FiUsers className="h-8 w-8 text-accent-200" />
            </div>
          </div>

          <div className="stats-card-gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.thisMonth}</p>
              </div>
              <FiDollarSign className="h-8 w-8 text-gray-200" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="card hover:shadow-medium transition-shadow duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {action.description}
                </p>
              </div>
              <FiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link
                to="/dashboard/doctor/appointments"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          {appointmentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {stats.upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {appointment.patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.patient.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-primary">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming appointments</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>

          {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {stats.recentAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <span className="text-secondary-600 font-semibold text-sm">
                        {appointment.patient.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.patient.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${
                      appointment.status === 'completed' ? 'badge-success' :
                      appointment.status === 'cancelled' ? 'badge-danger' :
                      'badge-primary'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Summary */}
      {user?.rating && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Performance Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FiStar className="h-6 w-6 text-yellow-400 mr-1" />
                <span className="text-2xl font-bold text-gray-900">
                  {user.rating.average.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-xs text-gray-500">{user.rating.count} reviews</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats?.appointments.completed || 0}
              </div>
              <p className="text-sm text-gray-600">Completed Appointments</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {user.experience}
              </div>
              <p className="text-sm text-gray-600">Years of Experience</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
