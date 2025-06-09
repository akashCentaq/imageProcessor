import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface File {
  fileName: string;
  downloadUrl: string;
}

interface StatusState {
  orderId: string | null;
  status: 'processing' | 'completed' | null;
  files: File[];
  queryStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StatusState = {
  orderId: null,
  status: null,
  files: [],
  queryStatus: 'idle',
  error: null,
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.orderId = null;
      state.status = null;
      state.files = [];
      state.queryStatus = 'idle';
      state.error = null;
    },
  },
});

export const { resetStatus } = statusSlice.actions;
export default statusSlice.reducer;