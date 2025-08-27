import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import appointmentService from '../../services/appointmentService';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  appointments: [],
  currentAppointment: null,
  availableSlots: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointments(params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointments';
      return rejectWithValue(message);
    }
  }
);

export const getAppointment = createAsyncThunk(
  'appointments/getAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointment(id);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch appointment';
      return rejectWithValue(message);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      toast.success('Appointment booked successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(id, data);
      toast.success('Appointment updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(id, reason);
      toast.success('Appointment cancelled successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getAvailableSlots = createAsyncThunk(
  'appointments/getAvailableSlots',
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAvailableSlots(doctorId, date);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch available slots';
      return rejectWithValue(message);
    }
  }
);

export const rateAppointment = createAsyncThunk(
  'appointments/rateAppointment',
  async ({ id, rating }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.rateAppointment(id, rating);
      toast.success('Rating submitted successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Appointment slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get appointment
      .addCase(getAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload.data;
      })
      .addCase(getAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.unshift(action.payload.data);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.appointments.findIndex(
          (appointment) => appointment._id === action.payload.data._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
        if (state.currentAppointment?._id === action.payload.data._id) {
          state.currentAppointment = action.payload.data;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel appointment
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (appointment) => appointment._id === action.payload.data._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
        if (state.currentAppointment?._id === action.payload.data._id) {
          state.currentAppointment = action.payload.data;
        }
      })
      // Get available slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.data;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Rate appointment
      .addCase(rateAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(
          (appointment) => appointment._id === action.payload.data._id
        );
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
        if (state.currentAppointment?._id === action.payload.data._id) {
          state.currentAppointment = action.payload.data;
        }
      });
  },
});

export const { 
  clearError, 
  clearCurrentAppointment, 
  clearAvailableSlots, 
  setLoading 
} = appointmentSlice.actions;

export default appointmentSlice.reducer;
