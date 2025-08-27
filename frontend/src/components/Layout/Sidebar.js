import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiCalendar, 
  FiUser, 
  FiUsers, 
  FiClock, 
  FiFileText, 
  FiBarChart2,
  FiSettings,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose, userRole }) => {
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: `/dashboard/${userRole}`,
        icon: FiHome,
      },
    ];

    switch (userRole) {
      case 'patient':
        return [
          ...baseItems,
          {
            name: 'My Appointments',
            href: '/dashboard/patient/appointments',
            icon: FiCalendar,
          },
          {
            name: 'Book Appointment',
            href: '/dashboard/patient/book-appointment',
            icon: FiClock,
          },
          {
            name: 'Medical History',
            href: '/dashboard/patient/medical-history',
            icon: FiFileText,
          },
          {
            name: 'Profile',
            href: '/dashboard/patient/profile',
            icon: FiUser,
          },
        ];

      case 'doctor':
        return [
          ...baseItems,
          {
            name: 'Appointments',
            href: '/dashboard/doctor/appointments',
            icon: FiCalendar,
          },
          {
            name: 'Availability',
            href: '/dashboard/doctor/availability',
            icon: FiClock,
          },
          {
            name: 'Patient Records',
            href: '/dashboard/doctor/patients',
            icon: FiUsers,
          },
          {
            name: 'Profile',
            href: '/dashboard/doctor/profile',
            icon: FiUser,
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            name: 'User Management',
            href: '/dashboard/admin/users',
            icon: FiUsers,
          },
          {
            name: 'Analytics',
            href: '/dashboard/admin/analytics',
            icon: FiBarChart2,
          },
          {
            name: 'Settings',
            href: '/dashboard/admin/settings',
            icon: FiSettings,
          },
        ];

      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-40">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                HealthCare
              </span>
            </div>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out border-r border-gray-200`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                HealthCare
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
