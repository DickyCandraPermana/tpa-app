"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import login_banner from "@/public/assets/login_banner.jpg";
import Container from "@/components/Container";

export default function AuthPage() {
  const router = useRouter();

  return (
    <Container title="Selamat Datang" description="">
      <Image
        src={login_banner}
        alt="Login Banner"
        width={400}
        height={150}
        className="mb-6"
      />

      <p className="mb-3 text-center text-gray-600">
        Silakan pilih metode autentikasi:
      </p>
      <div className="flex flex-row gap-2">
        <button
          onClick={() => router.push("/login")}
          className="w-1/2 px-4 py-2 text-white transition bg-blue-600 rounded hover:bg-blue-800"
        >
          Login
        </button>

        <button
          onClick={() => router.push("/register")}
          className="w-1/2 px-4 py-2 text-white transition bg-green-600 rounded hover:bg-green-700"
        >
          Register
        </button>
      </div>
    </Container>
  );
}
