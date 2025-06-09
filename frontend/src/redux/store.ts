import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import servicesReducer from './slices/serviceSlice';
import statusReducer from './slices/statusSlice';
import transactionsReducer from './slices/transactionsSlice';
import plansReducer from './slices/plansSlice';
import { api } from '@/redux/lib/api';
import { authApi } from '@/redux/lib/authApi';
import { servicesApi } from '@/redux/lib/serviceApi';
import { statusApi } from '@/redux/lib/statusApi';
import { transactionsApi } from '@/redux/lib/transactionsApi';
import { plansApi } from '@/redux/lib/plans';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['auth', 'profile', 'services', 'status', 'transactions', 'plans'],
};

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  services: servicesReducer,
  status: statusReducer,
  transactions: transactionsReducer,
  plans: plansReducer,
  [api.reducerPath]: api.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [servicesApi.reducerPath]: servicesApi.reducer,
  [statusApi.reducerPath]: statusApi.reducer,
  [transactionsApi.reducerPath]: transactionsApi.reducer,
  [plansApi.reducerPath]: plansApi.reducer,
});

const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action  .type === 'auth/clearCredentials') {
    state = undefined; // Reset all slices
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware, authApi.middleware, servicesApi.middleware, statusApi.middleware, transactionsApi.middleware, plansApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;