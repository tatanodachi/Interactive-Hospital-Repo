import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfigJson from "../firebase-applet-config.json";

// Helper function to check if a value is a placeholder or default dummy string
const isPlaceholder = (val: string | undefined): boolean => {
  if (!val) return true;
  const upperVal = val.toUpperCase().trim();
  return (
    upperVal === "" ||
    upperVal.includes("PLACEHOLDER") ||
    upperVal.includes("YOUR_") ||
    upperVal.includes("ACTUAL") ||
    upperVal.includes("SENDER_ID") ||
    upperVal.includes("APP_ID") ||
    upperVal.includes("API_KEY")
  );
};

// Helper function to resolve configuration at runtime or fallback
const getFirebaseConfig = () => {
  // Check build-time environment variables first if they are valid and not placeholders
  const buildTimeConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  };

  if (
    buildTimeConfig.apiKey &&
    !isPlaceholder(buildTimeConfig.apiKey) &&
    buildTimeConfig.projectId &&
    !isPlaceholder(buildTimeConfig.projectId)
  ) {
    console.log("[Firebase Debug] Configuration successfully loaded from build-time environment variables:", {
      projectId: buildTimeConfig.projectId,
      authDomain: buildTimeConfig.authDomain
    });
    return buildTimeConfig;
  }

  // Fallback to runtime injected window config if available
  if (typeof window !== "undefined" && (window as any).__FIREBASE_CONFIG__) {
    const injected = (window as any).__FIREBASE_CONFIG__;
    if (injected.apiKey && !isPlaceholder(injected.apiKey) && injected.projectId && !isPlaceholder(injected.projectId)) {
      console.log("[Firebase Debug] Configuration successfully loaded from runtime injected window.__FIREBASE_CONFIG__.", {
        projectId: injected.projectId,
        authDomain: injected.authDomain
      });
      return {
        apiKey: injected.apiKey,
        authDomain: injected.authDomain || "",
        projectId: injected.projectId,
        storageBucket: injected.storageBucket || "",
        messagingSenderId: injected.messagingSenderId || "",
        appId: injected.appId || "",
        measurementId: injected.measurementId || "",
        firestoreDatabaseId: injected.firestoreDatabaseId || "",
      };
    }
  }

  const fallback = {
    apiKey: firebaseConfigJson.apiKey,
    authDomain: firebaseConfigJson.authDomain,
    projectId: firebaseConfigJson.projectId,
    storageBucket: firebaseConfigJson.storageBucket,
    messagingSenderId: firebaseConfigJson.messagingSenderId,
    appId: firebaseConfigJson.appId,
    measurementId: firebaseConfigJson.measurementId,
    firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId,
  };

  console.log("[Firebase Debug] Configuration loaded from fallback JSON.", {
    projectId: fallback.projectId,
    authDomain: fallback.authDomain,
    isApiKeyPlaceholder: isPlaceholder(fallback.apiKey),
    isProjectIdPlaceholder: isPlaceholder(fallback.projectId)
  });

  return fallback;
};

const firebaseConfig = getFirebaseConfig();

// Detect if we are using placeholder credentials
export const isCloudConfigured =
  firebaseConfig.apiKey &&
  !isPlaceholder(firebaseConfig.apiKey) &&
  firebaseConfig.projectId &&
  !isPlaceholder(firebaseConfig.projectId);

let app;
let db: any = null;
let auth: any = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

if (isCloudConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
  } catch (error) {
    console.error(
      "Firebase Initialization failure, routing to Local Offline Mode:",
      error,
    );
  }
}

export { db, auth, googleProvider, firebaseConfig, isPlaceholder };

// Standardized Operation Type Enums
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Security Audit-compliant Error Information Interface
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

// Global Standardized Error Handler
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo:
        currentAuth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };

  console.error(
    "[Firestore Standardized Error]",
    JSON.stringify(errInfo, null, 2),
  );
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function loginWithGoogle() {
  if (!isCloudConfigured || !auth) {
    throw new Error(
      "Cannot login: True Cloud Mode is unconfigured. Please check firebase-applet-config.json",
    );
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failure:", error);
    throw error;
  }
}

export async function loginWithEmail(email, password) {
  if (!isCloudConfigured || !auth) {
    throw new Error(
      "Cannot login: True Cloud Mode is unconfigured. Please check firebase-applet-config.json",
    );
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Email login failure:", error);
    throw error;
  }
}

export async function registerWithEmail(email, password) {
  if (!isCloudConfigured || !auth) {
    throw new Error(
      "Cannot login: True Cloud Mode is unconfigured. Please check firebase-applet-config.json",
    );
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Email registration failure:", error);
    throw error;
  }
}

export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
}
