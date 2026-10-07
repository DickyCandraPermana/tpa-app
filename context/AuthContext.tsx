"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserProfileSchema } from "@/types/schema";

type AuthContextType = {
  uid: string | null;
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  username: string | null;
  setUsername: (username: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  avatarURL: string | null;
  setAvatarURL: (avatarURL: string | null) => void;
  email: string | null;
  setEmail: (email: string | null) => void;
  completedCourse: string[] | null;
  setCompletedCourse: (completedCourse: string[] | null) => void;
  totalPoint: number | null;
  setTotalPoint: (totalPoint: number | null) => void;
  setUid: (uid: string | null) => void;
  clearAuth: () => Promise<void>;
  signOutUser: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Local overrides for optimistic UI
  const [overridePoints, setOverridePoints] = useState<number | null>(null);
  const [overrideCourses, setOverrideCourses] = useState<string[] | null>(null);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Listen to Firestore document updates in real-time
        const userDocRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              try {
                const parsed = UserProfileSchema.parse({
                  uid: docSnap.id,
                  ...docSnap.data(),
                });
                setUserProfile(parsed);
              } catch (err) {
                console.error("Error parsing user profile from Firestore:", err);
              }
            } else {
              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                username: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Santri",
                role: "santri",
                avatarURL: firebaseUser.photoURL || null,
                totalPoint: 0,
                completedCourse: [],
              });
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore user onSnapshot error:", error);
            setLoading(false);
          }
        );
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        setUserProfile(null);
        setOverridePoints(null);
        setOverrideCourses(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const clearAuth = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Error during sign out:", e);
    }
    setUser(null);
    setUserProfile(null);
    setOverridePoints(null);
    setOverrideCourses(null);
  }, []);

  const totalPoint = overridePoints !== null ? overridePoints : userProfile?.totalPoint ?? 0;
  const completedCourse = overrideCourses !== null ? overrideCourses : userProfile?.completedCourse ?? [];

  return (
    <AuthContext.Provider
      value={{
        uid: user?.uid ?? userProfile?.uid ?? null,
        user,
        userProfile,
        username: userProfile?.username ?? user?.displayName ?? (user?.email ? user.email.split("@")[0] : null),
        setUsername: () => {},
        role: userProfile?.role ?? "santri",
        setRole: () => {},
        avatarURL: userProfile?.avatarURL ?? user?.photoURL ?? null,
        setAvatarURL: () => {},
        email: user?.email ?? userProfile?.email ?? null,
        setEmail: () => {},
        completedCourse,
        setCompletedCourse: (courses) => setOverrideCourses(courses),
        totalPoint,
        setTotalPoint: (pts) => setOverridePoints(pts),
        setUid: () => {},
        clearAuth,
        signOutUser: clearAuth,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
