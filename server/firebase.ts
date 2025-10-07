import admin from 'firebase-admin';
import serviceAccountKey from './serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

export const db = admin.firestore();
export const auth = admin.auth();
