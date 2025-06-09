import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { transactionsApi } from '../lib/transactionsApi';

interface Transaction {
  id: string;
  serviceName: string;
  creditsUsed: number;
  createdAt: string;
}

interface TransactionsResponse {
  billingRecords: { [orderId: string]: Transaction[] };
}

interface TransactionsState {
  transactions: { [orderId: string]: Transaction[] };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: {},
  status: 'idle',
  error: null,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetTransactions: (state) => {
      state.transactions = {};
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(transactionsApi.endpoints.getAllTransactions.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(transactionsApi.endpoints.getAllTransactions.matchFulfilled, (state, action: PayloadAction<TransactionsResponse>) => {
        state.status = 'succeeded';
        state.transactions = action.payload.billingRecords;
      })
      .addMatcher(transactionsApi.endpoints.getAllTransactions.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch transactions';
      });
  },
});

export const { resetTransactions } = transactionsSlice.actions;
export default transactionsSlice.reducer;