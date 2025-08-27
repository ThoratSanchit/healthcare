import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera
} from 'react-icons/fi';
import { updateProfile } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PatientProfile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        gender: user.gender || '',
        'address.street': user.address?.street || '',
        'address.city': user.address?.city || '',
        'address.state': user.address?.state || '',
        'address.zipCode': user.address?.zipCode || '',
        'address.country': user.address?.country || '',
        'emergencyContact.name': user.emergencyContact?.name || '',
        'emergencyContact.phone': user.emergencyContact?.phone || '',
        'emergencyContact.relationship': user.emergencyContact?.relationship || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const profileData = {
      name: data.name,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: {
        street: data['address.street'],
        city: data['address.city'],
        state: data['address.state'],
        zipCode: data['address.zipCode'],
        country: data['address.country'],
      },
      emergencyContact: {
        name: data['emergencyContact.name'],
        phone: data['emergencyContact.phone'],
        relationship: data['emergencyContact.relationship'],
      },
    };

    const result = await dispatch(updateProfile(profileData));
    if (result.type === 'auth/updateProfile/fulfilled') {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: FiUser },
    { id: 'contact', label: 'Contact & Address', icon: FiMapPin },
    { id: 'emergency', label: 'Emergency Contact', icon: FiPhone },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center"
          >
            <FiEdit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
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

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700">
                <FiCamera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <FiCalendar className="h-4 w-4 mr-1" />
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not set'}
              </span>
              <span className="capitalize">{user?.gender || 'Not specified'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      {/* Tab Content */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  type="text"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  {...register('email')}
                  type="email"
                  disabled={true}
                  className="input-field bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="form-label">Date of Birth</label>
                <input
                  {...register('dateOfBirth', { required: 'Date of birth is required' })}
                  type="date"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select
                  {...register('gender', { required: 'Gender is required' })}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="form-error">{errors.gender.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Contact & Address Tab */}
        {activeTab === 'contact' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact & Address</h3>
            <div className="space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input
                      {...register('phone', { required: 'Phone number is required' })}
                      type="tel"
                      disabled={!isEditing}
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                    {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Address</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="form-label">Street Address</label>
                    <input
                      {...register('address.street')}
                      type="text"
                      disabled={!isEditing}
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="form-label">City</label>
                      <input
                        {...register('address.city')}
                        type="text"
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="form-label">State</label>
                      <input
                        {...register('address.state')}
                        type="text"
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="form-label">ZIP Code</label>
                      <input
                        {...register('address.zipCode')}
                        type="text"
                        disabled={!isEditing}
                        className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Country</label>
                    <input
                      {...register('address.country')}
                      type="text"
                      disabled={!isEditing}
                      className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact Tab */}
        {activeTab === 'emergency' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Contact Name</label>
                <input
                  {...register('emergencyContact.name')}
                  type="text"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  {...register('emergencyContact.phone')}
                  type="tel"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>

              <div>
                <label className="form-label">Relationship</label>
                <select
                  {...register('emergencyContact.relationship')}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="child">Child</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientProfile;
