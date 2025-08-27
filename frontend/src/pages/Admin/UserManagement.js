import { useState, useEffect } from 'react';
import {
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiUserPlus,
  FiUsers,
  FiActivity,
  FiShield,
  FiMoreVertical,
  FiX,
  FiCheck
} from 'react-icons/fi';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import adminService from '../../services/adminService';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [usersPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load users from API with filters
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: usersPerPage };
        if (roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (searchTerm) params.search = searchTerm;
        const res = await adminService.getUsers(params);
        if (res?.success) {
          setUsers(res.data || []);
          setTotalCount(res.total || 0);
        } else {
          setUsers([]);
          setTotalCount(0);
        }
      } catch (e) {
        console.error('Failed to fetch users', e);
        setUsers([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, usersPerPage, roleFilter, statusFilter, searchTerm]);

  // Client-side safeguard search (server filters already applied)
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers; // already paginated from server
  const totalPages = Math.ceil((totalCount || filteredUsers.length) / usersPerPage);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'patient': return FiUsers;
      case 'doctor': return FiActivity;
      case 'admin': return FiShield;
      default: return FiUsers;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'patient': return 'badge-primary';
      case 'doctor': return 'badge-success';
      case 'admin': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u._id !== user._id));
    }
  };

  const handleToggleStatus = (user) => {
    setUsers(users.map(u =>
      u._id === user._id ? { ...u, isActive: !u.isActive } : u
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage patients, doctors, and administrators</p>
        </div>
        <button className="btn-primary flex items-center mt-4 sm:mt-0" onClick={() => setShowAddDoctor(true)}>
          <FiUserPlus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiUsers className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'patient').length}</h3>
          <p className="text-gray-600">Patients</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiActivity className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'doctor').length}</h3>
          <p className="text-gray-600">Doctors</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiShield className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</h3>
          <p className="text-gray-600">Admins</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCheck className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</h3>
          <p className="text-gray-600">Active Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="lg:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Last Login</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.map((user) => (
                    <UserTableRow
                      key={user._id}
                      user={user}
                      onView={handleViewUser}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onToggleStatus={handleToggleStatus}
                      getRoleIcon={getRoleIcon}
                      getRoleColor={getRoleColor}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, totalCount)} of {totalCount} users
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showAddDoctor && (
        <AddDoctorModal
          onClose={() => setShowAddDoctor(false)}
          onCreated={(newDoctor) => {
            setUsers((prev) => [newDoctor, ...prev]);
            setShowAddDoctor(false);
          }}
        />
      )}
    </div>
  );
};

// User Table Row Component
const UserTableRow = ({ user, onView, onEdit, onDelete, onToggleStatus, getRoleIcon, getRoleColor }) => {
  const [showActions, setShowActions] = useState(false);
  const RoleIcon = getRoleIcon(user.role);

  return (
    <tr className="hover:bg-gray-50">
      <td className="table-cell">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.phone && (
              <div className="text-xs text-gray-400">{user.phone}</div>
            )}
          </div>
        </div>
      </td>
      <td className="table-cell">
        <div className="flex items-center">
          <RoleIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className={`badge ${getRoleColor(user.role)}`}>
            {user.role}
          </span>
        </div>
        {user.specialization && (
          <div className="text-xs text-gray-500 mt-1">{user.specialization}</div>
        )}
      </td>
      <td className="table-cell">
        <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="table-cell">
        <div className="text-sm text-gray-900">
          {new Date(user.lastLogin).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(user.lastLogin).toLocaleTimeString()}
        </div>
      </td>
      <td className="table-cell">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <FiMoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView(user);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiEye className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiEdit3 className="h-4 w-4 mr-2" />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    onToggleStatus(user);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {user.isActive ? (
                    <>
                      <FiX className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onDelete(user);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <FiTrash2 className="h-4 w-4 mr-2" />
                  Delete User
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-gray-600">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600">{user.email}</p>
                <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Joined:</span>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Login:</span>
                    <span>{new Date(user.lastLogin).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                <div className="space-y-2 text-sm">
                  {user.role === 'doctor' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Specialization:</span>
                        <span>{user.specialization}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span>{user.experience} years</span>
                      </div>
                    </>
                  )}
                  {user.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>{user.address.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

// Add Doctor Modal Component
const AddDoctorModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    role: 'doctor',
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    consultationFee: '',
    dateOfBirth: '',
    gender: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let res;
      if (form.role === 'doctor') {
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          specialization: form.specialization,
          licenseNumber: form.licenseNumber,
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
        };
        res = await adminService.createDoctor(payload);
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
        };
        res = await adminService.createPatient(payload);
      }
      if (res?.success) {
        onCreated(res.data);
      } else {
        setError(res?.message || 'Failed to create doctor');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Doctor</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
              </div>
              {form.role === 'doctor' && (
              <div>
                <label className="form-label">Specialization</label>
                <input name="specialization" value={form.specialization} onChange={handleChange} className="input-field" required />
              </div>
              )}
              {form.role === 'doctor' && (
              <div>
                <label className="form-label">License Number</label>
                <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} className="input-field" required />
              </div>
              )}
              {form.role === 'doctor' && (
              <div>
                <label className="form-label">Experience (years)</label>
                <input name="experience" type="number" value={form.experience} onChange={handleChange} className="input-field" min="0" required />
              </div>
              )}
              {form.role === 'doctor' && (
              <div>
                <label className="form-label">Consultation Fee</label>
                <input name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} className="input-field" min="0" required />
              </div>
              )}
              {form.role === 'patient' && (
              <div>
                <label className="form-label">Date of Birth</label>
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="input-field" required />
              </div>
              )}
              {form.role === 'patient' && (
              <div>
                <label className="form-label">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="input-field" required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
