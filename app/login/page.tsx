"use client";
import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/Container";

export default function LoginPage() {
  const {
    setUid,
    setUsername,
    setRole,
    setAvatarURL,
    setEmail,
    setCompletedCourse,
    setTotalPoint,
  } = useAuth();
  const router = useRouter();
  const [email, setEmailLogin] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(email, password);
      if (res.success) {
        if (res.userData) {
          const userData = res.userData;
          setUid(userData.uid);
          setUsername(userData.username);
          setRole(userData.role);
          setAvatarURL(userData.avatarURL);
          setEmail(userData.email);
          setCompletedCourse(userData.completedCourse);
          setTotalPoint(userData.totalPoint);
          router.push("/dashboard");
        } else {
          setErr("Login failed: User data not found");
        }
      } else {
        setErr("Login failed");
      }
    } catch (err: any) {
      setErr(err.message);
    }
  };

  return (
    <Container title="Login" description="">
      <form
        onSubmit={handleLogin}
        className=" space-y-4 bg-white rounded shadow w-96"
      >
        <label htmlFor="email" className="text-md font-bold">
          Email:{" "}
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmailLogin(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <label htmlFor="password" className="text-md font-bold">
          Password:{" "}
        </label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {err && <p className="text-red-500">{err}</p>}
        <button
          type="submit"
          className="w-full py-2 text-white bg-green-600 rounded"
        >
          Login
        </button>
      </form>
    </Container>
  );
}
