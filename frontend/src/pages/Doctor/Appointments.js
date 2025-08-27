import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiFilter,
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiEdit3
} from 'react-icons/fi';
import { getAppointments, updateAppointment } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DoctorAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    dispatch(getAppointments(params));
  }, [dispatch, statusFilter]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = appointment.appointmentDate === today;
    } else if (dateFilter === 'upcoming') {
      const today = new Date().toISOString().split('T')[0];
      matchesDate = appointment.appointmentDate >= today;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'badge-primary';
      case 'confirmed': return 'badge-success';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      case 'no-show': return 'badge-warning';
      default: return 'badge-gray';
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    await dispatch(updateAppointment({
      id: appointmentId,
      data: { status: newStatus }
    }));
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const todayAppointments = filteredAppointments.filter(apt => {
    const appointmentDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return appointmentDate === today;
  });

  const upcomingAppointments = filteredAppointments.filter(apt => {
    const appointmentDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return appointmentDate > today;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your patient appointments</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            Total: {filteredAppointments.length} appointments
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{todayAppointments.length}</h3>
          <p className="text-gray-600">Today</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiClock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</h3>
          <p className="text-gray-600">Upcoming</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCheck className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {appointments.filter(a => a.status === 'completed').length}
          </h3>
          <p className="text-gray-600">Completed</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiUser className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {new Set(appointments.map(a => a.patient?.name).filter(Boolean)).size}
          </h3>
          <p className="text-gray-600">Patients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="lg:w-48">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment._id}
              appointment={appointment}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiCalendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No appointments scheduled'
            }
          </p>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAppointment(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment, onStatusUpdate, onViewDetails, getStatusColor }) => {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isToday = appointmentDate.toDateString() === new Date().toDateString();
  const isPast = appointmentDate < new Date();

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Patient Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {appointment.patient.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.patient.name}
                  </h3>
                  <p className="text-gray-600">
                    {appointment.patient.age} years, {appointment.patient.gender}
                  </p>
                </div>
                <span className={`badge ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2" />
                  {appointmentDate.toLocaleDateString()}
                  {isToday && <span className="ml-2 text-blue-600 font-medium">(Today)</span>}
                </div>
                <div className="flex items-center">
                  <FiClock className="h-4 w-4 mr-2" />
                  {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
                </div>
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2" />
                  {appointment.type}
                </div>
                <div className="flex items-center">
                  <span className="font-medium">${appointment.consultationFee}</span>
                </div>
              </div>

              {appointment.reason && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Reason:</strong> {appointment.reason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
          <button
            onClick={() => onViewDetails(appointment)}
            className="btn-secondary text-sm flex items-center justify-center"
          >
            <FiEye className="h-4 w-4 mr-1" />
            View
          </button>

          {appointment.status === 'scheduled' && (
            <button
              onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
              className="btn-success text-sm flex items-center justify-center"
            >
              <FiCheck className="h-4 w-4 mr-1" />
              Confirm
            </button>
          )}

          {appointment.status === 'confirmed' && !isPast && (
            <button
              onClick={() => onStatusUpdate(appointment._id, 'completed')}
              className="btn-primary text-sm flex items-center justify-center"
            >
              <FiCheck className="h-4 w-4 mr-1" />
              Complete
            </button>
          )}

          {['scheduled', 'confirmed'].includes(appointment.status) && (
            <button
              onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
              className="btn-danger text-sm flex items-center justify-center"
            >
              <FiX className="h-4 w-4 mr-1" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Appointment Details Modal
const AppointmentDetailsModal = ({ appointment, onClose, onStatusUpdate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Patient Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {appointment.patient.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment.patient.name}
                </h3>
                <p className="text-gray-600">
                  {appointment.patient.age} years, {appointment.patient.gender}
                </p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiPhone className="h-4 w-4 mr-1" />
                    {appointment.patient.phone}
                  </div>
                  <div className="flex items-center">
                    <FiMail className="h-4 w-4 mr-1" />
                    {appointment.patient.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Appointment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span>{appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{appointment.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`badge ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee:</span>
                    <span className="font-medium">${appointment.consultationFee}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason */}
            {appointment.reason && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Reason for Visit</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{appointment.reason}</p>
              </div>
            )}

            {/* Symptoms */}
            {appointment.symptoms && appointment.symptoms.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {appointment.symptoms.map((symptom, index) => (
                    <span key={index} className="badge badge-gray">{symptom}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Notes */}
            {appointment.notes?.patient && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Patient Notes</h4>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{appointment.notes.patient}</p>
              </div>
            )}

            {/* Doctor Notes */}
            {appointment.notes?.doctor && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Doctor Notes</h4>
                <p className="text-gray-600 bg-green-50 p-3 rounded-lg">{appointment.notes.doctor}</p>
              </div>
            )}

            {/* Prescription */}
            {appointment.prescription && appointment.prescription.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Prescription</h4>
                <div className="space-y-2">
                  {appointment.prescription.map((med, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                      <div className="font-medium">{med.medication}</div>
                      <div className="text-sm text-gray-600">
                        {med.dosage} - {med.frequency} for {med.duration}
                      </div>
                      {med.instructions && (
                        <div className="text-sm text-gray-600 mt-1">{med.instructions}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              {appointment.status === 'scheduled' && (
                <button
                  onClick={() => {
                    onStatusUpdate(appointment._id, 'confirmed');
                    onClose();
                  }}
                  className="btn-success flex items-center"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Confirm Appointment
                </button>
              )}

              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => {
                    onStatusUpdate(appointment._id, 'completed');
                    onClose();
                  }}
                  className="btn-primary flex items-center"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Mark as Completed
                </button>
              )}

              <button
                className="btn-secondary flex items-center"
              >
                <FiEdit3 className="h-4 w-4 mr-2" />
                Add Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled': return 'badge-primary';
    case 'confirmed': return 'badge-success';
    case 'completed': return 'badge-success';
    case 'cancelled': return 'badge-danger';
    case 'no-show': return 'badge-warning';
    default: return 'badge-gray';
  }
};

export default DoctorAppointments;
