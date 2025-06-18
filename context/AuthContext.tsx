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

  useEffect(() => {
    const fromLS = (key: string) => localStorage.getItem(key);
    setUid(fromLS("uid"));
    setUsername(fromLS("username"));
    setRole(fromLS("role"));
    setAvatarURL(fromLS("avatarURL"));
    setEmail(fromLS("email"));

    const storedCourse = fromLS("completedCourse");
    if (storedCourse) setCompletedCourse(JSON.parse(storedCourse));

    const storedPoint = fromLS("totalPoint");
    if (storedPoint) setTotalPoint(parseInt(storedPoint));
  }, []);

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
