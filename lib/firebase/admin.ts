import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdminConfig } from "@/config/env";

function initAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId,
      clientEmail: firebaseAdminConfig.clientEmail,
      privateKey: firebaseAdminConfig.privateKey,
    }),
  });
}

const adminApp = initAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);