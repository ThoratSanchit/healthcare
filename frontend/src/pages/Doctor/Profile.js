import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  FiUser,
  FiMapPin,
  FiBook,
  FiAward,
  FiEdit3,
  FiSave,
  FiX,
  FiCamera,
  FiStar,
  FiDollarSign
} from 'react-icons/fi';
import { updateProfile } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DoctorProfile = () => {
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
        specialization: user.specialization || '',
        experience: user.experience || '',
        consultationFee: user.consultationFee || '',
        licenseNumber: user.licenseNumber || '',
        bio: user.bio || '',
        'address.street': user.address?.street || '',
        'address.city': user.address?.city || '',
        'address.state': user.address?.state || '',
        'address.zipCode': user.address?.zipCode || '',
        'address.country': user.address?.country || '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data) => {
    const profileData = {
      name: data.name,
      phone: data.phone,
      specialization: data.specialization,
      experience: parseInt(data.experience),
      consultationFee: parseFloat(data.consultationFee),
      licenseNumber: data.licenseNumber,
      bio: data.bio,
      address: {
        street: data['address.street'],
        city: data['address.city'],
        state: data['address.state'],
        zipCode: data['address.zipCode'],
        country: data['address.country'],
      },
    };

    dispatch(updateProfile(profileData));
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: FiUser },
    { id: 'professional', label: 'Professional Details', icon: FiAward },
    { id: 'contact', label: 'Contact & Address', icon: FiMapPin },
    { id: 'education', label: 'Education & Experience', icon: FiBook },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Profile</h1>
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
            <h2 className="text-xl font-semibold text-gray-900">Dr. {user?.name}</h2>
            <p className="text-primary-600 font-medium">{user?.specialization}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <FiAward className="h-4 w-4 mr-1" />
                {user?.experience} years experience
              </span>
              <span className="flex items-center">
                <FiDollarSign className="h-4 w-4 mr-1" />
                ${user?.consultationFee} consultation
              </span>
              {user?.rating && (
                <span className="flex items-center">
                  <FiStar className="h-4 w-4 mr-1 text-yellow-400" />
                  {user.rating.average?.toFixed(1)} ({user.rating.count} reviews)
                </span>
              )}
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
                <label className="form-label">Phone Number</label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="form-label">License Number</label>
                <input
                  {...register('licenseNumber', { required: 'License number is required' })}
                  type="text"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.licenseNumber && <p className="form-error">{errors.licenseNumber.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Bio</label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="Tell patients about yourself, your approach to medicine, and your expertise..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Professional Details Tab */}
        {activeTab === 'professional' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Specialization</label>
                <input
                  {...register('specialization', { required: 'Specialization is required' })}
                  type="text"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="e.g., Cardiology, Dermatology"
                />
                {errors.specialization && <p className="form-error">{errors.specialization.message}</p>}
              </div>

              <div>
                <label className="form-label">Years of Experience</label>
                <input
                  {...register('experience', {
                    required: 'Experience is required',
                    min: { value: 0, message: 'Experience cannot be negative' }
                  })}
                  type="number"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.experience && <p className="form-error">{errors.experience.message}</p>}
              </div>

              <div>
                <label className="form-label">Consultation Fee ($)</label>
                <input
                  {...register('consultationFee', {
                    required: 'Consultation fee is required',
                    min: { value: 0, message: 'Fee cannot be negative' }
                  })}
                  type="number"
                  step="0.01"
                  disabled={!isEditing}
                  className={`input-field ${!isEditing ? 'bg-gray-50' : ''}`}
                />
                {errors.consultationFee && <p className="form-error">{errors.consultationFee.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Contact & Address Tab */}
        {activeTab === 'contact' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact & Address</h3>
            <div className="space-y-6">
              {/* Address */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Clinic Address</h4>
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

        {/* Education & Experience Tab */}
        {activeTab === 'education' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Education & Experience</h3>
            <div className="space-y-6">
              {/* Education */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Education</h4>
                <div className="space-y-4">
                  {user?.education && user.education.length > 0 ? (
                    user.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-primary-200 pl-4 bg-gray-50 p-4 rounded-r-lg">
                        <h5 className="font-medium text-gray-900">{edu.degree}</h5>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No education information added yet.</p>
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Certifications</h4>
                <div className="space-y-4">
                  {user?.certifications && user.certifications.length > 0 ? (
                    user.certifications.map((cert, index) => (
                      <div key={index} className="border-l-4 border-green-200 pl-4 bg-green-50 p-4 rounded-r-lg">
                        <h5 className="font-medium text-gray-900">{cert.name}</h5>
                        <p className="text-gray-600">{cert.issuedBy}</p>
                        <p className="text-sm text-gray-500">{cert.year}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No certifications added yet.</p>
                  )}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {user?.languages && user.languages.length > 0 ? (
                    user.languages.map((language, index) => (
                      <span key={index} className="badge badge-primary">
                        {language}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No languages specified.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default DoctorProfile;
