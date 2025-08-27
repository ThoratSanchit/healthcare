import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSearch,
  FiUser,
  FiCalendar,
  FiFileText,
  FiEye,
  FiEdit3,
  FiFilter,
  FiDownload,
  FiPhone,
  FiMail,
  FiMapPin,
  FiX,
  FiSave
} from 'react-icons/fi';
import { getAppointments } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PatientRecords = () => {
  const dispatch = useDispatch();
  const { appointments, loading } = useSelector((state) => state.appointments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  // Get appointments to extract patient data
  useEffect(() => {
    dispatch(getAppointments());
  }, [dispatch]);

  // Extract unique patients from appointments
  const patients = appointments.reduce((uniquePatients, appointment) => {
    if (appointment.patient && !uniquePatients.find(p => p._id === appointment.patient._id)) {
      const patientAppointments = appointments.filter(apt => apt.patient?._id === appointment.patient._id);
      const patientData = {
        ...appointment.patient,
        totalAppointments: patientAppointments.length,
        lastVisit: patientAppointments
          .filter(apt => apt.status === 'completed')
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0]?.appointmentDate,
        recentAppointments: patientAppointments
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
          .slice(0, 3)
      };
      uniquePatients.push(patientData);
    }
    return uniquePatients;
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleAddRecord = (patient) => {
    setSelectedPatient(patient);
    setShowAddRecordModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600 mt-1">Manage your patient medical records and history</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-600">
            Total: {filteredPatients.length} patients
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiUser className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{patients.length}</h3>
          <p className="text-gray-600">Total Patients</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
          </h3>
          <p className="text-gray-600">Total Appointments</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiFileText className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {patients.reduce((sum, p) => sum + p.medicalHistory.length, 0)}
          </h3>
          <p className="text-gray-600">Medical Records</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiEdit3 className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {patients.filter(p => {
              const lastVisit = new Date(p.lastVisit);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return lastVisit >= weekAgo;
            }).length}
          </h3>
          <p className="text-gray-600">Recent Visits</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="btn-secondary flex items-center">
              <FiFilter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="btn-secondary flex items-center">
              <FiDownload className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Patients List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient._id}
              patient={patient}
              onView={handleViewPatient}
              onAddRecord={handleAddRecord}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiUser className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'No patient records available'
            }
          </p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatient(null);
          }}
        />
      )}

      {/* Add Record Modal */}
      {showAddRecordModal && selectedPatient && (
        <AddRecordModal
          patient={selectedPatient}
          onClose={() => {
            setShowAddRecordModal(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

// Patient Card Component
const PatientCard = ({ patient, onView, onAddRecord }) => {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Patient Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            {/* Patient Avatar */}
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary-600">
                {patient.name.charAt(0)}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {patient.name}
                  </h3>
                  <p className="text-gray-600">
                    {patient.age} years, {patient.gender}
                  </p>
                  <p className="text-sm text-gray-500">
                    {patient.address.city}, {patient.address.state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2" />
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2" />
                  {patient.totalAppointments} appointments
                </div>
                <div className="flex items-center">
                  <FiFileText className="h-4 w-4 mr-2" />
                  {patient.medicalHistory.length} conditions
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-3 flex flex-wrap gap-2">
                {patient.allergies.length > 0 && (
                  <span className="badge badge-danger text-xs">
                    {patient.allergies.length} allergies
                  </span>
                )}
                {patient.medications.length > 0 && (
                  <span className="badge badge-primary text-xs">
                    {patient.medications.length} medications
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
          <button
            onClick={() => onView(patient)}
            className="btn-primary text-sm flex items-center justify-center"
          >
            <FiEye className="h-4 w-4 mr-1" />
            View Record
          </button>

          <button
            onClick={() => onAddRecord(patient)}
            className="btn-secondary text-sm flex items-center justify-center"
          >
            <FiEdit3 className="h-4 w-4 mr-1" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
};

// Patient Details Modal
const PatientDetailsModal = ({ patient, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Patient Record</h2>
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
                  {patient.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                <p className="text-gray-600">{patient.age} years, {patient.gender}</p>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FiPhone className="h-4 w-4 mr-1" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center">
                    <FiMail className="h-4 w-4 mr-1" />
                    {patient.email}
                  </div>
                  <div className="flex items-center">
                    <FiMapPin className="h-4 w-4 mr-1" />
                    {patient.address.city}, {patient.address.state}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Medical History</h4>
                <div className="space-y-3">
                  {patient.medicalHistory.map((condition, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{condition.condition}</h5>
                        <span className={`badge ${
                          condition.status === 'active' ? 'badge-warning' :
                          condition.status === 'resolved' ? 'badge-success' :
                          'badge-gray'
                        }`}>
                          {condition.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </p>
                      {condition.notes && (
                        <p className="text-sm text-gray-600 mt-2">{condition.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Current Medications</h4>
                <div className="space-y-3">
                  {patient.medications.map((med, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900">{med.name}</h5>
                      <p className="text-sm text-gray-600">
                        {med.dosage} - {med.frequency}
                      </p>
                      <p className="text-xs text-gray-500">
                        Started: {new Date(med.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Allergies</h4>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} className="badge badge-danger">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No known allergies</p>
              )}
            </div>

            {/* Recent Appointments */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Appointments</h4>
              <div className="space-y-3">
                {patient.recentAppointments.map((appointment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                      <span className="badge badge-primary text-xs">
                        {appointment.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Record Modal
const AddRecordModal = ({ patient, onClose }) => {
  const [recordType, setRecordType] = useState('note');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle adding record
    console.log('Adding record:', { type: recordType, note, patient: patient._id });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Medical Record</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900">Patient: {patient.name}</h3>
            <p className="text-gray-600">{patient.age} years, {patient.gender}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Record Type</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="input-field"
              >
                <option value="note">Clinical Note</option>
                <option value="diagnosis">Diagnosis</option>
                <option value="prescription">Prescription</option>
                <option value="lab">Lab Results</option>
              </select>
            </div>

            <div>
              <label className="form-label">Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={6}
                className="input-field"
                placeholder="Enter your clinical notes, observations, or recommendations..."
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="btn-primary flex items-center"
              >
                <FiSave className="h-4 w-4 mr-2" />
                Save Record
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
