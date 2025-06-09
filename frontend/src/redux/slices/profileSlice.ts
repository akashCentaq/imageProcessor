import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../lib/api';

// Define the UserProfile interface
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phoneNumber: string | null;
  joinDate: string;
  avatar?: string;
  security: {
    lastPasswordChange: string;
    twoFactorEnabled: boolean;
  };
}

// Define the ProfileState interface
interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle getProfile query
    builder.addMatcher(
      api.endpoints.getProfile.matchPending,
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    builder.addMatcher(
      api.endpoints.getProfile.matchFulfilled,
      (state, action: PayloadAction<UserProfile>) => {
        state.profile = action.payload;
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      api.endpoints.getProfile.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      }
    );

    // Handle updateProfile mutation
    builder.addMatcher(
      api.endpoints.updateProfile.matchFulfilled,
      (state, action: PayloadAction<UserProfile>) => {
        console.log('Profile updated successfully:', action.payload);
        state.isLoading = false;
        state.error = null;
      }
    );
    builder.addMatcher(
      api.endpoints.updateProfile.matchRejected,
      (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update profile';
      }
    );
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;