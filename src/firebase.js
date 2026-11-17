import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseConfig } from '../firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// La sesión se guarda en el teléfono para no tener que iniciar sesión cada vez.
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  auth = getAuth(app); // ya estaba inicializado (recarga en caliente)
}

export { auth };
export const db = getFirestore(app);
