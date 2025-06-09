import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = require('./your-service-account-key.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseAuth = getAuth();