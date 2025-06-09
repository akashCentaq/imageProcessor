import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';

interface Transaction {
  id: string;
  serviceName: string;
  creditsUsed: number;
  createdAt: string;
}

interface TransactionsResponse {
  message: string;
  billingRecords: { [orderId: string]: Transaction[] };
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
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
  tagTypes: ['Transactions'],
  endpoints: (builder) => ({
    getAllTransactions: builder.query<TransactionsResponse, { startDate?: string; endDate?: string } | undefined>({
      query: (args = {}) => {
        const { startDate, endDate } = args;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        return `/transactions/fetchTransactions${params.toString() ? `?${params.toString()}` : ''}`;
      },
      providesTags: ['Transactions'],
    }),
  }),
});

export const { useGetAllTransactionsQuery } = transactionsApi;