"use client";

import React from "react";
import Image from "next/image";
import ProfilePlaceholder from "@/public/assets/profile_picture_placeholder.png";

import { useAuth } from "@/context/AuthContext";
import PointBadge from "@/components/PointBadge";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const ProfileOverview = () => {
  const { username, email, avatarURL } = useAuth();
  
  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-200 w-full text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 z-10">
          <div className="p-1 bg-white rounded-full shadow-md">
            <Image
              src={avatarURL || ProfilePlaceholder}
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full border-4 border-white"
            />
          </div>
          <div className="text-center md:text-left flex flex-col justify-center gap-1">
            <h1 className="text-3xl md:text-4xl font-extrabold">{username || "Santri Hebat"}</h1>
            <p className="text-indigo-200 font-medium">{email}</p>
          </div>
        </div>
        
        <div className="mt-6 md:mt-0 z-10">
          <PointBadge />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Quick action: Mulai Belajar */}
        <Link
          href="/dashboard/courses"
          className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Mulai Belajar</h2>
          <p className="text-slate-500 font-medium text-center mt-2">Pilih materi kuis seru dan kumpulkan poinnya!</p>
        </Link>
        
        {/* Quick action: Tukar Poin */}
        <Link
          href="/dashboard/exchange"
          className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 shadow-sm rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🎁</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Tukar Poin</h2>
          <p className="text-slate-500 font-medium text-center mt-2">Pilih hadiah menarik untuk usahamu!</p>
        </Link>
      </div>
    </div>
  );
};

export default ProfileOverview;
