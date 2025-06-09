// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/AuthContext';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import ProtectedRoute from '@/ProtectedRoute';
import RootRedirect from '@/RootRedirect';
import ImageProcessorLayout from '@/polymet/layouts/image-processor-layout-updated';
import ImageProcessor from '@/polymet/pages/image-processor';
import CreditsPage from '@/polymet/pages/credits';
import HistoryPage from '@/polymet/pages/history';
import ProfilePage from '@/polymet/pages/profile';
import Login from '@/polymet/pages/Login';
import Signup from '@/polymet/pages/Signup';
import { Provider } from 'react-redux';

export default function ImageProcessorPrototype() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/image-processor/*"
                element={
                  <ProtectedRoute>
                    <ImageProcessorLayout>
                      <ImageProcessor />
                    </ImageProcessorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <ProtectedRoute>
                    <ImageProcessorLayout>
                      <CreditsPage />
                    </ImageProcessorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <ImageProcessorLayout>
                      <HistoryPage />
                    </ImageProcessorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ImageProcessorLayout>
                      <ProfilePage />
                    </ImageProcessorLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </AuthProvider>
        </Router>
      </PersistGate>
    </Provider>
  );
}