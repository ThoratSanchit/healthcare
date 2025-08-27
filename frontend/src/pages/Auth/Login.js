import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiLock, FiShield, FiHeart, FiActivity } from 'react-icons/fi';
import { login } from '../../redux/slices/authSlice';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (result.type === 'auth/login/fulfilled') {
      const from = location.state?.from?.pathname || getDashboardRoute(result.payload.user.role);
      navigate(from, { replace: true });
    }
  };

  const getDashboardRoute = (role) => {
    switch (role) {
      case 'patient':
        return '/dashboard/patient';
      case 'doctor':
        return '/dashboard/doctor';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/dashboard';
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
                  Smarter healthcare starts with effortless appointments
                </h1>

                <ul className="space-y-4 text-white/90">
                  <li className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10"><FiShield className="h-5 w-5" /></span>
                    <span>Secure, role-based access for patients, doctors, and admins</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10"><FiHeart className="h-5 w-5" /></span>
                    <span>Manage schedules, records, and bookings in one place</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-white/10"><FiActivity className="h-5 w-5" /></span>
                    <span>Realtime analytics and insights for smarter decisions</span>
                  </li>
                </ul>

                <div className="mt-6 text-white/80 text-sm">
                  Tip: Sign in or create an account to continue.
                </div>
              </div>
            </div>
          </div>

          {/* Right login card */}
          <div className="flex">
            <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border border-gray-100 rounded-2xl shadow-xl p-6 sm:p-8">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
              </div>
              <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Sign in to continue
              </p>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="form-label">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email address',
                          },
                          minLength: { value: 5, message: 'Email must be at least 5 characters long' },
                        })}
                        type="email"
                        className="input-field pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && <p className="form-error">{errors.email.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="form-label">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pl-10 pr-10"
                        placeholder="Your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <FiEye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (<LoadingSpinner size="small" />) : ('Sign in')}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <span>New here? </span>
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Create an account</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
