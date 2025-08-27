import { useEffect, useState } from 'react';
import { FiCalendar, FiSearch, FiFilter, FiUser, FiActivity } from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import adminService from '../../services/adminService';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (status !== 'all') params.status = status;
        if (search) params.search = search;
        const res = await adminService.getAppointments(params);
        if (res?.success) {
          setAppointments(res.data || []);
          setTotal(res.total || 0);
        } else {
          setAppointments([]);
          setTotal(0);
        }
      } catch (e) {
        setAppointments([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, limit, status, search]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all appointments</p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                className="input-field pl-10"
                placeholder="Search by doctor or patient..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          <div className="lg:w-48">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-500" />
              <select className="input-field" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-show</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : appointments.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Time</th>
                  <th className="table-header">Doctor</th>
                  <th className="table-header">Patient</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Fee</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((apt) => (
                  <tr key={apt._id}>
                    <td className="table-cell">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString() : '—'}</td>
                    <td className="table-cell">{apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleTimeString() : '—'}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-2 text-gray-900"><FiActivity className="text-gray-400" />Dr. {apt.doctor?.name || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-2 text-gray-900"><FiUser className="text-gray-400" />{apt.patient?.name || '—'}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'cancelled' ? 'badge-danger' : 'badge-primary'}`}>{apt.status}</span>
                    </td>
                    <td className="table-cell">{typeof apt.consultationFee === 'number' ? `$${apt.consultationFee}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">Page {page} of {totalPages}</div>
              <div className="flex gap-2">
                <button className="btn-secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
                <button className="btn-secondary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">Try adjusting filters or add data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;


