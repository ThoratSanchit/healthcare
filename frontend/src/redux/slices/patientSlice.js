import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import patientService from '../../services/patientService';
import { toast } from 'react-toastify';

const initialState = {
  profile: null,
  stats: null,
  loading: false,
  error: null,
};

export const getPatientProfile = createAsyncThunk(
  'patients/getPatientProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientService.getProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateMedicalHistory = createAsyncThunk(
  'patients/updateMedicalHistory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await patientService.updateMedicalHistory(data);
      toast.success('Medical history updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update medical history';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPatientStats = createAsyncThunk(
  'patients/getPatientStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientService.getStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const patientSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(getPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMedicalHistory.fulfilled, (state, action) => {
        state.profile = action.payload.data;
      })
      .addCase(getPatientStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      });
  },
});

export const { clearError } = patientSlice.actions;
export default patientSlice.reducer;
