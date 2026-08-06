"use client";

import Link from "next/link";
import { Star, BookOpen, Gift, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-amber-200 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-teal-200 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-6 flex justify-center items-center p-6 bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 w-32 h-32 transform hover:scale-105 transition-transform duration-300">
          <BookOpen className="w-16 h-16 text-indigo-600" />
        </div>
        
        <h1 className="mb-6 text-5xl md:text-7xl font-extrabold text-center text-slate-800 tracking-tight leading-tight">
          Belajar TPA dengan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">
            Sangat Menyenangkan!
          </span>
        </h1>
        
        <p className="max-w-2xl mb-12 text-xl md:text-2xl text-center text-slate-600 font-medium">
          Latih kemampuanmu membaca Al-Qur'an, jawab kuis interaktif, dan kumpulkan poin untuk ditukar dengan hadiah menarik.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-3xl">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Materi Audio & Visual</h3>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Kuis & Gamifikasi</h3>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Tukar Poin Hadiah</h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-6 w-full max-w-md">
          <Link
            href="/auth"
            className="group flex-1 flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg text-white transition-all bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 hover:-translate-y-1 active:translate-y-0 rounded-2xl w-full"
          >
            Mulai Belajar
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center px-8 py-4 font-bold text-lg text-indigo-600 transition-all bg-white border-2 border-indigo-100 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl w-full"
          >
            Dashboard Ku
          </Link>
        </div>
      </div>
    </main>
  );
}
