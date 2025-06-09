import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { plansApi } from '../lib/plans';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  validityDays: number;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

interface PlansResponse {
  plans: PricingPlan[];
}

interface PlansState {
  plans: PricingPlan[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  status: 'idle',
  error: null,
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    resetPlans: (state) => {
      state.plans = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(plansApi.endpoints.getAllPlans.matchPending, (state) => {
        state.status = 'loading';
      })
      .addMatcher(plansApi.endpoints.getAllPlans.matchFulfilled, (state, action: PayloadAction<PlansResponse>) => {
        state.status = 'succeeded';
        state.plans = action.payload.plans;
      })
      .addMatcher(plansApi.endpoints.getAllPlans.matchRejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch pricing plans';
      });
  },
});

export const { resetPlans } = plansSlice.actions;
export default plansSlice.reducer;