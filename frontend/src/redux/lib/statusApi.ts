import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';

interface File {
  fileName: string;
  downloadUrl: string;
}

interface StatusResponse {
  orderId: string;
  status: 'processing' | 'completed';
  files: File[];
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const statusApi = createApi({
  reducerPath: 'statusApi',
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
  tagTypes: ['Status'],
  endpoints: (builder) => ({
    getOrderStatus: builder.query<StatusResponse, string>({
      query: (orderId) => `/checkOrderStatus/${orderId}`,
      providesTags: ['Status'],
    }),
  }),
});

export const { useGetOrderStatusQuery } = statusApi;