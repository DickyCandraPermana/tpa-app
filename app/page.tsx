"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-gradient-to-br from-indigo-100 to-white">
      <h1 className="mb-4 text-5xl font-bold text-center text-indigo-700">
        Selamat Datang di TPA Interaktif
      </h1>
      <p className="max-w-xl mb-8 text-lg text-center text-gray-700">
        Latih kemampuanmu membaca Al-Qur'an,
        dan kumpulkan poin untuk ditukar hadiah!
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/soal"
          className="px-6 py-3 font-semibold text-white transition bg-indigo-600 shadow hover:bg-indigo-700 rounded-xl"
        >
          Mulai Latihan
        </Link>

        <Link
          href="/poin"
          className="px-6 py-3 font-semibold text-indigo-600 transition bg-white border border-indigo-300 shadow hover:bg-gray-100 rounded-xl"
        >
          Lihat Poin
        </Link>

        <Link
          href="/auth"
          className="px-6 py-3 font-semibold text-white transition shadow bg-amber-500 hover:bg-amber-600 rounded-xl"
        >
          Login / Register
        </Link>
      </div>
    </main>
  );
}
