import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiCheck,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';
import { getDoctors } from '../../redux/slices/doctorSlice';
import { getAvailableSlots, createAppointment } from '../../redux/slices/appointmentSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BookAppointment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors);
  const { availableSlots, loading: slotsLoading } = useSelector((state) => state.appointments);

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  // Pre-select doctor if coming from doctor profile
  useEffect(() => {
    const doctorId = searchParams.get('doctor');
    if (doctorId && doctors.length > 0) {
      const doctor = doctors.find(d => d._id === doctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        setStep(2);
      }
    }
  }, [searchParams, doctors]);

  useEffect(() => {
    dispatch(getDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      dispatch(getAvailableSlots({
        doctorId: selectedDoctor._id,
        date: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [dispatch, selectedDoctor, selectedDate]);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const onSubmit = async (data) => {
    const appointmentData = {
      doctor: selectedDoctor._id,
      appointmentDate: selectedDate.toISOString(),
      timeSlot: {
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      },
      reason: data.reason,
      type: data.type,
      symptoms: data.symptoms ? data.symptoms.split(',').map(s => s.trim()) : []
    };

    const result = await dispatch(createAppointment(appointmentData));
    if (result.type === 'appointments/createAppointment/fulfilled') {
      navigate('/dashboard/patient/appointments');
    }
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
        <p className="text-gray-600">Schedule your consultation with our qualified doctors</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        <StepIndicator step={1} currentStep={step} title="Select Doctor" />
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <StepIndicator step={2} currentStep={step} title="Choose Date & Time" />
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <StepIndicator step={3} currentStep={step} title="Appointment Details" />
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select a Doctor</h2>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Doctors List */}
          {doctorsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredDoctors.map((doctor) => (
                <DoctorSelectionCard
                  key={doctor._id}
                  doctor={doctor}
                  onSelect={() => handleDoctorSelect(doctor)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date & Time */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          {/* Selected Doctor Info */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary-600">
                    {selectedDoctor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. {selectedDoctor.name}</h3>
                  <p className="text-primary-600">{selectedDoctor.specialization}</p>
                  <p className="text-sm text-gray-600">${selectedDoctor.consultationFee}</p>
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex items-center"
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Change Doctor
              </button>
            </div>
          </div>

          {/* Date & Time Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Choose Date & Time</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date Picker */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Select Date</h3>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  filterDate={(date) => !isDateDisabled(date)}
                  minDate={new Date()}
                  inline
                  className="w-full"
                />
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Available Time Slots</h3>
                {!selectedDate ? (
                  <p className="text-gray-500 text-center py-8">Please select a date first</p>
                ) : slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-3 text-sm border rounded-lg transition-colors ${
                          selectedSlot === slot
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No available slots for this date
                  </p>
                )}
              </div>
            </div>

            {selectedSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center"
                >
                  Continue
                  <FiArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Appointment Details */}
      {step === 3 && selectedDoctor && selectedDate && selectedSlot && (
        <div className="space-y-6">
          {/* Appointment Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Doctor:</span>
                  <p className="font-medium">Dr. {selectedDoctor.name}</p>
                  <p className="text-gray-600">{selectedDoctor.specialization}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date & Time:</span>
                  <p className="font-medium">{selectedDate.toLocaleDateString()}</p>
                  <p className="text-gray-600">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                </div>
                <div>
                  <span className="text-gray-600">Consultation Fee:</span>
                  <p className="font-medium text-lg">${selectedDoctor.consultationFee}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Details</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Appointment Type</label>
                  <select
                    {...register('type', { required: 'Please select appointment type' })}
                    className="input-field"
                  >
                    <option value="">Select type</option>
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="routine-checkup">Routine Checkup</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  {errors.type && <p className="form-error">{errors.type.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Reason for Visit</label>
                <textarea
                  {...register('reason', {
                    required: 'Please provide reason for visit',
                    minLength: { value: 10, message: 'Please provide more details' }
                  })}
                  rows={4}
                  className="input-field"
                  placeholder="Describe your symptoms or reason for the appointment..."
                />
                {errors.reason && <p className="form-error">{errors.reason.message}</p>}
              </div>

              <div>
                <label className="form-label">Symptoms (Optional)</label>
                <input
                  {...register('symptoms')}
                  type="text"
                  className="input-field"
                  placeholder="List your symptoms separated by commas"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Example: fever, headache, cough
                </p>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center"
                >
                  <FiArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  <FiCheck className="h-4 w-4 mr-2" />
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ step, currentStep, title }) => {
  const isActive = currentStep === step;
  const isCompleted = currentStep > step;

  return (
    <div className="flex flex-col items-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
        isCompleted
          ? 'bg-green-600 text-white'
          : isActive
            ? 'bg-primary-600 text-white'
            : 'bg-gray-300 text-gray-600'
      }`}>
        {isCompleted ? <FiCheck className="h-5 w-5" /> : step}
      </div>
      <span className={`mt-2 text-xs font-medium ${
        isActive ? 'text-primary-600' : 'text-gray-500'
      }`}>
        {title}
      </span>
    </div>
  );
};

// Doctor Selection Card Component
const DoctorSelectionCard = ({ doctor, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-primary-600">
            {doctor.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Dr. {doctor.name}</h3>
          <p className="text-primary-600 font-medium">{doctor.specialization}</p>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <div className="flex items-center">
              <FiClock className="h-4 w-4 mr-1" />
              {doctor.experience} years exp.
            </div>
            <div className="flex items-center">
              <span>${doctor.consultationFee}</span>
            </div>
            {doctor.rating?.average > 0 && (
              <div className="flex items-center">
                <span>⭐ {doctor.rating.average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-primary-600">
          <FiArrowRight className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
