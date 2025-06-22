"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AuthContextType = {
  uid: string | null;
  setUid: (uid: string | null) => void;
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
  clearAuth: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [completedCourse, setCompletedCourse] = useState<string[] | null>(null);
  const [totalPoint, setTotalPoint] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // ⬇️ Restore from localStorage on load
  useEffect(() => {
    setUid(localStorage.getItem("uid"));
    setUsername(localStorage.getItem("username"));
    setRole(localStorage.getItem("role"));
    setAvatarURL(localStorage.getItem("avatarURL"));
    setEmail(localStorage.getItem("email"));

    const storedCourse = localStorage.getItem("completedCourse");
    if (storedCourse) setCompletedCourse(JSON.parse(storedCourse));

    const storedPoint = localStorage.getItem("totalPoint");
    if (storedPoint) setTotalPoint(parseInt(storedPoint));
    setLoading(false);
  }, []);

  // ⬇️ Sync ke localStorage tiap kali berubah
  useEffect(() => {
    uid !== null
      ? localStorage.setItem("uid", uid)
      : localStorage.removeItem("uid");
  }, [uid]);

  useEffect(() => {
    username !== null
      ? localStorage.setItem("username", username)
      : localStorage.removeItem("username");
  }, [username]);

  useEffect(() => {
    role !== null
      ? localStorage.setItem("role", role)
      : localStorage.removeItem("role");
  }, [role]);

  useEffect(() => {
    avatarURL !== null
      ? localStorage.setItem("avatarURL", avatarURL)
      : localStorage.removeItem("avatarURL");
  }, [avatarURL]);

  useEffect(() => {
    email !== null
      ? localStorage.setItem("email", email)
      : localStorage.removeItem("email");
  }, [email]);

  useEffect(() => {
    completedCourse !== null
      ? localStorage.setItem("completedCourse", JSON.stringify(completedCourse))
      : localStorage.removeItem("completedCourse");
  }, [completedCourse]);

  useEffect(() => {
    totalPoint !== null
      ? localStorage.setItem("totalPoint", totalPoint.toString())
      : localStorage.removeItem("totalPoint");
  }, [totalPoint]);

  const clearAuth = () => {
    setUid(null);
    setUsername(null);
    setRole(null);
    setAvatarURL(null);
    setEmail(null);
    setCompletedCourse(null);
    setTotalPoint(null);

    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("avatarURL");
    localStorage.removeItem("email");
    localStorage.removeItem("completedCourse");
    localStorage.removeItem("totalPoint");
  };

  return (
    <AuthContext.Provider
      value={{
        uid,
        setUid,
        username,
        setUsername,
        role,
        setRole,
        avatarURL,
        setAvatarURL,
        email,
        setEmail,
        completedCourse,
        setCompletedCourse,
        totalPoint,
        setTotalPoint,
        clearAuth,
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
