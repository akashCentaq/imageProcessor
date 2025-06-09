import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { servicesApi } from '../lib/serviceApi'; // Adjust the import path to your API service file

interface Service {
  id: string;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

interface ServicesResponse {
  services: Service[];
}

interface ServicesState {
  services: Service[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ServicesState = {
  services: [],
  status: 'idle',
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    resetServices: (state) => {
      state.services = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(servicesApi.endpoints.getAllServices.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(servicesApi.endpoints.getAllServices.matchFulfilled, (state, action: PayloadAction<ServicesResponse>) => {
        state.status = 'succeeded';
        state.services = action.payload.services; // Store the services data in state.services
      })
      .addMatcher(servicesApi.endpoints.getAllServices.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch services';
      });
  },
});

export const { resetServices } = servicesSlice.actions;
export default servicesSlice.reducer;