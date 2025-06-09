import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';

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
  message: string;
  plans: PricingPlan[];
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const plansApi = createApi({
  reducerPath: 'plansApi',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Plans'],
  endpoints: (builder) => ({
    getAllPlans: builder.query<PlansResponse, void>({
      query: () => '/plans/fetchPlans',
      providesTags: ['Plans'],
    }),
  }),
});

export const { useGetAllPlansQuery } = plansApi;