import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiFileText,
  FiPlus,
  FiArrowRight 
} from 'react-icons/fi';
import { getPatientStats } from '../../redux/slices/patientSlice';
import { getAppointments } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, loading: patientLoading } = useSelector((state) => state.patients);
  const { appointments, loading: appointmentsLoading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(getPatientStats());
    dispatch(getAppointments({ limit: 5 }));
  }, [dispatch]);

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with a doctor',
      icon: FiPlus,
      link: '/dashboard/patient/book-appointment',
      color: 'bg-primary-600',
    },
    {
      title: 'My Appointments',
      description: 'View and manage your appointments',
      icon: FiCalendar,
      link: '/dashboard/patient/appointments',
      color: 'bg-secondary-600',
    },
    {
      title: 'Medical History',
      description: 'Access your medical records',
      icon: FiFileText,
      link: '/dashboard/patient/medical-history',
      color: 'bg-accent-600',
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: FiUser,
      link: '/dashboard/patient/profile',
      color: 'bg-gray-600',
    },
  ];

  if (patientLoading) {
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
          Welcome back, {user?.name}!
        </h1>
        <p className="text-primary-100">
          Manage your health appointments and medical records from your dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Total Appointments</p>
                <p className="text-2xl font-bold">{stats.appointments.total}</p>
              </div>
              <FiCalendar className="h-8 w-8 text-primary-200" />
            </div>
          </div>
          
          <div className="stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm">Completed</p>
                <p className="text-2xl font-bold">{stats.appointments.completed}</p>
              </div>
              <FiFileText className="h-8 w-8 text-secondary-200" />
            </div>
          </div>
          
          <div className="stats-card-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-100 text-sm">Upcoming</p>
                <p className="text-2xl font-bold">{stats.appointments.upcoming}</p>
              </div>
              <FiClock className="h-8 w-8 text-accent-200" />
            </div>
          </div>
          
          <div className="stats-card-gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Cancelled</p>
                <p className="text-2xl font-bold">{stats.appointments.cancelled}</p>
              </div>
              <FiUser className="h-8 w-8 text-gray-200" />
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

      {/* Next Appointment */}
      {stats?.nextAppointment && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Next Appointment</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-semibold">
                  {stats.nextAppointment.doctor.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Dr. {stats.nextAppointment.doctor.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {stats.nextAppointment.doctor.specialization}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(stats.nextAppointment.appointmentDate).toLocaleDateString()} at{' '}
                  {stats.nextAppointment.timeSlot.startTime}
                </p>
              </div>
            </div>
            <Link
              to={`/dashboard/patient/appointments`}
              className="btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {/* Recent Appointments */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
            <Link
              to="/dashboard/patient/appointments"
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
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {appointment.doctor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Dr. {appointment.doctor.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {appointment.doctor.specialization}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${
                    appointment.status === 'completed' ? 'badge-success' :
                    appointment.status === 'scheduled' ? 'badge-primary' :
                    appointment.status === 'cancelled' ? 'badge-danger' :
                    'badge-warning'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No appointments yet</p>
            <Link
              to="/dashboard/patient/book-appointment"
              className="btn-primary mt-4 inline-flex items-center"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
