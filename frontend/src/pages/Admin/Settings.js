import { useState } from 'react';
import { FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const AdminSettings = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Wire to backend when settings API is available
      await new Promise((r) => setTimeout(r, 500));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure global options for the platform</p>
      </div>

      <div className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Maintenance mode</h3>
            <p className="text-sm text-gray-600">Temporarily disable the frontend for users</p>
          </div>
          <button
            className="flex items-center gap-2 text-gray-700"
            onClick={() => setMaintenanceMode((v) => !v)}
          >
            {maintenanceMode ? <FiToggleRight className="h-6 w-6 text-primary-600" /> : <FiToggleLeft className="h-6 w-6 text-gray-400" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Enable bookings</h3>
            <p className="text-sm text-gray-600">Allow patients to book new appointments</p>
          </div>
          <button
            className="flex items-center gap-2 text-gray-700"
            onClick={() => setBookingEnabled((v) => !v)}
          >
            {bookingEnabled ? <FiToggleRight className="h-6 w-6 text-primary-600" /> : <FiToggleLeft className="h-6 w-6 text-gray-400" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Auto-confirm appointments</h3>
            <p className="text-sm text-gray-600">Automatically confirm new bookings</p>
          </div>
          <button
            className="flex items-center gap-2 text-gray-700"
            onClick={() => setAutoConfirm((v) => !v)}
          >
            {autoConfirm ? <FiToggleRight className="h-6 w-6 text-primary-600" /> : <FiToggleLeft className="h-6 w-6 text-gray-400" />}
          </button>
        </div>

        <div className="flex justify-end">
          <button className="btn-primary flex items-center" onClick={handleSave} disabled={saving}>
            <FiSave className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


