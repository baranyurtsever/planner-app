import { getApp, getApps, initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDTqdjPRaMHI2AeRf24gV3eqGCrIL6Iwng',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'peregrin-planner-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'peregrin-planner-app',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'peregrin-planner-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '461399069410',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:461399069410:web:919fb6c65a7f00f3ebc4bb',
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
