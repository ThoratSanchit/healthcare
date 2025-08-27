import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiFilter,
  FiSearch,
  FiEye,
  FiX,
  FiStar
} from 'react-icons/fi';
import { getAppointments, cancelAppointment, rateAppointment } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MyAppointments = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState({ score: 5, review: '' });

  useEffect(() => {
    const params = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    dispatch(getAppointments(params));
  }, [dispatch, statusFilter]);

  const filteredAppointments = appointments.filter(appointment =>
    appointment.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await dispatch(cancelAppointment({
        id: appointmentId,
        reason: 'Cancelled by patient'
      }));
    }
  };

  const handleRateAppointment = async () => {
    await dispatch(rateAppointment({
      id: selectedAppointment._id,
      rating
    }));
    setShowRatingModal(false);
    setSelectedAppointment(null);
    setRating({ score: 5, review: '' });
  };

  const canCancelAppointment = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    return hoursDiff > 24 && ['scheduled', 'confirmed'].includes(appointment.status);
  };

  const canRateAppointment = (appointment) => {
    return appointment.status === 'completed' && !appointment.rating?.score;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            Total: {filteredAppointments.length} appointments
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
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
              onCancel={handleCancelAppointment}
              onRate={(apt) => {
                setSelectedAppointment(apt);
                setShowRatingModal(true);
              }}
              onViewDetails={setSelectedAppointment}
              canCancel={canCancelAppointment(appointment)}
              canRate={canRateAppointment(appointment)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiCalendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'You haven\'t booked any appointments yet'
            }
          </p>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && !showRatingModal && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedAppointment && (
        <RatingModal
          appointment={selectedAppointment}
          rating={rating}
          setRating={setRating}
          onSubmit={handleRateAppointment}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

// Appointment Card Component
const AppointmentCard = ({
  appointment,
  onCancel,
  onRate,
  onViewDetails,
  canCancel,
  canRate
}) => {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isUpcoming = appointmentDate > new Date();

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Appointment Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Doctor Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {appointment.doctor.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {appointment.doctor.name}
                  </h3>
                  <p className="text-primary-600 font-medium">
                    {appointment.doctor.specialization}
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

          {canCancel && (
            <button
              onClick={() => onCancel(appointment._id)}
              className="btn-danger text-sm"
            >
              Cancel
            </button>
          )}

          {canRate && (
            <button
              onClick={() => onRate(appointment)}
              className="btn-success text-sm flex items-center justify-center"
            >
              <FiStar className="h-4 w-4 mr-1" />
              Rate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Appointment Details Modal
const AppointmentDetailsModal = ({ appointment, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
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
            {/* Doctor Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {appointment.doctor.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {appointment.doctor.name}
                </h3>
                <p className="text-primary-600">{appointment.doctor.specialization}</p>
                <p className="text-sm text-gray-600">${appointment.consultationFee} consultation</p>
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
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  {appointment.doctor.phone && (
                    <div className="flex items-center">
                      <FiPhone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.doctor.phone}</span>
                    </div>
                  )}
                  {appointment.doctor.email && (
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{appointment.doctor.email}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiMapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Clinic Address</span>
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

            {/* Doctor's Notes */}
            {appointment.notes?.doctor && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Doctor's Notes</h4>
                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">{appointment.notes.doctor}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

// Rating Modal
const RatingModal = ({ appointment, rating, setRating, onSubmit, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Rate Your Experience</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-primary-600">
                {appointment.doctor.name.charAt(0)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">Dr. {appointment.doctor.name}</h3>
            <p className="text-gray-600">{appointment.doctor.specialization}</p>
          </div>

          <div className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating({ ...rating, score: star })}
                    className={`text-2xl ${
                      star <= rating.score ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <FiStar className="h-8 w-8" fill={star <= rating.score ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review (Optional)
              </label>
              <textarea
                value={rating.review}
                onChange={(e) => setRating({ ...rating, review: e.target.value })}
                placeholder="Share your experience with other patients..."
                rows={4}
                className="input-field"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onSubmit}
                className="flex-1 btn-primary"
              >
                Submit Rating
              </button>
              <button
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
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

export default MyAppointments;
