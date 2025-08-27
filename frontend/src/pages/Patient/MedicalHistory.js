import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSave,
  FiX,
  FiFileText,
  FiAlertCircle,
  FiPackage,
  FiActivity
} from 'react-icons/fi';
import { updateMedicalHistory } from '../../redux/slices/patientSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const MedicalHistory = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('conditions');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const tabs = [
    { id: 'conditions', label: 'Medical Conditions', icon: FiActivity },
    { id: 'allergies', label: 'Allergies', icon: FiAlertCircle },
    { id: 'medications', label: 'Current Medications', icon: FiPackage },
  ];

  const onSubmit = async (data) => {
    const medicalData = {
      medicalHistory: user?.medicalHistory || [],
      allergies: user?.allergies || [],
      medications: user?.medications || [],
    };

    if (activeTab === 'conditions') {
      if (editingItem !== null) {
        medicalData.medicalHistory[editingItem] = {
          condition: data.condition,
          diagnosedDate: data.diagnosedDate,
          status: data.status,
          notes: data.notes,
        };
      } else {
        medicalData.medicalHistory.push({
          condition: data.condition,
          diagnosedDate: data.diagnosedDate,
          status: data.status,
          notes: data.notes,
        });
      }
    } else if (activeTab === 'allergies') {
      if (editingItem !== null) {
        medicalData.allergies[editingItem] = data.allergy;
      } else {
        medicalData.allergies.push(data.allergy);
      }
    } else if (activeTab === 'medications') {
      if (editingItem !== null) {
        medicalData.medications[editingItem] = {
          name: data.medicationName,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
        };
      } else {
        medicalData.medications.push({
          name: data.medicationName,
          dosage: data.dosage,
          frequency: data.frequency,
          startDate: data.startDate,
          endDate: data.endDate,
        });
      }
    }

    const result = await dispatch(updateMedicalHistory(medicalData));
    if (result.type === 'patients/updateMedicalHistory/fulfilled') {
      setIsEditing(false);
      setEditingItem(null);
      reset();
    }
  };

  const handleEdit = (index, item) => {
    setEditingItem(index);
    setIsEditing(true);

    if (activeTab === 'conditions') {
      reset({
        condition: item.condition,
        diagnosedDate: item.diagnosedDate ? new Date(item.diagnosedDate).toISOString().split('T')[0] : '',
        status: item.status,
        notes: item.notes,
      });
    } else if (activeTab === 'allergies') {
      reset({ allergy: item });
    } else if (activeTab === 'medications') {
      reset({
        medicationName: item.name,
        dosage: item.dosage,
        frequency: item.frequency,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
      });
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const medicalData = {
      medicalHistory: user?.medicalHistory || [],
      allergies: user?.allergies || [],
      medications: user?.medications || [],
    };

    if (activeTab === 'conditions') {
      medicalData.medicalHistory.splice(index, 1);
    } else if (activeTab === 'allergies') {
      medicalData.allergies.splice(index, 1);
    } else if (activeTab === 'medications') {
      medicalData.medications.splice(index, 1);
    }

    await dispatch(updateMedicalHistory(medicalData));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    reset();
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsEditing(true);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Medical History</h1>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="btn-primary flex items-center"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Add New
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsEditing(false);
                setEditingItem(null);
                reset();
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Add/Edit Form */}
      {isEditing && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingItem !== null ? 'Edit' : 'Add New'} {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <FiSave className="h-4 w-4 mr-2" />
                    Save
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
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'conditions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Condition</label>
                  <input
                    {...register('condition', { required: 'Condition is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Hypertension, Diabetes"
                  />
                  {errors.condition && <p className="form-error">{errors.condition.message}</p>}
                </div>

                <div>
                  <label className="form-label">Diagnosed Date</label>
                  <input
                    {...register('diagnosedDate')}
                    type="date"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="chronic">Chronic</option>
                  </select>
                  {errors.status && <p className="form-error">{errors.status.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="input-field"
                    placeholder="Additional notes about the condition..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'allergies' && (
              <div>
                <label className="form-label">Allergy</label>
                <input
                  {...register('allergy', { required: 'Allergy is required' })}
                  type="text"
                  className="input-field"
                  placeholder="e.g., Penicillin, Peanuts, Latex"
                />
                {errors.allergy && <p className="form-error">{errors.allergy.message}</p>}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Medication Name</label>
                  <input
                    {...register('medicationName', { required: 'Medication name is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., Lisinopril, Metformin"
                  />
                  {errors.medicationName && <p className="form-error">{errors.medicationName.message}</p>}
                </div>

                <div>
                  <label className="form-label">Dosage</label>
                  <input
                    {...register('dosage', { required: 'Dosage is required' })}
                    type="text"
                    className="input-field"
                    placeholder="e.g., 10mg, 500mg"
                  />
                  {errors.dosage && <p className="form-error">{errors.dosage.message}</p>}
                </div>

                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    {...register('frequency', { required: 'Frequency is required' })}
                    className="input-field"
                  >
                    <option value="">Select frequency</option>
                    <option value="once daily">Once daily</option>
                    <option value="twice daily">Twice daily</option>
                    <option value="three times daily">Three times daily</option>
                    <option value="as needed">As needed</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  {errors.frequency && <p className="form-error">{errors.frequency.message}</p>}
                </div>

                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="form-label">End Date (Optional)</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Content Lists */}
      <div className="card">
        {activeTab === 'conditions' && (
          <MedicalConditionsList
            conditions={user?.medicalHistory || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'allergies' && (
          <AllergiesList
            allergies={user?.allergies || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {activeTab === 'medications' && (
          <MedicationsList
            medications={user?.medications || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

// Medical Conditions List Component
const MedicalConditionsList = ({ conditions, onEdit, onDelete }) => {
  if (conditions.length === 0) {
    return (
      <div className="text-center py-8">
        <FiFileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No medical conditions recorded</h3>
        <p className="text-gray-600">Add your medical conditions to keep track of your health history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Medical Conditions</h3>
      {conditions.map((condition, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{condition.condition}</h4>
              <div className="mt-1 text-sm text-gray-600">
                <span className={`badge ${
                  condition.status === 'active' ? 'badge-warning' :
                  condition.status === 'resolved' ? 'badge-success' :
                  condition.status === 'chronic' ? 'badge-danger' : 'badge-gray'
                }`}>
                  {condition.status}
                </span>
                {condition.diagnosedDate && (
                  <span className="ml-2">
                    Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {condition.notes && (
                <p className="mt-2 text-sm text-gray-600">{condition.notes}</p>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(index, condition)}
                className="p-2 text-gray-400 hover:text-primary-600"
              >
                <FiEdit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Allergies List Component
const AllergiesList = ({ allergies, onEdit, onDelete }) => {
  if (allergies.length === 0) {
    return (
      <div className="text-center py-8">
        <FiAlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies recorded</h3>
        <p className="text-gray-600">Add your known allergies to help healthcare providers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allergies.map((allergy, index) => (
          <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-gray-900">{allergy}</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(index, allergy)}
                  className="p-1 text-gray-400 hover:text-primary-600"
                >
                  <FiEdit3 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <FiTrash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Medications List Component
const MedicationsList = ({ medications, onEdit, onDelete }) => {
  if (medications.length === 0) {
    return (
      <div className="text-center py-8">
        <FiPackage className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No medications recorded</h3>
        <p className="text-gray-600">Add your current medications to keep track of your treatment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
      {medications.map((medication, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <FiPackage className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">{medication.name}</h4>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                <span className="font-medium">{medication.dosage}</span>
                <span className="mx-2">•</span>
                <span>{medication.frequency}</span>
              </div>
              {medication.startDate && (
                <div className="mt-1 text-sm text-gray-500">
                  Started: {new Date(medication.startDate).toLocaleDateString()}
                  {medication.endDate && (
                    <span> • Ends: {new Date(medication.endDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onEdit(index, medication)}
                className="p-2 text-gray-400 hover:text-primary-600"
              >
                <FiEdit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MedicalHistory;
