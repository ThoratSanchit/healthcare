import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import doctorService from '../../services/doctorService';
import { toast } from 'react-toastify';

const initialState = {
  doctors: [],
  currentDoctor: null,
  stats: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};

export const getDoctors = createAsyncThunk(
  'doctors/getDoctors',
  async (params, { rejectWithValue }) => {
    try {
      const response = await doctorService.getDoctors(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const getDoctor = createAsyncThunk(
  'doctors/getDoctor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await doctorService.getDoctor(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'doctors/updateAvailability',
  async (availability, { rejectWithValue }) => {
    try {
      const response = await doctorService.updateAvailability(availability);
      toast.success('Availability updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update availability';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getDoctorStats = createAsyncThunk(
  'doctors/getDoctorStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await doctorService.getDoctorStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload.data;
      })
      .addCase(getDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.currentDoctor = action.payload.data;
      })
      .addCase(getDoctorStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearError, clearCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
