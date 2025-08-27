import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiClock,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiSave,
  FiEdit3,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { updateAvailability } from '../../redux/slices/doctorSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DoctorAvailability = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [availability, setAvailability] = useState([]);



  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  // Initialize availability data
  useEffect(() => {
    // Initialize with empty availability for all days
    const defaultAvailability = [
      { day: 'monday', slots: [] },
      { day: 'tuesday', slots: [] },
      { day: 'wednesday', slots: [] },
      { day: 'thursday', slots: [] },
      { day: 'friday', slots: [] },
      { day: 'saturday', slots: [] },
      { day: 'sunday', slots: [] }
    ];

    // If user has existing availability, use it, otherwise use default
    if (user && user.availability && user.availability.length > 0) {
      setAvailability(user.availability);
    } else {
      setAvailability(defaultAvailability);
    }
  }, [user]);

  const handleDayToggle = (dayIndex) => {
    const updatedAvailability = [...availability];
    const currentDay = updatedAvailability[dayIndex];

    // Toggle availability by adding/removing slots
    if (currentDay.slots.length > 0) {
      // If has slots, remove them (make unavailable)
      currentDay.slots = [];
    } else {
      // If no slots, add a default slot (make available)
      currentDay.slots = [{ startTime: '09:00', endTime: '17:00', isAvailable: true }];
    }

    setAvailability(updatedAvailability);
  };

  const addTimeSlot = (dayIndex) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots.push({
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true
    });
    setAvailability(updatedAvailability);
  };

  const removeTimeSlot = (dayIndex, slotIndex) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updatedAvailability);
  };

  const updateTimeSlot = (dayIndex, slotIndex, field, value) => {
    const updatedAvailability = [...availability];
    updatedAvailability[dayIndex].slots[slotIndex][field] = value;
    setAvailability(updatedAvailability);
  };

  const onSubmit = () => {
    dispatch(updateAvailability(availability));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data
  };

  const getTotalHours = () => {
    return availability.reduce((total, day) => {
      if (day.slots.length === 0) return total;

      return total + day.slots.reduce((dayTotal, slot) => {
        const start = new Date(`2000-01-01 ${slot.startTime}`);
        const end = new Date(`2000-01-01 ${slot.endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        return dayTotal + hours;
      }, 0);
    }, 0);
  };

  const getAvailableDays = () => {
    return availability.filter(day => day.slots.length > 0).length;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability Settings</h1>
          <p className="text-gray-600 mt-1">Manage your weekly schedule and time slots</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center"
          >
            <FiEdit3 className="h-4 w-4 mr-2" />
            Edit Schedule
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={onSubmit}
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              className="btn-secondary flex items-center"
            >
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getAvailableDays()}</h3>
          <p className="text-gray-600">Available Days</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiClock className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{getTotalHours()}</h3>
          <p className="text-gray-600">Hours per Week</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCheck className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {availability.reduce((total, day) => total + day.slots.length, 0)}
          </h3>
          <p className="text-gray-600">Time Slots</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        </div>

        <div className="space-y-6">
          {availability.map((daySchedule, dayIndex) => (
            <DaySchedule
              key={daySchedule.day}
              day={daySchedule.day}
              dayIndex={dayIndex}
              schedule={daySchedule}
              isEditing={isEditing}
              timeSlots={timeSlots}
              onDayToggle={handleDayToggle}
              onAddTimeSlot={addTimeSlot}
              onRemoveTimeSlot={removeTimeSlot}
              onUpdateTimeSlot={updateTimeSlot}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {isEditing && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const updated = availability.map(day => ({
                  ...day,
                  slots: day.slots.length === 0 ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }] : day.slots
                }));
                setAvailability(updated);
              }}
              className="btn-secondary"
            >
              Enable All Days
            </button>
            <button
              onClick={() => {
                const updated = availability.map(day => ({
                  ...day,
                  slots: []
                }));
                setAvailability(updated);
              }}
              className="btn-secondary"
            >
              Disable All Days
            </button>
            <button
              onClick={() => {
                const updated = availability.map(day => ({
                  ...day,
                  slots: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.day)
                    ? [{ startTime: '09:00', endTime: '17:00', isAvailable: true }]
                    : []
                }));
                setAvailability(updated);
              }}
              className="btn-secondary"
            >
              Standard Weekdays
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Day Schedule Component
const DaySchedule = ({
  day,
  dayIndex,
  schedule,
  isEditing,
  timeSlots,
  onDayToggle,
  onAddTimeSlot,
  onRemoveTimeSlot,
  onUpdateTimeSlot
}) => {
  const dayName = day.charAt(0).toUpperCase() + day.slice(1);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <input
              type="checkbox"
              checked={schedule.slots.length > 0}
              onChange={() => onDayToggle(dayIndex)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          ) : (
            <div className={`w-4 h-4 rounded ${
              schedule.slots.length > 0 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
          )}
          <h3 className="text-lg font-medium text-gray-900">{dayName}</h3>
          <span className={`badge ${
            schedule.slots.length > 0 ? 'badge-success' : 'badge-gray'
          }`}>
            {schedule.slots.length > 0 ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {isEditing && schedule.slots.length > 0 && (
          <button
            onClick={() => onAddTimeSlot(dayIndex)}
            className="btn-secondary text-sm flex items-center"
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Add Slot
          </button>
        )}
      </div>

      {schedule.slots.length > 0 && (
        <div className="space-y-3">
          {schedule.slots.length === 0 ? (
            <p className="text-gray-500 text-sm">No time slots configured</p>
          ) : (
            schedule.slots.map((slot, slotIndex) => (
              <div key={slotIndex} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 flex-1">
                  <FiClock className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <>
                      <select
                        value={slot.startTime}
                        onChange={(e) => onUpdateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                        className="input-field text-sm w-24"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500">to</span>
                      <select
                        value={slot.endTime}
                        onChange={(e) => onUpdateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                        className="input-field text-sm w-24"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <span className="text-sm font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={() => onRemoveTimeSlot(dayIndex, slotIndex)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorAvailability;
