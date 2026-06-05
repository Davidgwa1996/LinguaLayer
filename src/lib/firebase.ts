import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getPerformance } from 'firebase/performance';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize App Check (using a placeholder debug key to satisfy the requirement during dev/testing)
if (typeof window !== 'undefined') {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LdbvwAAAAAAAAAAAAAA_xxxxxxxxxxxxxxxxx'),
    isTokenAutoRefreshEnabled: true
  });
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const perf = typeof window !== 'undefined' ? getPerformance(app) : null;
