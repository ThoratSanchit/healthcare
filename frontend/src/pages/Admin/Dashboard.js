import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiTrendingUp,
  FiUserCheck,
  FiActivity,
  FiBarChart2,
  FiSettings,
  FiArrowRight,
  FiCheckCircle,
} from 'react-icons/fi';
import { getDashboardStats } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboardStats: stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage patients, doctors, and admins',
      icon: FiUsers,
      link: '/dashboard/admin/users',
      color: 'bg-primary-600',
    },
    {
      title: 'System Analytics',
      description: 'View detailed system analytics',
      icon: FiBarChart2,
      link: '/dashboard/admin/analytics',
      color: 'bg-secondary-600',
    },
    {
      title: 'Appointments',
      description: 'Monitor all appointments',
      icon: FiCalendar,
      link: '/dashboard/admin/appointments',
      color: 'bg-accent-600',
    },
    {
      title: 'System Settings',
      description: 'Configure system settings',
      icon: FiSettings,
      link: '/dashboard/admin/settings',
      color: 'bg-gray-600',
    },
  ];

  if (loading) {
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
          Monitor and manage the healthcare system from your admin dashboard.
        </p>
      </div>

      {/* Stats Overview - customized cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Doctors */}
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Doctors</p>
                <p className="text-2xl font-bold">{stats.users.doctors}</p>
                <p className="text-primary-200 text-xs">Total registered</p>
              </div>
              <FiActivity className="h-8 w-8 text-primary-200" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="stats-card-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.total}</p>
                <p className="text-accent-200 text-xs">All-time completed</p>
              </div>
              <FiDollarSign className="h-8 w-8 text-accent-200" />
            </div>
          </div>

          {/* Appointments */}
          <div className="stats-card-secondary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm">Appointments</p>
                <p className="text-2xl font-bold">{stats.appointments.total}</p>
                <p className="text-secondary-200 text-xs">{stats.appointments.thisMonth} this month</p>
              </div>
              <FiCalendar className="h-8 w-8 text-secondary-200" />
            </div>
          </div>

          {/* Active Users */}
          <div className="stats-card-gray">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm">Active Users</p>
                <p className="text-2xl font-bold">{stats.users.active}</p>
                <p className="text-gray-200 text-xs">Currently active</p>
              </div>
              <FiUserCheck className="h-8 w-8 text-gray-200" />
            </div>
          </div>

          {/* Completion Rate */}
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.appointments.completionRate}%</p>
                <p className="text-primary-200 text-xs">of all appointments</p>
              </div>
              <FiCheckCircle className="h-8 w-8 text-primary-200" />
            </div>
          </div>
        </div>
      )}

      {/* User Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUsers className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.users.patients}</h3>
            <p className="text-gray-600">Patients</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiActivity className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.users.doctors}</h3>
            <p className="text-gray-600">Doctors</p>
          </div>

          <div className="card text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.appointments.completed}</h3>
            <p className="text-gray-600">Completed Appointments</p>
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

      {/* Top Doctors */}
      {stats?.topDoctors && stats.topDoctors.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Doctors</h2>
          </div>
          <div className="space-y-4">
            {stats.topDoctors.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {doctor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dr. {doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{doctor.appointmentCount} appointments</p>
                  <p className="text-sm text-gray-600">${doctor.revenue} revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Today's Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Appointments Today</span>
              <span className="font-semibold">{stats?.appointments.today || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New Users</span>
              <span className="font-semibold">{stats?.users.newThisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed Appointments</span>
              <span className="font-semibold">{stats?.appointments.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Cancelled Appointments</span>
              <span className="font-semibold">{stats?.appointments.cancelled || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">System Status</span>
              <span className="badge badge-success">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <span className="badge badge-success">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">API Response</span>
              <span className="badge badge-success">Normal</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-600">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
