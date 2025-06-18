"use client";
import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      setErr("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    if (!(password === confirmPassword)) {
      setErr("Passwords do not match");
      return;
    }

    try {
      const res = await registerUser(email, password);
      if (res.success) {
        router.push("/login");
      } else {
        setErr(res.message);
      }
    } catch (err: any) {
      setErr(err.message);
    }
  };

  return (
    <Container title="Register" description="">
      <form
        onSubmit={handleRegister}
        className="space-y-4 bg-white rounded shadow w-96"
      >
        <label htmlFor="email" className="text-md font-bold">
          Email:{" "}
        </label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <label htmlFor="confirmPassword" className="text-md font-bold">
          Confirm Password:{" "}
        </label>
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {err && <p className="text-red-500">{err}</p>}
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-600 rounded"
        >
          Register
        </button>
      </form>
    </Container>
  );
}
