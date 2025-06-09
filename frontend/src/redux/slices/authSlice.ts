import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie'; // Correct import

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  userId: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; userId: string }>
    ) => {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.isAuthenticated = true;
      Cookies.set('token', action.payload.token); // Use Cookies from js-cookie
      state.error = null;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.userId = null;
      state.isAuthenticated = false;
      Cookies.remove('token'); // Use Cookies from js-cookie
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;