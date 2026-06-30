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
import firebaseConfig from "../firebase-applet-config.json";

// Detect if we are using placeholder credentials
export const isCloudConfigured =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("PLACEHOLDER") &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes("PLACEHOLDER");

let app;
let db: any = null;
let auth: any = null;
const googleProvider = new GoogleAuthProvider();

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

export { db, auth, googleProvider };

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
