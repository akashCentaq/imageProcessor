import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';

interface UserProfile {
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

interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
}

interface UploadFilesResponse {
  message: string;
  orderId: string;
  files: { fileName: string; filePath: string }[];
  services: string[];
}

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

export const api = createApi({
  reducerPath: 'api',
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
  tagTypes: ['Profile', 'Services'],
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: (body) => ({
        url: '/users/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    uploadFiles: builder.mutation<UploadFilesResponse, { files: File[]; serviceIds: string[] }>({
      query: ({ files, serviceIds }) => {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('serviceIds', JSON.stringify(serviceIds)); // Ensure proper JSON string
        return {
          url: '/fileUpload',
          method: 'POST',
          body: formData,
        };
      },
    }),
    getAllServices: builder.query<ServicesResponse, void>({
      query: () => '/services',
      providesTags: ['Services'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadFilesMutation,
  useGetAllServicesQuery,
} = api;