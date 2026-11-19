"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase/client";
import { storeConfig } from "@/config/store";
import type { UserProfile } from "@/types/user";

const PHONE_DOMAIN = "phone.jadybox.vn";

export function normalizeVNPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s.-]/g, "");
  const normalized = cleaned.startsWith("+84")
    ? "0" + cleaned.slice(3)
    : cleaned.startsWith("84") && cleaned.length === 11
    ? "0" + cleaned.slice(2)
    : cleaned;

  return /^0\d{9}$/.test(normalized) ? normalized : null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithIdentifier: (identifier: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  registerWithPhone: (name: string, phone: string, password: string) => Promise<void>;
  updateUserProfile: (data: {
    name: string;
    phone: string;
    address: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, storeConfig.collections.users, firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          const isPhoneAccount = firebaseUser.email?.endsWith(`@${PHONE_DOMAIN}`);
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName ?? "Khách hàng Jady",
            email: isPhoneAccount ? "" : (firebaseUser.email ?? ""),
            phone: isPhoneAccount
              ? firebaseUser.email?.split("@")[0] ?? ""
              : "",
            avatar: firebaseUser.photoURL ?? "",
            role: "customer",
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  // Hỗ trợ nhập cả Email hoặc Số điện thoại khi đăng nhập
  const loginWithIdentifier = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const phone = normalizeVNPhone(trimmed);
    const authEmail = phone ? `${phone}@${PHONE_DOMAIN}` : trimmed;
    await signInWithEmailAndPassword(auth, authEmail, password);
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name: cleanName,
      email: cleanEmail,
      avatar: "",
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, storeConfig.collections.users, cred.user.uid), newProfile);
    setProfile(newProfile);
  };

  const registerWithPhone = async (name: string, rawPhone: string, password: string) => {
    const cleanName = name.trim();
    const phone = normalizeVNPhone(rawPhone);

    if (!phone) {
      throw { code: "custom/invalid-phone" };
    }

    const internalEmail = `${phone}@${PHONE_DOMAIN}`;
    const cred = await createUserWithEmailAndPassword(auth, internalEmail, password);
    await updateProfile(cred.user, { displayName: cleanName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      name: cleanName,
      email: "",
      phone,
      avatar: "",
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, storeConfig.collections.users, cred.user.uid), newProfile);
    setProfile(newProfile);
  };
  const updateUserProfile = async (data: {
    name: string;
    phone: string;
    address: string;
  }) => {
    if (!user) return;

    const cleanName = data.name.trim();
    const cleanPhone = data.phone.trim();
    const cleanAddress = data.address.trim();

    if (cleanName && cleanName !== user.displayName) {
      await updateProfile(user, { displayName: cleanName });
    }

    const userRef = doc(db, storeConfig.collections.users, user.uid);
    const updatedFields = {
      name: cleanName || profile?.name || "Khách hàng Jady",
      phone: cleanPhone,
      address: cleanAddress,
    };

    await setDoc(userRef, updatedFields, { merge: true });

    setProfile((prev) =>
      prev
        ? { ...prev, ...updatedFields }
        : {
            uid: user.uid,
            email: user.email ?? "",
            avatar: user.photoURL ?? "",
            role: "customer",
            createdAt: new Date().toISOString(),
            ...updatedFields,
          }
    );
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        loginWithGoogle,
        loginWithIdentifier,
        registerWithEmail,
        registerWithPhone,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong AuthProvider");
  }
  return context;
}