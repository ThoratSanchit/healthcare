import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiShield, FiHeart } from 'react-icons/fi';
import { register as registerUser } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState('patient');
  const [showCustomSpecialization, setShowCustomSpecialization] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');
  const selectedSpecialization = watch('specialization');

  const specializations = [
    'Cardiology','Dermatology','Endocrinology','Gastroenterology','General Medicine','Gynecology','Neurology','Oncology','Ophthalmology','Orthopedics','Pediatrics','Psychiatry','Pulmonology','Radiology','Surgery','Urology','Other'
  ];

  const onSubmit = async (data) => {
    if (data.specialization === 'Other' && data.customSpecialization) {
      data.specialization = data.customSpecialization;
      delete data.customSpecialization;
    }
    const result = await dispatch(registerUser(data));
    if (result.type === 'auth/register/fulfilled') {
      const role = result.payload.user.role;
      navigate(role === 'patient' ? '/dashboard/patient' : role === 'doctor' ? '/dashboard/doctor' : '/dashboard/admin', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left promo panel */}
          <div className="hidden lg:flex">
            <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-xl">
              <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-white/10 blur-2xl"></div>

              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-primary-700 font-bold">H</span>
                  </div>
                  <span className="text-white/90 text-sm tracking-wide">Healthcare Booking</span>
                </div>

                <h1 className="text-3xl xl:text-4xl font-extrabold leading-tight">
                  Create your account and book appointments in minutes
                </h1>

                <ul className="space-y-4 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10"><FiShield className="h-5 w-5" /></span>
                    <span>Secure authentication with role-based access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10"><FiHeart className="h-5 w-5" /></span>
                    <span>Personalized care and seamless scheduling</span>
                  </li>
                </ul>

                <div className="mt-6 text-white/80 text-sm">
                  Already have an account? <Link to="/login" className="underline decoration-white/40">Sign in</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right register card */}
          <div className="flex">
            <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-gray-100 rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
              </div>
              <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">Create your account</h2>
              <p className="mt-2 text-center text-sm text-gray-600">Join the platform and get started</p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Role Selection (Doctor disabled - admin creates doctors) */}
                <div>
                  <label className="form-label">I am a</label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input {...register('role')} id="patient" type="radio" value="patient" checked={userRole === 'patient'} onChange={(e) => setUserRole(e.target.value)} className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300" />
                      <label htmlFor="patient" className="ml-3 block text-sm font-medium text-gray-700">Patient</label>
                    </div>
                    <div className="flex items-center">
                      <input id="doctor" type="radio" value="doctor" className="h-4 w-4 text-gray-300 border-gray-300" disabled />
                      <label htmlFor="doctor" className="ml-3 block text-sm font-medium text-gray-400">Doctor (contact admin)</label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiUser className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters long' }, maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }, pattern: { value: /^[a-zA-Z\s]+$/, message: 'Name can only contain letters and spaces' } })} type="text" className="input-field pl-10" placeholder="Enter your full name" />
                    </div>
                    {errors.name && (<p className="form-error">{errors.name.message}</p>)}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('email', { required: 'Email address is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' }, minLength: { value: 5, message: 'Email must be at least 5 characters long' }, maxLength: { value: 100, message: 'Email cannot exceed 100 characters' } })} type="email" className="input-field pl-10" placeholder="Enter your email" />
                    </div>
                    {errors.email && (<p className="form-error">{errors.email.message}</p>)}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiPhone className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('phone', { required: 'Phone number is required', pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }, minLength: { value: 10, message: 'Phone number must be at least 10 digits' }, maxLength: { value: 15, message: 'Phone number cannot exceed 15 digits' } })} type="tel" className="input-field pl-10" placeholder="Enter your phone number" />
                    </div>
                    {errors.phone && (<p className="form-error">{errors.phone.message}</p>)}
                  </div>

                  {/* Patient fields */}
                  {userRole === 'patient' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                          <input {...register('dateOfBirth', { required: 'Date of birth is required', validate: (value) => { const today = new Date(); const birthDate = new Date(value); let age = today.getFullYear() - birthDate.getFullYear(); const monthDiff = today.getMonth() - birthDate.getMonth(); if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) { age--; } if (age < 18) return 'You must be at least 18 years old to register'; if (age > 120) return 'Please enter a valid date of birth'; return true; } })} type="date" className="input-field" />
                          {errors.dateOfBirth && (<p className="form-error">{errors.dateOfBirth.message}</p>)}
                        </div>
                        <div>
                          <label htmlFor="gender" className="form-label">Gender</label>
                          <select {...register('gender', { required: 'Gender is required' })} className="input-field">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.gender && (<p className="form-error">{errors.gender.message}</p>)}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Doctor fields hidden by default (admin only) */}
                  {false && userRole === 'doctor' && (
                    <>
                      {/* unchanged doctor fields (hidden) */}
                    </>
                  )}

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters long' }, maxLength: { value: 128, message: 'Password cannot exceed 128 characters' }, pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, message: 'Password must contain uppercase, lowercase, number, and special character' } })} type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Create a password" />
                      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (<FiEyeOff className="h-5 w-5 text-gray-400" />) : (<FiEye className="h-5 w-5 text-gray-400" />)}
                      </button>
                    </div>
                    {errors.password && (<p className="form-error">{errors.password.message}</p>)}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })} type="password" className="input-field pl-10" placeholder="Confirm your password" />
                    </div>
                    {errors.confirmPassword && (<p className="form-error">{errors.confirmPassword.message}</p>)}
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center">
                  <input id="agree-terms" name="agree-terms" type="checkbox" required className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the <Link to="/terms" className="text-primary-600 hover:text-primary-500">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 hover:text-primary-500">Privacy Policy</Link>
                  </label>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (<LoadingSpinner size="small" />) : ('Create Account')}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Sign in</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
