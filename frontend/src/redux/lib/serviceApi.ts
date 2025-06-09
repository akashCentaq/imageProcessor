import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';

interface Service {
  id: string;
  name: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

interface ServicesResponse {
  message: string;
  services: Service[];
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export const servicesApi = createApi({
  reducerPath: 'servicesApi',
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
  tagTypes: ['Services'],
  endpoints: (builder) => ({
    getAllServices: builder.query<ServicesResponse, void>({
      query: () => '/services/fetchServices',
      providesTags: ['Services'],
    }),
  }),
});

export const { useGetAllServicesQuery } = servicesApi;