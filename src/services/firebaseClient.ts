import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, logEvent as fbLogEvent } from "firebase/analytics";
import { getPerformance, trace } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export let analytics: any = null;
export let perf: any = null;
try {
  analytics = getAnalytics(app);
  perf = getPerformance(app);
  
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    // Only initialize AppCheck in production-like environments if there's a real token.
    // Replace with your actual reCAPTCHA v3 site key when deploying.
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider("YOUR_RECAPTCHA_V3_SITE_KEY"),
      isTokenAutoRefreshEnabled: true
    });
  }
} catch(e) {
  console.warn("Analytics/Performance initialization failed", e);
}

export const logEvent = (eventName: string, eventParams?: any) => {
  if (analytics) {
    try {
      fbLogEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn("Analytics failed", e);
    }
  }
};

export const startTrace = (traceName: string) => {
  if (perf) {
    try {
      const t = trace(perf, traceName);
      t.start();
      return t;
    } catch {
      return null;
    }
  }
  return null;
};


// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
