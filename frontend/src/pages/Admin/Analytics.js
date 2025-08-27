import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiPieChart,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { getAnalytics, getDashboardStats } from '../../redux/slices/adminSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SystemAnalytics = () => {
  const dispatch = useDispatch();
  const { loading, analytics, dashboardStats: stats } = useSelector((state) => state.admin);
  const [timeRange, setTimeRange] = useState('30');
  const [activeChart, setActiveChart] = useState('appointments');

  useEffect(() => {
    dispatch(getAnalytics({ period: timeRange }));
    dispatch(getDashboardStats());
  }, [dispatch, timeRange]);

  // Build chart data from backend analytics
  const chartData = useMemo(() => {
    const appointments = (analytics?.dailyAppointments || []).map((d) => ({
      date: d._id,
      total: d.count,
      completed: d.completed,
      cancelled: d.cancelled,
    }));

    const users = (analytics?.dailyRegistrations || []).map((d) => ({
      date: d._id,
      patients: d.patients,
      doctors: d.doctors,
      total: d.total,
    }));

    return { appointments, users };
  }, [analytics]);

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.revenue?.total || 0).toLocaleString()}`,
      change: '',
      trend: 'up',
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Users',
      value: `${stats?.users?.active || 0}`,
      change: '',
      trend: 'up',
      icon: FiUsers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Appointments',
      value: `${stats?.appointments?.total || 0}`,
      change: '',
      trend: 'up',
      icon: FiCalendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Completion Rate',
      value: `${stats?.appointments?.completionRate || 0}%`,
      change: '',
      trend: 'up',
      icon: FiActivity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // Derive top doctors from dashboard stats (fallback to empty)
  const topDoctors = stats?.topDoctors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your healthcare system</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="btn-secondary flex items-center">
            <FiRefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button className="btn-primary flex items-center">
            <FiDownload className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${kpi.bgColor} rounded-lg flex items-center justify-center`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-gray-600">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                {kpi.change && (
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className={`h-4 w-4 mr-1 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Trends Overview</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveChart('appointments')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      activeChart === 'appointments'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Appointments
                  </button>
                  <button
                    onClick={() => setActiveChart('users')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      activeChart === 'users'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Users
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="h-64">
                <SimpleLineChart
                  data={chartData[activeChart] || []}
                  type={activeChart}
                />
              </div>
            )}
          </div>
        </div>

        {/* Specialization Distribution */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiPieChart className="h-5 w-5 mr-2" />
                Doctor Specializations
              </h2>
            </div>
            <div className="space-y-4">
              {(analytics?.specializationStats || []).map((spec, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-4 h-4 bg-blue-500 rounded mr-3`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">{spec._id || 'Unknown'}</span>
                      <span className="text-sm text-gray-600">{spec.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-blue-500`}
                        style={{ width: `${Math.min(100, (spec.count / Math.max(1, (analytics?.specializationStats?.[0]?.count || spec.count))) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {!analytics?.specializationStats?.length && (
                <div className="text-gray-500 text-sm">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Doctors */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Top Performing Doctors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Appointments</th>
                  <th className="table-header">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-primary-600">
                            {doctor.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">Dr. {doctor.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{doctor.appointmentCount}</td>
                    <td className="table-cell">${(doctor.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {!topDoctors.length && (
                  <tr>
                    <td colSpan="3" className="table-cell text-center text-gray-500">No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent System Activity</h2>
          </div>
          <div className="space-y-4">
            {(analytics?.recentActivities || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'appointment' ? (activity.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500') : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.user} • {new Date(activity.time).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {!analytics?.recentActivities?.length && (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Line Chart Component
const SimpleLineChart = ({ data, type }) => {
  const maxValue = Math.max(...data.map(d =>
    type === 'appointments' ? d.total : d.total
  ));

  return (
    <div className="h-full flex items-end justify-between px-4 py-4">
      {data.map((item, index) => {
        return (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="flex flex-col items-center space-y-1">
              {type === 'appointments' ? (
                <>
                  <div
                    className="w-6 bg-primary-500 rounded-t"
                    style={{ height: `${(item.completed / maxValue) * 200}px` }}
                    title={`Completed: ${item.completed}`}
                  ></div>
                  <div
                    className="w-6 bg-red-300 rounded-t"
                    style={{ height: `${(item.cancelled / maxValue) * 200}px` }}
                    title={`Cancelled: ${item.cancelled}`}
                  ></div>
                </>
              ) : (
                <>
                  <div
                    className="w-6 bg-blue-500 rounded-t"
                    style={{ height: `${(item.patients / maxValue) * 200}px` }}
                    title={`Patients: ${item.patients}`}
                  ></div>
                  <div
                    className="w-6 bg-green-500 rounded-t"
                    style={{ height: `${(item.doctors / maxValue) * 200}px` }}
                    title={`Doctors: ${item.doctors}`}
                  ></div>
                </>
              )}
            </div>
            <span className="text-xs text-gray-600 transform -rotate-45">
              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SystemAnalytics;
