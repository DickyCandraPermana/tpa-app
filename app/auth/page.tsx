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

      <p className="mb-6 text-center font-medium text-slate-600 text-lg">
        Silakan pilih metode autentikasi:
      </p>
      <div className="flex flex-col gap-4 w-full">
        <button
          onClick={() => router.push("/login")}
          className="w-full px-6 py-4 font-bold text-lg text-white transition-all bg-indigo-600 rounded-2xl shadow-lg hover:-translate-y-1 hover:bg-indigo-700 hover:shadow-indigo-200"
        >
          Masuk (Login)
        </button>

        <button
          onClick={() => router.push("/register")}
          className="w-full px-6 py-4 font-bold text-lg text-white transition-all bg-teal-500 rounded-2xl shadow-lg hover:-translate-y-1 hover:bg-teal-600 hover:shadow-teal-200"
        >
          Buat Akun Baru
        </button>
      </div>
    </Container>
  );
}
